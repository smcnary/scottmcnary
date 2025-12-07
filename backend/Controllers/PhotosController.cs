using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;
using System.IO.Compression;
using System.Formats.Tar;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UploadService _uploadService;
    private readonly ILogger<PhotosController> _logger;
    private readonly IConfiguration _configuration;

    public PhotosController(
        AppDbContext context,
        UploadService uploadService,
        ILogger<PhotosController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _uploadService = uploadService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedPhotosResponse>> GetPhotos(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 24;
        if (pageSize > 100) pageSize = 100; // Max page size limit

        var totalCount = await _context.Photos.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var photos = await _context.Photos
            .OrderByDescending(p => p.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return Ok(new PaginatedPhotosResponse
        {
            Photos = photos,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Photo>> GetPhoto(Guid id)
    {
        var photo = await _context.Photos.FindAsync(id);

        if (photo == null)
        {
            return NotFound();
        }

        return Ok(photo);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadPhotos(
        IFormFile zipFile,
        [FromHeader(Name = "X-Upload-Password")] string? password)
    {
        var requiredPassword = _configuration["UPLOAD_PASSWORD"];
        
        if (string.IsNullOrEmpty(requiredPassword))
        {
            return StatusCode(500, new { error = "Upload password not configured" });
        }

        if (password != requiredPassword)
        {
            return Unauthorized(new { error = "Invalid password" });
        }

        if (zipFile == null || zipFile.Length == 0)
        {
            return BadRequest(new { error = "No file uploaded" });
        }

        if (!zipFile.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "File must be a ZIP archive" });
        }

        const long maxZipSize = 100 * 1024 * 1024; // 100MB
        if (zipFile.Length > maxZipSize)
        {
            return BadRequest(new { error = "ZIP file too large (max 100MB)" });
        }

        try
        {
            using var stream = zipFile.OpenReadStream();
            var photos = await _uploadService.ProcessZipFile(stream, zipFile.FileName);

            if (photos.Count == 0)
            {
                return BadRequest(new { error = "No valid images found in ZIP file" });
            }

            _context.Photos.AddRange(photos);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Successfully uploaded {photos.Count} photo(s)",
                count = photos.Count,
                photos = photos.Select(p => new { p.Id, p.FileName })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing upload");
            return StatusCode(500, new { error = "Error processing upload", details = ex.Message });
        }
    }

    [HttpPost("bulk-extract")]
    public async Task<IActionResult> BulkExtractFiles(
        IFormFile archiveFile,
        [FromHeader(Name = "X-Upload-Password")] string? password)
    {
        var requiredPassword = _configuration["UPLOAD_PASSWORD"];
        
        if (string.IsNullOrEmpty(requiredPassword))
        {
            return StatusCode(500, new { error = "Upload password not configured" });
        }

        if (password != requiredPassword)
        {
            return Unauthorized(new { error = "Invalid password" });
        }

        if (archiveFile == null || archiveFile.Length == 0)
        {
            return BadRequest(new { error = "No file uploaded" });
        }

        if (!archiveFile.FileName.EndsWith(".tar.gz", StringComparison.OrdinalIgnoreCase) &&
            !archiveFile.FileName.EndsWith(".tgz", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "File must be a tar.gz archive" });
        }

        const long maxArchiveSize = 5L * 1024 * 1024 * 1024; // 5GB
        if (archiveFile.Length > maxArchiveSize)
        {
            return BadRequest(new { error = "Archive too large (max 5GB)" });
        }

        try
        {
            // Get the storage path
            var storagePath = _configuration["STORAGE_PATH"];
            if (string.IsNullOrEmpty(storagePath))
            {
                storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }
            
            var uploadsPath = Path.Combine(storagePath, "uploads");
            
            // Ensure directory exists
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
                _logger.LogInformation($"Created uploads directory at: {uploadsPath}");
            }

            _logger.LogInformation($"Extracting archive to: {uploadsPath}");

            // Extract tar.gz archive
            using var fileStream = archiveFile.OpenReadStream();
            using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);
            using var tarReader = new TarReader(gzipStream);

            int extractedCount = 0;
            long totalSize = 0;

            while (tarReader.GetNextEntry() is { } entry)
            {
                // Skip directories
                if (entry.EntryType == TarEntryType.Directory)
                    continue;

                // Get the file name (handle nested paths)
                var fileName = entry.Name;
                if (fileName.Contains('/'))
                {
                    fileName = Path.GetFileName(fileName);
                }

                // Skip if no filename
                if (string.IsNullOrEmpty(fileName))
                    continue;

                var destinationPath = Path.Combine(uploadsPath, fileName);

                // Ensure destination directory exists (in case of nested paths)
                var destDir = Path.GetDirectoryName(destinationPath);
                if (!string.IsNullOrEmpty(destDir) && !Directory.Exists(destDir))
                {
                    Directory.CreateDirectory(destDir);
                }

                // Extract file
                using var entryStream = entry.DataStream ?? Stream.Null;
                using var fileOutStream = File.Create(destinationPath);
                await entryStream.CopyToAsync(fileOutStream);
                
                extractedCount++;
                totalSize += entry.Length;
            }

            _logger.LogInformation($"Extracted {extractedCount} files ({totalSize / 1024 / 1024}MB) to {uploadsPath}");

            return Ok(new
            {
                message = $"Successfully extracted {extractedCount} file(s)",
                count = extractedCount,
                totalSize = totalSize,
                destination = uploadsPath
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting archive");
            return StatusCode(500, new { error = "Error extracting archive", details = ex.Message });
        }
    }

    [HttpPost("metadata/{id}")]
    public async Task<IActionResult> UpdateMetadata(
        Guid id,
        [FromBody] UpdateMetadataRequest request,
        [FromHeader(Name = "X-Upload-Password")] string? password)
    {
        var requiredPassword = _configuration["UPLOAD_PASSWORD"];
        
        if (string.IsNullOrEmpty(requiredPassword) || password != requiredPassword)
        {
            return Unauthorized(new { error = "Invalid password" });
        }

        var photo = await _context.Photos.FindAsync(id);
        if (photo == null)
        {
            return NotFound();
        }

        photo.Title = request.Title;
        photo.Description = request.Description;
        photo.Keywords = request.Keywords;
        photo.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(photo);
    }
}

public class UpdateMetadataRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string[]? Keywords { get; set; }
}

public class PaginatedPhotosResponse
{
    public IEnumerable<Photo> Photos { get; set; } = new List<Photo>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}


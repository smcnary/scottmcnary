using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

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
    public async Task<ActionResult<IEnumerable<Photo>>> GetPhotos()
    {
        var photos = await _context.Photos
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync();
        
        return Ok(photos);
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


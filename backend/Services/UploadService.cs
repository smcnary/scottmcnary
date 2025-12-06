using System.IO.Compression;
using backend.Models;

namespace backend.Services;

public class UploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UploadService> _logger;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB per file

    public UploadService(
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<UploadService> logger)
    {
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<List<Photo>> ProcessZipFile(Stream zipStream, string zipFileName)
    {
        var photos = new List<Photo>();
        
        // Use Railway Volume path if configured, otherwise use WebRootPath
        // Railway volumes are typically mounted at /data or custom path via STORAGE_PATH env var
        var storageBasePath = _configuration["STORAGE_PATH"];
        if (string.IsNullOrEmpty(storageBasePath))
        {
            storageBasePath = _environment.WebRootPath;
        }
        
        var uploadsPath = Path.Combine(storageBasePath, "uploads");
        
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
            _logger.LogInformation($"Created uploads directory at: {uploadsPath}");
        }
        
        _logger.LogInformation($"Storing photos in: {uploadsPath}");

        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        
        foreach (var entry in archive.Entries)
        {
            if (entry.FullName.EndsWith("/") || string.IsNullOrEmpty(entry.Name))
                continue;

            var fileExtension = Path.GetExtension(entry.Name).ToLowerInvariant();
            if (!_allowedExtensions.Contains(fileExtension))
            {
                _logger.LogWarning($"Skipping file {entry.Name} - invalid extension");
                continue;
            }

            if (entry.Length > MaxFileSize)
            {
                _logger.LogWarning($"Skipping file {entry.Name} - file too large");
                continue;
            }

            var sanitizedFileName = SanitizeFileName(entry.Name);
            var uniqueFileName = $"{Guid.NewGuid()}_{sanitizedFileName}";
            var filePath = Path.Combine(uploadsPath, uniqueFileName);

            try
            {
                using (var entryStream = entry.Open())
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await entryStream.CopyToAsync(fileStream);
                }

                var photo = new Photo
                {
                    FileName = sanitizedFileName,
                    FilePath = $"/uploads/{uniqueFileName}",
                    FileSize = entry.Length,
                    MimeType = GetMimeType(fileExtension),
                    UploadedAt = DateTime.UtcNow
                };

                photos.Add(photo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing file {entry.Name}");
            }
        }

        return photos;
    }

    private string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return sanitized.Trim();
    }

    private string GetMimeType(string extension)
    {
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            _ => "application/octet-stream"
        };
    }
}





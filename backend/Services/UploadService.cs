using System.IO.Compression;
using backend.Models;

namespace backend.Services;

public class UploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadService> _logger;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB per file

    public UploadService(IWebHostEnvironment environment, ILogger<UploadService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<List<Photo>> ProcessZipFile(Stream zipStream, string zipFileName)
    {
        var photos = new List<Photo>();
        var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
        
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

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





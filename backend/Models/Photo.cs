using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Photo
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(500)]
    public string? Title { get; set; }

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    public string[]? Keywords { get; set; }

    [Required]
    [MaxLength(1000)]
    public string FilePath { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    [MaxLength(100)]
    public string? MimeType { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}






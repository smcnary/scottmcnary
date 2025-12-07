using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Swashbuckle.AspNetCore.SwaggerGen;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
// Prefer Railway's DATABASE_URL, then check ConnectionStrings
var connectionString = builder.Configuration["DATABASE_URL"];
if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}
if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration["ConnectionStrings__DefaultConnection"];
}

// Remove any whitespace/newlines that might be in the connection string
if (!string.IsNullOrEmpty(connectionString))
{
    connectionString = connectionString.Replace("\n", "").Replace("\r", "").Trim();
}

// Convert PostgreSQL URL format (postgresql://) to Npgsql connection string format
if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgresql://"))
{
    try
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        if (userInfo.Length == 2)
        {
            connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])}";
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error parsing connection string: {ex.Message}");
        // If parsing fails, try to use as-is
    }
}

if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// Services
builder.Services.AddScoped<UploadService>();

// CORS
var corsOrigins = builder.Configuration["CORS_ORIGINS"]?.Split(',') 
    ?? new[] { "http://localhost:3000", "https://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Get logger early so we can use it for configuration logging
var logger = app.Services.GetRequiredService<ILogger<Program>>();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Serve static files from wwwroot (always available)
app.UseStaticFiles();

// Configure uploads directory and static file serving
var storagePath = builder.Configuration["STORAGE_PATH"];
string? uploadsPath = null;
bool useStoragePath = false;

if (!string.IsNullOrEmpty(storagePath))
{
    uploadsPath = Path.Combine(storagePath, "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!Directory.Exists(uploadsPath))
    {
        try
        {
            Directory.CreateDirectory(uploadsPath);
            logger.LogInformation($"Created uploads directory at: {uploadsPath}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Failed to create uploads directory at {uploadsPath}. Will fall back to wwwroot.");
            uploadsPath = null;
        }
    }
    
    // Use STORAGE_PATH if directory exists or was successfully created
    if (uploadsPath != null && Directory.Exists(uploadsPath))
    {
        useStoragePath = true;
    }
}

// If STORAGE_PATH is not available, use wwwroot/uploads as fallback
if (!useStoragePath)
{
    var wwwrootPath = app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
    uploadsPath = Path.Combine(wwwrootPath, "uploads");
    
    if (!Directory.Exists(uploadsPath))
    {
        try
        {
            Directory.CreateDirectory(uploadsPath);
            logger.LogInformation($"Created wwwroot uploads directory at: {uploadsPath}");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, $"Could not create wwwroot uploads directory: {uploadsPath}");
        }
    }
}

// Register static file middleware for /uploads path
if (uploadsPath != null && Directory.Exists(uploadsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads"
    });
    logger.LogInformation($"Serving uploads from: {uploadsPath} ({(useStoragePath ? "Railway Volume" : "wwwroot")})");
}
else
{
    logger.LogWarning("Uploads directory not available. Image serving may not work correctly.");
}

app.UseAuthorization();

app.MapControllers();

// Log startup information
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
logger.LogInformation($"Starting application on port {port}");
logger.LogInformation($"Environment: {app.Environment.EnvironmentName}");
logger.LogInformation($"Database connection configured: {!string.IsNullOrEmpty(connectionString)}");

// Ensure database is created and migrated
if (!string.IsNullOrEmpty(connectionString))
{
    try
    {
        logger.LogInformation("Starting database migration...");
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        logger.LogInformation("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "CRITICAL: Error running database migration. The app will start, but database operations may fail.");
        // Don't throw - allow the app to start even if migration fails
        // This helps with debugging in Railway
    }
}
else
{
    logger.LogWarning("No database connection string configured. Database features will not be available.");
}

// Ensure we're listening on the correct interface and port
// Railway sets PORT env var, and we use --urls in railway.json
// But as a fallback, we can also set it programmatically
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    app.Urls.Add($"http://0.0.0.0:{port}");
}
logger.LogInformation($"Application URLs: {string.Join(", ", app.Urls)}");

app.Run();


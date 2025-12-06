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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();


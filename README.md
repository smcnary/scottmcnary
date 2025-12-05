# In Memory of Scott Roberts McNary

A memorial website with bulk photo upload functionality, built with Next.js, .NET Core, and PostgreSQL.

## Project Structure

- `frontend/` - Next.js 14+ React application (deployed to Vercel)
- `backend/` - .NET Core 8 Web API (deployed to Railways)
- `database/` - PostgreSQL database (provisioned via Railways)

## Features

- Photo gallery with responsive grid layout
- Bulk photo upload via ZIP files (password protected)
- SEO metadata support (title, description, keywords)
- Individual photo pages with Open Graph and Twitter Card support
- Structured data (JSON-LD) for search engines
- Automatic sitemap generation

## Setup

### Backend (.NET Core)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update `appsettings.Development.json` with your PostgreSQL connection string

4. Run database migrations:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. Set environment variables:
   - `UPLOAD_PASSWORD` - Password for upload authentication
   - `ConnectionStrings__DefaultConnection` - PostgreSQL connection string

6. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000`

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Deployment

### Frontend (Vercel)

1. Push the code to GitHub: https://github.com/smcnary/scottmcnary.git
2. Connect the repository to Vercel
3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL` - Your Railways backend URL
4. Deploy

### Backend/Database (Railways)

1. Create a new Railway project
2. Add a PostgreSQL service
3. Add a new service for the .NET Core API
4. Connect your GitHub repository
5. Set environment variables:
   - `ConnectionStrings__DefaultConnection` - Auto-provided by Railway PostgreSQL service
   - `UPLOAD_PASSWORD` - Your upload password
   - `ASPNETCORE_ENVIRONMENT` - `Production`
   - `CORS_ORIGINS` - Your Vercel frontend URL
6. Deploy

## Usage

### Uploading Photos

1. Navigate to `/upload` page
2. Enter the upload password
3. Select a ZIP file containing images
4. Click "Upload Photos"

Supported image formats: JPG, JPEG, PNG, GIF, WEBP, BMP

### Updating Photo Metadata

After uploading, you can update photo metadata (title, description, keywords) via the API:

```bash
POST /api/photos/metadata/{id}
Headers:
  X-Upload-Password: your-password
Body:
  {
    "title": "Photo Title",
    "description": "Photo description",
    "keywords": ["keyword1", "keyword2"]
  }
```

## Security

- Upload endpoint is password protected
- File type validation (images only)
- File size limits (10MB per file, 100MB per ZIP)
- CORS configured for frontend domain
- Sanitized file names

## License

Private memorial site.





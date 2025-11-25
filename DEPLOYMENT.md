# Deployment Guide

## Prerequisites

- GitHub account with repository: https://github.com/smcnary/scottmcnary.git
- Vercel account (free tier works)
- Railway account (free tier works)

## Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/smcnary/scottmcnary.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import the GitHub repository `smcnary/scottmcnary`
   - Configure the project:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Set Environment Variables**
   - In Vercel project settings, add:
     - `NEXT_PUBLIC_API_URL` = Your Railway backend URL (e.g., `https://your-app.railway.app`)

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch

## Backend & Database Deployment (Railways)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select `smcnary/scottmcnary`

2. **Add PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database

3. **Deploy Backend API**
   - In your Railway project, click "New"
   - Select "GitHub Repo" → Select `smcnary/scottmcnary`
   - Configure the service:
     - **Root Directory**: `backend`
     - **Build Command**: `dotnet restore && dotnet build`
     - **Start Command**: `dotnet run --urls http://0.0.0.0:$PORT`

4. **Set Environment Variables**
   - In the backend service settings, add:
     - `ConnectionStrings__DefaultConnection` = (Auto-provided by Railway PostgreSQL service - use the variable reference)
     - `UPLOAD_PASSWORD` = Your secure upload password
     - `ASPNETCORE_ENVIRONMENT` = `Production`
     - `CORS_ORIGINS` = Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

5. **Link Database to Backend**
   - In the backend service, go to "Variables" tab
   - Add a variable reference to the PostgreSQL service's `DATABASE_URL`
   - Railway will automatically set `ConnectionStrings__DefaultConnection`

6. **Deploy**
   - Railway will automatically deploy on every push to main branch
   - The first deployment will run database migrations automatically

## Post-Deployment

1. **Update Vercel Environment Variable**
   - After Railway deployment, copy your backend URL
   - Update `NEXT_PUBLIC_API_URL` in Vercel with the Railway URL

2. **Test Upload**
   - Navigate to `https://your-app.vercel.app/upload`
   - Enter the upload password
   - Upload a test ZIP file with images

3. **Verify Gallery**
   - Check that photos appear on the home page
   - Click on a photo to verify individual photo pages work
   - Check that SEO metadata is present in page source

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify database connection string is set correctly
- Ensure `UPLOAD_PASSWORD` is set
- Check CORS origins match your Vercel URL

### Frontend Issues
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for API errors
- Verify CORS is configured on backend

### Database Issues
- Ensure migrations have run (check Railway logs)
- Verify PostgreSQL service is running
- Check connection string format

## File Storage

For production, consider using cloud storage (AWS S3, Cloudflare R2) instead of local filesystem:
- More reliable for Railway deployments
- Better scalability
- Persistent storage across deployments

Update `UploadService.cs` to use cloud storage SDK instead of local file system.


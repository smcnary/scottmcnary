#!/bin/bash

# Script to upload photos to Railway via API endpoint
# Usage: ./upload_via_api.sh

UPLOADS_DIR="/Users/seanmcnary/Desktop/repos/Active-Projects/scottmcnary/backend/wwwroot/uploads"
ARCHIVE_NAME="/tmp/photos_upload.tar.gz"
API_URL="${RAILWAY_API_URL:-https://backend-production-00cb.up.railway.app}"
UPLOAD_PASSWORD="${UPLOAD_PASSWORD:-}"

echo "=========================================="
echo "Uploading photos to Railway via API"
echo "=========================================="
echo "Source: $UPLOADS_DIR"
echo "API URL: $API_URL"
echo ""

# Check if uploads directory exists
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Error: Uploads directory not found: $UPLOADS_DIR"
    exit 1
fi

# Check for password
if [ -z "$UPLOAD_PASSWORD" ]; then
    echo "Error: UPLOAD_PASSWORD environment variable not set"
    echo "Please set it: export UPLOAD_PASSWORD='your-password'"
    exit 1
fi

# Count files
FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l | tr -d ' ')
echo "Files to upload: $FILE_COUNT"
echo ""

# Check if archive already exists
if [ -f "$ARCHIVE_NAME" ]; then
    echo "Archive already exists: $ARCHIVE_NAME"
    read -p "Use existing archive? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating new archive..."
        rm "$ARCHIVE_NAME"
    else
        echo "Using existing archive."
    fi
fi

# Create archive if it doesn't exist
if [ ! -f "$ARCHIVE_NAME" ]; then
    echo "Creating archive (this may take a few minutes)..."
    tar -czf "$ARCHIVE_NAME" -C "$UPLOADS_DIR" .
    
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
    echo "Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
    echo ""
fi

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "Archive size: $ARCHIVE_SIZE"
echo ""

# Upload to Railway
echo "Uploading to Railway (this may take 10-30 minutes for 2.4GB)..."
echo ""

response=$(curl -X POST \
    -H "X-Upload-Password: $UPLOAD_PASSWORD" \
    -F "archiveFile=@$ARCHIVE_NAME" \
    -w "\n%{http_code}" \
    -s \
    "$API_URL/api/photos/bulk-extract" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response: $body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "=========================================="
    echo "Upload complete!"
    echo "=========================================="
    echo ""
    read -p "Delete local archive? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "$ARCHIVE_NAME"
        echo "Local archive cleaned up."
    else
        echo "Archive kept at: $ARCHIVE_NAME"
    fi
else
    echo "Upload failed. Please check the error above."
    echo "Archive is still available at: $ARCHIVE_NAME"
    exit 1
fi

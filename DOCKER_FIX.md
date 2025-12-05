# Docker Build Fix Applied

## Issue
Frontend Dockerfiles were using `npm ci` which requires `package-lock.json` files. The shared directory doesn't have this file.

## Solution
Changed from `npm ci` to `npm install` in both frontend Dockerfiles.

## Changes Made
- `frontend/user/Dockerfile` - Uses `npm install` instead of `npm ci`
- `frontend/admin/Dockerfile` - Uses `npm install` instead of `npm ci`

## Try Again
```bash
docker-compose up -d --build
```

This should now build successfully!

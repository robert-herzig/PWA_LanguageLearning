# Deployment Guide for PWA Language Learning App

## Overview
This guide explains how to deploy both the frontend (PWA) and backend (API server) for public testing with the secure chatbot functionality.

## Architecture
- **Frontend**: Deployed to GitHub Pages (automatic via GitHub Actions)
- **Backend**: Deployed to cloud platform (Railway or Render recommended)
- **Security**: API key is stored as environment variable on backend, never exposed publicly

## Frontend Deployment (GitHub Pages)

### Automatic Deployment
1. The GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) is already configured
2. Push any changes to the `main` branch to trigger automatic deployment
3. Your PWA will be available at: `https://robert-herzig.github.io/PWA_LanguageLearning/`

### Manual Deployment Check
```bash
# Check workflow status
git status
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Connect GitHub**: Link your GitHub account
3. **Deploy Project**: 
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `PWA_LanguageLearning` repository
   - Railway will detect the `railway.toml` file and configure automatically

4. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your_api_key_here
   NODE_ENV=production
   CORS_ORIGIN=https://robert-herzig.github.io
   ```

5. **Get Your API URL**: Railway will provide a URL like `https://your-app-name.railway.app`

### Option 2: Render.com (Alternative)
1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Link your GitHub account
3. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your repository
   - Render will use the `render.yaml` configuration

4. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your_api_key_here
   NODE_ENV=production
   CORS_ORIGIN=https://robert-herzig.github.io
   ```

## After Backend Deployment

### Update Frontend Configuration
Once your backend is deployed, you'll need to update the production API URL:

1. **Get your backend URL** (e.g., `https://your-app-name.railway.app`)
2. **Update the chatbot configuration**:

Edit `js/chatbot.js` and replace the production API URL:
```javascript
// In the environment detection section
const API_BASE_URL = isProduction 
  ? 'https://YOUR-ACTUAL-BACKEND-URL.railway.app' // Replace with your actual URL
  : 'http://localhost:3001';
```

3. **Push the update**:
```bash
git add js/chatbot.js
git commit -m "Update production API URL"
git push origin main
```

## Testing the Deployment

### Health Check
Visit your backend URL + `/health` to verify it's running:
- `https://your-backend-url/health`

### Frontend Testing
1. Visit: `https://robert-herzig.github.io/PWA_LanguageLearning/`
2. Navigate to the chatbot section
3. Select a topic and verify the chatbot responds using your API

### Cost Monitoring
Check your OpenAI usage dashboard - each message costs approximately $0.0001

## Troubleshooting

### Frontend Issues
- Check GitHub Actions tab for deployment status
- Verify all files are committed and pushed
- Check browser console for JavaScript errors

### Backend Issues
- Verify environment variables are set correctly
- Check backend logs for CORS or API key errors
- Test health endpoint directly

### API Communication Issues
- Verify CORS configuration includes your GitHub Pages domain
- Check network tab in browser dev tools for failed requests
- Ensure production API URL is correct in chatbot.js

## Security Notes
- API key is never exposed in frontend code
- CORS is configured to only allow your GitHub Pages domain
- Rate limiting is enabled (100 requests per 15 minutes per IP)
- Usage tracking helps monitor costs

## Sharing with Testers
Once deployed, share this URL with your testers:
`https://robert-herzig.github.io/PWA_LanguageLearning/`

They can use the full chatbot functionality without needing their own API key.

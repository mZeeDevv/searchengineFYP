# Vercel Deployment Guide for Fashion FYP API

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **GitHub Repository**: Push your code to GitHub

## 🚀 Deployment Steps

### Step 1: Prepare Environment Variables

1. Go to your Vercel dashboard
2. Select your project → Settings → Environment Variables
3. Add all variables from `vercel-env-guide.txt`:

```bash
# Required Variables
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET_NAME=your_bucket_name
# ... (see vercel-env-guide.txt for complete list)
```

### Step 2: Deploy via GitHub

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a Python project
3. It will use the `vercel.json` configuration

### Step 3: Alternative - CLI Deployment

```bash
# Run the deployment script
./deploy-vercel.ps1  # Windows
# or
./deploy-vercel.sh   # Linux/Mac

# Deploy
vercel --prod
```

## 📁 File Structure for Vercel

```
your-project/
├── api/
│   └── index.py          # Vercel entry point
├── app/                  # Your FastAPI app
├── static/               # Static files (handled separately)
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── vercel.json          # Vercel configuration
└── .env                 # Local environment (not deployed)
```

## 🔧 Environment Variables Required

| Variable | Description |
|----------|-------------|
| `QDRANT_URL` | Your Qdrant cluster URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET_NAME` | Firebase storage bucket |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_MOCK_MODE` | Set to `false` for production |

## 🌍 Frontend Considerations

Since static files are handled differently in Vercel:

1. **Option 1**: Deploy frontend separately (Recommended)
   - Deploy static files to Vercel as a separate project
   - Point API calls to your FastAPI Vercel deployment

2. **Option 2**: Use Vercel's static file handling
   - Put static files in `public/` directory
   - Configure routes in `vercel.json`

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

- `GET /` - API information
- `POST /api/v1/vectors/upload-and-store` - Upload and store
- `GET /api/v1/config/firebase` - Firebase configuration
- `POST /api/v1/vectors/search` - Similarity search

## ⚠️ Important Notes

1. **Cold Starts**: First request may be slow
2. **Timeout**: Vercel has execution time limits
3. **Size Limits**: Large models might need optimization
4. **Dependencies**: TensorFlow is large - consider alternatives
5. **Static Files**: Deploy frontend separately for better performance

## 🐛 Troubleshooting

1. **Import Errors**: Check `requirements.txt`
2. **Environment Variables**: Verify all are set correctly
3. **Timeout Issues**: Optimize model loading
4. **CORS Issues**: Check CORS configuration in main.py

## 📊 Performance Optimization

1. Use `tensorflow-cpu` instead of full TensorFlow
2. Consider model optimization for serverless
3. Implement caching for embeddings
4. Use lighter dependencies where possible

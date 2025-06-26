# Vercel Deployment Script for Windows
# Run this before deploying to Vercel

Write-Host "🚀 Preparing for Vercel deployment..." -ForegroundColor Green

# Copy production requirements
Copy-Item "requirements-vercel.txt" "requirements.txt" -Force

Write-Host "📦 Requirements updated for Vercel" -ForegroundColor Yellow
Write-Host "🔧 Make sure to set environment variables in Vercel dashboard" -ForegroundColor Yellow
Write-Host "📋 See vercel-env-guide.txt for required environment variables" -ForegroundColor Yellow

# Vercel CLI deployment (uncomment if you have Vercel CLI installed)
# vercel --prod

Write-Host "✅ Ready for Vercel deployment" -ForegroundColor Green
Write-Host "💡 Deploy using: vercel --prod" -ForegroundColor Cyan

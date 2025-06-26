#!/bin/bash
# Vercel Deployment Script

echo "🚀 Preparing for Vercel deployment..."

# Copy production requirements
cp requirements-vercel.txt requirements.txt

echo "📦 Requirements updated for Vercel"
echo "🔧 Make sure to set environment variables in Vercel dashboard"
echo "📋 See vercel-env-guide.txt for required environment variables"

# Vercel CLI deployment (uncomment if you have Vercel CLI installed)
# vercel --prod

echo "✅ Ready for Vercel deployment"
echo "💡 Deploy using: vercel --prod"

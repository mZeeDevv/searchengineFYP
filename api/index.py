"""
Vercel serverless function entry point for FastAPI
"""
from main import app

# This is the handler that Vercel will call
def handler(request):
    return app(request.environ, lambda status, headers: None)

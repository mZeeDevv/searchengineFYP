# Fashion FYP Backend

This is the backend API for the Fashion Final Year Project built with FastAPI.

## Setup

1. Create a virtual environment:
```bash
python -m venv .venv
```

2. Activate the virtual environment:
```bash
# Windows
.venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

To start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Main API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Development

Add your API routes and models as you develop your fashion project features.




import {QdrantClient} from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: 'https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI',
});

try {
    const result = await client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}
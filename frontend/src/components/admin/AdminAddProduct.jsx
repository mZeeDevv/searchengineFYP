// Admin Add Product Component
import React, { useState } from 'react';
import { uploadAndStoreImage } from '../../services/api';

const AdminAddProduct = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [price, setPrice] = useState('');
  const [productName, setProductName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !price || !productName) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📤 Adding product to database...');
      const uploadResult = await uploadAndStoreImage(file, price, productName);
      
      console.log('✅ Product added successfully:', uploadResult);
      setResult(uploadResult);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setPrice('');
    setProductName('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Product</h1>
        <p className="text-gray-600">Upload a new fashion item to the database</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {result && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold text-green-800">Product Added Successfully!</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 mb-3">Product Details:</h4>
              <div className="space-y-2 text-sm">
                <p className="text-green-700"><strong>Filename:</strong> {result.filename}</p>
                <p className="text-green-700"><strong>Product Name:</strong> {result.product_name || 'N/A'}</p>
                <p className="text-green-700"><strong>Vector ID:</strong> {result.vector_id}</p>
                <p className="text-green-700"><strong>Processing Time:</strong> {result.processing_time}s</p>
                <p className="text-green-700"><strong>Price:</strong> ${result.price || 'N/A'}</p>
                <p className="text-green-700"><strong>Status:</strong> {result.embedding_status}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 mb-3">AI Embeddings:</h4>
              <div className="space-y-2 text-sm">
                <p className="text-green-700"><strong>Model:</strong> {result.model_used}</p>
                <p className="text-green-700"><strong>Dimensions:</strong> {result.embedding_shape?.[0] || 'N/A'}</p>
                <p className="text-green-700"><strong>Confidence:</strong> High</p>
                <p className="text-green-700"><strong>Vector Database:</strong> Qdrant</p>
              </div>
            </div>
          </div>
          
          {result.firebase_url && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-green-700 mb-2"><strong>Firebase URL:</strong></p>
              <a 
                href={result.firebase_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
              >
                {result.firebase_url}
              </a>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={resetForm}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Another Product
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!result && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Product Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name (e.g., 'Red Summer Dress', 'Nike Air Max')"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Give your product a descriptive name
            </p>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter the product price in USD
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Fashion Image
                </h3>
                <p className="text-gray-600">
                  Click to select or drag and drop an image
                </p>
              </label>
            </div>
          </div>

          {/* Preview */}
          {file && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="border rounded-lg overflow-hidden max-w-md">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    <strong>Filename:</strong> {file.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || !price || !productName || loading}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                flex items-center gap-2
                ${!file || !price || !productName || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Add Product
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddProduct;

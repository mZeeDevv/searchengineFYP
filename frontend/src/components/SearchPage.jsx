import { useState, useEffect } from 'react';
import { uploadAndStoreImage, searchSimilarImages } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const SearchPage = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'search', 'results'
  const [price, setPrice] = useState(''); // For product price
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleUploadAndStore = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Uploading and storing image...');
      const result = await uploadAndStoreImage(file, price);
      
      console.log('✅ Upload successful:', result);
      setUploadResult(result);
      setCurrentStep('search');
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching for similar images...');
      
      // Pass user ID if user is logged in
      const userId = currentUser ? currentUser.uid : null;
      if (userId) {
        console.log('👤 User is logged in, will save search embeddings for user:', userId);
      } else {
        console.log('👤 User is not logged in, search embeddings will not be saved');
      }
      
      const searchResult = await searchSimilarImages(file, 5, 0.7, userId);
      
      console.log('✅ Search successful:', searchResult);
      setResults(searchResult.similar_images || []);
      setCurrentStep('results');
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setFile(null);
    setResults([]);
    setUploadResult(null);
    setCurrentStep('upload');
    setError(null);
    setPrice('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center justify-start py-10 px-4 font-sans">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Fashion Visual Search
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-lg mx-auto">
          Upload your fashion image and discover similar styles from our curated collection ✨
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-pink-600' : currentStep === 'search' || currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'bg-pink-100' : currentStep === 'search' || currentStep === 'results' ? 'bg-green-100' : 'bg-gray-100'}`}>1</div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${currentStep === 'search' ? 'text-pink-600' : currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'search' ? 'bg-pink-100' : currentStep === 'results' ? 'bg-green-100' : 'bg-gray-100'}`}>2</div>
            <span className="ml-2 font-medium">Search</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'results' ? 'bg-green-100' : 'bg-gray-100'}`}>3</div>
            <span className="ml-2 font-medium">Results</span>
          </div>
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <>
          {/* Price Input */}
          <div className="w-full max-w-2xl mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Price *
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
                className="w-full pl-8 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              � Enter the product price in USD
            </p>
          </div>

          {/* Upload Area */}
          <div className="w-full max-w-2xl mb-12">
            <div className="border-2 border-dashed border-pink-300 rounded-xl p-12 text-center bg-pink-50 cursor-pointer transition-colors hover:bg-pink-100 mb-6">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="mx-auto mb-4 h-16 w-16 text-pink-600">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Upload Your Fashion Image
                </h3>
                <p className="text-gray-600">
                  Drag and drop or click to select an image
                </p>
              </label>
            </div>

            {file && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-72 object-cover"
                />
                <div className="p-4 bg-pink-50 text-center">
                  <p className="text-pink-700 font-medium">
                    Ready to upload and store!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="mb-16">
            <button
              onClick={handleUploadAndStore}
              disabled={!file || !price || loading}
              className={`
                px-12 py-4 rounded-xl text-lg font-medium transition-all duration-300 
                flex items-center gap-3 border-0
                ${!file || !price || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-pink-600 text-white cursor-pointer shadow-lg hover:bg-pink-700 hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading to Firebase...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload & Store Image
                </>
              )}
            </button>
          </div>
        </>
      )}      {/* Step 2: Upload Success & Search */}
      {currentStep === 'search' && uploadResult && (
        <div className="w-full max-w-4xl">
          {/* Upload Success */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold text-green-800">Upload Successful! ✅</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Image Details:</h4>
                <p className="text-green-700"><strong>Filename:</strong> {uploadResult.filename}</p>
                <p className="text-green-700"><strong>Vector ID:</strong> {uploadResult.vector_id}</p>
                <p className="text-green-700"><strong>Processing Time:</strong> {uploadResult.processing_time}s</p>
                <p className="text-green-700"><strong>Price:</strong> ${uploadResult.price || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-800 mb-2">AI Embeddings:</h4>
                <p className="text-green-700"><strong>Model:</strong> {uploadResult.model_used}</p>
                <p className="text-green-700"><strong>Dimensions:</strong> {uploadResult.embedding_shape?.[0] || 'N/A'}</p>
                <p className="text-green-700"><strong>Status:</strong> {uploadResult.embedding_status}</p>
              </div>
            </div>
            
            {uploadResult.firebase_url && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-sm text-green-700 mb-2"><strong>Firebase URL:</strong></p>
                <a 
                  href={uploadResult.firebase_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                >
                  {uploadResult.firebase_url}
                </a>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="text-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`
                px-12 py-4 rounded-xl text-lg font-medium transition-all duration-300 
                flex items-center gap-3 border-0 mx-auto
                ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white cursor-pointer shadow-lg hover:bg-purple-700 hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching Similar Images...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Similar Styles
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Search Results */}
      {currentStep === 'results' && (
        <div className="w-full max-w-6xl">
          {results.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ✨ {results.length} Similar Styles Found
                </h2>
                <p className="text-xl text-gray-600">
                  Discover fashion items that match your style
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map((result, index) => (
                  <div
                    key={result.id || index}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeIn"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      {result.firebase_url ? (
                        <img
                          src={result.firebase_url}
                          alt={`Similar style ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Similarity
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p><strong>Filename:</strong> {result.filename || 'Unknown'}</p>
                        {result.user_id && (
                          <p><strong>User:</strong> {result.user_id}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.2-5.5-3M3 12a9 9 0 0118 0 9 9 0 01-18 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Similar Images Found</h3>
              <p className="text-gray-600 mb-6">Try uploading a different fashion image or lower the similarity threshold.</p>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center mt-12">
            <button
              onClick={resetSearch}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchPage;

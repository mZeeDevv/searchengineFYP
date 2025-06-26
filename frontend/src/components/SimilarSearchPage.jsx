import { useState } from 'react';
import { searchSimilarImages } from '../services/api';

const SimilarSearchPage = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const handleSearch = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSearchPerformed(false);
    
    try {
      const searchResult = await searchSimilarImages(file, 10, 0.5); // 10 results, 0.5 threshold
      
      setResults(searchResult.similar_images || []);
      setSearchPerformed(true);
      
      // Reset image loading states for new results
      setImageLoadingStates({});
      setImageErrors({});
      
      // Pre-initialize loading states for all images
      if (searchResult.similar_images) {
        const initialLoadingStates = {};
        const preloadPromises = [];
        
        searchResult.similar_images.forEach((result, index) => {
          if (result.metadata?.firebase_url) {
            const resultId = result.id || index;
            initialLoadingStates[resultId] = true;
            
            // Start preloading the image
            const preloadPromise = preloadImage(result.metadata.firebase_url)
              .then(() => {
                setImageLoadingStates(prev => ({
                  ...prev,
                  [resultId]: false
                }));
              })
              .catch((error) => {
                setImageLoadingStates(prev => ({
                  ...prev,
                  [resultId]: false
                }));
                setImageErrors(prev => ({
                  ...prev,
                  [resultId]: true
                }));
              });
            
            preloadPromises.push(preloadPromise);
          }
        });
        
        setImageLoadingStates(initialLoadingStates);
      }
      
    } catch (error) {
      setError(error.message);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setFile(null);
    setResults([]);
    setError(null);
    setSearchPerformed(false);
    setImageLoadingStates({});
    setImageErrors({});
  };

  const handleImageLoad = (resultId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [resultId]: false
    }));
  };

  const handleImageError = (resultId, url) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [resultId]: false
    }));
    setImageErrors(prev => ({
      ...prev,
      [resultId]: true
    }));
  };

  // Firebase URLs come pre-encoded from the API, so we don't need to encode them further
  const validateFirebaseURL = (url) => {
    if (!url) return url;
    return url; // Return the URL unchanged since it's already properly encoded
  };

  // Preload images for faster display
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Remove crossOrigin to avoid CORS issues with Firebase Storage
      
      // Use the Firebase URL as-is since it's already properly encoded
      const validatedUrl = validateFirebaseURL(url);
      
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = validatedUrl;
      
      // Add timeout for slow loading images
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Image load timeout'));
        }
      }, 10000); // 10 second timeout
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-start py-10 px-4 font-sans">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Find Similar Styles
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-lg mx-auto">
          Upload any fashion image and discover visually similar items from our database 🔍
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

      {/* Upload Area */}
      <div className="w-full max-w-2xl mb-12">
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50 cursor-pointer transition-colors hover:bg-blue-100 mb-6">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <div className="mx-auto mb-4 h-16 w-16 text-blue-600">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Upload Image to Search
            </h3>
            <p className="text-gray-600">
              Drag and drop or click to select a fashion image
            </p>
          </label>
        </div>

        {file && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
            <img
              src={URL.createObjectURL(file)}
              alt="Search query"
              className="w-full h-72 object-cover"
            />
            <div className="p-4 bg-blue-50 text-center">
              <p className="text-blue-700 font-medium">
                Ready to find similar styles!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <div className="mb-16">
        <button
          onClick={handleSearch}
          disabled={!file || loading}
          className={`
            px-12 py-4 rounded-xl text-lg font-medium transition-all duration-300 
            flex items-center gap-3 border-0
            ${!file || loading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white cursor-pointer shadow-lg hover:bg-blue-700 hover:shadow-xl'
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

      {/* Search Results */}
      {searchPerformed && (
        <div className="w-full max-w-7xl">
          {results.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🎯 Found {results.length} Similar Styles
                </h2>
                <p className="text-xl text-gray-600">
                  Results sorted by similarity score (minimum 50% match)
                </p>
                
                {/* Image loading progress */}
                {Object.values(imageLoadingStates).some(loading => loading) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm text-blue-700">
                        Loading images... ({Object.values(imageLoadingStates).filter(loading => !loading).length}/{Object.keys(imageLoadingStates).length} loaded)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                {results.map((result, index) => (
                  <div
                    key={result.id || index}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeIn"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      {result.metadata?.firebase_url ? (
                        <>
                          {/* Loading spinner */}
                          {imageLoadingStates[result.id || index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="flex flex-col items-center space-y-2">
                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs text-gray-600">Loading image...</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Error state */}
                          {imageErrors[result.id || index] ? (
                            <div className="w-full h-full bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-xs text-red-600 text-center px-2">
                                Failed to load image
                              </span>
                              <button 
                                onClick={() => {
                                  setImageErrors(prev => ({ ...prev, [result.id || index]: false }));
                                  setImageLoadingStates(prev => ({ ...prev, [result.id || index]: true }));
                                }}
                                className="mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"
                              >
                                Retry
                              </button>
                            </div>
                          ) : (
                            <img
                              src={validateFirebaseURL(result.metadata.firebase_url)}
                              alt={`Similar style ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              loading="lazy"
                              onLoad={() => handleImageLoad(result.id || index)}
                              onError={() => handleImageError(result.id || index, result.metadata.firebase_url)}
                              style={{
                                display: imageLoadingStates[result.id || index] ? 'none' : 'block'
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-500">No Image URL</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Similarity
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="truncate"><strong>File:</strong> {result.metadata?.filename || 'Unknown'}</p>
                        {result.metadata?.user_id && (
                          <p className="truncate"><strong>User:</strong> {result.metadata.user_id}</p>
                        )}
                        {result.metadata?.upload_timestamp && (
                          <p><strong>Uploaded:</strong> {new Date(result.metadata.upload_timestamp).toLocaleDateString()}</p>
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
              <p className="text-gray-600 mb-6">
                No images found with similarity above 50%. Try uploading a different fashion image.
              </p>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={resetSearch}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Search Another Image
            </button>
          </div>
        </div>
      )}

      {/* Search Info */}
      <div className="w-full max-w-4xl mt-16 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="mb-2">🔍 <strong>Search Parameters:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Returns up to 10 similar images</li>
              <li>Minimum similarity threshold: 50%</li>
              <li>Uses AI-powered visual similarity</li>
            </ul>
          </div>
          <div>
            <p className="mb-2">🎯 <strong>Results Include:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Similarity percentage score</li>
              <li>Original filename and upload date</li>
              <li>User information (if available)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarSearchPage;

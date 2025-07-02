import { useState, useEffect } from 'react';
import { searchSimilarImages } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SimilarSearchPage = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState('neutral');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSearchPerformed(false);
    
    try {
      // Pass user ID if user is logged in
      const userId = currentUser ? currentUser.uid : null;
      if (userId) {
        console.log('👤 User is logged in, will save search embeddings for user:', userId);
      } else {
        console.log('👤 User is not logged in, search embeddings will not be saved');
      }
      
      const searchResult = await searchSimilarImages(file, 10, 0.5, userId); // 10 results, 0.5 threshold
      
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
    setShowFeedbackForm(false);
    setFeedbackRating(0);
    setFeedbackComment('');
    setFeedbackSatisfaction('neutral');
    setFeedbackSubmitted(false);
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) {
      setError("Please provide a star rating before submitting feedback");
      return;
    }

    try {
      setSubmittingFeedback(true);
      
      // Prepare the feedback data
      const feedbackData = {
        rating: feedbackRating,
        satisfaction: feedbackSatisfaction,
        comment: feedbackComment,
        timestamp: serverTimestamp(),
        search_results: results.map(result => ({
          id: result.id,
          score: result.score,
          product_name: result.metadata?.product_name || 'Unknown'
        })),
        user_id: currentUser ? currentUser.uid : 'anonymous',
        search_image_name: file ? file.name : 'unknown'
      };
      
      // Add to Firestore
      await addDoc(collection(db, "users_feedback"), feedbackData);
      
      console.log("✅ Feedback submitted successfully!", feedbackData);
      
      // Show success state
      setFeedbackSubmitted(true);
      setSubmittingFeedback(false);
      
      // Reset form after a delay
      setTimeout(() => {
        setShowFeedbackForm(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(`Failed to submit feedback: ${error.message}`);
      setSubmittingFeedback(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-fashionvs-primary-50 via-fashionvs-neutral-50 to-fashionvs-secondary-50 flex flex-col items-center justify-start py-10 px-4 font-sans">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-fashionvs-primary-700 to-fashionvs-primary-800 bg-clip-text text-transparent mb-4">
          Discover Similar Products
        </h1>
        <p className="text-xl text-fashionvs-neutral-600 font-light max-w-lg mx-auto">
          Upload any fashion image and find matching products to shop right away �️
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-red-50 border border-fashionvs-error/30 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-fashionvs-error mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-fashionvs-error font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="w-full max-w-2xl mb-12">
        <div className="border-2 border-dashed border-fashionvs-primary-300 rounded-xl p-12 text-center bg-fashionvs-primary-50 cursor-pointer transition-colors hover:bg-fashionvs-primary-100 mb-6">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <div className="mx-auto mb-4 h-16 w-16 text-fashionvs-primary-600">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-fashionvs-neutral-800 mb-2">
              Upload Image to Search
            </h3>
            <p className="text-fashionvs-neutral-600">
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
            <div className="p-4 bg-fashionvs-primary-50 text-center">
              <p className="text-fashionvs-primary-700 font-medium">
                Ready to find similar products!
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
              : 'bg-fashionvs-primary-600 text-white cursor-pointer shadow-lg hover:bg-fashionvs-primary-700 hover:shadow-xl'
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
              Find Similar Products
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
                <h2 className="text-3xl font-bold text-fashionvs-neutral-800 mb-4">
                  🎯 Found {results.length} Similar Products
                </h2>
                <p className="text-xl text-fashionvs-neutral-600">
                  Browse these products based on your image search
                </p>
                
                {/* Image loading progress */}
                {Object.values(imageLoadingStates).some(loading => loading) && (
                  <div className="mt-4 p-3 bg-fashionvs-primary-50 border border-fashionvs-primary-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-fashionvs-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm text-fashionvs-primary-700">
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
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeIn cursor-pointer group"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      {result.metadata?.firebase_url ? (
                        <>
                          {/* Loading spinner */}
                          {imageLoadingStates[result.id || index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-fashionvs-primary-50">
                              <div className="flex flex-col items-center space-y-2">
                                <svg className="animate-spin h-8 w-8 text-fashionvs-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs text-fashionvs-neutral-600">Loading image...</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Error state */}
                          {imageErrors[result.id || index] ? (
                            <div className="w-full h-full bg-red-50 border-2 border-fashionvs-error/30 flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-fashionvs-error mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-xs text-fashionvs-error text-center px-2">
                                Failed to load image
                              </span>
                              <button 
                                onClick={() => {
                                  setImageErrors(prev => ({ ...prev, [result.id || index]: false }));
                                  setImageLoadingStates(prev => ({ ...prev, [result.id || index]: true }));
                                }}
                                className="mt-2 px-2 py-1 bg-red-100 text-fashionvs-error text-xs rounded hover:bg-red-200"
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
                      <div className="mb-2">
                        <h3 className="text-sm font-medium text-fashionvs-neutral-800 truncate">
                          {result.metadata?.product_name || 'Fashion Item ' + (index + 1)}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-fashionvs-primary-700 font-semibold">
                            ${result.metadata?.price || ((19.99 + index * 5).toFixed(2))}
                          </span>
                          <span className="px-2 py-1 bg-fashionvs-primary-100 text-fashionvs-primary-800 text-xs font-medium rounded-full">
                            {(result.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-fashionvs-neutral-500 space-y-1 border-t border-fashionvs-neutral-100 pt-2">
                        <p><strong>Added:</strong> {result.metadata?.product_added_date ? 
                          new Date(result.metadata.product_added_date).toLocaleDateString() : 
                          result.metadata?.upload_timestamp ? 
                          new Date(result.metadata.upload_timestamp).toLocaleDateString() : 
                          'Recently added'}
                        </p>
                        {result.metadata?.brand && (
                          <p className="truncate"><strong>Brand:</strong> {result.metadata.brand}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-fashionvs-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.2-5.5-3M3 12a9 9 0 0118 0 9 9 0 01-18 0z" />
              </svg>
              <h3 className="text-xl font-medium text-fashionvs-neutral-800 mb-2">No Similar Products Found</h3>
              <p className="text-fashionvs-neutral-600 mb-6">
                No products found with similarity above 50%. Try uploading a different fashion image.
              </p>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={resetSearch}
              className="px-8 py-3 bg-fashionvs-secondary-600 text-white rounded-lg hover:bg-fashionvs-secondary-700 transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Search Another Image
            </button>
            
            {/* Feedback button */}
            {results.length > 0 && !showFeedbackForm && !feedbackSubmitted && (
              <button 
                onClick={() => setShowFeedbackForm(true)}
                className="mt-6 px-6 py-2 bg-white border border-fashionvs-primary-300 text-fashionvs-primary-700 rounded-lg hover:bg-fashionvs-primary-50 transition-colors duration-300 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Rate Your Search Experience
              </button>
            )}
            
            {/* Feedback submitted message */}
            {feedbackSubmitted && (
              <div className="mt-6 p-4 bg-fashionvs-primary-50 border border-fashionvs-primary-300 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6 text-fashionvs-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-fashionvs-primary-700 font-medium">Thank you for your feedback!</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Feedback Form */}
          {showFeedbackForm && !feedbackSubmitted && (
            <div className="mt-12 w-full max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-fashionvs-primary-100 animate-fadeIn">
              <h3 className="text-xl font-medium text-fashionvs-primary-700 mb-4 text-center">
                Your Feedback Matters
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-fashionvs-neutral-600 mb-3">How would you rate the search results?</p>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 focus:outline-none transition-transform ${feedbackRating >= star ? 'text-fashionvs-accent-gold scale-110' : 'text-fashionvs-neutral-300'}`}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-fashionvs-neutral-600 mb-3">How satisfied are you with the matched products?</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackSatisfaction('unsatisfied')}
                    className={`p-3 rounded-lg border ${feedbackSatisfaction === 'unsatisfied' ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Unsatisfied</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFeedbackSatisfaction('neutral')}
                    className={`p-3 rounded-lg border ${feedbackSatisfaction === 'neutral' ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-3 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Neutral</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFeedbackSatisfaction('satisfied')}
                    className={`p-3 rounded-lg border ${feedbackSatisfaction === 'satisfied' ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-3 5.5a2.5 2.5 0 005 0v-1a.5.5 0 00-.5-.5h-4a.5.5 0 00-.5.5v1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Satisfied</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="feedbackComment" className="block text-sm text-fashionvs-neutral-600 mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  id="feedbackComment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3 py-2 border border-fashionvs-neutral-200 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-300 focus:border-fashionvs-primary-300 resize-none"
                  rows="3"
                  placeholder="Tell us more about your experience..."
                ></textarea>
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-4 py-2 border border-fashionvs-neutral-300 text-fashionvs-neutral-700 rounded-lg hover:bg-fashionvs-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-fashionvs-primary-600 text-white rounded-lg hover:bg-fashionvs-primary-700 flex items-center space-x-2"
                >
                  {submittingFeedback ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Info */}
      <div className="w-full max-w-4xl mt-16 p-6 bg-fashionvs-primary-50 rounded-xl border border-fashionvs-primary-200">
        <h3 className="text-lg font-semibold text-fashionvs-primary-900 mb-3">How It Works:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-fashionvs-primary-800">
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
              <li>Product name and pricing</li>
              <li>Product addition date</li>
              <li>Brand information (when available)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarSearchPage;

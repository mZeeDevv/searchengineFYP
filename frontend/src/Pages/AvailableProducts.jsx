// Available Products Page
import React, { useState, useEffect } from 'react';
import { listAllEmbeddings, getUserRecommendations } from '../services/api';
import { FaSearch, FaSpinner, FaHeart, FaStar, FaUser } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AvailableProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(12); // Start with 12 products in grid
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price-low, price-high
  
  // Recommendations state
  const [currentUser, setCurrentUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchRecommendations(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await listAllEmbeddings();
      setProducts(response.embeddings || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (userId) => {
    try {
      setRecommendationsLoading(true);
      const response = await getUserRecommendations(userId, 8); // Get 8 recommendations
      setRecommendations(response.recommendations || []);
      setShowRecommendations(response.recommendations && response.recommendations.length > 0);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setShowRecommendations(false);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const filteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const filename = product.filename || '';
      const productName = product.product_name || '';
      const price = product.price || '';
      
      return filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
             productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             price.toString().includes(searchTerm.toLowerCase());
    });

    // Sort products
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.upload_timestamp) - new Date(a.upload_timestamp));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.upload_timestamp) - new Date(b.upload_timestamp));
        break;
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const sortedProducts = filteredAndSortedProducts();
  const productsToShow = sortedProducts.slice(0, displayCount);
  const hasMoreProducts = sortedProducts.length > displayCount;

  const loadMoreProducts = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 12);
      setLoadingMore(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-fashionvs-primary-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Products
          </h1>
          <p className="text-xl text-gray-600">
            Discover our curated collection of fashion items
          </p>
        </div>

        {/* Recommendations Section - Only show for logged in users with recommendations */}
        {currentUser && showRecommendations && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FaHeart className="h-6 w-6 text-pink-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recommended For You
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaUser className="mr-2" />
                  <span>Based on your search history</span>
                </div>
              </div>
              
              {recommendationsLoading ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading your recommendations...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {recommendations.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                    >
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden relative">
                        {item.firebase_url ? (
                          <img
                            src={item.firebase_url}
                            alt={item.product_name || 'Recommended product'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                        
                        {/* Similarity Badge */}
                        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <FaStar className="mr-1" />
                          {(item.score * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.product_name || 'Fashion Item'}
                        </h3>
                        
                        {item.price && (
                          <div className="text-lg font-bold text-purple-600 mb-2">
                            ${item.price.toFixed(2)}
                          </div>
                        )}

                        {/* Match Score Bar */}
                        <div className="flex items-center text-xs">
                          <span className="text-gray-500 mr-2">Match</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${item.score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center mt-6">
                <a 
                  href="/recommendations" 
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaHeart className="mr-2" />
                  View All Recommendations
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Description */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through our collection of fashion items. Find styles, compare prices, and discover your next favorite piece.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDisplayCount(12);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
              />
              <FaSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsToShow.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {productsToShow.map((product) => (
                <div
                  key={product.vector_id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {product.firebase_url ? (
                      <img
                        src={product.firebase_url}
                        alt={product.filename || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                      {product.product_name || (product.filename ? product.filename.replace(/\.[^/.]+$/, "") : 'Fashion Item')}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      {product.price ? (
                        <span className="text-2xl font-bold text-fashionvs-primary-600">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-lg text-gray-400">Price not available</span>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="text-sm text-gray-500 space-y-1">
                      {product.upload_timestamp && (
                        <p>
                          Added: {new Date(product.upload_timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      <p className="truncate">
                        ID: {product.vector_id?.substring(0, 8)}...
                      </p>
                    </div>

                    {/* View Image Link */}
                    {product.firebase_url && (
                      <div className="mt-3">
                        <a
                          href={product.firebase_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-fashionvs-primary-600 hover:text-fashionvs-primary-700 text-sm font-medium"
                        >
                          View Full Image
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="text-center">
                <button
                  onClick={loadMoreProducts}
                  disabled={loadingMore}
                  className={`
                    inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg transition-all duration-300
                    ${loadingMore
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-fashionvs-primary-600 text-white hover:bg-fashionvs-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    }
                  `}
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 h-5 w-5" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Products ({sortedProducts.length - displayCount} remaining)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm border p-12 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or clearing the search.' 
                  : 'There are currently no products in the database.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDisplayCount(12);
                  }}
                  className="text-fashionvs-primary-600 hover:text-fashionvs-primary-700 font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableProducts;

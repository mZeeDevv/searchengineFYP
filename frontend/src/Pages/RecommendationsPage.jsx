import React, { useState, useEffect } from 'react';
import { getUserRecommendations } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { FaHeart, FaStar, FaSearch, FaUser, FaClock } from 'react-icons/fa';

const RecommendationsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch recommendations when user is authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchRecommendations();
    }
  }, [currentUser, authLoading]);

  const fetchRecommendations = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Fetching recommendations for user:', currentUser.uid);
      const response = await getUserRecommendations(currentUser.uid, 10);
      
      console.log('✅ Recommendations response:', response);
      setRecommendations(response.recommendations || []);
      
    } catch (error) {
      console.error('❌ Failed to fetch recommendations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FaUser className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view personalized recommendations based on your search history.
          </p>
          <a 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaUser className="mr-2" />
            Login to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaHeart className="h-8 w-8 text-pink-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Personalized Recommendations
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover products tailored to your style based on your search history
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <FaUser className="mr-2" />
            <span>Recommendations for {currentUser.email}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing your preferences...</p>
          </div>
        )}

        {/* No Recommendations */}
        {!loading && recommendations.length === 0 && !error && (
          <div className="text-center py-16 max-w-md mx-auto">
            <FaSearch className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-6">
              Start searching for fashion items to get personalized recommendations based on your preferences!
            </p>
            <a 
              href="/find-similar" 
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaSearch className="mr-2" />
              Start Searching
            </a>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && recommendations.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                ✨ {recommendations.length} Items Recommended For You
              </h2>
              <p className="text-gray-600">
                Based on your recent searches and style preferences
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {recommendations.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden relative">
                    {item.firebase_url ? (
                      <img
                        src={item.firebase_url}
                        alt={item.product_name || 'Recommended product'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    
                    {/* Similarity Badge */}
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <FaStar className="mr-1" />
                      {(item.score * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.product_name || 'Fashion Item'}
                    </h3>
                    
                    {item.price && (
                      <div className="text-2xl font-bold text-purple-600 mb-3">
                        ${item.price.toFixed(2)}
                      </div>
                    )}

                    {/* Recommendation Source */}
                    {item.recommendation_source && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <div className="text-xs text-purple-600 font-medium mb-1">
                          Recommended based on:
                        </div>
                        <div className="text-xs text-gray-600">
                          Search: {item.recommendation_source.search_filename}
                        </div>
                        {item.recommendation_source.search_timestamp && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FaClock className="mr-1" />
                            {formatDate(item.recommendation_source.search_timestamp)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match Score */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Style Match</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-purple-600">
                          {(item.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="text-center mt-12">
              <button
                onClick={fetchRecommendations}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <FaSearch className="mr-2" />
                {loading ? 'Refreshing...' : 'Refresh Recommendations'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;

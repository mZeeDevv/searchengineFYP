// Admin User Feedback Component
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getProductById } from '../../services/api';

const AdminUserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [searchResults, setSearchResults] = useState({});
  const [loadingResults, setLoadingResults] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const feedbackCollection = collection(db, 'users_feedback');
        const feedbackSnapshot = await getDocs(feedbackCollection);
        
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date() // Convert Firestore timestamp
        }));
        
        // Sort by timestamp (newest first)
        feedbackData.sort((a, b) => b.timestamp - a.timestamp);
        
        setFeedbacks(feedbackData);
        
        // Fetch user information for each feedback entry
        const userIds = feedbackData
          .filter(feedback => feedback.user_id && feedback.user_id !== 'anonymous')
          .map(feedback => feedback.user_id);
          
        // Only fetch unique user IDs
        const uniqueUserIds = [...new Set(userIds)];
        
        if (uniqueUserIds.length > 0) {
          setLoadingUserInfo(true);
          
          // Fetch user data for each unique user ID
          const userDataPromises = uniqueUserIds.map(async (userId) => {
            try {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  id: userId,
                  name: userData.firstName && userData.lastName 
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.displayName || 'Unknown User',
                  email: userData.email || '',
                  profilePicture: userData.profilePicture || ''
                };
              }
              return { id: userId, name: 'Unknown User' };
            } catch (error) {
              console.error(`Error fetching user data for ${userId}:`, error);
              return { id: userId, name: 'Unknown User' };
            }
          });
          
          const usersData = await Promise.all(userDataPromises);
          const usersMap = {};
          
          usersData.forEach(user => {
            usersMap[user.id] = user;
          });
          
          setUserInfo(usersMap);
          setLoadingUserInfo(false);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Function to fetch user info for a single user ID
  const fetchUserInfo = async (userId) => {
    if (!userId || userId === 'anonymous' || userInfo[userId]) {
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedUserInfo = {
          ...userInfo,
          [userId]: {
            id: userId,
            name: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.displayName || 'Unknown User',
            email: userData.email || '',
            profilePicture: userData.profilePicture || ''
          }
        };
        setUserInfo(updatedUserInfo);
      }
    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
    }
  };

  const fetchProductDetails = async (feedbackId, resultId) => {
    try {
      // Check if we already have this result
      if (searchResults[resultId]) return;
      
      setLoadingResults(prev => ({ ...prev, [resultId]: true }));
      
      // Use the API to get vector details from Qdrant
      const response = await getProductById(resultId);
      
      setSearchResults(prev => ({
        ...prev,
        [resultId]: response
      }));
    } catch (err) {
      console.error(`Error fetching product details for ${resultId}:`, err);
      setSearchResults(prev => ({
        ...prev,
        [resultId]: { error: err.message }
      }));
    } finally {
      setLoadingResults(prev => ({ ...prev, [resultId]: false }));
    }
  };

  const toggleFeedbackExpansion = (feedbackId) => {
    if (expandedFeedback === feedbackId) {
      setExpandedFeedback(null);
    } else {
      setExpandedFeedback(feedbackId);
      
      // Fetch product details for each result ID if this feedback is expanded
      const feedback = feedbacks.find(f => f.id === feedbackId);
      if (feedback && feedback.search_results) {
        feedback.search_results.forEach(result => {
          fetchProductDetails(feedbackId, result.id);
        });
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSatisfactionColor = (satisfaction) => {
    switch (satisfaction) {
      case 'satisfied':
        return 'bg-green-100 text-green-800';
      case 'unsatisfied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">User Feedback</h1>
            <p className="text-gray-600">Manage and view user feedback from the search experience</p>
          </div>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.2-5.5-3M3 12a9 9 0 0118 0 9 9 0 01-18 0z" />
              </svg>
              <p className="text-gray-600">No feedback submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Search Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <React.Fragment key={feedback.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(feedback.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {feedback.user_id === 'anonymous' ? (
                            <span className="text-gray-500 italic">Anonymous</span>
                          ) : userInfo[feedback.user_id] ? (
                            <div className="flex items-center">
                              {userInfo[feedback.user_id].profilePicture && (
                                <img 
                                  src={userInfo[feedback.user_id].profilePicture} 
                                  alt="User" 
                                  className="h-6 w-6 rounded-full mr-2"
                                />
                              )}
                              <div>
                                <span className="font-medium">{userInfo[feedback.user_id].name}</span>
                                {userInfo[feedback.user_id].email && (
                                  <p className="text-xs text-gray-500">{userInfo[feedback.user_id].email}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-700" title={`User ID: ${feedback.user_id}`}>
                                {feedback.user_id.substring(0, 8)}...
                              </span>
                              {loadingUserInfo ? (
                                <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center">
                                  <div className="w-3 h-3 mr-1 rounded-full border-b-2 border-gray-400 animate-spin"></div>
                                  Loading...
                                </span>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchUserInfo(feedback.user_id);
                                  }}
                                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                                  title="Retry loading user information"
                                >
                                  Load info
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`h-5 w-5 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getSatisfactionColor(feedback.satisfaction)}`}>
                            {feedback.satisfaction.charAt(0).toUpperCase() + feedback.satisfaction.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {feedback.search_image_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleFeedbackExpansion(feedback.id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end space-x-1"
                          >
                            <span>{expandedFeedback === feedback.id ? 'Hide' : 'View'}</span>
                            <svg 
                              className={`h-4 w-4 transition-transform ${expandedFeedback === feedback.id ? 'transform rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded View */}
                      {expandedFeedback === feedback.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* Comment Section */}
                              {feedback.user_id !== 'anonymous' && userInfo[feedback.user_id] && (
                                <div className="p-4 bg-white border-b border-gray-200">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Information:</h4>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center">
                                      {userInfo[feedback.user_id].profilePicture && (
                                        <img 
                                          src={userInfo[feedback.user_id].profilePicture} 
                                          alt="User" 
                                          className="h-10 w-10 rounded-full mr-3"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium text-gray-900">{userInfo[feedback.user_id].name}</p>
                                        {userInfo[feedback.user_id].email && (
                                          <p className="text-sm text-gray-500">{userInfo[feedback.user_id].email}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {feedback.comment && (
                                <div className="p-4 bg-white border-b border-gray-200">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comment:</h4>
                                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                                    {feedback.comment}
                                  </div>
                                </div>
                              )}
                              
                              {/* Search Results */}
                              <div className="p-4 bg-white">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">Search Results:</h4>
                                
                                {feedback.search_results && feedback.search_results.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {feedback.search_results.map((result) => {
                                      const productData = searchResults[result.id];
                                      const isLoading = loadingResults[result.id];
                                      
                                      return (
                                        <div key={result.id} className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                          <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                                            {isLoading ? (
                                              <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                              </div>
                                            ) : productData?.error ? (
                                              <div className="flex items-center justify-center h-full text-red-500 text-sm p-2 text-center">
                                                Failed to load image
                                              </div>
                                            ) : productData?.metadata?.firebase_url ? (
                                              <img 
                                                src={productData.metadata.firebase_url} 
                                                alt={productData.metadata.product_name || 'Product'} 
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="flex items-center justify-center h-full text-gray-400">
                                                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-3">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {result.product_name}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                              <span className="text-xs text-gray-500">
                                                ID: {result.id.substring(0, 8)}...
                                              </span>
                                              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                {(result.score * 100).toFixed(0)}% match
                                              </span>
                                            </div>
                                            {productData?.metadata?.price && (
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                ${productData.metadata.price}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-gray-50 rounded-md">
                                    <p className="text-gray-500">No search results found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserFeedback;

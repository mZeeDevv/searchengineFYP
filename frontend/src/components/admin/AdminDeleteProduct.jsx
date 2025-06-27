// Admin Delete Product Component
import React, { useState, useEffect } from 'react';
import { listAllEmbeddings, deleteProduct } from '../../services/api';

const AdminDeleteProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [displayCount, setDisplayCount] = useState(10); // Start with 10 products
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products from API...');
      const response = await listAllEmbeddings();
      console.log('📦 API Response:', response);
      console.log('📊 Embeddings in response:', response.embeddings);
      console.log('📈 Number of embeddings:', response.embeddings?.length || 0);
      setProducts(response.embeddings || []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vectorId, filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(vectorId);
      setError(null);
      
      await deleteProduct(vectorId);
      
      // Remove from local state
      setProducts(products.filter(p => p.vector_id !== vectorId));
      setSuccess(`Product "${filename}" deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const filename = product.filename || '';
    const productName = product.product_name || '';
    const vectorId = product.vector_id || '';
    const price = product.price || '';
    
    return filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
           productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vectorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           price.toString().includes(searchTerm.toLowerCase());
  });

  // Get products to display (limited by displayCount)
  const productsToShow = filteredProducts.slice(0, displayCount);
  const hasMoreProducts = filteredProducts.length > displayCount;

  const loadMoreProducts = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount(prev => prev + 10);
      setLoadingMore(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-300 h-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Product</h1>
        <p className="text-gray-600">Manage and remove products from the database</p>
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
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name, filename, vector ID, or price..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDisplayCount(10); // Reset display count when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Showing {productsToShow.length} of {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Products ({filteredProducts.length})
          </h2>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDisplayCount(10);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          )}
        </div>
        
        {productsToShow.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {productsToShow.map((product) => (
                <div key={product.vector_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {product.firebase_url ? (
                          <img
                            src={product.firebase_url}
                            alt={product.filename || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {product.product_name || product.filename || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Filename:</strong> {product.filename || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Vector ID:</strong> {product.vector_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Price:</strong> ${product.price ? parseFloat(product.price).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            <strong>Uploaded:</strong> {
                              product.upload_timestamp 
                                ? new Date(product.upload_timestamp).toLocaleDateString()
                                : 'Unknown'
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Model:</strong> {product.model_used || 'N/A'}
                          </p>
                          {product.firebase_url && (
                            <a 
                              href={product.firebase_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              View Image
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleDelete(product.vector_id, product.product_name || product.filename)}
                        disabled={deleting === product.vector_id}
                        className={`
                          inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg
                          ${deleting === product.vector_id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                          }
                        `}
                      >
                        {deleting === product.vector_id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className={`
                      inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg
                      ${loadingMore
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }
                    `}
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        See More ({filteredProducts.length - displayCount} remaining)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No products found matching your search' : 'No products found'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDisplayCount(10);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDeleteProduct;

import React from 'react';
import { Link } from 'react-router-dom';

const HowToUse = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-6">How to Use Our Fashion Visual Search</h1>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                Welcome to our Fashion Visual Search platform! This guide will walk you through the steps to get the most out of our application.
              </p>

              {/* Quick Navigation Links */}
              <div className="bg-green-50 p-6 rounded-lg mb-10">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Quick Navigation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <Link to="/find-similar" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    Find Similar
                  </Link>
                  <Link to="/available-products" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    Available Products
                  </Link>
                  <Link to="/recommendations" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    Recommendations
                  </Link>
                  <Link to="/search" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    Search
                  </Link>
                  <Link to="/about" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    About Us
                  </Link>
                  <Link to="/login" className="bg-white hover:bg-green-100 transition-colors p-3 rounded-md text-center shadow-sm border border-green-100 text-green-800 font-medium">
                    Login / Sign Up
                  </Link>
                </div>
              </div>
              
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-green-700 mb-6">Finding Similar Fashion Items</h2>
                
                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start bg-green-50 p-6 rounded-lg">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-4 flex items-center justify-center h-16 w-16">
                      <span className="text-2xl font-bold text-green-800">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Navigate to "Find Similar" Page</h3>
                      <p className="text-gray-700">
                        Click on the <Link to="/find-similar" className="text-green-700 font-medium hover:underline">"Find Similar"</Link> option in the navigation menu at the top of the page. This will take you to our visual search interface.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start bg-green-50 p-6 rounded-lg">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-4 flex items-center justify-center h-16 w-16">
                      <span className="text-2xl font-bold text-green-800">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Upload Your Image</h3>
                      <p className="text-gray-700 mb-3">
                        You can upload an image in two ways:
                      </p>
                      <ul className="list-disc ml-6 space-y-2">
                        <li>Click on the upload area to browse your files</li>
                        <li>Drag and drop an image directly onto the upload area</li>
                      </ul>
                      <p className="text-gray-700 mt-3">
                        For best results, use clear images of clothing items against a simple background. The image should primarily feature the fashion item you're searching for.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start bg-green-50 p-6 rounded-lg">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-4 flex items-center justify-center h-16 w-16">
                      <span className="text-2xl font-bold text-green-800">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Processing Your Request</h3>
                      <p className="text-gray-700">
                        After uploading, our system will process your image using advanced machine learning algorithms. This typically takes just a few seconds. You'll see a loading indicator while we analyze your image and search our database for similar items.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start bg-green-50 p-6 rounded-lg">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-4 flex items-center justify-center h-16 w-16">
                      <span className="text-2xl font-bold text-green-800">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">View Your Results</h3>
                      <p className="text-gray-700 mb-3">
                        Once processing is complete, you'll see a grid of visually similar fashion items. Each result includes:
                      </p>
                      <ul className="list-disc ml-6 space-y-2">
                        <li>Product name</li>
                        <li>Price</li>
                        <li>Date added to our collection</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Step 5 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start bg-green-50 p-6 rounded-lg">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-4 flex items-center justify-center h-16 w-16">
                      <span className="text-2xl font-bold text-green-800">5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Provide Feedback</h3>
                      <p className="text-gray-700">
                        After reviewing your results, we'd love to hear your thoughts! At the bottom of the results page, you'll find a feedback form where you can rate your experience, indicate your satisfaction level, and leave any comments. Your feedback helps us improve our visual search algorithms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-green-700 mb-6">Browsing Available Products</h2>
                
                <div className="bg-green-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700 mb-4">
                    If you prefer to browse our collection rather than searching for similar items, you can:
                  </p>
                  <ol className="list-decimal ml-6 space-y-2">
                    <li>Click on <Link to="/available-products" className="text-green-700 font-medium hover:underline">"Available Products"</Link> in the navigation menu</li>
                    <li>Browse through our catalog of fashion items</li>
                    <li>Use filters to narrow down results by category, price, etc.</li>
                    <li>Click on any product to see more details</li>
                  </ol>
                </div>
              </div>
              
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-green-700 mb-6">Getting Personalized Recommendations</h2>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    To get personalized recommendations:
                  </p>
                  <ol className="list-decimal ml-6 space-y-3">
                    <li>Create an account or <Link to="/login" className="text-green-700 font-medium hover:underline">log in</Link> to your existing account</li>
                    <li>Visit the <Link to="/recommendations" className="text-green-700 font-medium hover:underline">"Recommendations"</Link> page from the navigation menu</li>
                    <li>Our system will analyze your previous searches and interactions to suggest items you might like</li>
                    <li>The more you use our platform, the better our recommendations will become!</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-green-100 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-green-800 mb-3">Tips for Best Results</h2>
                
                <ul className="list-disc ml-6 space-y-2">
                  <li>Use high-quality images with good lighting</li>
                  <li>Images should clearly show the fashion item you're searching for</li>
                  <li>Try different angles if you don't get the results you're looking for initially</li>
                  <li>For complex outfits, focus on one item at a time for more accurate results</li>
                  <li><Link to="/login" className="text-green-700 font-medium hover:underline">Sign in</Link> to save your search history and get better recommendations over time</li>
                </ul>
              </div>
              
              {/* Additional Resources */}
              <div className="mt-10 bg-green-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">Additional Resources</h2>
                <div className="space-y-3">
                  <p>
                    <Link to="/about" className="inline-flex items-center text-green-700 hover:text-green-900">
                      <span className="mr-2">Learn about our team and project</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </p>
                  <p>
                    <Link to="/login" className="inline-flex items-center text-green-700 hover:text-green-900">
                      <span className="mr-2">Create an account for personalized recommendations</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </p>
                  <p>
                    <Link to="/find-similar" className="inline-flex items-center text-green-700 hover:text-green-900">
                      <span className="mr-2">Try the visual search now</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;

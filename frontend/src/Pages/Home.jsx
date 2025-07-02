import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaRocket, FaBrain, FaHeart, FaArrowRight, FaUpload, FaFilter, FaShoppingBag } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-tr from-fashionvs-primary-900 via-fashionvs-primary-700 to-fashionvs-primary-500 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Discover Fashion with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fashionvs-accent-cream to-white">
              AI-Powered Vision
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-4xl mx-auto leading-relaxed">
            Upload any fashion image and let our advanced AI instantly find similar styles, colors, and pieces from thousands of brands. Your perfect outfit is just one click away.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              to="/find-similar"
              className="inline-flex items-center px-8 py-4 bg-fashionvs-primary-800 text-white font-semibold rounded-xl hover:bg-fashionvs-primary-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaSearch className="mr-3 h-5 w-5" />
              Start Visual Search
              <FaArrowRight className="ml-3 h-4 w-4" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-fashionvs-primary-900/30 hover:border-transparent transition-all duration-300">
              <FaRocket className="mr-3 h-5 w-5" />
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-fashionvs-accent-cream">Fashion Items</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-fashionvs-accent-cream">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-fashionvs-accent-cream">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-fashionvs-primary-600 mb-4">
              How Our AI Magic Works
            </h2>
            <p className="text-xl text-fashionvs-neutral-600 max-w-3xl mx-auto font-light">
              Experience the future of fashion discovery with our cutting-edge visual recognition technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-fashion transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-fashionvs-primary-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-fashionvs-primary-200 transition-colors">
                  <FaUpload className="h-12 w-12 text-fashionvs-primary-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-fashionvs-neutral-900 mb-4">Upload & Analyze</h3>
                <p className="text-fashionvs-neutral-600 leading-relaxed">
                  Simply upload any fashion image from your device or paste a URL. Our AI instantly analyzes colors, patterns, styles, and textures with incredible precision.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-fashion transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-fashionvs-secondary-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-fashionvs-secondary-200 transition-colors">
                  <FaBrain className="h-12 w-12 text-fashionvs-secondary-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-fashionvs-neutral-900 mb-4">AI Intelligence</h3>
                <p className="text-fashionvs-neutral-600 leading-relaxed">
                  Our neural networks, trained on millions of fashion items, understand style nuances, seasonal trends, and brand aesthetics to deliver perfect matches.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-fashion transition-all duration-300 group-hover:-translate-y-2">
                <div  className="bg-fashionvs-secondary-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 group-hover:bg-fashionvs-secondary-200 transition-colors">
                  <FaShoppingBag className="h-12 w-12 text-fashionvs-secondary-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-fashionvs-neutral-900 mb-4">Discover & Shop</h3>
                <p className="text-fashionvs-neutral-600 leading-relaxed">
                  Browse curated results ranked by similarity, price, and availability. Find your perfect piece from trusted retailers and emerging brands worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-fashionvs-neutral-900 mb-4">
              Why Fashion Lovers Choose Us
            </h2>
            <p className="text-xl text-fashionvs-neutral-600 max-w-3xl mx-auto font-light">
              Revolutionary features that transform how you discover and shop for fashion
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-fashionvs-primary-100 rounded-lg p-3 flex-shrink-0">
                  <FaFilter className="h-6 w-6 text-fashionvs-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-fashionvs-neutral-900 mb-2">Smart Filtering</h3>
                  <p className="text-fashionvs-neutral-600">
                    Filter by size, color, price range, brand, and style preferences. Our AI learns your taste to show more relevant results over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-fashionvs-secondary-100 rounded-lg p-3 flex-shrink-0">
                  <FaHeart className="h-6 w-6 text-fashionvs-secondary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-fashionvs-neutral-900 mb-2">Personalized Recommendations</h3>
                  <p className="text-fashionvs-neutral-600">
                    Get style suggestions tailored to your body type, color preferences, and fashion personality. Discover new looks that complement your existing wardrobe.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-fashionvs-accent-terracotta/20 rounded-lg p-3 flex-shrink-0">
                  <FaRocket className="h-6 w-6 text-fashionvs-accent-terracotta" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-fashionvs-neutral-900 mb-2">Lightning Fast Results</h3>
                  <p className="text-fashionvs-neutral-600">
                    Get instant results in under 3 seconds. Our optimized AI infrastructure ensures you never wait long to find your next favorite piece.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 aspect-square flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <FaBrain className="h-24 w-24 text-fashionvs-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-fashionvs-primary-700 mb-2">AI-Powered Intelligence</h3>
                  <p className="text-fashionvs-neutral-600">
                    Advanced computer vision and machine learning algorithms working 24/7 to understand fashion better than ever before.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-fashionvs-primary-600">
            Ready to Revolutionize Your Style?
          </h2>
          <p className="text-xl font-light mb-8 text-fashionvs-neutral-600">
            Join thousands of fashion enthusiasts who've discovered their perfect style with our AI-powered visual search
          </p>
          <Link
            to="/find-similar"
            className="inline-flex items-center px-10 py-4 bg-fashionvs-primary-600 hover:bg-fashionvs-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FaSearch className="mr-3 h-5 w-5" />
            Start Your Fashion Journey
            <FaArrowRight className="ml-3 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

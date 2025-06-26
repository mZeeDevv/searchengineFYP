import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaSearch, FaBrain, FaHeart, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebase';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle login with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Update last login timestamp
      await setDoc(doc(db, "users", userCredential.user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });

      // Redirect to home page or dashboard
      navigate('/');
    } catch (error) {
      console.error("Error during login:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        // Update last login timestamp for existing user
        await setDoc(doc(db, "users", user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      } else {
        // Create new user document if first time logging in with Google
        await setDoc(doc(db, "users", user.uid), {
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
          email: user.email,
          profilePicture: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }

      // Redirect to home page or dashboard
      navigate('/');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      default:
        return 'An error occurred during sign in. Please try again later.';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-fashionvs-primary-600 via-fashionvs-secondary-600 to-fashionvs-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
              Welcome Back to
              <span className="block text-fashionvs-accent-cream">FashionVS</span>
            </h1>
            <p className="text-xl font-light mb-8 text-fashionvs-primary-100 leading-relaxed">
              Continue your AI-powered fashion discovery journey. Find your perfect style with just a click.
            </p>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaSearch className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Visual Search</h3>
                  <p className="text-fashionvs-primary-200 text-sm">Upload any image and find similar fashion items instantly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaBrain className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Recommendations</h3>
                  <p className="text-fashionvs-primary-200 text-sm">Get personalized style suggestions powered by AI</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaHeart className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Save Favorites</h3>
                  <p className="text-fashionvs-primary-200 text-sm">Build your wishlist and track your favorite finds</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-8 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-fashionvs-accent-cream">10M+</div>
                <div className="text-sm text-fashionvs-primary-200">Fashion Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fashionvs-accent-cream">500K+</div>
                <div className="text-sm text-fashionvs-primary-200">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fashionvs-accent-cream">98%</div>
                <div className="text-sm text-fashionvs-primary-200">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20">
          <FaStar className="h-32 w-32 text-fashionvs-accent-cream" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-10">
          <FaHeart className="h-48 w-48 text-white" />
        </div>
      </div>

      {/* Right Panel - Form Side */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-fashionvs-neutral-50 to-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold text-fashionvs-neutral-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-fashionvs-neutral-600 font-light">
              Sign in to continue your fashion journey
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-fashion p-8 border border-fashionvs-primary-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-fashionvs-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-fashionvs-neutral-300 placeholder-fashionvs-neutral-500 text-fashionvs-neutral-900 focus:outline-none focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-fashionvs-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-fashionvs-neutral-300 placeholder-fashionvs-neutral-500 text-fashionvs-neutral-900 focus:outline-none focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-fashionvs-neutral-400 hover:text-fashionvs-primary-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-fashionvs-neutral-400 hover:text-fashionvs-primary-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-fashionvs-primary-600 focus:ring-fashionvs-primary-500 border-fashionvs-neutral-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-fashionvs-neutral-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-fashionvs-primary-600 hover:text-fashionvs-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg 
                  bg-fashionvs-primary-600 hover:bg-fashionvs-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-fashionvs-primary-500 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-fashionvs-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-fashionvs-neutral-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full inline-flex justify-center py-3 px-4 border border-fashionvs-neutral-300 
                    rounded-lg shadow-sm bg-white text-sm font-medium text-fashionvs-neutral-700 
                    hover:bg-fashionvs-neutral-50 transition-all
                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  <span className="ml-2">Continue with Google</span>
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-fashionvs-neutral-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-fashionvs-primary-600 hover:text-fashionvs-primary-700 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

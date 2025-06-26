import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaGoogle, FaCheck, FaRocket, FaShoppingBag, FaUsers, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebase';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle registration with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Store user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subscribeNewsletter: formData.subscribeNewsletter,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      // Redirect to home page or dashboard
      navigate('/');
    } catch (error) {
      console.error("Error during signup:", error);
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
      
      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        email: user.email,
        subscribeNewsletter: formData.subscribeNewsletter,
        profilePicture: user.photoURL || '',
        createdAt: new Date(),
        lastLogin: new Date()
      }, { merge: true });  // Use merge to update existing documents

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
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      default:
        return 'An error occurred during sign up. Please try again later.';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-fashionvs-secondary-600 via-fashionvs-primary-600 to-fashionvs-secondary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
              Start Your
              <span className="block text-fashionvs-accent-cream">Fashion Journey</span>
            </h1>
            <p className="text-xl font-light mb-8 text-fashionvs-secondary-100 leading-relaxed">
              Join thousands of fashion enthusiasts discovering their perfect style with AI-powered visual search.
            </p>
            
            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaRocket className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instant Discovery</h3>
                  <p className="text-fashionvs-secondary-200 text-sm">Upload any image and find similar items in seconds</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaShoppingBag className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Curated Collections</h3>
                  <p className="text-fashionvs-secondary-200 text-sm">Access millions of fashion items from top brands</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaUsers className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Fashion Community</h3>
                  <p className="text-fashionvs-secondary-200 text-sm">Connect with style enthusiasts worldwide</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <FaChartLine className="h-6 w-6 text-fashionvs-accent-cream" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Trend Insights</h3>
                  <p className="text-fashionvs-secondary-200 text-sm">Stay ahead with the latest fashion trends and predictions</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-fashionvs-accent-cream font-medium text-lg">
                Ready to revolutionize your fashion discovery?
              </p>
              <p className="text-fashionvs-secondary-200 text-sm mt-2">
                Join our community and start finding your perfect style today!
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20">
          <FaShoppingBag className="h-32 w-32 text-fashionvs-accent-cream" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-10">
          <FaRocket className="h-48 w-48 text-white" />
        </div>
      </div>

      {/* Right Panel - Form Side */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-fashionvs-neutral-50 to-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold text-fashionvs-neutral-900 mb-2">
              Join FashionVS
            </h2>
            <p className="text-fashionvs-neutral-600 font-light">
              Create your account and start discovering fashion with AI
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl shadow-fashion p-8 border border-fashionvs-primary-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-fashionvs-neutral-300 placeholder-fashionvs-neutral-500 text-fashionvs-neutral-900 focus:outline-none focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500 transition-all"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-fashionvs-neutral-300 placeholder-fashionvs-neutral-500 text-fashionvs-neutral-900 focus:outline-none focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500 transition-all"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-fashionvs-neutral-400" />
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
                    placeholder="Create a password"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-fashionvs-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-fashionvs-neutral-300 placeholder-fashionvs-neutral-500 text-fashionvs-neutral-900 focus:outline-none focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500 transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-fashionvs-neutral-400 hover:text-fashionvs-primary-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-fashionvs-neutral-400 hover:text-fashionvs-primary-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-fashionvs-primary-600 focus:ring-fashionvs-primary-500 border-fashionvs-neutral-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="text-fashionvs-neutral-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-fashionvs-primary-600 hover:text-fashionvs-primary-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-fashionvs-primary-600 hover:text-fashionvs-primary-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="subscribeNewsletter"
                      name="subscribeNewsletter"
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-fashionvs-primary-600 focus:ring-fashionvs-primary-500 border-fashionvs-neutral-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="subscribeNewsletter" className="text-fashionvs-neutral-700">
                      Subscribe to fashion trends and product updates
                    </label>
                  </div>
                </div>
              </div>

              {/* Signup Button */}
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
                    Processing...
                  </span>
                ) : (
                  <>
                    <FaCheck className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-fashionvs-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-fashionvs-neutral-500">Or sign up with</span>
                </div>
              </div>

              {/* Social Signup */}
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

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-fashionvs-neutral-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-fashionvs-primary-600 hover:text-fashionvs-primary-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

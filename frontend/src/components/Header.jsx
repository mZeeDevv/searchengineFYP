import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaUserShield } from 'react-icons/fa';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAdmin } from './admin/AdminContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle profile dropdown menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <header className="bg-gradient-to-r from-fashionvs-neutral-50 via-white to-fashionvs-primary-50 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-fashionvs-primary-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="group">
              <div className="flex items-center space-x-2 group-hover:shadow-fashion transition-shadow duration-300 rounded-xl p-1.5">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-fashionvs-primary-600 to-fashionvs-primary-400 rounded-lg transform group-hover:rotate-6 transition-transform duration-300 group-hover:animate-pulse-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl tracking-wide font-display font-extrabold bg-gradient-to-r from-fashionvs-primary-800 via-fashionvs-primary-600 to-fashionvs-primary-700 bg-size-200 bg-pos-0 bg-clip-text text-transparent group-hover:bg-pos-100 transition-all duration-500">
                    <span className="font-fashion font-bold italic">FASHION</span>
                    <span className="font-fashion font-light mx-1 opacity-70">|</span>
                    <span className="font-display italic">VISUAL</span>
                  </h2>
                  <div className="flex items-center mt-1 ml-1">
                    <span className="text-sm uppercase tracking-widest text-fashionvs-primary-500 font-fashion font-medium italic transform group-hover:translate-x-1 transition-transform duration-300 mr-1">
                      SEARCH
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fashionvs-primary-500 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 rounded-lg bg-fashionvs-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link 
              to="/find-similar" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
            >
              <span className="relative z-10">Find Similar</span>
              <div className="absolute inset-0 rounded-lg bg-fashionvs-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link 
              to="/available-products" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
            >
              <span className="relative z-10">Available Products</span>
              <div className="absolute inset-0 rounded-lg bg-fashionvs-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link 
              to="/about" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 rounded-lg bg-fashionvs-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            <Link 
              to="/how-to-use" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
            >
              <span className="relative z-10">How to Use</span>
              <div className="absolute inset-0 rounded-lg bg-fashionvs-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            {/* Conditional rendering based on auth state */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={toggleProfileMenu} 
                  className="flex items-center space-x-2 bg-gradient-to-r from-white to-fashionvs-primary-50 border border-fashionvs-primary-200 hover:border-fashionvs-primary-400 text-fashionvs-neutral-800 hover:text-fashionvs-primary-700 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="h-6 w-6 rounded-full object-cover ring-2 ring-fashionvs-primary-200"
                    />
                  ) : (
                    <FaUserCircle className="h-5 w-5 text-fashionvs-primary-500" />
                  )}
                  <span className="truncate max-w-[120px] font-medium">
                    {currentUser.email}
                  </span>
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-fashionvs-primary-200 rounded-xl shadow-xl py-1 z-10 backdrop-blur-sm">
                    {/* User Email Display */}
                    <div className="px-4 py-3 border-b border-fashionvs-primary-100 bg-gradient-to-r from-fashionvs-primary-50 to-white">
                      <p className="text-xs text-fashionvs-neutral-500 font-medium uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm font-semibold text-fashionvs-neutral-900 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    
                    {/* Admin Panel Link */}
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-fashionvs-primary-700 hover:bg-gradient-to-r hover:from-fashionvs-primary-50 hover:to-blue-50 hover:text-fashionvs-primary-800 w-full text-left font-medium transition-all duration-200"
                      >
                        <FaUserShield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    {isAdmin && <hr className="my-1 border-fashionvs-primary-100" />}
                    
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 w-full text-left font-medium transition-all duration-200"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-2 bg-gradient-to-r from-fashionvs-primary-600 to-fashionvs-primary-700 hover:from-fashionvs-primary-700 hover:to-fashionvs-primary-800 text-white px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaUserCircle className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 transition-colors duration-200"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-64 opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-fashionvs-primary-100">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/find-similar"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              Find Similar
            </Link>
            <Link
              to="/available-products"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              Available Products
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/how-to-use"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              How to Use
            </Link>
            
            {/* Mobile: Conditional rendering based on auth state */}
            {currentUser ? (
              <>
                <div className="px-3 py-2 font-medium text-fashionvs-neutral-700 border-b border-fashionvs-neutral-200">
                  <div className="flex items-center space-x-2 mb-2">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="h-8 w-8 text-fashionvs-neutral-500" />
                    )}
                    <div className="truncate">
                      <div className="text-sm text-fashionvs-neutral-500">Signed in as</div>
                      <div className="font-medium truncate">{currentUser.email}</div>
                    </div>
                  </div>
                </div>
                {/* Mobile Admin Panel Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <FaUserShield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 mx-3 my-2 px-4 py-2 bg-fashionvs-primary-600 hover:bg-fashionvs-primary-700 text-white text-base font-medium rounded-lg transition-all duration-200 shadow-md"
              >
                <FaUserCircle className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

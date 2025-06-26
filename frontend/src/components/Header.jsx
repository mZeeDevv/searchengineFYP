import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBars, FaTimes, FaSignOutAlt, FaCog, FaUserCircle } from 'react-icons/fa';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-fashionvs-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h2 className="text-2xl font-display font-bold text-fashionvs-primary-600">
                Fashion Visual Search
              </h2>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Upload & Store
            </Link>
            <Link 
              to="/find-similar" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Find Similar
            </Link>
            <Link 
              to="/about" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/how-to-use" 
              className="text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              How to Use
            </Link>
            
            {/* Conditional rendering based on auth state */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={toggleProfileMenu} 
                  className="flex items-center space-x-2 bg-white border border-fashionvs-neutral-300 hover:border-fashionvs-primary-500 text-fashionvs-neutral-800 hover:text-fashionvs-primary-600 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-5 w-5" />
                  )}
                  <span className="truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-fashionvs-neutral-200 rounded-lg shadow-lg py-1 z-10">
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-fashionvs-neutral-700 hover:bg-fashionvs-primary-50 hover:text-fashionvs-primary-600 w-full text-left"
                    >
                      <FaUser className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-fashionvs-neutral-700 hover:bg-fashionvs-primary-50 hover:text-fashionvs-primary-600 w-full text-left"
                    >
                      <FaCog className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-fashionvs-neutral-200" />
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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
                className="flex items-center space-x-2 bg-fashionvs-primary-600 hover:bg-fashionvs-primary-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaUser className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 transition-colors duration-200"
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
              to="/search"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              Upload & Store
            </Link>
            <Link
              to="/find-similar"
              className="block px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
            >
              Find Similar
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
                <div className="px-3 py-2 font-medium text-fashionvs-neutral-700">
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
                      <div className="font-medium">{currentUser.displayName || currentUser.email.split('@')[0]}</div>
                      <div className="text-sm text-fashionvs-neutral-500 truncate">{currentUser.email}</div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
                >
                  <FaUser className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-fashionvs-neutral-700 hover:text-fashionvs-primary-600 hover:bg-fashionvs-primary-50 rounded-md transition-colors duration-200"
                >
                  <FaCog className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
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
                <FaUser className="h-4 w-4" />
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

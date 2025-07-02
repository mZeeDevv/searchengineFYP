import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaMapMarkerAlt,
  FaEnvelope,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-fashionvs-neutral-900 to-fashionvs-primary-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-4">
              Fashion Visual Search
            </h3>
            <p className="text-fashionvs-neutral-300 mb-6 font-light leading-relaxed">
              Discover your perfect style with AI-powered visual search. Upload any fashion image and find similar items instantly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-400 transition-colors duration-200">
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a href="#" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-400 transition-colors duration-200">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-400 transition-colors duration-200">
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-fashionvs-neutral-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-fashionvs-neutral-300 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-to-use" className="text-fashionvs-neutral-300 hover:text-white transition-colors duration-200">
                  How to Use
                </Link>
              </li>
              <li>
                <Link to="/find-similar" className="text-fashionvs-neutral-300 hover:text-white transition-colors duration-200">
                  Find Similar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-5 w-5 text-fashionvs-neutral-400 mt-1 flex-shrink-0" />
                <span className="text-fashionvs-neutral-300">
                  International Islamic University, Islamabad
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="h-5 w-5 text-fashionvs-neutral-400 flex-shrink-0" />
                <a 
                  href="mailto:fashionvisualsearch@gmail.com" 
                  className="text-fashionvs-neutral-300 hover:text-white transition-colors duration-200"
                >
                  fashionvisualsearch@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-fashionvs-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-fashionvs-neutral-400 text-sm">
              <span>&copy; {new Date().getFullYear()} Fashion Visual Search. Made with</span>
              <FaHeart className="h-3 w-3 text-fashionvs-primary-400" />
              <span>by Hamnah Naeem & Eman</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

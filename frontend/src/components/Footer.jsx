import React from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaPinterest, 
  FaYoutube,
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-fashionvs-neutral-900 via-fashionvs-neutral-800 to-fashionvs-primary-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-display font-bold text-fashionvs-primary-200 mb-4">
              Fashion Visual Search
            </h3>
            <p className="text-fashionvs-neutral-300 mb-6 font-light leading-relaxed">
              Discover your perfect style with AI-powered visual search. Upload any fashion image and find similar items from thousands of brands.
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
              <a href="#" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-400 transition-colors duration-200">
                <FaPinterest className="h-5 w-5" />
              </a>
              <a href="#" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-400 transition-colors duration-200">
                <FaYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="/how-to-use" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  How to Use
                </a>
              </li>
              <li>
                <a href="/categories" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Categories
                </a>
              </li>
              <li>
                <a href="/brands" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Brands
                </a>
              </li>
              <li>
                <a href="/blog" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Fashion Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="/help" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/faq" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/returns" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="/contact" className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-5 w-5 text-fashionvs-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-fashionvs-neutral-300">
                    123 Fashion Avenue<br />
                    Style District<br />
                    IIUI
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaPhone className="h-5 w-5 text-fashionvs-primary-400 flex-shrink-0" />
                <a 
                  href="tel:+1234567890" 
                  className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="h-5 w-5 text-fashionvs-primary-400 flex-shrink-0" />
                <a 
                  href="mailto:hello@fashionvisualsearch.com" 
                  className="text-fashionvs-neutral-300 hover:text-fashionvs-primary-300 transition-colors duration-200"
                >
                  hello@fashionvisualsearch.com
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8">
              <h5 className="text-white font-medium mb-3">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-fashionvs-neutral-700 border border-fashionvs-neutral-600 rounded-l-md text-white placeholder-fashionvs-neutral-400 focus:outline-none focus:border-fashionvs-primary-500"
                />
                <button className="px-4 py-2 bg-fashionvs-primary-600 hover:bg-fashionvs-primary-700 text-white rounded-r-md transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-fashionvs-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-fashionvs-neutral-400">
              <span>&copy; 2024 Fashion Visual Search. Made with</span>
              <FaHeart className="h-4 w-4 text-fashionvs-primary-400" />
              <span>for fashion lovers.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="/accessibility" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-300 transition-colors duration-200">
                Accessibility
              </a>
              <a href="/sitemap" className="text-fashionvs-neutral-400 hover:text-fashionvs-primary-300 transition-colors duration-200">
                Sitemap
              </a>
              <div className="flex items-center space-x-2">
                <span className="text-fashionvs-neutral-400">🌍</span>
                <select className="bg-transparent text-fashionvs-neutral-400 border-none focus:outline-none cursor-pointer">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

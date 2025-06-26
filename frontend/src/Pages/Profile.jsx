import React from 'react';
import { FaTools } from 'react-icons/fa';

const Profile = () => {
  return (
    <div className="min-h-screen bg-fashionvs-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-fashion p-8 border border-fashionvs-primary-100">
          <div className="text-center py-12">
            <FaTools className="mx-auto h-16 w-16 text-fashionvs-primary-400 mb-4" />
            <h1 className="text-3xl font-display font-bold text-fashionvs-neutral-900 mb-3">
              Profile Page Under Development
            </h1>
            <p className="text-lg text-fashionvs-neutral-600 max-w-2xl mx-auto">
              We're working hard to build your personalized profile experience. 
              Check back soon to manage your account, view your favorites, and track your style journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

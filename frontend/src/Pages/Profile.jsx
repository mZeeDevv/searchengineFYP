import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaSpinner, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaUserCircle } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    bio: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setEditForm({
          displayName: userData.displayName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: userData.dateOfBirth || '',
          bio: userData.bio || ''
        });
      } else {
        // Create a basic profile if it doesn't exist
        const basicProfile = {
          displayName: currentUser?.displayName || '',
          email: currentUser?.email || '',
          uid: uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(basicProfile);
        setEditForm({
          displayName: basicProfile.displayName,
          email: basicProfile.email,
          phone: '',
          address: '',
          dateOfBirth: '',
          bio: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original values
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        bio: userProfile.bio || ''
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      setError(null);

      const updatedProfile = {
        ...editForm,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      
      setUserProfile(prev => ({ ...prev, ...updatedProfile }));
      setEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fashionvs-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-fashion p-8 border border-fashionvs-primary-100">
            <div className="text-center py-12">
              <FaSpinner className="animate-spin mx-auto h-16 w-16 text-fashionvs-primary-600 mb-4" />
              <h2 className="text-xl font-semibold text-fashionvs-neutral-700">Loading your profile...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-fashionvs-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-fashion p-8 border border-fashionvs-primary-100">
            <div className="text-center py-12">
              <FaUser className="mx-auto h-16 w-16 text-fashionvs-neutral-400 mb-4" />
              <h1 className="text-3xl font-display font-bold text-fashionvs-neutral-900 mb-3">
                Please Log In
              </h1>
              <p className="text-lg text-fashionvs-neutral-600 max-w-2xl mx-auto mb-6">
                You need to be logged in to view your profile.
              </p>
              <a 
                href="/login" 
                className="inline-flex items-center px-6 py-3 bg-fashionvs-primary-600 text-white font-medium rounded-lg hover:bg-fashionvs-primary-700 transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fashionvs-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-fashion border border-fashionvs-primary-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-fashionvs-primary-500 to-fashionvs-secondary-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-full p-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-16 w-16 text-fashionvs-primary-600" />
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-display font-bold">
                    {userProfile?.displayName || 'User Profile'}
                  </h1>
                  <p className="text-fashionvs-primary-100">
                    Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {!editing && (
                <button
                  onClick={handleEdit}
                  className="bg-white text-fashionvs-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-fashionvs-neutral-50 transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {editing ? (
              /* Edit Mode */
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                      placeholder="Enter your display name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-fashionvs-neutral-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-4 py-2 border border-fashionvs-neutral-300 rounded-lg focus:ring-2 focus:ring-fashionvs-primary-500 focus:border-fashionvs-primary-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-fashionvs-neutral-200">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-fashionvs-neutral-300 text-fashionvs-neutral-700 rounded-lg hover:bg-fashionvs-neutral-50 transition-colors flex items-center space-x-2"
                  >
                    <FaTimes className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      saving 
                        ? 'bg-fashionvs-neutral-300 text-fashionvs-neutral-500 cursor-not-allowed' 
                        : 'bg-fashionvs-primary-600 text-white hover:bg-fashionvs-primary-700'
                    }`}
                  >
                    {saving ? (
                      <FaSpinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaSave className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-fashionvs-neutral-900 mb-4 border-b border-fashionvs-neutral-200 pb-2">
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <FaUser className="h-5 w-5 text-fashionvs-primary-600" />
                      <div>
                        <p className="text-sm text-fashionvs-neutral-500">Display Name</p>
                        <p className="font-medium text-fashionvs-neutral-900">
                          {userProfile?.displayName || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="h-5 w-5 text-fashionvs-primary-600" />
                      <div>
                        <p className="text-sm text-fashionvs-neutral-500">Email</p>
                        <p className="font-medium text-fashionvs-neutral-900">
                          {userProfile?.email || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FaPhone className="h-5 w-5 text-fashionvs-primary-600" />
                      <div>
                        <p className="text-sm text-fashionvs-neutral-500">Phone</p>
                        <p className="font-medium text-fashionvs-neutral-900">
                          {userProfile?.phone || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FaBirthdayCake className="h-5 w-5 text-fashionvs-primary-600" />
                      <div>
                        <p className="text-sm text-fashionvs-neutral-500">Date of Birth</p>
                        <p className="font-medium text-fashionvs-neutral-900">
                          {userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {userProfile?.address && (
                    <div className="mt-6 flex items-start space-x-3">
                      <FaMapMarkerAlt className="h-5 w-5 text-fashionvs-primary-600 mt-1" />
                      <div>
                        <p className="text-sm text-fashionvs-neutral-500">Address</p>
                        <p className="font-medium text-fashionvs-neutral-900">
                          {userProfile.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                {userProfile?.bio && (
                  <div>
                    <h2 className="text-xl font-semibold text-fashionvs-neutral-900 mb-4 border-b border-fashionvs-neutral-200 pb-2">
                      About Me
                    </h2>
                    <p className="text-fashionvs-neutral-700 leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h2 className="text-xl font-semibold text-fashionvs-neutral-900 mb-4 border-b border-fashionvs-neutral-200 pb-2">
                    Account Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-fashionvs-neutral-500">User ID</p>
                      <p className="font-mono text-sm text-fashionvs-neutral-700 bg-fashionvs-neutral-100 px-2 py-1 rounded">
                        {currentUser.uid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-fashionvs-neutral-500">Last Updated</p>
                      <p className="font-medium text-fashionvs-neutral-900">
                        {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

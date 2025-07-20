import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Globe, Languages, FileText, Shield, Users, Plane } from 'lucide-react';

import { fetchUserById } from '../services/userService';
  
const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      const loadUserProfile = async () => {
        try {
          setLoading(true);
          setError(null);
          const userData = await fetchUserById(userId);
          setUser(userData);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setError('Failed to load user profile. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      loadUserProfile();
    }
  }, [isOpen, userId]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'guide':
        return <Users className="w-5 h-5 text-yellow-500" />;
      case 'traveler':
        return <Plane className="w-5 h-5 text-yellow-500" />;
      default:
        return <User className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'guide':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'traveler':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              User Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <span className="ml-3 text-gray-600">Loading user details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(user.role)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Common Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">{user.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{user.address}</p>
                  </div>
                </div>
              </div>

              {/* Role-specific Attributes */}
              {user.role === 'guide' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    Guide Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-amber-700">Expertise Region</p>
                        <p className="font-medium text-gray-900">{user.expertiseCityRegion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <Languages className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-amber-700">Languages</p>
                        <p className="font-medium text-gray-900">{user.language}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-700">About</p>
                      <p className="font-medium text-gray-900">{user.about}</p>
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'traveler' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-500" />
                    Traveler Information
                  </h4>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Nationality</p>
                      <p className="font-medium text-gray-900">{user.nationality}</p>
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Administrator
                  </h4>
                  
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      This user has full administrative privileges in the Yamu Travel Management System.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
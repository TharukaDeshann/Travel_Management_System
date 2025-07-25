import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Languages,
  FileText,
  Shield,
  Users,
  Plane,
} from "lucide-react";

import { fetchUserById } from "../services/userService";

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
          console.error("Failed to fetch user profile:", err);
          setError("Failed to load user profile. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      loadUserProfile();
    }
  }, [isOpen, userId]);
  console.log("user : ", user);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return "U";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "GUIDE":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "TRAVELER":
        return <Plane className="w-5 h-5 text-blue-600" />;
      default:
        return <User className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "GUIDE":
        return "bg-green-100 text-green-800 border-green-200";
      case "TRAVELER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              User Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading user details...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(user.role)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Common Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">
                      {user.contactNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{user.address}</p>
                  </div>
                </div>
              </div>

              {/* Role-specific Attributes */}
              {user.role === "GUIDE" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-700">
                          Expertise Region
                        </p>
                        <p className="font-medium text-gray-900">
                          {user.expertiseCityRegion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Languages className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-700">Languages</p>
                        <p className="font-medium text-gray-900">
                          {user.language}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700">About</p>
                      <p className="font-medium text-gray-900">{user.about}</p>
                    </div>
                  </div>
                </div>
              )}

              {user.role === "TRAVELER" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Nationality</p>
                      <p className="font-medium text-gray-900">
                        {user.nationality}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user.role === "ADMIN" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Administrator
                  </h4>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700">
                      This user has full administrative privileges in the Yamu
                      Travel Management System.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f0f2f5] px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
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
import React, { useState, useEffect } from "react";
import { Camera, Edit, LogOut, MapPin, Phone, Mail, Globe, Car, FileText, Languages, Star, Shield, Upload, User, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchLoggedInUser, logoutUser } from "../../services/authService";
import { useNotification } from "../../hooks/useNotification";
import { uploadImage } from "../../services/imageUploadService";
import VehicleManagement from "../../components/VehicleManagement";

const UserProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = "Your Profile";

    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await fetchLoggedInUser();
        setUser(userData);
        setLoading(false);
      } catch (error) {
        showError("Failed to load user profile. Please try again.");
        setLoading(false);
      }
    };

    if (!user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user, setUser, showError]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
    const MAX_SIZE_MB = 5;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Only JPG, JPEG, or PNG images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showError("File size should be less than 5MB.");
      return;
    }

    setSelectedImage(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return showError("Please select an image.");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await uploadImage(formData);
      setUser({ ...user, profileImageUrl: response.imageUrl });
      showSuccess("Profile image updated successfully!");
      setSelectedImage(null);
    } catch (error) {
      showError(error.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = () => navigate("/profile/update-profile");
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (error) {
      showError("Logout failed. Please try again.");
    }
  };

  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-to-r from-indigo-500 to-cyan-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-20 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Unavailable</h1>
          <p className="text-gray-600 mb-8">Please log in to view your profile</p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Enhanced Header Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
              {/* Enhanced Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Image Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-white text-xs font-medium">Change Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Enhanced User Info */}
              <div className="text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.verified && (
                    <div className="flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                      <Shield className="w-5 h-5 mr-2" />
                      Verified User
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2 mt-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
                  <p className="text-gray-600 text-xl font-medium capitalize">{user.role.toLowerCase()}</p>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-500 text-sm">Member since {new Date().getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handleUpdateProfile}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg border border-gray-200"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Image Upload Section */}
      {selectedImage && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 shadow-md">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-indigo-800 font-semibold text-lg">New profile image selected</p>
                  <p className="text-indigo-600 text-sm">Ready to upload your new profile picture</p>
                </div>
              </div>
              <button 
                onClick={handleImageUpload}
                disabled={uploading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Left Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-900 font-semibold break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-900 font-semibold">{user.contactNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900 font-semibold">{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            {user.role === "GUIDE" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6 mb-8">
                  <p className="text-gray-700 leading-relaxed text-lg">{user.about || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Languages className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.language ? (
                        user.language.split(',').map((lang, index) => (
                          <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200">
                            {lang.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm italic">No languages specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Vehicle Status</span>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      user.vehicleAvailability 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                        : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                    }`}>
                      {user.vehicleAvailability ? '✓ Available' : '✗ Not Available'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Expertise Region</span>
                  </div>
                  <p className="text-gray-700 font-medium text-lg">{user.expertiseCityRegion || 'Not specified'}</p>
                </div>
              </div>
            )}

            {user.role === "TRAVELER" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Traveler Information</h2>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Nationality</p>
                      <p className="text-gray-900 font-bold text-lg">{user.nationality || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Vehicle Management Section for Guides */}
            {user.role === "GUIDE" && (
              <div className="bg-gradient-to-r from-indigo-50 via-white to-cyan-50 rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Vehicle Management</h2>
                      <p className="text-gray-600 text-lg">Manage your fleet of vehicles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-800 rounded-full text-sm font-semibold">
                      Professional Fleet
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <VehicleManagement guideId={user.id} isOwner={true} />
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                    <p className="text-sm">Add, edit, or remove vehicles to help travelers plan their trips better. Keep your fleet information up to date for the best booking experience.</p>
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

export default UserProfile;
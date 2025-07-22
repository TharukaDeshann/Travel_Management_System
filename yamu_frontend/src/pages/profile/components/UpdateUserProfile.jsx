import React, { useState, useEffect } from 'react';
import { UpdateUserDetails } from '../../../services/userService'; 
import useNotification from '../../../hooks/useNotification';
import { useUser } from '../../../context/UserContext';
import { fetchCountries, fetchLanguages, fetchRegions } from "../../../services/dropdownService";

// UpdatePasswordModal and UpdateEmailModal components
import UpdatePasswordModal from './UpdatePasswordModal';
import UpdateEmailModal from './UpdateEmailModal';
import BackButton from '../../../components/BackButton';
import { Button, Select, Spin } from 'antd';

const { Option } = Select;

const UpdateUserProfile = () => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [errors, setErrors] = useState({});
  
  // API data states
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Initial form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    address: '',
    // Role-specific fields
    nationality: '',
    expertiseCityRegion: '',
    language: '',
    about: '',
  });
  
  // User type state (determines which fields to show)
  const [userType, setUserType] = useState(null); // 'traveler' or 'guide'

  const userData = useUser().user; // load logged user data 
  
  // Load countries and languages on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingCountries(true);
        setLoadingLanguages(true);
        
        const [countriesData, languagesData] = await Promise.all([
          fetchCountries(),
          fetchLanguages()
        ]);
        
        setCountries(countriesData);
        setLanguages(languagesData);
      } catch (error) {
        showError('Failed to load countries and languages data.');
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingCountries(false);
        setLoadingLanguages(false);
      }
    };
    
    loadInitialData();
  }, [showError]);
  
  // Load regions when a country is selected (for guides)
  useEffect(() => {
    const loadRegions = async () => {
      if (selectedCountry && userType === 'GUIDE') {
        try {
          setLoadingRegions(true);
          const regionsData = await fetchRegions(selectedCountry);
          setRegions(regionsData);
        } catch (error) {
          showError('Failed to load regions for the selected country.');
          console.error('Error loading regions:', error);
        } finally {
          setLoadingRegions(false);
        }
      }
    };
    
    loadRegions();
  }, [selectedCountry, userType, showError]);
  
  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Update form data with user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          nationality: userData.nationality || '',
          expertiseCityRegion: userData.expertiseCityRegion || '',
          language: userData.language || '',
          about: userData.about || '',
        });
        
        // Set user type
        setUserType(userData.role); // set user role 
        
        // If user has nationality, find the country code for region loading
        if (userData.nationality && userData.role === 'GUIDE') {
          const country = countries.find(c => c.name === userData.nationality);
          if (country) {
            setSelectedCountry(country.code);
          }
        }
        
      } catch (error) {
        showError('Failed to load user data. Please try again.');
        console.error('Error fetching user data:', error);
      }
    };
    
    if (countries.length > 0) {
      fetchUserData();
    }
  }, [showError, countries, userData]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle country selection for guides (to load regions)
    if (name === 'nationality' && userType === 'GUIDE') {
      const country = countries.find(c => c.name === value);
      if (country) {
        setSelectedCountry(country.code);
        // Reset region selection when country changes
        setFormData(prev => ({
          ...prev,
          expertiseCityRegion: ''
        }));
      }
    }
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle multiple language selection
  const handleLanguageChange = (selectedLanguages) => {
    const languageString = selectedLanguages.join(', ');
    setFormData(prev => ({
      ...prev,
      language: languageString
    }));
    
    if (errors.language) {
      setErrors(prev => ({ ...prev, language: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (formData.firstName && formData.firstName.length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters';
    }
    
    if (formData.contactNumber && !/^[0-9]{10,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10-15 digits';
    }
    
    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Filter out empty fields to avoid overwriting with null/empty values
      const updatedData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '')
      );
     
      const userId = userData.id; // get logged user id
      const response = await UpdateUserDetails(userId, updatedData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      // Handle different error types
      if (error.response && error.response.status === 403) {
        showError('You are not authorized to update this profile.');
      } else {
        showError('Failed to update profile. Please try again later.');
      }
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected languages array for multi-select
  const getSelectedLanguages = () => {
    if (!formData.language) return [];
    return formData.language.split(', ').filter(lang => lang.trim() !== '');
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Update Profile</h1>
          <p className="text-gray-600 mt-2">Update your account information</p>
          
          <form onSubmit={handleSubmit} className="mt-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="First Name"
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Last Name"
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Contact Number"
                  />
                  {errors.contactNumber && <p className="text-sm text-red-500">{errors.contactNumber}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Address"
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>
              </div>
            </div>
            
            {/* Traveler-specific fields */}
            {userType === 'TRAVELER' && (
              <div className="border-b border-gray-200 py-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Traveler Details</h2>
                
                <div className="space-y-2">
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                    Nationality
                  </label>
                  <Select
                    id="nationality"
                    value={formData.nationality || undefined}
                    onChange={(value) => handleSelectChange('nationality', value)}
                    placeholder="Select your nationality"
                    className="w-full"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    loading={loadingCountries}
                    notFoundContent={loadingCountries ? <Spin size="small" /> : 'No countries found'}
                  >
                    {countries.map(country => (
                      <Option key={country.code} value={country.name}>
                        {country.name}
                      </Option>
                    ))}
                  </Select>
                  {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
                </div>
              </div>
            )}
            
            {/* Guide-specific fields */}
            {userType === 'GUIDE' && (
              <div className="border-b border-gray-200 py-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Guide Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <Select
                      id="nationality"
                      value={formData.nationality || undefined}
                      onChange={(value) => handleSelectChange('nationality', value)}
                      placeholder="Select your country"
                      className="w-full"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      loading={loadingCountries}
                      notFoundContent={loadingCountries ? <Spin size="small" /> : 'No countries found'}
                    >
                      {countries.map(country => (
                        <Option key={country.code} value={country.name}>
                          {country.name}
                        </Option>
                      ))}
                    </Select>
                    {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="expertiseCityRegion" className="block text-sm font-medium text-gray-700">
                      Expertise City/Region
                    </label>
                    <Select
                      id="expertiseCityRegion"
                      value={formData.expertiseCityRegion || undefined}
                      onChange={(value) => handleSelectChange('expertiseCityRegion', value)}
                      placeholder="Select city/region of expertise"
                      className="w-full"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      loading={loadingRegions}
                      disabled={!selectedCountry}
                      notFoundContent={loadingRegions ? <Spin size="small" /> : selectedCountry ? 'No regions found' : 'Please select a country first'}
                    >
                      {regions.map(region => (
                        <Option key={region.id} value={region.name}>
                          {region.name}
                        </Option>
                      ))}
                    </Select>
                    {errors.expertiseCityRegion && <p className="text-sm text-red-500">{errors.expertiseCityRegion}</p>}
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Languages
                  </label>
                  <Select
                    id="language"
                    mode="multiple"
                    value={getSelectedLanguages()}
                    onChange={handleLanguageChange}
                    placeholder="Select languages you speak"
                    className="w-full"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    loading={loadingLanguages}
                    notFoundContent={loadingLanguages ? <Spin size="small" /> : 'No languages found'}
                  >
                    {languages.map(language => (
                      <Option key={language.code} value={language.name}>
                        {language.name}
                      </Option>
                    ))}
                  </Select>
                  {errors.language && <p className="text-sm text-red-500">{errors.language}</p>}
                </div>
                
                <div className="mt-6 space-y-2">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.about ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                  {errors.about && <p className="text-sm text-red-500">{errors.about}</p>}
                </div>
              </div>
            )}
            
            {/* Security Settings Section */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Account & Security</h2>
              <p className="text-gray-600 mb-4">
                Update your email address or change your password to keep your account secure.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                >
                  Change Email
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
            
            {/* Submit button */}
            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
              >
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
              <BackButton/>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modals for password and email updates */}
      {showPasswordModal && (
        <UpdatePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      
      {showEmailModal && (
        <UpdateEmailModal
          visible={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}
                

      
    </div>
    
  );
};

export default UpdateUserProfile;
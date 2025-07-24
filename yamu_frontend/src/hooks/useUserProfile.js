import { useState, useEffect } from 'react';
import { UpdateUserDetails } from '../services/userService';
import { fetchCountries, fetchLanguages, fetchRegions } from "../services/dropdownService";
import useNotification from './useNotification';
import { useUser } from '../context/UserContext';

export const useUserProfile = () => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // API data states
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    address: '',
    nationality: '',
    expertiseCityRegion: '',
    language: '',
    about: '',
  });
  
  const [userType, setUserType] = useState(null);
  const userData = useUser().user;

  // Load initial data
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

  // Load regions for selected country
  const loadRegions = async (countryCode) => {
    if (countryCode && userType === 'GUIDE') {
      try {
        setLoadingRegions(true);
        const regionsData = await fetchRegions(countryCode);
        setRegions(regionsData);
      } catch (error) {
        showError('Failed to load regions for the selected country.');
        console.error('Error loading regions:', error);
      } finally {
        setLoadingRegions(false);
      }
    }
  };

  // Initialize form with user data
  const initializeFormData = () => {
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
    
    setUserType(userData.role);
    
    // Set selected country for guides
    if (userData.nationality && userData.role === 'GUIDE') {
      const country = countries.find(c => c.name === userData.nationality);
      if (country) {
        setSelectedCountry(country.code);
      }
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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
    
    // Handle country selection for guides
    if (name === 'nationality' && userType === 'GUIDE') {
      const country = countries.find(c => c.name === value);
      if (country) {
        setSelectedCountry(country.code);
        setFormData(prev => ({
          ...prev,
          expertiseCityRegion: ''
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle language selection
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

  // Get selected languages array
  const getSelectedLanguages = () => {
    if (!formData.language) return [];
    return formData.language.split(', ').filter(lang => lang.trim() !== '');
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.firstName && formData.firstName.length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters';
    }
    
    if (formData.contactNumber && !/^[0-9]{10,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10-15 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '')
      );
     
      const userId = userData.id;
      await UpdateUserDetails(userId, updatedData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
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

  // Effects
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadRegions(selectedCountry);
  }, [selectedCountry, userType]);

  useEffect(() => {
    if (countries.length > 0) {
      initializeFormData();
    }
  }, [countries, userData]);

  return {
    // State
    isLoading,
    errors,
    formData,
    userType,
    countries,
    regions,
    languages,
    loadingCountries,
    loadingRegions,
    loadingLanguages,
    selectedCountry,
    
    // Handlers
    handleChange,
    handleSelectChange,
    handleLanguageChange,
    handleSubmit,
    getSelectedLanguages,
  };
};
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Mail, Calendar, Users, DollarSign, MapPin, Clock, Search, User, Package } from "lucide-react";
import '../styles/TravelerDashboard.css';
import WeatherCard from "../components/WeatherCard";
import yamuLogo from '../images/yamu-logo.png';
import notificationIcon from '../images/notification.png';
import profileIcon from '../images/profile.png';
import botImage from '../images/bot-image.png';
import apiClient from "../services/axiosInstance";
import GuideModal from "../components/GuideModal";
import EventModal from "../components/EventModal";
import { useUser } from "../context/UserContext";
import { Layout } from "../components/Layout";
import { fetchLoggedInUser } from "../services/authService";
import { useCurrencyConverter } from "../hooks/useCurrencyConverter";
import PriceDisplay from "../components/PriceDisplay";
import useNotification from "../hooks/useNotification";

export default function TravelerDashboard({ currentUser: propCurrentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [showLeftButton, setShowLeftButton] = useState({});
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    groupMemberCount: 1,
    startingDate: '',
    specialRequests: ''
  });
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    guides: [],
    events: [],
    packages: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  
  // Use the currency converter hook
  const { convertPackages, selectedCurrency, getCurrencySymbol } = useCurrencyConverter();
  
  // Use the notification hook
  const { showSuccess, showError } = useNotification();
  

  const loggedUser = useUser().user || currentUser;

  const unreadCount = 0;

  // Fetch logged-in user if not available from props or context
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!currentUser && !loggedUser) {
        try {
          const fetchedUser = await fetchLoggedInUser();
          setCurrentUser(fetchedUser);
        } catch (error) {
          console.error('Error fetching logged-in user:', error);
        }
      }
    };

    loadCurrentUser();
  }, [currentUser, loggedUser]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await apiClient.get("/api/users/role/GUIDE");
        setGuides(response.data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await apiClient.get("/api/facebook-events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchPackages = async () => {
      try {
        const response = await apiClient.get("/api/packages/active");
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    const fetchHotels = async ()=>{
      try {
        const response=await apiClient.get('/api/hotels/dashboard-hotels');
        console.log('🏨 Hotels fetched:', response.data);
        
        // Ensure we're setting an array
        if (Array.isArray(response.data)) {
          setHotels(response.data);
        } else if (response.data && Array.isArray(response.data.hotels)) {
          // In case the response has a nested hotels array
          setHotels(response.data.hotels);
        } else {
          console.warn('Hotels API response is not an array:', response.data);
          setHotels([]);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setHotels([]); // Set empty array on error
      }
    }

    fetchGuides();
    fetchEvents();
    fetchPackages();
    fetchHotels();
  }, []);

  // Search functionality
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ guides: [], events: [], packages: [] });
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchLower = query.toLowerCase();
      
      // Filter guides
      const filteredGuides = guides.filter(guide => 
        `${guide.firstName} ${guide.lastName}`.toLowerCase().includes(searchLower) ||
        guide.expertiseCityRegion?.toLowerCase().includes(searchLower) ||
        guide.language?.toLowerCase().includes(searchLower)
      );

      // Filter events
      const filteredEvents = events.filter(event =>
        event.name?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower)
      );

      // Filter packages
      const filteredPackages = packages.filter(pkg =>
        pkg.packageName?.toLowerCase().includes(searchLower) ||
        pkg.description?.toLowerCase().includes(searchLower) ||
        pkg.selectedGuide?.firstName?.toLowerCase().includes(searchLower) ||
        pkg.selectedGuide?.lastName?.toLowerCase().includes(searchLower)
      );

      setSearchResults({
        guides: filteredGuides.slice(0, 5), // Limit to 5 results each
        events: filteredEvents.slice(0, 5),
        packages: filteredPackages.slice(0, 5)
      });
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, guides, events, packages]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (type, item) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (type === 'guide') {
      setSelectedGuide(item);
    } else if (type === 'event') {
      setSelectedEvent(item);
    } else if (type === 'package') {
      handlePackageClick(item);
    }
  };

  const sections = [
    {
      title: "Discover Places",
      items: [
        { name: "Sigiriya", image: "/src/images/sigiriya.jpg" },
        { name: "Hiriketiya", image: "/src/images/hiriketiya.jpg" },
        { name: "Ambuluwawa", image: "/src/images/ambuluwawa.jpg" },
        { name: "Nagapooshani Amman Temple", image: "/src/images/amman_temple.jpg" },
        { name: "Adams Peak", image: "/src/images/adams-peak.jpg" }
      ]
    },
    {
      title: "Discover Accommodations",
      items: Array.isArray(hotels) ? hotels.slice(0, 10).map((hotel, index) => ({
        name: hotel.name,
        image: `/hotels/${index + 1}.webp`,
        hotel: hotel,
        rating: hotel.rating,
        address: hotel.address
      })) : []
    },
    {
      title: "Discover Tour Guides",
      items: guides.slice(0, 5).map(guide => ({
        name: `${guide.firstName} ${guide.lastName}`,
        image: `${guide.profileImageUrl}`,
        guide: guide
      }))
    },
    {
      title: "Event & Festival Highlights",
      items: events.slice(0, 5).map(event => ({
        name: event.name,
        image: event.image_url,
        description: event.description,
        startDate: event.formatted_date,
        startTime: event.formatted_time,
        event: event
      }))
    }
  ];

  const [convertedPackages, setConvertedPackages] = useState([]);

  // Convert packages when currency or packages change
  useEffect(() => {
    const convertAndSetPackages = async () => {
      if (packages.length > 0) {
        const converted = await convertPackages(packages);
        setConvertedPackages(converted);
      }
    };

    convertAndSetPackages();
  }, [packages, selectedCurrency, convertPackages]);

  // Handle package application functions
  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowApplicationModal(true);
    setApplicationForm({
      groupMemberCount: 1,
      startingDate: '',
      specialRequests: ''
    });
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationForm.startingDate || applicationForm.groupMemberCount < 1) {
      showError('Please fill in all required fields', 'Validation Error');
      return;
    }

    setIsSubmittingApplication(true);
    
    try {
      const applicationData = {
        packageId: selectedPackage.id,
        groupMemberCount: parseInt(applicationForm.groupMemberCount),
        startingDate: applicationForm.startingDate,
        specialRequests: applicationForm.specialRequests
      };

      const response = await apiClient.post(`/api/packages/${selectedPackage.id}/apply/${loggedUser.id}`, applicationData);
      console.log('Package application response:', response);
      if (response.status === 201) {
        showSuccess('Your package application has been submitted successfully!', 'Application Submitted');
        setShowApplicationModal(false);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.data?.error) {
        showError(error.response.data.error, 'Application Failed');
      } else {
        showError('Failed to submit application. Please try again.', 'Submission Error');
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleFormChange = (field, value) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScroll = (e, title) => {
    const { scrollLeft } = e.target;
    setShowLeftButton(prev => ({
      ...prev,
      [title]: scrollLeft > 0
    }));
  };

  const handleNavigateToGuides = () => {
    const userToPass = loggedUser || currentUser;
    navigate('/guides-page', { state: { currentUser: userToPass } });
  };

  return (
    <Layout 
      user={loggedUser || currentUser}
      unreadCount={unreadCount}
    >
      <div className="main-content">
        <div className="search-container">
          <div className="search-bar" ref={searchRef}>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search guides, events, or packages..." 
                  className="search-input pl-10"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                {isSearching && (
                  <div className="absolute right-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                  {/* Guides Results */}
                  {searchResults.guides.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Tour Guides
                      </h3>
                      {searchResults.guides.map((guide) => (
                        <div
                          key={guide.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleSearchResultClick('guide', guide)}
                        >
                          <img
                            src={guide.profileImageUrl}
                            alt={`${guide.firstName} ${guide.lastName}`}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {guide.firstName} {guide.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {guide.expertiseCityRegion} • {guide.language}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Events Results */}
                  {searchResults.events.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Events
                      </h3>
                      {searchResults.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleSearchResultClick('event', event)}
                        >
                          <img
                            src={event.image_url}
                            alt={event.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {event.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {event.formatted_date} at {event.formatted_time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Packages Results */}
                  {searchResults.packages.length > 0 && (
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        Packages
                      </h3>
                      {searchResults.packages.map((pkg,index) => (
                        <div
                          key={pkg.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleSearchResultClick('package', pkg)}
                        >
                          <img
                            src={`/src/images/${index+1}.jpg`}
                            alt={pkg.packageName}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {pkg.packageName}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span className="mr-3">{pkg.durationDays} days</span>
                              <DollarSign className="w-3 h-3 mr-1" />
                              <span>LKR {pkg.budgetPerPerson?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchResults.guides.length === 0 && 
                   searchResults.events.length === 0 && 
                   searchResults.packages.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                      <p className="text-xs mt-1">Try searching for guides, events, or packages</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="buttons-container">
            <button 
              className="action-button upcoming-trips-button"
              onClick={() => navigate('/traveler-upcoming-trips')}
            >
              Upcoming Trips
            </button>
            <button 
              className="action-button start-planning-button"
              onClick={() => navigate('/itinerary-planner')}
            >
              Start Planning
            </button>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="section-container">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <button 
                className="text-blue-500"
                onClick={() => section.title === "Discover Tour Guides" ? handleNavigateToGuides() : null}
              >
                See more →
              </button>
            </div>
            <div className={`cards-scroll-container ${showLeftButton[section.title] ? 'scrolled' : ''}`}>
              {showLeftButton[section.title] && (
                <button 
                  className="scroll-button left"
                  onClick={(e) => {
                    const container = e.target.closest('.cards-scroll-container').querySelector('.flex');
                    container.scrollBy({ left: -339 - 16, behavior: 'smooth' });
                  }}
                >
                  ←
                </button>
              )}
              <div 
                className="flex space-x-4"
                onScroll={(e) => handleScroll(e, section.title)}
              >
                {section.items.map((item) => (
                  <div 
                    key={item.name} 
                    className="card-container hover:cursor-pointer"
                    onClick={() => {
                      if (section.title === "Discover Tour Guides") {
                        setSelectedGuide(item.guide);
                      } else if (section.title === "Event & Festival Highlights" && item.event) {
                        setSelectedEvent(item.event);
                      }
                    }}
                  >
                    <img src={item.image} alt={item.name} className="card-image" />
                    <div className="card-overlay">
                      <h3 className="card-title">{item.name}</h3>
                      {section.title === "Discover Tour Guides" && (
                        <p style={{ color: 'white', fontSize: '14px' }}>{item.guide.expertiseCityRegion}</p>
                      )}
                      {section.title === "Discover Accommodations" && item.hotel && (
                        <>
                          <div className="flex items-center" style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>
                            <span>⭐ {item.rating}</span>
                          </div>
                          <p style={{ color: 'white', fontSize: '12px', marginTop: '2px' }}>
                            {item.address}
                          </p>
                        </>
                      )}
                      {section.title === "Event & Festival Highlights" && item.event && (
                        <>
                          <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>
                            {item.startDate} at {item.startTime}
                          </p>
                          
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="scroll-button right"
                onClick={(e) => {
                  const container = e.target.closest('.cards-scroll-container').querySelector('.flex');
                  container.scrollBy({ left: 339 + 16, behavior: 'smooth' });
                }}
              >
                →
              </button>
            </div>
          </div>
        ))}

        <div className="section-container">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Discover Packages</h2>
            <button 
              className="text-blue-500"
              onClick={() => navigate('/packages')}
            >
              See more →
            </button>
          </div>
          <div className={`cards-scroll-container ${showLeftButton['Discover Packages'] ? 'scrolled' : ''}`}>
            {showLeftButton['Discover Packages'] && (
              <button 
                className="scroll-button left"
                onClick={(e) => {
                  const container = e.target.closest('.cards-scroll-container').querySelector('.flex');
                  container.scrollBy({ left: -339 - 16, behavior: 'smooth' });
                }}
              >
                ←
              </button>
            )}
            <div 
              className="flex space-x-4"
              onScroll={(e) => handleScroll(e, 'Discover Packages')}
            >
              {convertedPackages.length > 0 ? (
                convertedPackages.slice(0, 6).map((pkg,index) => (
                  <div 
                    key={pkg.id} 
                    className="card-container hover:cursor-pointer"
                    onClick={() => handlePackageClick(pkg)}
                  >
                    <img 
                      src={`/src/images/${index+1}.jpg`} 
                      alt={pkg.packageName} 
                      className="card-image" 
                    />
                    <div className="card-overlay">
                      <h3 className="card-title">{pkg.packageName}</h3>
                      <p className="text-white text-lg font-semibold">
                        {getCurrencySymbol()} {pkg.convertedPrice?.toLocaleString()}
                      </p>
                      <div className="flex items-center text-white text-sm mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{pkg.durationDays} days</span>
                      </div>
                      <p className="text-white text-sm mt-1">{pkg.description}</p>
                      <div className="flex items-center text-white text-xs mt-2">
                        <span className={`px-2 py-1 rounded ${
                          pkg.status === 'ACTIVE' ? 'bg-green-500' : 
                          pkg.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {pkg.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-container">
                  <div className="card-overlay flex items-center justify-center">
                    <p className="text-white">Loading packages...</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="scroll-button right"
              onClick={(e) => {
                const container = e.target.closest('.cards-scroll-container').querySelector('.flex');
                container.scrollBy({ left: 339 + 16, behavior: 'smooth' });
              }}
            >
              →
            </button>
          </div>
        </div>

        <img 
          src={botImage}
          alt="Bot Assistant"
          type="button"
          className="fixed-bottom-image"
          onClick={() => navigate('/chatbot')}
        />
      </div>

      {selectedGuide && (
        <GuideModal 
          guide={selectedGuide} 
          onClose={() => setSelectedGuide(null)}
          currentUser={currentUser}
        />
      )}

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Package Application Modal */}
      {showApplicationModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Apply for Package</h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Package Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedPackage.packageName}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-600" />
                  <span>{selectedPackage.durationDays} days</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-600" />
                  <span><PriceDisplay price={selectedPackage.budgetPerPerson} fromCurrency="LKR" inline /> per person</span>
                </div>
              </div>
              <p className="text-gray-600 mt-3">{selectedPackage.description}</p>
              
              {/* Package Resources */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {selectedPackage.selectedHotel && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Hotel: {selectedPackage.selectedHotel.name}</span>
                  </div>
                )}
                {selectedPackage.selectedDriver && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-green-600" />
                    <span>Driver: {selectedPackage.selectedDriver.name}</span>
                  </div>
                )}
                {selectedPackage.selectedGuide && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Guide: {selectedPackage.selectedGuide.firstName} {selectedPackage.selectedGuide.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleApplicationSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline w-4 h-4 mr-1" />
                    Group Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={applicationForm.groupMemberCount}
                    onChange={(e) => handleFormChange('groupMemberCount', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Total cost: <PriceDisplay 
                      price={selectedPackage.budgetPerPerson * applicationForm.groupMemberCount} 
                      fromCurrency="LKR" 
                      inline 
                    />
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Starting Date *
                  </label>
                  <input
                    type="date"
                    value={applicationForm.startingDate}
                    onChange={(e) => handleFormChange('startingDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={applicationForm.specialRequests}
                    onChange={(e) => handleFormChange('specialRequests', e.target.value)}
                    placeholder="Any special requirements or requests..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApplication}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingApplication ? 'Submitting...' : 'Apply for Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
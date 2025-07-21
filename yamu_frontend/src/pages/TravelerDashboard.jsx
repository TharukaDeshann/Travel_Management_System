import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Mail, Calendar, Users, DollarSign, MapPin, Clock } from "lucide-react";
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

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'LKR', symbol: 'Rs.' },
  { code: 'EUR', symbol: '€' },
  { code: 'CHF', symbol: 'Fr.' }
];

export default function TravelerDashboard({ currentUser: propCurrentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [guides, setGuides] = useState([]);
  const [showLeftButton, setShowLeftButton] = useState({});
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    groupMemberCount: 1,
    startingDate: '',
    specialRequests: ''
  });
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  

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

    fetchGuides();
    fetchEvents();
    fetchPackages();
  }, []);

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
      items: [
        { name: "Wild Coast Tented Lodge", image: "/src/images/wild_coast.jpg" },
        { name: "98 Acre Resort & Spa", image: "/src/images/98_acre.jpg" },
        { name: "Anantara Resort & Spa", image: "/src/images/anantaya.jpg" },
        { name: "Jetwing Colombo Seven", image: "/src/images/jetwing.jpg" },
        { name: "The Lake Forest Hotel", image: "/src/images/lake_forest.jpg" }
      ]
    },
    {
      title: "Discover Tour Guides",
      items: guides.slice(0, 5).map(guide => ({
        name: `${guide.firstName} ${guide.lastName}`,
        image: "/src/images/default-profile.png",
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

  const fetchExchangeRates = async () => {
    if (selectedCurrency === 'LKR') {
      setConvertedPackages(packages.map(pkg => ({
        ...pkg,
        convertedPrice: pkg.budgetPerPerson
      })));
      return;
    }

    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/ee302ff3be157ca6a021f6a0/pair/LKR/${selectedCurrency}`);
      const data = await response.json();
      
      if (data && data.conversion_rate) {
        const rate = data.conversion_rate;
        const updatedPackages = packages.map(pkg => ({
          ...pkg,
          convertedPrice: Math.round((pkg.budgetPerPerson * rate) * 100) / 100
        }));
        setConvertedPackages(updatedPackages);
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    const intervalId = setInterval(fetchExchangeRates, 60000);
    return () => clearInterval(intervalId);
  }, [selectedCurrency, packages]);

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
      alert('Please fill in all required fields');
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

      if (response.status === 200) {
        alert('Package application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to submit application. Please try again.');
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
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
    >
      <div className="main-content">
        <div className="search-container">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search destinations, hotels, or events..." 
              className="search-input"
            />
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
                convertedPackages.slice(0, 6).map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="card-container hover:cursor-pointer"
                    onClick={() => handlePackageClick(pkg)}
                  >
                    <img 
                      src="/src/images/sigiriya.jpg" 
                      alt={pkg.packageName} 
                      className="card-image" 
                    />
                    <div className="card-overlay">
                      <h3 className="card-title">{pkg.packageName}</h3>
                      <p className="text-white text-lg font-semibold">
                        {selectedCurrency === 'LKR' ? 'Rs. ' : currencies.find(c => c.code === selectedCurrency)?.symbol}
                        {pkg.convertedPrice?.toLocaleString()}
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
                  <span>Rs. {selectedPackage.budgetPerPerson?.toLocaleString()} per person</span>
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
                    Total cost: Rs. {(selectedPackage.budgetPerPerson * applicationForm.groupMemberCount).toLocaleString()}
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
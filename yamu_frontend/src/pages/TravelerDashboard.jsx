import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Mail } from "lucide-react";
import '../styles/TravelerDashboard.css';
import WeatherCard from "../components/WeatherCard";
import yamuLogo from '../images/yamu-logo.png';
import notificationIcon from '../images/notification.png';
import profileIcon from '../images/profile.png';
import botImage from '../images/bot-image.png';
import apiClient from "../services/axiosInstance";
import GuideModal from "../components/GuideModal";
import { useUser } from "../context/UserContext";

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'LKR', symbol: 'Rs.' },
  { code: 'EUR', symbol: '€' },
  { code: 'CHF', symbol: 'Fr.' }
];

export default function TravelerDashboard({ currentUser }) {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [guides, setGuides] = useState([]);
  const [showLeftButton, setShowLeftButton] = useState({});
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visionResults, setVisionResults] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [imageSearchResult, setImageSearchResult] = useState(null);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [placesData, setPlacesData] = useState([]);
  
  const loggedUser = useUser().user;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await apiClient.get("/api/places");
        setPlacesData(response.data);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await apiClient.get("/api/users/role/GUIDE");
        setGuides(response.data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    fetchGuides();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = placesData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, placesData]);

  const sections = [
    {
      title: "Discover Places",
      items: placesData.filter(p => p.type === 'place').slice(0, 5).map(place => ({
        name: place.name,
        image: place.imageUrl || '/src/images/default-image.jpg',
        description: place.description,
        location: place.location,
        id: place.id,
        type: 'place',
        latitude: place.latitude,
        longitude: place.longitude
      }))
    },
    {
      title: "Discover Accommodations",
      items: [
        { name: "Wild Coast Tented Lodge", image: "/src/images/wild_coast.jpg", type: "hotel", id: 1 },
        { name: "98 Acre Resort & Spa", image: "/src/images/98_acre.jpg", type: "hotel", id: 2 },
        { name: "Anantara Resort & Spa", image: "/src/images/anantaya.jpg", type: "hotel", id: 3 },
        { name: "Jetwing Colombo Seven", image: "/src/images/jetwing.jpg", type: "hotel", id: 4 },
        { name: "The Lake Forest Hotel", image: "/src/images/lake_forest.jpg", type: "hotel", id: 5 }
      ]
    },
    {
      title: "Discover Tour Guides",
      items: guides.slice(0, 5).map(guide => ({
        name: `${guide.firstName} ${guide.lastName}`,
        image: guide.profileImageUrl || "/src/images/default-profile.png",
        guide: guide,
        type: "guide",
        id: guide.id
      }))
    },
    {
      title: "Event & Festival Highlights",
      items: [
        { name: "Esala Perahera", image: "/src/images/asala_perahera.webp", type: "event", id: 1 },
        { name: "Nallur Kovil Festival", image: "/src/images/nallur_festival.jpg", type: "event", id: 2 },
        { name: "Sinhala Tamil New Year", image: "/src/images/new_year.jpeg", type: "event", id: 3 },
        { name: "Kuweni The Musical", image: "/src/images/kuweni.jpg", type: "event", id: 4 },
        { name: "Whale Watching Season", image: "/src/images/whale_watching.jpg", type: "event", id: 5 }
      ]
    }
  ];

  const packages = [
    { name: "Package 1", price: 50000, image: "/src/images/sigiriya.jpg", description: "3 Days Sigiriya Adventure", type: "package", id: 1 },
    { name: "Package 2", price: 60000, image: "/src/images/hiriketiya.jpg", description: "5 Days Beach Getaway", type: "package", id: 2 },
    { name: "Package 3", price: 30000, image: "/src/images/hiriketiya.jpg", description: "2 Days Quick Escape", type: "package", id: 3 }
  ];

  const [convertedPackages, setConvertedPackages] = useState(
    packages.map(pkg => ({ ...pkg, convertedPrice: pkg.price }))
  );

  const fetchExchangeRates = async () => {
    if (selectedCurrency === 'LKR') {
      setConvertedPackages(packages.map(pkg => ({
        ...pkg,
        convertedPrice: pkg.price
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
          convertedPrice: Math.round((pkg.price * rate) * 100) / 100
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
  }, [selectedCurrency]);

  const handleScroll = (e, title) => {
    const { scrollLeft } = e.target;
    setShowLeftButton(prev => ({
      ...prev,
      [title]: scrollLeft > 0
    }));
  };

  const handleNavigateToGuides = () => {
    navigate('/guides-page', { state: { currentUser } });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the 5MB limit.");
      return;
    }
  
    try {
      setIsProcessingImage(true);
      setVisionResults(null);
  
      const formData = new FormData();
      formData.append("image", file);
  
      const endpoint = "https://southeastasia.api.cognitive.microsoft.com/customvision/v3.0/Prediction/0b950bb8-98a3-42d8-bc95-011f5c6efc99/detect/iterations/Iteration3/image";
      const predictionKey = "4d3e08b59e25443ab5f3d26e5c428a05";
  
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Prediction-Key": predictionKey,
        },
      });
  
      const result = await response.json();
      setVisionResults(result);
  
      const sortedPredictions = result.predictions.sort((a, b) => b.probability - a.probability);
      const topPrediction = sortedPredictions[0];
  
      if (topPrediction) {
        setImageSearchResult({
          name: topPrediction.tagName,
          probability: (topPrediction.probability * 100).toFixed(2),
          image: URL.createObjectURL(file)
        });
        
        const exactMatches = placesData.filter(item => 
          item.type === "place" && 
          item.name.toLowerCase() === topPrediction.tagName.toLowerCase()
        );
        
        const matches = exactMatches.length > 0 ? exactMatches : 
          placesData.filter(item => 
            item.type === "place" && 
            item.name.toLowerCase().includes(topPrediction.tagName.toLowerCase())
          );
        
        setRelatedPlaces(matches);
        setShowImageSearchModal(true);
      } else {
        alert("No objects detected in the image");
      }
    } catch (error) {
      console.error("Error calling Azure Custom Vision:", error);
      alert("Error processing image. Please try again later.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSearchItemClick = (item) => {
    setShowSearchResults(false);
    setSearchQuery("");
    
    switch(item.type) {
      case "place":
        navigate(`/place-details/${item.id}`);
        break;
      case "hotel":
        navigate(`/hotel-details/${item.id}`);
        break;
      case "guide":
        setSelectedGuide(item.guide);
        break;
      case "event":
        navigate(`/event-details/${item.id}`);
        break;
      case "package":
        navigate(`/package-details/${item.id}`);
        break;
      default:
        break;
    }
  };

  const handleGetDirections = (place) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate('/map', { 
            state: { 
              currentLocation: { lat: latitude, lon: longitude },
              destination: {
                lat: place.latitude,
                lon: place.longitude,
                name: place.name
              }
            } 
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
          // Fallback to just the destination if location can't be determined
          navigate('/map', { 
            state: { 
              initialLocation: {
                lat: place.latitude,
                lon: place.longitude,
                name: place.name
              }
            } 
          });
        }
      );
    } else {
      // Browser doesn't support Geolocation
      navigate('/map', { 
        state: { 
          initialLocation: {
            lat: place.latitude,
            lon: place.longitude,
            name: place.name
          }
        } 
      });
    }
  };

  const CurrencyDropdown = () => (
    <div className="currency-dropdown">
      <button
        type="button"
        className="currency-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <span>{currencies.find(c => c.code === selectedCurrency)?.symbol}</span>
        <span>{selectedCurrency}</span>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              className="currency-option"
              onClick={() => {
                setSelectedCurrency(currency.code);
                setIsDropdownOpen(false);
              }}
            >
              <span>{currency.symbol}</span> <span>{currency.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="traveler-dashboard-container">
      <nav className="nav-container">
        <div className="logo-container">
          <img src={yamuLogo} alt="YAMU Logo" className="nav-logo-image" />
          <h1 className="nav-logo">YAMU</h1>
        </div>
        <ul className="nav-links">
          {['Dashboard', 'Hotels', 'Guides', 'Places', 'Emergency Contacts'].map((item) => (
            <li
              key={item}
              className="nav-link"
              onClick={() => {
                if (item === 'Guides') {
                  handleNavigateToGuides();
                } else if (item === 'Dashboard') {
                  navigate('/traveler-dashboard');
                } else if (item === 'Places') {
                  navigate('/places');
                } else if (item === 'Hotels') {
                  navigate('/hotels');
                } else if (item === 'Emergency Contacts') {
                  navigate('/emergency-contacts');
                }
              }}
            >
              {item}
            </li>
          ))}
          <li
            key="Inbox"
            className="nav-link"
            onClick={() => navigate('/inbox', { state: { currentUser } })}
            style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}
          >
            <Mail size={20} />
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          <CurrencyDropdown />
          <WeatherCard />
          <div className="icon-container">
            <img src={notificationIcon} alt="Notifications" className="w-6 h-6" />
            <span className="notification-badge">3</span>
          </div>
          <div className="icon-container">
            <img src={loggedUser.profileImageUrl || profileIcon} alt="Profile" className="profile-image" onClick={() => navigate('/profile')} />
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="search-container">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search destinations, hotels, or events..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            <div className="search-icons">
              <button className="search-icon-button" onClick={() => setShowSearchResults(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              
              <label htmlFor="image-upload" className="image-upload-button">
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </label>
            </div>
          </div>
          
          {showSearchResults && (
            <div className="search-results-popup">
              <div className="search-results-header">
                <h3>Search Results</h3>
                <button 
                  className="close-search-results"
                  onClick={() => setShowSearchResults(false)}
                >
                  ×
                </button>
              </div>
              <div className="search-results-list">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div 
                      key={item.id} 
                      className="search-result-item"
                      onClick={() => handleSearchItemClick(item)}
                    >
                      <img 
                        src={item.imageUrl || item.image || '/src/images/default-image.jpg'} 
                        alt={item.name} 
                        className="search-result-image"
                        onError={(e) => {
                          e.target.src = '/src/images/default-image.jpg';
                        }}
                      />
                      <div className="search-result-details">
                        <h4>{item.name}</h4>
                        <p className="search-result-type">{item.type}</p>
                        <p className="search-result-description">{item.description}</p>
                        {item.location && (
                          <p className="search-result-location">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {item.location}
                          </p>
                        )}
                        {item.latitude && item.longitude && (
                          <button
                            className="directions-button-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetDirections(item);
                            }}
                          >
                            Get Directions
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                onClick={() => {
                  if (section.title === "Discover Tour Guides") {
                    navigate('/guides-page');
                  } else if (section.title === "Discover Places") {
                    navigate('/places');
                  } else if (section.title === "Discover Accommodations") {
                    navigate('/hotels');
                  } else if (section.title === "Event & Festival Highlights") {
                    navigate('/events');
                  }
                }}
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
                    className="card-container"
                    onClick={() => handleSearchItemClick(item)}
                  >
                    <img 
                      src={item.imageUrl || item.image || '/src/images/default-image.jpg'} 
                      alt={item.name} 
                      className="card-image"
                      onError={(e) => {
                        e.target.src = '/src/images/default-image.jpg';
                      }}
                    />
                    <div className="card-overlay">
                      <h3 className="card-title">{item.name}</h3>
                      {item.location && (
                        <p style={{ color: 'white', fontSize: '14px' }}>{item.location}</p>
                      )}
                      {item.latitude && item.longitude && (
                        <button
                          className="directions-button-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetDirections(item);
                          }}
                        >
                          Directions
                        </button>
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
          <h2 className="text-lg font-bold">Discover Packages</h2>
          <div className="cards-scroll-container">
            <div className="flex space-x-4">
              {convertedPackages.map((pkg) => (
                <div key={pkg.name} className="card-container" onClick={() => handleSearchItemClick(pkg)}>
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="card-image"
                    onError={(e) => {
                      e.target.src = '/src/images/default-image.jpg';
                    }}
                  />
                  <div className="card-overlay">
                    <h3 className="card-title">{pkg.name}</h3>
                    <p className="text-white text-lg">
                      {selectedCurrency === 'LKR' ? 'Rs. ' : currencies.find(c => c.code === selectedCurrency)?.symbol}
                      {pkg.convertedPrice?.toLocaleString()}
                    </p>
                    <p className="text-white text-sm">{pkg.description}</p>
                  </div>
                </div>
              ))}
            </div>
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

      {showImageSearchModal && imageSearchResult && (
        <div className="image-search-modal">
          <div className="image-search-modal-content">
            <button 
              className="close-modal-button"
              onClick={() => setShowImageSearchModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="image-search-header">
              <h2>Image Search Results</h2>
              <div className={`prediction-badge ${
                imageSearchResult.probability > 65 ? 'high-confidence' : 
                imageSearchResult.probability > 35 ? 'medium-confidence' : 'low-confidence'
              }`}>
                {imageSearchResult.probability}% confidence
              </div>
            </div>
            
            <div className="image-search-main-content">
              <div className="image-preview-container">
                <img 
                  src={imageSearchResult.image} 
                  alt="Uploaded content" 
                  className="uploaded-image-preview"
                />
              </div>
              
              <div className="image-search-details">
                <h3 className="result-title">{imageSearchResult.name}</h3>
                
                <div className="result-description">
                  <h4>Description</h4>
                  <p>
                    {relatedPlaces.length > 0 
                      ? relatedPlaces[0].description 
                      : "No description available for this location."}
                  </p>
                </div>
                
                <div className="button-group">
                  <button 
                    className="view-location-button"
                    onClick={() => {
                      if (relatedPlaces.length > 0) {
                        setShowImageSearchModal(false);
                        navigate(`/place-details/${relatedPlaces[0].id}`);
                      }
                    }}
                    disabled={relatedPlaces.length === 0}
                  >
                    View Location Details
                  </button>
                  
                  {relatedPlaces.length > 0 && (
                    <button 
                      className="directions-button"
                      onClick={() => {
                        setShowImageSearchModal(false);
                        handleGetDirections(relatedPlaces[0]);
                      }}
                    >
                      Get Directions
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessingImage && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <p>Processing your image...</p>
        </div>
      )}
    </div>
  );
}
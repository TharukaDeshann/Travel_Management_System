import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Layout } from "../components/Layout";

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'LKR', symbol: 'Rs.' },
  { code: 'EUR', symbol: '€' },
  { code: 'CHF', symbol: 'Fr.' }
];

export default function TravelerDashboard({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [uploadError, setUploadError] = useState(null);

  const loggedUser = useUser().user;
  const unreadCount = 0;

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

    setUploadError(null);
    const imageUrl = URL.createObjectURL(file);

    if (!file.type.startsWith("image/")) {
      setUploadError({
        message: "Please upload a valid image file (JPEG, PNG, etc.)",
        image: imageUrl
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError({
        message: "File size exceeds the 5MB limit. Please choose a smaller image.",
        image: imageUrl
      });
      return;
    }

    try {
      setIsProcessingImage(true);
      setVisionResults(null);

      const formData = new FormData();
      formData.append("image", file);

      const endpoint = "https://projectyamunew-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/cc863e72-507b-4771-a727-1189da24add9/detect/iterations/Iteration1/image";
      const predictionKey = "UNrxBtUvLBxVeBihEbFwwybT1NEpJ8DOlAtQcZErGpPx41QI3aurJQQJ99BGACqBBLyXJ3w3AAAIACOGUGpE";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Prediction-Key": predictionKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setVisionResults(result);

      const highConfidencePredictions = result.predictions.filter(
        prediction => prediction.probability >= 0.9
      );

      if (highConfidencePredictions.length === 0) {
        setUploadError({
          message: "Sorry, we couldn't confidently identify this image. Please try another clear image of a recognizable landmark.",
          image: imageUrl
        });
        return;
      }

      const topPrediction = highConfidencePredictions[0];

      setImageSearchResult({
        name: topPrediction.tagName,
        probability: (topPrediction.probability * 100).toFixed(2),
        image: imageUrl
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

      if (matches.length === 0) {
        setUploadError({
          message: `We recognized "${topPrediction.tagName}" but couldn't find matching places in our database.`,
          image: imageUrl
        });
        return;
      }

      setRelatedPlaces(matches);
      setShowImageSearchModal(true);
    } catch (error) {
      console.error("Error processing image:", error);
      setUploadError({
        message: "An error occurred while processing your image. Please try again later.",
        image: imageUrl
      });
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
    const cleanedPlaceName = place.name.replace(/\s*\([^)]*\)/g, '').trim();
    
    console.log('Passing to DirectionsPage:', {
      placeName: cleanedPlaceName,
      hasCoordinates: !!(place.latitude && place.longitude),
      coordinates: {
        lat: place.latitude,
        lon: place.longitude
      },
      originalPlace: place
    });
  
    if (place.latitude && place.longitude) {
      const destination = {
        lat: parseFloat(place.latitude),
        lon: parseFloat(place.longitude),
        name: cleanedPlaceName
      };
  
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Navigating with current location:', {
              currentLocation: { lat: latitude, lon: longitude },
              destination: destination
            });
            navigate('/directions', { 
              state: { 
                currentLocation: { lat: latitude, lon: longitude },
                destination: destination
              } 
            });
          },
          (error) => {
            console.error("Error getting current location:", error);
            console.log('Navigating with destination only:', {
              initialLocation: destination
            });
            navigate('/directions', { 
              state: { 
                initialLocation: destination
              } 
            });
          }
        );
      } else {
        console.log('Navigating with destination only (no geolocation):', {
          initialLocation: destination
        });
        navigate('/directions', { 
          state: { 
            initialLocation: destination
          } 
        });
      }
    } else {
      console.log('Navigating with place name only:', {
        placeName: cleanedPlaceName
      });
      navigate('/directions', { 
        state: { 
          placeName: cleanedPlaceName
        } 
      });
    }
  };

  return (
    <Layout 
      user={loggedUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
      navigate={navigate}
      location={location}
    >
      <div className="traveler-dashboard-container">
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
                ×
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

        {uploadError && (
          <div className="error-modal">
            <div className="error-modal-content">
              <button 
                className="close-modal-button"
                onClick={() => setUploadError(null)}
              >
                ×
              </button>
              <div className="error-modal-header">
                <h2>Image Recognition Error</h2>
              </div>
              <div className="error-modal-body">
                {uploadError.image && (
                  <div className="error-image-preview">
                    <img 
                      src={uploadError.image} 
                      alt="Uploaded content" 
                      className="uploaded-image-preview"
                    />
                  </div>
                )}
                <p className="error-message">{uploadError.message}</p>
                <p className="error-tip">Tips for better results:</p>
                <ul className="error-tips-list">
                  <li>Use clear, well-lit photos of landmarks</li>
                  <li>Avoid blurry or cropped images</li>
                  <li>Try different angles of the same location</li>
                </ul>
              </div>
              <div className="error-modal-footer">
                <button 
                  className="error-modal-ok-button"
                  onClick={() => setUploadError(null)}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
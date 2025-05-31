import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/TravelerDashboard.css';
import WeatherCard from "../components/WeatherCard";
import yamuLogo from '../images/yamu-logo.png';
import notificationIcon from '../images/notification.png';
import profileIcon from '../images/profile.png';
import botImage from '../images/bot-image.png';
import apiClient from "../services/axiosInstance";
import GuideModal from "../components/GuideModal";
import EventModal from "../components/EventModal";
import eventService from "../services/eventService";

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [facebookEvents, setFacebookEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await apiClient.get("/api/users/role/GUIDE");
        setGuides(response.data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };


    // Try loading real Facebook events, fallback to mock data if error occurs
    const fetchFacebookEvents = async () => {
      try {
        setIsLoadingEvents(true);
        console.log("TravelerDashboard: Fetching Facebook events...");
        
        let eventsData;
        try {
          // First try to get real Facebook events
          eventsData = await eventService.getFacebookEvents();
          console.log("TravelerDashboard: Received Facebook events:", eventsData);
        } catch (facebookError) {
          console.error("TravelerDashboard: Error with Facebook events, falling back to mock data:", facebookError);
          
          // If that fails, fall back to mock events
          try {
            eventsData = await eventService.getMockEvents();
            console.log("TravelerDashboard: Received mock events:", eventsData);
          } catch (mockError) {
            console.error("TravelerDashboard: Even mock events failed:", mockError);
            throw mockError; // Re-throw to be caught by the outer catch
          }
        }
        
        setFacebookEvents(eventsData || []);// Ensure we set an empty array if no events are returned
      } catch (error) {
        console.error("TravelerDashboard: Error fetching events:", error);
        // Still set an empty array even on error to avoid undefined issues
        setFacebookEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchGuides();
    fetchFacebookEvents();
  }, []);

  // Generate sections dynamically, including Facebook events if available
  useEffect(() => {
    const generateSections = () => {
      const staticSections = [
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
        }
      ];

      // Prepare Event & Festival Highlights section
      let eventSection = {
        title: "Event & Festival Highlights",
        items: []
      };

      if (isLoadingEvents) {
        // Show loading placeholder if events are still loading
        eventSection.items = [
          { name: "Loading events...", image: "https://dummyimage.com/300x200/cccccc/666666&text=Loading..." }
        ];
      } else if (facebookEvents && facebookEvents.length > 0) {
        // Filter out past events and sort the remainder by date
        const now = new Date();
        const filteredEvents = facebookEvents.filter(event => {
          // If no start_time, keep the event to be safe
          if (!event.start_time) return true;
          
          //only keep future events
          const eventDate = new Date(event.start_time);
          return eventDate > now;
        });
        
        console.log(`TravelerDashboard: Filtered out ${facebookEvents.length - filteredEvents.length} past events`);
        
        // Sort the filtered events by date
        const sortedEvents = [...filteredEvents].sort((a, b) => {
          // Extract dates for sorting
          const dateA = new Date(a.start_time || '2099-01-01');
          const dateB = new Date(b.start_time || '2099-01-01');
          return dateA - dateB;// Sort by date
        });
        
        // Use the sorted Facebook events
        eventSection.items = sortedEvents.slice(0, 5).map(event => ({
          name: event.name,
          image: event.image_url || "https://dummyimage.com/300x200/cccccc/666666&text=Event",
          date: event.formatted_date,
          fbEvent: event
        }));
      } else {
        // Use default events if no Facebook events available
        eventSection.items = [
          { name: "Esala Perahera", image: "/src/images/asala_perahera.webp" },
          { name: "Nallur Kovil Festival", image: "/src/images/nallur_festival.jpg" },
          { name: "Sinhala Tamil New Year", image: "/src/images/new_year.jpeg" },
          { name: "Kuweni The Musical", image: "/src/images/kuweni.jpg" },
          { name: "Whale Watching Season", image: "/src/images/whale_watching.jpg" }
        ];
      }

      return [...staticSections, eventSection];
    };

    setSections(generateSections());
  }, [guides, facebookEvents, isLoadingEvents]);

  const packages = [
    { name: "Package 1", price: 50000, image: "/src/images/sigiriya.jpg", description: "3 Days Sigiriya Adventure" },
    { name: "Package 2", price: 60000, image: "/src/images/hiriketiya.jpg", description: "5 Days Beach Getaway" },
    { name: "Package 3", price: 30000, image: "/src/images/hiriketiya.jpg", description: "2 Days Quick Escape" }
  ];

  const [convertedPackages, setConvertedPackages] = useState(
    packages.map(pkg => ({ ...pkg, convertedPrice: pkg.price }))
  );

  // Fetch exchange rates and convert package prices based on selected currency
  const fetchExchangeRates = async () => {
    if (selectedCurrency === 'LKR') {
      setConvertedPackages(packages.map(pkg => ({
        ...pkg,
        convertedPrice: pkg.price
      })));
      return;
    }

    try {
      // Replace with your ExchangeRate API key
      const response = await fetch(`https://v6.exchangerate-api.com/v6/ee302ff3be157ca6a021f6a0/pair/LKR/${selectedCurrency}`);// Replace with your API key
      const data = await response.json();

      // Check if the response is valid and has a conversion rate
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
    // Set up an interval to fetch exchange rates every minute to ensure the exchange rates are up-to-date
    const intervalId = setInterval(fetchExchangeRates, 60000);
    return () => clearInterval(intervalId);
  }, [selectedCurrency]);

  // Handle scroll for the cards-scroll-container
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

  const CurrencyDropdown = () => (
    <div className="currency-dropdown">
      <button
        type="button"
        className="currency-button"
        onClick={(e) => {
          e.stopPropagation();//prevent the click event from bubbling up
          setIsDropdownOpen(!isDropdownOpen);//toggle the dropdown
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
    <div>
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
                }
              }}
            >
              {item}
            </li>
          ))}
          <li
            key="Inbox"
            className="nav-link"
            onClick={() => navigate('/inbox')}
          >
            Inbox
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
            <img src={profileIcon} alt="Profile" className="profile-image" onClick={() => navigate('/profile')} />
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
            />
          </div>
          <div className="buttons-container">
            <button className="action-button upcoming-trips-button">
              Upcoming Trips
            </button>
            <button 
              className="action-button start-planning-button"
              onClick={() => navigate('/visit-planner')}
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
                onClick={() => section.title === "Discover Tour Guides" ? navigate('/guides-page') : null}
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
                    onClick={() => {
                      if (section.title === "Discover Tour Guides") {
                        setSelectedGuide(item.guide);
                      } else if (section.title === "Event & Festival Highlights" && item.fbEvent) {
                        setSelectedEvent(item.fbEvent);
                      }
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="card-image" 
                      onError={(e) => {
                        e.target.src = "https://dummyimage.com/300x200/cccccc/666666&text=Image+Not+Found";
                      }}
                    />
                    <div className="card-overlay">
                      <h3 className="card-title">{item.name}</h3>
                      {section.title === "Discover Tour Guides" && (
                        <p style={{ color: 'white', fontSize: '14px' }}>{item.guide.expertiseCityRegion}</p>
                      )}
                      {section.title === "Event & Festival Highlights" && item.date && (
                        <p style={{ color: 'white', fontSize: '14px' }}>{item.date}</p>
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
                <div key={pkg.name} className="card-container">
                  <img src={pkg.image} alt={pkg.name} className="card-image" />
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
      
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
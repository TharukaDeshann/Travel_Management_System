import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import '../styles/TravelerDashboard.css';
import WeatherCard from "../components/WeatherCard";
import yamuLogo from '../images/yamu-logo.png';
import notificationIcon from '../images/notification.png';
import profileIcon from '../images/profile.png';
import botImage from '../images/bot-image.png';
import apiClient from "../services/axiosInstance";
import GuideModal from "../components/GuideModal";

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
      items: [
        { name: "Esala Perahera", image: "/src/images/asala_perahera.webp" },
        { name: "Nallur Kovil Festival", image: "/src/images/nallur_festival.jpg" },
        { name: "Sinhala Tamil New Year", image: "/src/images/new_year.jpeg" },
        { name: "Kuweni The Musical", image: "/src/images/kuweni.jpg" },
        { name: "Whale Watching Season", image: "/src/images/whale_watching.jpg" }
      ]
    }
  ];

  const packages = [
    { name: "Package 1", price: 50000, image: "/src/images/sigiriya.jpg", description: "3 Days Sigiriya Adventure" },
    { name: "Package 2", price: 60000, image: "/src/images/hiriketiya.jpg", description: "5 Days Beach Getaway" },
    { name: "Package 3", price: 30000, image: "/src/images/hiriketiya.jpg", description: "2 Days Quick Escape" }
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
    navigate('/users/users-by-role', { state: { currentUser } });
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
              onClick={() => item === 'Guides' && handleNavigateToGuides()}
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
            <img src={profileIcon} alt="Profile" className="profile-image" onClick={() => (window.location.href = "/profile")} />
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
                onClick={() => section.title === "Discover Tour Guides" ? navigate('/guides') : null}
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
                    onClick={() => section.title === "Discover Tour Guides" && setSelectedGuide(item.guide)}
                  >
                    <img src={item.image} alt={item.name} className="card-image" />
                    <div className="card-overlay">
                      <h3 className="card-title">{item.name}</h3>
                      {section.title === "Discover Tour Guides" && (
                        <p style={{ color: 'white', fontSize: '14px' }}>{item.guide.expertiseCityRegion}</p>
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
        />
      </div>

      {selectedGuide && (
        <GuideModal 
          guide={selectedGuide} 
          onClose={() => setSelectedGuide(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
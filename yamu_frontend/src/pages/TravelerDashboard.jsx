import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import './TravelerDashboard.css';  // Import the CSS file
// Import images
import yamuLogo from '../images/yamu-logo.png';  // Add your logo file
import notificationIcon from '../images/notification.png';  // Updated import name
import profileIcon from '../images/profile.png';  // Updated import name

import botImage from '../images/bot-image.png';  // Updated import name

// Add currencies array at the top level
const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'LKR', symbol: 'Rs.' },
  { code: 'EUR', symbol: '€' },
  { code: 'CHF', symbol: 'Fr.' }
];



const sections = [
  { 
    title: "Discover Places", 
    items: [
      {
        name: "Sigiriya",
        image: "src/images/sigiriya.jpg",  // Add your image paths here
      },
      {
        name: "Hiriketiya",
        image: "src/images/hiriketiya.jpg",
      },
      {
        name: "Ambuluwawa",
        image: "src/images/ambuluwawa.jpg",
      },
      {
        name: "Nagapooshani Amman Temple",
        image: "src/images/amman_temple.jpg",
      },
      {
        name: "Adams Peak",
        image: "src/images/adams-peak.jpg",
      }
    ] 
  },
  { 
    title: "Discover Accommodations", 
    items: [
      {
        name: "Wild Coast Tented Lodge",
        image: "src/images/wild_coast.jpg",  
      },
      {
        name: "98 Acre Resort & Spa",
        image: "src/images/98_acre.jpg",
      },
      {
        name: "Anantara Resort & Spa",
        image: "src/images/anantaya.jpg",
      },
      {
        name: "Jetwing Colombo Seven",
        image: "src/images/jetwing.jpg",
      },
      {
        name: "The Lake Forest Hotel",
        image: "src/images/lake_forest.jpg",
      },
    ] 
  },
  { 
    title: "Discover Tour Guides", 
    items: [
      {
        name: "Rajam Chaitanya",
        image: "src/images/rajam.jpeg",
      },
      {
        name: "Duminda Jayasinghe",
        image: "src/images/duminda.jpg",
      },
      {
        name: "Selvam Vetri",
        image: "src/images/selvam.webp",  // Add your image paths here
      },
      {
        name: "Samantha Perera",
        image: "src/images/samantha.webp",
      },
      {
        name: "Jagath Karunathilake",
        image: "src/images/jagath.jpeg",
      }
      
    ] 
  },

  { 
    title: "Event & Festival Highlights", 
    items: [
      {
        name: "Esala Perahera",
        image: "src/images/asala_perahera.webp",  // Add your image paths here
      },
      {
        name: "Nallur Kovil Festival",
        image: "src/images/nallur_festival.jpg",
      },
      {
        name: "Sinhala Tamil New Year",
        image: "src/images/new_year.jpeg",
      },
      {
        name: "Kuweni The Musical",
        image: "src/images/kuweni.jpg",
      },
      {
        name: "Whale Watching Season",
        image: "src/images/whale_watching.jpg",
      }   
    ] 
  },

  { 
    title: "Discover Packages", 
    items: [
      {
        name: "Package 1 - Rs.50,000",
        image: "src/images/sigiriya.jpg",  // Add your image paths here
      },
      {
        name: "Package 2 - Rs.60,000",
        image: "src/images/hiriketiya.jpg",
      },
      {
        name: "Package 3 - Rs.30,000",
        image: "src/images/hiriketiya.jpg",
      }
    ] 
  }

];

export default function TravelerDashboard() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Add state for scroll buttons visibility
  const [showLeftButton, setShowLeftButton] = useState({});

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.currency-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll event for each container
  const handleScroll = (e, sectionTitle) => {
    const container = e.target;
    setShowLeftButton(prev => ({
      ...prev,
      [sectionTitle]: container.scrollLeft > 0
    }));
  };

  // Currency dropdown component
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
      {/* Fixed Navigation Bar */}
      <nav className="nav-container">
        <div className="logo-container">
          <img 
            src={yamuLogo} 
            alt="YAMU Logo" 
            className="nav-logo-image"
          />
          <h1 className="nav-logo">YAMU</h1>
        </div>
        <ul className="nav-links">
          {['Dashboard', 'Hotels', 'Guides', 'Places', 'Emergency Contacts'].map((item) => (
            <li key={item} className="nav-link">{item}</li>
          ))}
        </ul>
        <div className="flex items-center space-x-4">
          {/* Currency Dropdown */}
          <CurrencyDropdown />
          {/* Icons */}
          <div className="icon-container">
            <img 
              src={notificationIcon} 
              alt="Notifications" 
              className="w-6 h-6"
            />
            <span className="notification-badge">3</span>
          </div>
          <div className="icon-container">
            <img 
              src={profileIcon} 
              alt="Profile" 
              className="profile-image"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Search & Buttons */}
        <div className="search-container">
          {/* Search Bar */}
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search destinations, hotels, or events..." 
              className="search-input"
            />
          </div>
          
          {/* Buttons */}
          <div className="buttons-container">
            <button className="action-button upcoming-trips-button">
              Upcoming Trips
            </button>
            <button className="action-button start-planning-button">
              Start Planning
            </button>
          </div>
        </div>
        
        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="section-container">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <button className="text-blue-500">See more →</button>
            </div>
            <div className={`cards-scroll-container ${showLeftButton[section.title] ? 'scrolled' : ''}`}>
              {showLeftButton[section.title] && (
                <button 
                  className="scroll-button left"
                  onClick={(e) => {
                    const container = e.target.closest('.cards-scroll-container').querySelector('.flex');
                    container.scrollBy({ left: -(339 + 16), behavior: 'smooth' });
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
                  <div key={item.name} className="card-container">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="card-image"
                    />
                    <div className="card-overlay">
                      <h3 className="card-title">{item.name}</h3>
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
        
        {/* Bot Image */}
        <img 
          src={botImage}
          alt="Bot Assistant"
          type="button"
          className="fixed-bottom-image"
        />
      </div>
    </div>
  );
}
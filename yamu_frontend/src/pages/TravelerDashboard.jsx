import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import './TravelerDashboard.css';  // Import the CSS file
// Import logo
import yamuLogo from '../images/yamu-logo.png';  // Add your logo file
import botImage from '../images/bot-image.png';  // Updated import name

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
        image: "/images/ambuluwawa.jpg",
      }
    ] 
  },
  { title: "Discover Accommodations", items: ["Wild Coast Tented Lodge", "98 Acre Resort & Spa", "141 Key Anantara"] },
  { title: "Discover Tour Guides", items: ["Tour Guide 1", "Tour Guide 2", "Tour Guide 3"] },
  { title: "Event & Festival Highlights", items: ["Esala Perahera", "Nadagama 360", "Sinhala Tamil New Year"] },
  { title: "Discover Packages", items: ["Package 1 - Rs.50,000", "Package 2 - Rs.60,000", "Package 3 - Rs.30,000"] }
];

// Add currencies array
const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'LKR', symbol: 'Rs.' },
  { code: 'CHF', symbol: '' },
  { code: 'EUR', symbol: '€' }
];

export default function TravelerDashboard() {
  // Add state for currency and dropdown
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="p-4">
      {/* Navigation Bar */}
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
          <div className="currency-dropdown">
            <button 
              className="currency-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {currencies.find(c => c.code === selectedCurrency)?.symbol}{selectedCurrency}
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    className="currency-option"
                    onClick={() => {
                      setSelectedCurrency(currency.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {currency.symbol}{currency.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="icon-container">
            <img 
              src="src/images/notification.webp" 
              alt="Notifications" 
              className="w-6 h-6"
            />
            <span className="notification-badge">3</span>
          </div>
          <div className="icon-container">
            <img 
              src="src/images/profile.png" 
              alt="Profile" 
              className="profile-image"
            />
          </div>
        </div>
      </nav>
      
      {/* Search & Buttons */}
      <div className="search-container">
        {/* Search Bar */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search destinations, hotels, or activities..." 
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
        <div key={section.title} className="my-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{section.title}</h2>
            <button className="text-blue-500">See more →</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto py-2">
            {section.items.map((item) => (
              <div key={item.name} className="min-w-[200px] p-4 shadow-md bg-white rounded">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p>{item.name}</p>
              </div>
            ))}
            <button className="p-2 bg-gray-200 rounded-full">→</button>
          </div>
        </div>
      ))}
      
      {/* Updated image element */}
      <img 
        src={botImage}
        alt="Bot Assistant"
        className="fixed-bottom-image"
      />
    </div>
  );
}
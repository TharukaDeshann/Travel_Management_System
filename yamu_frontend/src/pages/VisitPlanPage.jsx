import React from 'react';
import VisitPlanner from '../components/VisitPlanner';
import yamuLogo from '../images/yamu-logo.png';
import notificationIcon from '../images/notification.png';
import profileIcon from '../images/profile.png';

const VisitPlanPage = () => {
  return (
    <div>
      <nav className="nav-container">
        <div className="logo-container">
          <img src={yamuLogo} alt="YAMU Logo" className="nav-logo-image" />
          <h1 className="nav-logo">YAMU</h1>
        </div>
        <ul className="nav-links">
          {['Dashboard', 'Hotels', 'Guides', 'Places', 'Emergency Contacts'].map((item) => (
            <li key={item} className="nav-link">{item}</li>
          ))}
        </ul>
        <div className="flex items-center space-x-4">
          <div className="icon-container">
            <img src={notificationIcon} alt="Notifications" className="w-6 h-6" />
            <span className="notification-badge">3</span>
          </div>
          <div className="icon-container">
            <img src={profileIcon} alt="Profile" className="profile-image" />
          </div>
        </div>
      </nav>

      <div className="main-content">
        <VisitPlanner />
      </div>
    </div>
  );
};

export default VisitPlanPage;
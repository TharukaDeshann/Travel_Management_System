import React, { useState } from "react";
import {
  Mail,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";

// Header Component
const Header = ({
  user = {},
  unreadCount = 0,
  navigate = () => {},
  location = { pathname: "" },
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "booking",
      message: "Your booking has been confirmed",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "message",
      message: "New message from guide",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "reminder",
      message: "Trip reminder: Tomorrow at 8 AM",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const getNavigationItems = () => {
    if (user?.role === "GUIDE") {
      return [
        { name: "Dashboard", path: "/guide-dashboard" },
        { name: "Calendar", path: "/guide-calendar" },
        { name: "Reviews", path: "/guide-reviews" },
        { name: "Emergency Contacts", path: "/emergency-contacts" },
      ];
    } else if (user?.role === "TRAVELER") {
      return [
        { name: "Dashboard", path: "/traveler-dashboard" },
        { name: "Reservations", path: "/reservations" },
        { name: "Guides", path: "/guides-page" },
        { name: "Places", path: "/places" },
        { name: "Emergency Contacts", path: "/emergency-contacts" },
      ];
    } else if (user?.role === "ADMIN") {
      return [
        { name: "Users", path: "/users/users-by-role" },
        { name: "Analytics", path: "/admin-analytics" },
        { name: "Emergency Contacts", path: "/emergency-contacts" },
      ];
    } else {
      return [
        { name: "Home", path: "/" },
        { name: "Places", path: "/places" },
        { name: "Emergency Contacts", path: "/emergency-contacts" },
      ];
    }
  };

  const navigationItems = getNavigationItems();
  
  // Helper functions for role-based rendering
  const shouldShowCurrencySelector = () => {
    if (!user) return true; // Show for guests (no user logged in)
    return user.role === "TRAVELER"; // Show for travelers only
  };

  const shouldShowMessages = () => {
    if (!user || !user.role) return false;
    return user.role === "TRAVELER" || user.role === "GUIDE";
  };

  const shouldShowNotifications = () => {
    return user && user.role; // Show when user is logged in
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NotificationCenter = () => (
    <div className="relative">
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
        title="Notifications"
      >
        <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
        {notifications.filter((n) => n.unread).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-pulse font-medium text-[10px] lg:text-xs">
            {notifications.filter((n) => n.unread).length}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 lg:w-84 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-base lg:text-lg text-gray-900">
              Notifications
            </h3>
            <button className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 lg:max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  notification.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full mt-2 ${
                      notification.unread ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm lg:text-base text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-gray-100">
            <button className="w-full text-center text-sm lg:text-base text-blue-600 hover:text-blue-700 font-semibold">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const MessagesIcon = () => (
    <button
      onClick={() => navigate("/inbox")}
      className="relative p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
      title="Messages"
    >
      <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-medium text-[10px] lg:text-xs">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  const ProfileDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
      >
        <div className="relative">
          <img
            src={user?.profileImageUrl || "/default-profile.png"}
            alt="Profile"
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-200"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="hidden lg:block text-left">
          <p className="font-semibold text-sm lg:text-base text-gray-900 truncate max-w-[100px] lg:max-w-[120px]">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs lg:text-sm text-gray-500">
            {user?.role === "ADMIN"
              ? "Admin"
              : user?.role === "GUIDE"
              ? "Guide"
              : "Traveler"}
          </p>
        </div>
        <ChevronDown
          className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-600 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 lg:w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={user?.profileImageUrl || "/default-profile.png"}
                alt="Profile"
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-base lg:text-lg text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm lg:text-base text-gray-600">{user?.email}</p>
                <span
                  className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold mt-1 ${
                    user?.role === "ADMIN"
                      ? "bg-red-100 text-red-800"
                      : user?.role === "GUIDE"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user?.role === "ADMIN"
                    ? "Admin"
                    : user?.role === "GUIDE"
                    ? "Guide"
                    : "Traveler"}
                </span>
              </div>
            </div>
          </div>
          <div className="py-2">
            <button
              onClick={() => {
                navigate("/profile");
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 lg:px-5 py-2.5 lg:py-3 text-left text-sm lg:text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium"
            >
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              Profile Settings
            </button>
            <hr className="my-2 border-gray-100" />
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 lg:px-5 py-2.5 lg:py-3 text-left text-sm lg:text-base text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-[#f0f2f5] shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl lg:text-2xl">Y</span>
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-gray-900">YAMU</span>
          </div>

          {/* Center: Desktop Navigation - Only show on large screens */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8 xl:mx-16">
            <div className="flex items-center space-x-1 xl:space-x-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 xl:px-5 py-2.5 rounded-xl text-sm xl:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActivePath(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Right: Action Items */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Action buttons group */}
            <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 lg:p-2 gap-0.5 lg:gap-1">
              {/* Currency Selector */}
              {shouldShowCurrencySelector() && (
                <CurrencySelector variant="minimal" size="default" />
              )}

              {/* Divider */}
              {shouldShowCurrencySelector() && (shouldShowMessages() || shouldShowNotifications()) && (
                <div className="w-px h-6 lg:h-8 bg-gray-300 mx-0.5 lg:mx-1"></div>
              )}

              {/* Messages */}
              {shouldShowMessages() && <MessagesIcon />}

              {/* Notifications */}
              {shouldShowNotifications() && <NotificationCenter />}
            </div>

            {/* Profile */}
            <div className="ml-2 lg:ml-3">
              <ProfileDropdown />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden ml-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-2 max-h-screen overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                  isActivePath(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

// Footer Component
const Footer = ({ navigate }) => {
  const footerSections = [
    {
      title: "Explore",
      links: [
        { name: "Destinations", path: "/places" },
        { name: "Hotels", path: "/hotels" },
        { name: "Tour Guides", path: "/guides-page" },
        { name: "Packages", path: "/packages" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help" },
        { name: "Emergency Contacts", path: "/emergency-contacts" },
        { name: "Contact Us", path: "/contact" },
        { name: "FAQ", path: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Press", path: "/press" },
        { name: "Blog", path: "/blog" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 lg:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">Y</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold">YAMU</span>
            </div>
            <p className="text-gray-400 mb-4 lg:mb-6 max-w-md text-sm lg:text-base">
              Your trusted travel companion in Sri Lanka. Discover amazing
              destinations, connect with local guides, and create unforgettable
              memories.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@yamu.lk</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="py-4 lg:py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs lg:text-sm text-center sm:text-left">
              © 2025 YAMU Travel Management System. All rights reserved.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Layout Component
const Layout = ({ children, user, unreadCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        user={user}
        unreadCount={unreadCount}
        navigate={navigate}
        location={location}
      />

      <main className="flex-1">{children}</main>

      <Footer navigate={navigate} />
    </div>
  );
};

export { Layout, Header, Footer };
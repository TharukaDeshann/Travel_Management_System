import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  MapPin, 
  BarChart3,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Layout } from './Layout';
import { useUser } from '../context/UserContext';

const AdminLayout = ({ children, currentPage = 'User Management' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const loggedUser = useUser().user;
  const unreadCount = loggedUser?.unreadCount || 0;
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Close sidebar on mobile when window resizes
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Navigation items with proper route paths
  const navigationItems = [
    { 
      id: 'user-management', 
      label: 'User Management', 
      icon: Users, 
      path: '/admin-user-management' 
    },
    { 
      id: 'guide-management', 
      label: 'Guide Management', 
      icon: MapPin, 
      path: '/admin-guide-management' 
    },
    { 
      id: 'traveler-management', 
      label: 'Traveler Management', 
      icon: Users, 
      path: '/admin-traveler-management' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/admin-analytics' 
    }
  ];

  // Function to determine if a navigation item is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.path);
    
    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 lg:px-6 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <Layout
      user={loggedUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
    >
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`
            fixed z-30 inset-y-0 left-0 w-64 sm:w-72 lg:w-64 bg-white border-r border-gray-200 shadow-lg transform
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 lg:static lg:shadow-none
          `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200">
            <h1 className="text-lg lg:text-xl font-bold text-blue-600 truncate">
              YAMU Admin
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 overflow-y-auto">
            <div className="space-y-1 px-2 lg:px-0">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
          {/* Top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-20 z-10">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              {/* Left section */}
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Page title */}
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 capitalize truncate">
                  {getCurrentPageTitle()}
                </h2>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* User menu - Mobile */}
                <div className="sm:hidden">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {loggedUser?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );

  // Helper function to get current page title based on pathname
  function getCurrentPageTitle() {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Admin Dashboard';
  }
};

export default AdminLayout;
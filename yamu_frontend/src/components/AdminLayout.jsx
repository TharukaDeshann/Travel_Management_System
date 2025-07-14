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

const AdminLayout = ({ children, currentPage = 'overview' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
  }, [currentPage, isMobile]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'guide-management', label: 'Guide Management', icon: MapPin },
    { id: 'traveler-management', label: 'Traveler Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={`#${item.id}`}
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
                  isActive={currentPage === item.id}
                />
              ))}
            </div>
          </nav>

          {/* Sidebar footer - only visible on larger screens */}
          <div className="hidden lg:block p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {loggedUser?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {loggedUser?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {loggedUser?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
          </div>
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
                  {currentPage.replace('-', ' ')}
                </h2>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Search - Desktop */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Search - Mobile */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Settings - Hidden on mobile */}
                <button className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>

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

            {/* Mobile search bar */}
            {searchOpen && (
              <div className="md:hidden px-4 pb-3 border-t border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            )}
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
};

export default AdminLayout;
import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';

const AdminLayout = ({ children, currentPage = 'overview' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'guide-management', label: 'Guide Management', icon: MapPin },
    { id: 'traveler-management', label: 'Traveler Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <a
        href={`#${item.id}`}
        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.label}
      </a>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (always visible on lg+) */}
      <aside
        className={`
          fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg transform
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">YAMU Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
              />
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@yamu.com</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">3</span>
                </span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

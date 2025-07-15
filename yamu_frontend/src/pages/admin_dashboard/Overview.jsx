import React, { useState, useEffect } from 'react';
import { Users, MapPin, Star, Car, TrendingUp, Activity } from 'lucide-react';
import guideSearchService from '../../services/guideSearchService';
import AdminLayout from '../../components/AdminLayout';

const Overview = () => {
  const [stats, setStats] = useState({
    totalGuides: 0,
    totalVehicles: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [topGuides, setTopGuides] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
    
  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Don't show loading spinner if data is already loaded (for navigation)
      if (!dataLoaded) {
        setLoading(true);
      }
      
      const [statsResponse, topGuidesResponse] = await Promise.all([
        guideSearchService.getGuideStats(),
        guideSearchService.getTopRatedGuides(4, 0, 5),
      ]);

      setStats(statsResponse || {
        totalGuides: 0,
        totalVehicles: 0,
        averageRating: 0,
        totalReviews: 0
      });
      setTopGuides(topGuidesResponse.results || []);
      setDataLoaded(true);
    
    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Set default values on error
      setStats({
        totalGuides: 0,
        totalVehicles: 0,
        averageRating: 0,
        totalReviews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, isLoading = false }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {change && !isLoading && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const GuideCard = ({ guide, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {guide.firstName?.charAt(0)}{guide.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              {guide.firstName} {guide.lastName}
            </h4>
            <p className="text-sm text-gray-500">{guide.expertiseCityRegion}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{guide.averageRating}</span>
          </div>
        </div>
      </div>
    );
  };

  const ActivityItem = ({ activity, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-1">
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">
            New review for {activity.firstName} {activity.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {activity.reviewCreatedAt && new Date(activity.reviewCreatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs">{activity.reviewRating}</span>
        </div>
      </div>
    );
  };

  // Show skeleton UI immediately, don't wait for loading
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Guides"
            value={stats?.totalGuides || 0}
            icon={Users}
            color="bg-blue-500"
            change={12}
            isLoading={loading}
          />
          <StatCard
            title="Active Vehicles"
            value={stats?.totalVehicles || 0}
            icon={Car}
            color="bg-green-500"
            change={8}
            isLoading={loading}
          />
          <StatCard
            title="Avg Rating"
            value={stats?.averageRating || 0}
            icon={Star}
            color="bg-yellow-500"
            change={5}
            isLoading={loading}
          />
          <StatCard
            title="Total Reviews"
            value={stats?.totalReviews || 0}
            icon={TrendingUp}
            color="bg-purple-500"
            change={15}
            isLoading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Rated Guides */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Rated Guides</h3>
              </div>
              <div className="p-6 space-y-4">
                {loading ? (
                  // Show skeleton cards while loading
                  Array(4).fill(0).map((_, index) => (
                    <GuideCard key={index} guide={{}} isLoading={true} />
                  ))
                ) : (
                  topGuides.map((guide, index) => (
                    <GuideCard key={index} guide={guide} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {loading ? (
                  // Show skeleton activity items while loading
                  Array(5).fill(0).map((_, index) => (
                    <ActivityItem key={index} activity={{}} isLoading={true} />
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">View All Guides</span>
              </button>
              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Review Management</span>
              </button>
              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Car className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Vehicle Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Overview;
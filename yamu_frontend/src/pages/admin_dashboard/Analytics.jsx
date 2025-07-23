import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Users, Calendar, Car, Hotel, TrendingUp, Activity, 
  DollarSign, MapPin, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import AdminLayout from "../../components/AdminLayout.jsx";


// Import your API functions
import { 
  getAllTravelers, 
  getAllTravelerBookings, 
  getTravelerBookingCounts 
} from '../../services/travelerManagementService'; 

const Analytics = () => {
  const [travelers, setTravelers] = useState([]);
  const [allBookingsData, setAllBookingsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');

  // Color schemes for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
  const STATUS_COLORS = {
    PENDING: '#ffc658',
    CONFIRMED: '#82ca9d',
    COMPLETED: '#8884d8',
    CANCELLED: '#ff7300',
    BOOKED: '#0088fe'
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all travelers
      const travelersData = await getAllTravelers();
      setTravelers(travelersData);

      // Fetch booking data for each traveler
      const bookingsPromises = travelersData.map(traveler => 
        getAllTravelerBookings(traveler.id).catch(err => {
          console.warn(`Failed to fetch bookings for traveler ${traveler.id}:`, err);
          return { guideReservations: [], hotelBookings: [], driverBookings: [] };
        })
      );

      const bookingsResults = await Promise.all(bookingsPromises);
      
      // Combine all booking data
      const combinedData = {};
      travelersData.forEach((traveler, index) => {
        combinedData[traveler.id] = {
          traveler,
          ...bookingsResults[index]
        };
      });

      setAllBookingsData(combinedData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate various metrics
  const analytics = useMemo(() => {
    if (!travelers.length || !Object.keys(allBookingsData).length) {
      return {
        totalTravelers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        bookingsByType: [],
        statusDistribution: [],
        monthlyTrends: [],
        topDestinations: [],
        recentActivity: [],
        avgBookingsPerTraveler: 0
      };
    }

    // Calculate total bookings and revenue
    let totalGuideReservations = 0;
    let totalHotelBookings = 0;
    let totalDriverBookings = 0;
    let totalRevenue = 0;
    let statusCounts = {};
    let monthlyData = {};
    let destinationCounts = {};

    Object.values(allBookingsData).forEach(({ guideReservations, hotelBookings, driverBookings }) => {
      totalGuideReservations += guideReservations.length;
      totalHotelBookings += hotelBookings.length;
      totalDriverBookings += driverBookings.length;

      // Calculate revenue from hotel bookings
      hotelBookings.forEach(booking => {
        totalRevenue += booking.totalPrice || 0;
        
        // Count statuses
        statusCounts[booking.bookingStatus] = (statusCounts[booking.bookingStatus] || 0) + 1;
        
        // Group by month
        const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { hotel: 0, guide: 0, driver: 0 };
        }
        monthlyData[month].hotel += 1;
      });

      // Process guide reservations
      guideReservations.forEach(reservation => {
        statusCounts[reservation.status] = (statusCounts[reservation.status] || 0) + 1;
        
        const month = new Date(reservation.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { hotel: 0, guide: 0, driver: 0 };
        }
        monthlyData[month].guide += 1;

        // Count destinations
        reservation.dayDetails?.forEach(detail => {
          const place = detail.places;
          destinationCounts[place] = (destinationCounts[place] || 0) + 1;
        });
      });

      // Process driver bookings
      driverBookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
        
        const month = new Date(booking.bookingDate).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = { hotel: 0, guide: 0, driver: 0 };
        }
        monthlyData[month].driver += 1;
      });
    });

    const totalBookings = totalGuideReservations + totalHotelBookings + totalDriverBookings;

    return {
      totalTravelers: travelers.length,
      totalBookings,
      totalRevenue,
      avgBookingsPerTraveler: travelers.length > 0 ? (totalBookings / travelers.length).toFixed(1) : 0,
      bookingsByType: [
        { name: 'Guide Reservations', value: totalGuideReservations, color: COLORS[0] },
        { name: 'Hotel Bookings', value: totalHotelBookings, color: COLORS[1] },
        { name: 'Driver Bookings', value: totalDriverBookings, color: COLORS[2] }
      ],
      statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: STATUS_COLORS[status] || COLORS[0]
      })),
      monthlyTrends: Object.entries(monthlyData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, data]) => ({
          month,
          ...data,
          total: data.hotel + data.guide + data.driver
        })),
      topDestinations: Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([destination, count]) => ({ name: destination, value: count }))
    };
  }, [travelers, allBookingsData]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout currentPage="traveler-management">
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
        <AdminLayout currentPage="traveler-management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="analytics">
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor traveler activities and booking trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Travelers"
            value={analytics.totalTravelers}
            icon={Users}
            color="#8884d8"
          />
          <StatCard
            title="Total Bookings"
            value={analytics.totalBookings}
            icon={Calendar}
            color="#82ca9d"
            subtitle={`${analytics.avgBookingsPerTraveler} avg per traveler`}
          />
          <StatCard
            title="Total Revenue"
            value={`LKR ${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="#ffc658"
          />
          <StatCard
            title="Active Services"
            value="3"
            icon={Activity}
            color="#ff7300"
            subtitle="Guide, Hotel, Driver"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings by Type */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.bookingsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.bookingsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Booking Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="hotel" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="guide" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="driver" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Destinations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Destinations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topDestinations} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Traveler Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traveler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guide Reservations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {travelers.slice(0, 10).map((traveler) => {
                  const bookingData = allBookingsData[traveler.id] || {};
                  const guideCount = bookingData.guideReservations?.length || 0;
                  const hotelCount = bookingData.hotelBookings?.length || 0;
                  const driverCount = bookingData.driverBookings?.length || 0;
                  const totalCount = guideCount + hotelCount + driverCount;
                  
                  return (
                    <tr key={traveler.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <img src={traveler.profileImageUrl} alt={`${traveler.firstName[0]} ${traveler.lastName[0]}`} className="h-10 w-10 rounded-full" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {traveler.firstName} {traveler.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{traveler.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{totalCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{guideCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hotelCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driverCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          totalCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {totalCount > 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Future Extensions Placeholder */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-blue-800 font-medium">Coming Soon</h3>
              <p className="text-blue-600 mt-1">
                Guide and Admin analytics will be added in future updates. This will include guide performance metrics, 
                admin activity tracking, and more detailed insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Analytics;
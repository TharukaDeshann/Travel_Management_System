import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Calendar, 
  DollarSign,
  Eye,
  User,
  Package,
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import packageService from '../../services/packageService';
import { useUser } from '../../context/UserContext';

const PackageApplicationsManagement = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);

  // Load applications on component mount
  useEffect(() => {
    loadPendingApplications();
  }, []);

  const loadPendingApplications = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPendingApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search term and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.travelerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.travelerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const handleStatusUpdate = async (applicationId, status, adminNotes = '') => {
    try {
      await packageService.updateApplicationStatus(applicationId, status, adminNotes);
      await loadPendingApplications();
      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return;
    
    try {
      await packageService.bulkApproveApplications(selectedApplications);
      await loadPendingApplications();
      setSelectedApplications([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleAllApplications = () => {
    if (selectedApplications.length === currentApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(currentApplications.map(app => app.applicationId));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have permission to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="package-applications">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Package Applications</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and review package applications from travelers
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {selectedApplications.length > 0 && (
                <button
                  onClick={handleBulkApprove}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Selected ({selectedApplications.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by traveler name, email, or package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <XCircle className="mx-auto h-8 w-8 text-red-500" />
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={loadPendingApplications}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedApplications.length === currentApplications.length && currentApplications.length > 0}
                          onChange={toggleAllApplications}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Traveler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentApplications.map((app) => (
                      <tr key={app.applicationId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(app.applicationId)}
                            onChange={() => toggleApplicationSelection(app.applicationId)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {app.travelerName || 'Unknown Traveler'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.travelerEmail || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {app.packageName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.packageDuration} days
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {app.groupSize} {app.groupSize === 1 ? 'person' : 'people'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(app.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(app.totalCost)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.applicationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {app.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowStatusModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Update Status"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{indexOfFirstApplication + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastApplication, filteredApplications.length)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{filteredApplications.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {showDetailsModal && selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedApplication(null);
            }}
          />
        )}

        {showStatusModal && selectedApplication && (
          <StatusUpdateModal
            application={selectedApplication}
            onUpdate={handleStatusUpdate}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Application Details Modal
const ApplicationDetailsModal = ({ application, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-md bg-white my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Traveler Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {application.travelerName}</p>
                <p><span className="font-medium">Email:</span> {application.travelerEmail}</p>
                <p><span className="font-medium">Phone:</span> {application.travelerPhone || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Package Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Package:</span> {application.packageName}</p>
                <p><span className="font-medium">Duration:</span> {application.packageDuration} days</p>
                <p><span className="font-medium">Start Date:</span> {new Date(application.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <p><span className="font-medium">Group Size:</span> {application.groupSize} people</p>
              <p><span className="font-medium">Cost per Person:</span> {formatCurrency(application.costPerPerson)}</p>
              <p><span className="font-medium">Total Cost:</span> {formatCurrency(application.totalCost)}</p>
            </div>
          </div>
          
          {application.specialRequests && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Special Requests</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {application.specialRequests}
              </p>
            </div>
          )}
          
          {application.adminNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Admin Notes</h4>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                {application.adminNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Update Modal
const StatusUpdateModal = ({ application, onUpdate, onClose }) => {
  const [status, setStatus] = useState('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(application.applicationId, status, adminNotes);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Update Application Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any notes for the traveler..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                status === 'APPROVED' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {status === 'APPROVED' ? 'Approve' : 'Reject'} Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageApplicationsManagement;

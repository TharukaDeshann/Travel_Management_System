import React, { useEffect, useState } from "react";
import { searchUsers, getSuggestions } from "../../services/searchService";
import AdminLayout from "../../components/AdminLayout";
import { Input } from "antd";
import { Button } from "antd";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import UserDetailsModal from "../../components/UserDetailsModal";

const roles = ["ADMIN", "GUIDE", "TRAVELER"];
const languages = ["English", "Sinhala", "Tamil"];
const cities = ["Colombo", "Kandy", "Galle"];
const nationalities = ["Sri Lankan", "Indian", "British"];

const UserManagement = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedNationalities, setSelectedNationalities] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleFilterToggle = (filter, value) => {
    const filterMap = {
      role: { current: selectedRoles, setter: setSelectedRoles },
      language: { current: selectedLanguages, setter: setSelectedLanguages },
      city: { current: selectedCities, setter: setSelectedCities },
      nationality: {
        current: selectedNationalities,
        setter: setSelectedNationalities,
      },
    };

    const { current, setter } = filterMap[filter];

    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchUsers({
        query: query || "*",
        role: selectedRoles,
        language: selectedLanguages,
        city: selectedCities,
        nationality: selectedNationalities,
        page,
        size,
      });
      setUsers(response.results || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error("Search failed", err);
      setUsers([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const handleSuggestionFetch = async (text) => {
    setQuery(text);
    if (text.length >= 2) {
      try {
        const res = await getSuggestions(text);
        setSuggestions(res || []);
      } catch (err) {
        console.error("Suggestions failed", err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleViewProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetailsModal(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "GUIDE":
        return "bg-blue-100 text-blue-800";
      case "TRAVELER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSelectedLanguages([]);
    setSelectedCities([]);
    setSelectedNationalities([]);
  };

  useEffect(() => {
    handleSearch();
  }, [
    page,
    selectedRoles,
    selectedCities,
    selectedLanguages,
    selectedNationalities,
  ]);

  const hasActiveFilters =
    selectedRoles.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedCities.length > 0 ||
    selectedNationalities.length > 0;

  return (
    <AdminLayout currentPage="user-management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Search and manage user accounts across the platform
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total Users: {totalCount.toLocaleString()}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search users by name, email, or ID..."
              value={query}
              onChange={(e) => handleSuggestionFetch(e.target.value)}
              className="w-full"
              size="large"
            />
            {suggestions.length > 0 && (
              <motion.ul
                className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setQuery(s);
                      setSuggestions([]);
                    }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            size="large"
            type="primary"
            className="min-w-[100px]"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Search"}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" size="sm">
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Role",
                values: roles,
                key: "role",
                selected: selectedRoles,
              },
              {
                title: "Language",
                values: languages,
                key: "language",
                selected: selectedLanguages,
              },
              {
                title: "City",
                values: cities,
                key: "city",
                selected: selectedCities,
              },
              {
                title: "Nationality",
                values: nationalities,
                key: "nationality",
                selected: selectedNationalities,
              },
            ].map(({ title, values, key, selected }) => (
              <div key={key}>
                <p className="font-semibold text-gray-700 mb-3">{title}</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => (
                    <Button
                      key={val}
                      type={selected.includes(val) ? "primary" : "default"}
                      size="sm"
                      onClick={() => handleFilterToggle(key, val)}
                      className="text-xs"
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <motion.div
                    key={user.user_id || user.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6">
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={
                                user.fullName ||
                                `${user.first_name} ${user.last_name}`
                              }
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.fullName ||
                                `${user.first_name} ${user.last_name}`}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {user.verified || user.is_verified ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{user.email}</span>
                        </div>

                        {user.contact_number && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{user.contact_number}</span>
                          </div>
                        )}

                        {user.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        )}

                        {user.nationality && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Shield className="w-4 h-4 mr-2" />
                            <span>{user.nationality}</span>
                          </div>
                        )}

                        {user.expertise_city_region && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>Expert in: {user.expertise_city_region}</span>
                          </div>
                        )}

                        {user.guide_language && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">
                              Languages: {user.guide_language}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Guide About */}
                      {user.guide_about && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {user.guide_about}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          ID: {user.user_id || user.id}
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleViewProfile(user.user_id || user.id)
                          }
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Showing {page * size + 1} to{" "}
              {Math.min((page + 1) * size, totalCount)} of {totalCount} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Page {page + 1} of {Math.ceil(totalCount / size)}
              </span>
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={(page + 1) * size >= totalCount}
                variant="outline"
                size="sm"
              >
                Next
              </Button>

              {/* User Details Modal*/}
              <UserDetailsModal
                isOpen={showUserDetailsModal}
                onClose={() => setShowUserDetailsModal(false)}
                userId={selectedUserId}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

import React, { useEffect, useState } from 'react';
import { searchUsers, getSuggestions } from '../../services/searchService';
import AdminLayout from '../../components/AdminLayout';
import { Input } from 'antd';
import { Button } from 'antd';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = ['ADMIN', 'GUIDE', 'TRAVELER'];
const languages = ['English', 'Sinhala', 'Tamil'];
const cities = ['Colombo', 'Kandy', 'Galle'];
const nationalities = ['Sri Lankan', 'Indian', 'British'];

const UserManagement = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedNationalities, setSelectedNationalities] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFilterToggle = (filter, value) => {
    const updater = {
      role: setSelectedRoles,
      language: setSelectedLanguages,
      city: setSelectedCities,
      nationality: setSelectedNationalities
    }[filter];

    const current = {
      role: selectedRoles,
      language: selectedLanguages,
      city: selectedCities,
      nationality: selectedNationalities
    }[filter];

    if (current.includes(value)) {
      updater(current.filter(v => v !== value));
    } else {
      updater([...current, value]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchUsers({
        query: query || '*',
        role: selectedRoles,
        language: selectedLanguages,
        city: selectedCities,
        nationality: selectedNationalities,
        page,
        size,
      });
      setUsers(response.results || []);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Search failed', err);
    }
    setLoading(false);
  };

  const handleSuggestionFetch = async (text) => {
    setQuery(text);
    if (text.length >= 2) {
      const res = await getSuggestions(text);
      setSuggestions(res || []);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [page, selectedRoles, selectedCities, selectedLanguages, selectedNationalities]);

  return (
    <AdminLayout currentPage="user-management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => handleSuggestionFetch(e.target.value)}
              className="w-full"
            />
            {suggestions.length > 0 && (
              <motion.ul
                className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow"
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
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Search'}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Role', values: roles, key: 'role' },
            { title: 'Language', values: languages, key: 'language' },
            { title: 'City', values: cities, key: 'city' },
            { title: 'Nationality', values: nationalities, key: 'nationality' }
          ].map(({ title, values, key }) => (
            <div key={key}>
              <p className="font-semibold text-gray-700 mb-2">{title}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => (
                  <Button
                    key={val}
                    variant={
                      (key === 'role' && selectedRoles.includes(val)) ||
                      (key === 'language' && selectedLanguages.includes(val)) ||
                      (key === 'city' && selectedCities.includes(val)) ||
                      (key === 'nationality' && selectedNationalities.includes(val))
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleFilterToggle(key, val)}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Nationality</th>
                <th>City</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="border-t">
                    <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.nationality}</td>
                    <td>{user.expertiseCityRegion}</td>
                    <td>{user.verified ? 'Yes' : 'No'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {Math.ceil(totalCount / size)}
          </span>
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={(page + 1) * size >= totalCount}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

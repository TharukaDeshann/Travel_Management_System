import React, { useEffect, useState } from 'react';
import { searchUsers } from '../services/searchService'; // Adjust the import path as necessary

const UserSearch = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('*');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchUsers({ query, page: 0, size: 10 });
      setUsers(response.results || []);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []); // initial fetch

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔍 User AI Search (Test Page)</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          placeholder="Search by name, role, nationality..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ marginLeft: '8px', padding: '8px' }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {users.length === 0 && !loading ? (
        <p>No results found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <h3>
                {user.first_name} {user.last_name} ({user.role})
              </h3>
              {user.profile_image_url && (
                <img
                  src={user.profile_image_url}
                  alt={`${user.first_name}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                />
              )}
              {JSON.stringify(user)}
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>User ID:</strong> {user.userId}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Address:</strong> {user.address}</p>
              <p><strong>Contact Number:</strong> {user.contactNumber}</p>
              <p><strong>Verified:</strong> {user.isVerified ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Nationality:</strong> {user.nationality}</p>
              <p><strong>Guide About:</strong> {user.guide_about}</p>
              <p><strong>Expertise Region:</strong> {user.expertise_city_region}</p>
              <p><strong>Guide Language:</strong> {user.guide_language}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;

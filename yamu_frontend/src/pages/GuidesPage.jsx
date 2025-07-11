import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GuideModal from '../components/GuideModal';
import { searchUsers } from '../services/searchService';

const GuidesPage = () => {
  const location = useLocation();
  const currentUser = location.state?.currentUser;
  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchGuides = useCallback(async (queryText = '*') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching with query:', queryText);
      
      const response = await searchUsers({
        query: queryText,
        // Try different parameter formats - adjust based on your backend
        role: 'GUIDE', // Try singular instead of array
        // OR try: roles: ['GUIDE']
        // OR try: filter: { role: 'GUIDE' }
        page: 0,
        size: 20
      });
      
      console.log('Search response:', response);
      
      // Filter guides on frontend as backup
      const allUsers = response.results || [];
      const guidesOnly = allUsers.filter(user => 
        user.role === 'GUIDE' || user.role === 'guide'
      );
      
      setGuides(guidesOnly);
      
      if (guidesOnly.length === 0 && allUsers.length > 0) {
        console.warn('No guides found in results. All users:', allUsers);
      }
      
    } catch (error) {
      console.error("AI Search error:", error);
      setError('Failed to search guides. Please try again.');
      setGuides([]);
    }
    
    setLoading(false);
  }, []);

  // Debounced search for real-time typing
  const debouncedSearch = useCallback(
    debounce((query) => {
      fetchGuides(query.trim() || '*');
    }, 300),
    [fetchGuides]
  );

  // Initial load
  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  // Real-time search when user types
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchGuides(searchTerm.trim() || '*');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Discover Tour Guides</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search guides by name, region, or language..."
          value={searchTerm}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            maxWidth: '500px'
          }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px' }}>
          Search
        </button>
      </form>

      {loading && <p>Loading guides...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && guides.length === 0 && (
        <p>No guides found. Try adjusting your search terms.</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {guides.map(guide => (
          <div
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              background: '#fff'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <img
              src={guide.profile_image_url || 'https://via.placeholder.com/300'}
              alt={`${guide.first_name}`}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginTop: 0 }}>
                {guide.first_name} {guide.last_name}
              </h3>
              <p><strong>Expertise:</strong> {guide.expertise_city_region || 'N/A'}</p>
              <p><strong>Language:</strong> {guide.guide_language || 'N/A'}</p>
              <p><strong>Contact:</strong> {guide.contact_number || 'N/A'}</p>
              <p><strong>Verified:</strong> {(guide.is_verified || guide.verified) ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedGuide && (
        <GuideModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default GuidesPage;
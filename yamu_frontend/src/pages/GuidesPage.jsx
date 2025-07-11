import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuideModal from '../components/GuideModal';
import apiClient from '../services/axiosInstance';

const GuidesPage = ({ currentUser }) => {
  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await apiClient.get("/api/users/role/GUIDE");
        setGuides(response.data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(guide => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${guide.firstName} ${guide.lastName}`.toLowerCase().includes(searchLower) ||
      guide.expertiseCityRegion.toLowerCase().includes(searchLower) ||
      guide.language.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Discover Tour Guides</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search guides by name, region, or language..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            maxWidth: '500px'
          }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredGuides.map(guide => (
          <div 
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              ':hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <img 
              src="/src/images/default-profile.png" 
              alt={guide.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginTop: 0 }}>{guide.firstName} {guide.lastName}</h3>
              <p><strong>Expertise:</strong> {guide.expertiseCityRegion}</p>
              <p><strong>Language:</strong> {guide.language}</p>
              <p><strong>Vehicle:</strong> {guide.vehicleAvailability ? 'Available' : 'Not Available'}</p>
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
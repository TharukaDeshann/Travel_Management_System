import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GuideModal from '../components/GuideModal';
import apiClient from '../services/axiosInstance';
import { fetchUsersByRole } from '../services/userService';
import { useUser } from '../context/UserContext';
import { Star } from 'lucide-react';

const GuidesPage = () => {
  const location = useLocation();
  const currentUser = useUser();
  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetchUsersByRole('GUIDE');
        const guidesWithRatings = await Promise.all(
          response.map(async (guide) => {
            try {
              const avgRatingResponse = await apiClient.get(`/api/reviews/guide/${guide.id}/average-rating`);
              const reviewsResponse = await apiClient.get(`/api/reviews/guide/${guide.id}`);
              return {
                ...guide,
                averageRating: avgRatingResponse.data || 0,
                reviewCount: reviewsResponse.data.length || 0,
              };
            } catch (err) {
              console.error(`Error fetching ratings for guide ${guide.id}:`, err);
              return { ...guide, averageRating: 0, reviewCount: 0 };
            }
          })
        );
        setGuides(guidesWithRatings);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(guide => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (guide.firstName + ' ' + guide.lastName).toLowerCase().includes(searchLower) ||
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
              src={guide.profileImageUrl || 'https://via.placeholder.com/300'}
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
              {guide.averageRating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <Star size={16} fill="#FFD700" color="#FFD700" />
                  <span style={{ marginLeft: '5px' }}>
                    {guide.averageRating.toFixed(1)} ({guide.reviewCount} reviews)
                  </span>
                </div>
              )}
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
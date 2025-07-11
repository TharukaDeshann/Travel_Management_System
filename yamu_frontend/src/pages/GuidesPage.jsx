import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GuideModal from '../components/GuideModal';
import apiClient from '../services/axiosInstance';
import { fetchUsersByRole } from '../services/userService';
import { Star } from 'lucide-react';

const GuidesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract state from location
  const currentUser = location.state?.currentUser;
  const prefillDate = location.state?.date || null;
  const prefillPlaces = location.state?.places || null;
  const fromItinerary = location.state?.fromItinerary || false;
  const itineraryId = location.state?.itineraryId;
  const dayIndex = location.state?.dayIndex;
  const travelerId = location.state?.travelerId;

  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const response = await fetchUsersByRole('GUIDE');
        
        const guidesWithRatings = await Promise.all(
          response.map(async (guide) => {
            try {
              const avgRatingResponse = await apiClient.get(
                `/api/reviews/guide/${guide.id}/average-rating`
              );
              const reviewsResponse = await apiClient.get(
                `/api/reviews/guide/${guide.id}`
              );
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
        setError('');
      } catch (error) {
        console.error("Error fetching guides:", error);
        setError('Failed to load guides. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(guide => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (guide.firstName + ' ' + guide.lastName).toLowerCase().includes(searchLower) ||
      (guide.expertiseCityRegion?.toLowerCase().includes(searchLower) || '') ||
      (guide.language?.toLowerCase().includes(searchLower) || '')
    );
  });

  // Handle navigation back to itinerary
  const handleBackToItinerary = () => {
    if (fromItinerary) {
      navigate('/map', {
        state: {
          itineraryId,
          dates: location.state.dates,
          tripTitle: location.state.tripTitle,
          budget: location.state.budget,
          currency: location.state.currency,
          travelerId
        }
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
          Discover Tour Guides
        </h1>
        
        {fromItinerary && (
          <button
            onClick={handleBackToItinerary}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center"
          >
            <span>← Back to Itinerary</span>
          </button>
        )}
      </div>
      
      {fromItinerary && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            Booking for Day {dayIndex + 1} - {prefillDate}
          </h3>
          <p className="text-sm">
            Places: {prefillPlaces?.join(', ') || 'Not specified'}
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search guides by name, region, or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-3 text-gray-500">🔍</span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p>Loading guides...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredGuides.length === 0 ? (
            <div className="text-center py-8">
              <p>No guides found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map(guide => (
                <div 
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={guide.profileImageUrl || '/src/images/default-guide.jpg'}
                      alt={guide.firstName + ' ' + guide.lastName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/src/images/default-guide.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">
                      {guide.firstName} {guide.lastName}
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      {guide.averageRating > 0 ? (
                        <>
                          <Star size={16} fill="#FFD700" color="#FFD700" />
                          <span className="ml-1 text-sm">
                            {guide.averageRating.toFixed(1)} ({guide.reviewCount} reviews)
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews yet</span>
                      )}
                    </div>
                    
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Expertise:</span> {guide.expertiseCityRegion || 'Not specified'}
                    </p>
                    
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Languages:</span> {guide.language || 'Not specified'}
                    </p>
                    
                    <p className="text-sm">
                      <span className="font-semibold">Vehicle:</span> 
                      <span className={guide.vehicleAvailability ? 'text-green-600' : 'text-gray-500'}>
                        {guide.vehicleAvailability ? ' Available' : ' Not available'}
                      </span>
                    </p>
                    
                    <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {selectedGuide && (
        <GuideModal 
          guide={selectedGuide} 
          onClose={() => setSelectedGuide(null)}
          currentUser={currentUser}
          prefillDate={prefillDate}
          prefillPlaces={prefillPlaces}
        />
      )}
    </div>
  );
};

export default GuidesPage;
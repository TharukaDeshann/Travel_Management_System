import React from 'react';

const HotelCard = ({ hotel, onSelect }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    
    return stars;
  };

  const getPriceLevelText = (priceLevel) => {
    const levels = {
      1: { text: 'Budget', color: 'text-green-600', symbol: '$' },
      2: { text: 'Moderate', color: 'text-blue-600', symbol: '$$' },
      3: { text: 'Expensive', color: 'text-orange-600', symbol: '$$$' },
      4: { text: 'Very Expensive', color: 'text-red-600', symbol: '$$$$' }
    };
    return levels[priceLevel] || { text: 'Unknown', color: 'text-gray-600', symbol: '?' };
  };

  const price = getPriceLevelText(hotel.priceLevel);

  return (
    <div className="bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex">
        {/* Hotel Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <img 
            src={hotel.photoUrl || 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image'}
            alt={hotel.name}
            className="w-full h-full object-cover rounded-l-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image';
            }}
          />
        </div>

        {/* Hotel Details */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {hotel.name}
            </h3>
            <div className="text-right">
              <div className={`font-semibold ${price.color}`}>
                {price.symbol}
              </div>
              <div className="text-xs text-gray-500">
                {price.text}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex mr-2">
              {renderStars(hotel.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {hotel.rating?.toFixed(1)} ({hotel.totalRatings} reviews)
            </span>
          </div>

          {/* Address */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            📍 {hotel.address}
          </p>

          {/* Amenities Preview */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.slice(0, 4).map((amenity, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    +{hotel.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hotel Template Info */}
          {hotel.mockDataTemplate && (
            <div className="mb-3">
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {hotel.mockDataTemplate.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}

          {/* Select Button */}
          <button
            onClick={onSelect}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Select This Hotel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;

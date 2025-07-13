import React, { useState, useEffect } from 'react';
import { getHotelAvailability } from '../services/hotelService';

const RoomAvailabilityModal = ({ isOpen, onClose, hotel, checkInDate, checkOutDate, onRoomSelect }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (isOpen && hotel && checkInDate && checkOutDate) {
      fetchAvailability();
    }
  }, [isOpen, hotel, checkInDate, checkOutDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching room availability for hotel:', hotel.id);
      const availabilityData = await getHotelAvailability(hotel.id, checkInDate, checkOutDate);
      setAvailability(availabilityData);
      console.log('🏨 Room availability loaded:', availabilityData);
    } catch (err) {
      console.error('❌ Failed to fetch room availability:', err);
      setError('Failed to load room availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleContinueToBooking = () => {
    if (selectedRoom) {
      onRoomSelect(selectedRoom, availability);
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = (pricePerNight) => {
    return pricePerNight * calculateNights();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{hotel.name}</h2>
              <p className="text-blue-100">📍 {hotel.address}</p>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-300 mr-2">
                  {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-blue-100">{hotel.rating} ({hotel.totalRatings} reviews)</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-3 bg-blue-500 rounded p-2">
            <div className="flex justify-between text-sm">
              <span>Check-in: {checkInDate}</span>
              <span>Check-out: {checkOutDate}</span>
              <span>{calculateNights()} night(s)</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '60vh' }}>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading room availability...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg">❌ {error}</div>
              <button 
                onClick={fetchAvailability}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && availability && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
              
              {availability.availableRooms.map((room, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedRoom === room 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{room.roomType}</h4>
                        {selectedRoom === room && (
                          <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-600">Capacity:</span>
                          <span className="ml-2 font-medium">{room.capacity} guests</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Available:</span>
                          <span className="ml-2 font-medium">{room.availableCount} of {room.totalCount} rooms</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 block mb-1">Room Amenities:</span>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity, idx) => (
                              <span 
                                key={idx}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600">
                        LKR {room.pricePerNight.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">per night</div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        Total: LKR {calculateTotalPrice(room.pricePerNight).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">for {calculateNights()} night(s)</div>
                    </div>
                  </div>

                  {/* Availability Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Availability</span>
                      <span>{room.availableCount}/{room.totalCount} rooms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          room.availableCount > room.totalCount * 0.5 ? 'bg-green-500' :
                          room.availableCount > room.totalCount * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(room.availableCount / room.totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedRoom && (
                <span>
                  Selected: {selectedRoom.roomType} - LKR {calculateTotalPrice(selectedRoom.pricePerNight).toLocaleString()} total
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueToBooking}
                disabled={!selectedRoom}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityModal;

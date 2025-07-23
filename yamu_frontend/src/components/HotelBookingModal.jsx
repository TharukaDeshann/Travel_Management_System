import React, { useState, useEffect } from 'react';
import { createHotelBooking } from '../services/hotelService';

const HotelBookingModal = ({ 
  isOpen, 
  onClose, 
  hotel, 
  selectedRoom, 
  availability, 
  checkInDate, 
  checkOutDate,
  onBookingComplete,
  travelerId,
  dayPlanId // <-- add this
}) => {
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    specialRequests: ''
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [dateData, setDateData] = useState({
    checkInDate: checkInDate,
    checkOutDate: checkOutDate
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Guest Details, 2: Payment, 3: Confirmation

  // Update dates when props change
  useEffect(() => {
    setDateData({
      checkInDate: checkInDate,
      checkOutDate: checkOutDate
    });
  }, [checkInDate, checkOutDate]);

  const calculateNights = () => {
    const checkIn = new Date(dateData.checkInDate);
    const checkOut = new Date(dateData.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const roomTotal = selectedRoom.pricePerNight * nights;
    const taxes = roomTotal * 0.12; // 12% tax
    const serviceFee = roomTotal * 0.05; // 5% service fee
    return {
      roomTotal,
      taxes,
      serviceFee,
      grandTotal: roomTotal + taxes + serviceFee
    };
  };

  const handleInputChange = (field, value, section = 'booking') => {
    if (section === 'booking') {
      setBookingData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'payment') {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'dates') {
      setDateData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateGuestDetails = () => {
    return bookingData.guestName && 
           bookingData.guestEmail && 
           bookingData.guestPhone && 
           bookingData.numberOfGuests > 0 &&
           bookingData.numberOfGuests <= selectedRoom.capacity;
  };

  const validateDates = () => {
    const checkIn = new Date(dateData.checkInDate);
    const checkOut = new Date(dateData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkIn >= today && checkOut > checkIn;
  };

  const validatePaymentDetails = () => {
    return paymentData.cardNumber.length === 16 && 
           paymentData.expiryDate && 
           paymentData.cvv.length === 3 && 
           paymentData.cardHolderName;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateGuestDetails() && validateDates()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validatePaymentDetails()) {
      setCurrentStep(3);
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const handleBooking = async () => {
    if (!validateGuestDetails() || !validatePaymentDetails() || !validateDates()) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const total = calculateTotal();
      
      const bookingRequest = {
        hotelId: hotel.id,
        checkInDate: dateData.checkInDate,
        checkOutDate: dateData.checkOutDate,
        roomType: selectedRoom.roomType,
        numberOfRooms: 1, // Default to 1 room
        numberOfGuests: bookingData.numberOfGuests,
        specialRequests: bookingData.specialRequests,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        pricePerNight: selectedRoom.pricePerNight,
        totalPrice: total.grandTotal,
        paymentMethod: "CREDIT_CARD",
        cardholderName: paymentData.cardHolderName,
        cardLastFour: paymentData.cardNumber.slice(-4),
        paymentAmount: total.grandTotal,
        currencyCode: "LKR",
        dayPlanId: dayPlanId // <-- add this
      };

      console.log('📝 Creating hotel booking:', bookingRequest,travelerId);
      const result = await createHotelBooking(bookingRequest,travelerId);
      
      console.log('✅ Booking successful:', result);
      onBookingComplete(result);
      onClose();
      
    } catch (err) {
      console.error('❌ Booking failed:', err);
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-vertical">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Complete Your Booking</h2>
              <p className="text-blue-100">{hotel.name}</p>
              <p className="text-blue-100 text-sm">{selectedRoom.roomType}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="ml-2">Guest Details</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span className="ml-2">Payment</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <div className={`flex items-center ${currentStep >= 3 ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                  3
                </div>
                <span className="ml-2">Confirm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Guest Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
              
              {/* Date Selection Section */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="text-md font-semibold mb-3 text-blue-800">Check-in & Check-out Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      value={dateData.checkInDate}
                      onChange={(e) => handleInputChange('checkInDate', e.target.value, 'dates')}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      value={dateData.checkOutDate}
                      onChange={(e) => handleInputChange('checkOutDate', e.target.value, 'dates')}
                      min={dateData.checkInDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {!validateDates() && (dateData.checkInDate || dateData.checkOutDate) && (
                  <div className="mt-2 text-sm text-red-600">
                    Please ensure check-in date is today or later, and check-out date is after check-in date.
                  </div>
                )}
                
                <div className="mt-3 text-sm text-gray-600">
                  Duration: {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={bookingData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter guest name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={bookingData.guestEmail}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingData.guestPhone}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests *
                  </label>
                  <select
                    value={bookingData.numberOfGuests}
                    onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(selectedRoom.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or preferences..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Holder Name *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardHolderName}
                    onChange={(e) => handleInputChange('cardHolderName', e.target.value, 'payment')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name on card"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 16) {
                        handleInputChange('cardNumber', value, 'payment');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      }
                      if (value.length <= 5) {
                        handleInputChange('expiryDate', value, 'payment');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        handleInputChange('cvv', value, 'payment');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Hotel:</strong> {hotel.name}
                  </div>
                  <div>
                    <strong>Room:</strong> {selectedRoom.roomType}
                  </div>
                  <div>
                    <strong>Check-in:</strong> {dateData.checkInDate}
                  </div>
                  <div>
                    <strong>Check-out:</strong> {dateData.checkOutDate}
                  </div>
                  <div>
                    <strong>Guests:</strong> {bookingData.numberOfGuests}
                  </div>
                  <div>
                    <strong>Nights:</strong> {calculateNights()}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Room Cost ({calculateNights()} nights × LKR {selectedRoom.pricePerNight.toLocaleString()})</span>
                    <span>LKR {total.roomTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (12%)</span>
                    <span>LKR {total.taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (5%)</span>
                    <span>LKR {total.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>LKR {total.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={currentStep === 1 ? (!validateGuestDetails() || !validateDates()) : !validatePaymentDetails()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay LKR ${total.grandTotal.toLocaleString()}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingModal;

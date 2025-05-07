import React, { useEffect, useState } from "react";
import { FaHotel, FaCar, FaUserCheck, FaFilePdf } from "react-icons/fa";

const FinalizeItinerary = () => {
  const tripData = {
    name: "Explore the Cultural Triangle",
    id: "TRP-2025-0620",
    start: "2025-06-15",
    end: "2025-06-20",
    budget: 100000,
  };

  const [days, setDays] = useState([]);

  useEffect(() => {
    const generateDays = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysArray = [];

      while (startDate <= endDate) {
        daysArray.push({
          date: startDate.toISOString().split("T")[0],
          hotel: {
            name: "Cinnamon Grand",
            location: "Galle Road, Colombo 03",
            checkIn: "14:00",
            checkOut: "12:00",
            rooms: 2,
            roomNumbers: ["102", "105"],
            contact: "+94 112 345 678",
            cost: 12000,
          },
          transport: {
            tripId: "TRANS-2025-0620-01",
            service: "Uber",
            mode: "Private Car (Toyota Prius)",
            pickup: "Katunayake Airport (09:00)",
            dropoff: "Hotel (10:15)",
            cost: "Pending",
          },
          guide: {
            id: "GUIDE-0456",
            name: "Sanjeewa Perera",
            status: "pending",
            languages: ["English", "Sinhala"],
            fee: "Pending",
            meetup: "Hotel Lobby",
          },
          locations: [
            "Unawatuna Thalpe Beach",
            "Galle Fort",
            "Jungle Beach",
          ],
        });
        startDate.setDate(startDate.getDate() + 1);
      }
      return daysArray;
    };

    setDays(generateDays(tripData.start, tripData.end));
  }, [tripData.start, tripData.end]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header Section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">{tripData.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="text-gray-600">Trip ID:</label>
            <p>{tripData.id}</p>
          </div>
          <div>
            <label className="text-gray-600">Dates:</label>
            <p>
              {tripData.start} to {tripData.end}
            </p>
          </div>
          <div>
            <label className="text-gray-600">Total Budget:</label>
            <p>LKR {tripData.budget.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-gray-600">Estimated Cost:</label>
            <p>LKR 87,500</p>
          </div>
        </div>
      </div>

      {/* Daily Itinerary Cards */}
      {days.slice().reverse().map((day, index) => (
        <div key={index} className="mb-6 border rounded-lg">
          <div className="bg-gray-50 p-4">
            <h2 className="font-semibold">
              Day {days.length - index} - {day.date}
            </h2>
          </div>

          <div className="p-4 space-y-6">
            {/* Locations */}
            <div className="border-l-4 border-yellow-200 pl-4">
              <h3 className="font-semibold mb-2">📍 Places to Visit</h3>
              <ul className="list-disc pl-5 space-y-2">
                {day.locations.map((location, locIndex) => (
                  <li key={locIndex} className="text-sm">
                    {location}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hotel Booking */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FaHotel className="mr-2 text-blue-600" />
                  <h3 className="font-semibold">Hotel Booking</h3>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">
                    + Add New Booking
                  </button>
                  <button className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
                    Cancel Booking
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label>Hotel Name:</label> {day.hotel.name}
                </div>
                <div>
                  <label>Location:</label> {day.hotel.location}
                </div>
                <div>
                  <label>Check-in:</label> {day.hotel.checkIn}
                </div>
                <div>
                  <label>Check-out:</label> {day.hotel.checkOut}
                </div>
                <div>
                  <label>Rooms:</label> {day.hotel.rooms}
                </div>
                <div>
                  <label>Room Numbers:</label> {day.hotel.roomNumbers.join(", ")}
                </div>
                <div>
                  <label>Contact:</label> {day.hotel.contact}
                </div>
                <div>
                  <label>Hotel Cost:</label> LKR {day.hotel.cost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Transport */}
            <div className="border-l-4 border-green-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FaCar className="mr-2 text-green-600" />
                  <h3 className="font-semibold">Transportation</h3>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">
                    + Add New Booking
                  </button>
                  <button className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
                    Cancel Booking
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label>Trip ID:</label> {day.transport.tripId}
                </div>
                <div>
                  <label>Service:</label> {day.transport.service}
                </div>
                <div>
                  <label>Mode:</label> {day.transport.mode}
                </div>
                <div>
                  <label>Pickup:</label> {day.transport.pickup}
                </div>
                <div>
                  <label>Dropoff:</label> {day.transport.dropoff}
                </div>
                <div>
                  <label>Transport Fee:</label>{" "}
                  {typeof day.transport.cost === "number" ? (
                    `LKR ${day.transport.cost.toLocaleString()}`
                  ) : (
                    <span className="text-red-600 italic">{day.transport.cost}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Guide */}
            <div className="border-l-4 border-purple-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FaUserCheck className="mr-2 text-purple-600" />
                  <h3 className="font-semibold">Tour Guide</h3>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200">
                    View Guide Profile
                  </button>
                  <button className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
                    Cancel Booking
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label>Guide ID:</label> {day.guide.id}
                </div>
                <div>
                  <label>Name:</label> {day.guide.name}
                </div>
                <div
                  className={
                    day.guide.status === "pending"
                      ? "text-red-600 italic"
                      : "text-green-600"
                  }
                >
                  <label>Status:</label> {day.guide.status}
                </div>
                <div>
                  <label>Languages:</label> {day.guide.languages.join(", ")}
                </div>
                <div>
                  <label>Guide Fee:</label>{" "}
                  <span
                    className={
                      day.guide.status === "pending" ? "text-red-600 italic" : ""
                    }
                  >
                    {day.guide.fee}
                  </span>
                </div>
                <div>
                  <label>Meetup:</label> {day.guide.meetup}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Total Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Cost Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>Total Accommodation Cost</div>
          <div>LKR 48,000</div>
          <div>Total Transportation Cost</div>
          <div>LKR 18,000</div>
          <div>Total Guide Fees</div>
          <div>LKR 12,000</div>
          <div className="font-bold">Remaining Budget</div>
          <div className="font-bold text-green-600">LKR 22,000</div>
        </div>
      </div>

      {/* Notice Section */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Some tour guide bookings are pending confirmation. Final cost may
          vary.
          <br />
          📌 Prices shown are based on current selections from booking APIs
          (Booking.com, Uber, etc.).
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4 justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
          <FaFilePdf className="mr-2" /> Download Final Itinerary as PDF
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Print Itinerary
        </button>
      </div>
    </div>
  );
};

export default FinalizeItinerary;
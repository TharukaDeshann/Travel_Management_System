# Room Availability Test Cases 
# These endpoints show room availability with mock data

## 🏨 Test 1: Get Room Availability for Specific Hotel
GET http://localhost:8080/api/hotels/-42425/availability?checkIn=2025-07-15&checkOut=2025-07-17

---

## 🏨 Test 2: Different Hotel with Different Template  
GET http://localhost:8080/api/hotels/-33874/availability?checkIn=2025-07-20&checkOut=2025-07-22

---

## 🏨 Test 3: Test Mock Data Generation Directly
GET http://localhost:8080/api/hotels/debug/test-mock-data?hotelId=-42425&checkIn=2025-07-15&checkOut=2025-07-17

---

## 🏨 Test 4: Different Date Range (affects pricing)
GET http://localhost:8080/api/hotels/-42425/availability?checkIn=2025-08-01&checkOut=2025-08-05

---

## 📝 Sample Expected Response:
```json
{
    "availableRooms": [
        {
            "roomType": "Deluxe Suite",
            "capacity": 2,
            "pricePerNight": 350.00,
            "availableCount": 3,
            "totalCount": 5,
            "amenities": [
                "Ocean View",
                "King Bed",
                "Mini Bar",
                "Balcony",
                "Room Service"
            ]
        },
        {
            "roomType": "Presidential Suite", 
            "capacity": 4,
            "pricePerNight": 750.00,
            "availableCount": 1,
            "totalCount": 2,
            "amenities": [
                "Panoramic View",
                "Separate Living Room",
                "Jacuzzi",
                "Butler Service",
                "Private Balcony"
            ]
        }
    ],
    "checkInDate": "2025-07-15",
    "checkOutDate": "2025-07-17",
    "hotelId": -42425
}
```

## 🎯 HOW IT WORKS:
1. **Hotel Search** finds hotels by location
2. **User clicks hotel** → Frontend calls availability endpoint
3. **Room Availability** shows specific rooms, prices, availability
4. **User books room** → Creates actual booking

## ✅ YOUR CURRENT FLOW IS PERFECT:
1. Search hotels by route ✅
2. Get 10 hotels with OpenStreetMap ✅  
3. Each hotel has amenities and basic info ✅
4. Frontend can call separate availability API ✅
5. Booking system works with mock data ✅

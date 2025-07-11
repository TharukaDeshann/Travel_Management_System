# Hotel Management System - API Test Collection

Base URL: `http://localhost:8080`

## 1. Search Hotels Along Route

**Endpoint:** `POST /api/hotels/search`

### Test Case 1: Basic Search (Colombo to Kandy)
```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 10000,
    "minRating": 3.0,
    "maxResults": 5
}
```

### Test Case 2: Luxury Hotels Search (Colombo to Galle)
```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 6.0367,
    "endLongitude": 80.2170,
    "radius": 15000,
    "minRating": 4.5,
    "maxResults": 3,
    "priceLevel": "LUXURY"
}
```

### Test Case 3: Budget Hotels Search (Negombo to Ratnapura)
```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 7.2084,
    "startLongitude": 79.8380,
    "endLatitude": 6.6823,
    "endLongitude": 80.4037,
    "radius": 5000,
    "minRating": 3.5,
    "maxResults": 10,
    "priceLevel": "LOW"
}
```

---

## 2. Get Hotel Details

**Endpoint:** `GET /api/hotels/{hotelId}`

### Test Case 1: Valid Hotel ID
```http
GET http://localhost:8080/api/hotels/1
```

### Test Case 2: Another Hotel
```http
GET http://localhost:8080/api/hotels/3
```

### Test Case 3: Non-existent Hotel (Should return 404)
```http
GET http://localhost:8080/api/hotels/999
```

---

## 3. Check Hotel Room Availability

**Endpoint:** `GET /api/hotels/{hotelId}/availability`

### Test Case 1: Check Luxury Resort Availability
```http
GET http://localhost:8080/api/hotels/1/availability?checkIn=2025-08-15&checkOut=2025-08-17
```

### Test Case 2: Check Business Hotel Availability
```http
GET http://localhost:8080/api/hotels/2/availability?checkIn=2025-07-25&checkOut=2025-07-28
```

### Test Case 3: Check Boutique Hotel Availability
```http
GET http://localhost:8080/api/hotels/3/availability?checkIn=2025-09-10&checkOut=2025-09-12
```

### Test Case 4: Invalid Date (Past Date - Should return 400)
```http
GET http://localhost:8080/api/hotels/1/availability?checkIn=2025-01-15&checkOut=2025-01-17
```

---

## 4. Create Hotel Booking

**Endpoint:** `POST /api/hotels/bookings`

### Test Case 1: Luxury Resort Booking
```json
POST http://localhost:8080/api/hotels/bookings?travelerId=1
Content-Type: application/json

{
    "hotelId": 1,
    "checkInDate": "2025-08-15",
    "checkOutDate": "2025-08-17",
    "roomType": "DELUXE",
    "numberOfRooms": 1,
    "numberOfGuests": 2,
    "specialRequests": "Ocean view room preferred, late check-in expected",
    "paymentMethod": "CREDIT_CARD",
    "cardholderName": "John Doe",
    "cardLastFour": "1234",
    "paymentAmount": 700.00,
    "currencyCode": "USD"
}
```

### Test Case 2: Business Hotel Booking
```json
POST http://localhost:8080/api/hotels/bookings?travelerId=2
Content-Type: application/json

{
    "hotelId": 2,
    "checkInDate": "2025-07-25",
    "checkOutDate": "2025-07-28",
    "roomType": "SUITE",
    "numberOfRooms": 1,
    "numberOfGuests": 2,
    "specialRequests": "Business center access required",
    "paymentMethod": "DEBIT_CARD",
    "cardholderName": "Jane Smith",
    "cardLastFour": "5678",
    "paymentAmount": 1200.00,
    "currencyCode": "USD"
}
```

### Test Case 3: Family Booking
```json
POST http://localhost:8080/api/hotels/bookings?travelerId=1
Content-Type: application/json

{
    "hotelId": 6,
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-25",
    "roomType": "FAMILY_ROOM",
    "numberOfRooms": 2,
    "numberOfGuests": 5,
    "specialRequests": "Connecting rooms for family with children, cribs needed",
    "paymentMethod": "PAYPAL",
    "cardholderName": "Robert Johnson",
    "cardLastFour": "9876",
    "paymentAmount": 2500.00,
    "currencyCode": "USD"
}
```

### Test Case 4: Invalid Booking (Past Date - Should return 400)
```json
POST http://localhost:8080/api/hotels/bookings?travelerId=1
Content-Type: application/json

{
    "hotelId": 1,
    "checkInDate": "2025-01-15",
    "checkOutDate": "2025-01-17",
    "roomType": "DELUXE",
    "numberOfRooms": 1,
    "numberOfGuests": 2,
    "paymentMethod": "CREDIT_CARD",
    "cardholderName": "John Doe",
    "cardLastFour": "1234",
    "paymentAmount": 700.00,
    "currencyCode": "USD"
}
```

---

## 5. Get Traveler Bookings

**Endpoint:** `GET /api/hotels/bookings/traveler/{travelerId}`

### Test Case 1: Get All Bookings for Traveler 1
```http
GET http://localhost:8080/api/hotels/bookings/traveler/1
```

### Test Case 2: Get All Bookings for Traveler 2
```http
GET http://localhost:8080/api/hotels/bookings/traveler/2
```

### Test Case 3: Non-existent Traveler (Should return 400)
```http
GET http://localhost:8080/api/hotels/bookings/traveler/999
```

---

## 6. Get Booking Details by Reference

**Endpoint:** `GET /api/hotels/bookings/{bookingReference}`

### Test Case 1: Valid Booking Reference (Use reference from previous booking)
```http
GET http://localhost:8080/api/hotels/bookings/HTL1720789123456
```

### Test Case 2: Non-existent Booking Reference (Should return 404)
```http
GET http://localhost:8080/api/hotels/bookings/HTL9999999999999
```

---

## 7. Cancel Booking

**Endpoint:** `PUT /api/hotels/bookings/{bookingReference}/cancel`

### Test Case 1: Valid Cancellation
```http
PUT http://localhost:8080/api/hotels/bookings/HTL1720789123456/cancel?travelerId=1
```

### Test Case 2: Unauthorized Cancellation (Wrong Traveler - Should return 400)
```http
PUT http://localhost:8080/api/hotels/bookings/HTL1720789123456/cancel?travelerId=999
```

---

## 8. Test Mock Data

**Endpoint:** `GET /api/hotels/mock-data-test/{hotelId}`

### Test Case 1: Test Luxury Resort Mock Data
```http
GET http://localhost:8080/api/hotels/mock-data-test/1
```

### Test Case 2: Test Business Hotel Mock Data
```http
GET http://localhost:8080/api/hotels/mock-data-test/2
```

### Test Case 3: Test Boutique Hotel Mock Data
```http
GET http://localhost:8080/api/hotels/mock-data-test/3
```

---

## CURL Commands for Command Line Testing

### 1. Search Hotels
```bash
curl -X POST http://localhost:8080/api/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 10000,
    "minRating": 3.0,
    "maxResults": 5
  }'
```

### 2. Get Hotel Details
```bash
curl -X GET http://localhost:8080/api/hotels/1
```

### 3. Check Availability
```bash
curl -X GET "http://localhost:8080/api/hotels/1/availability?checkIn=2025-08-15&checkOut=2025-08-17"
```

### 4. Create Booking
```bash
curl -X POST "http://localhost:8080/api/hotels/bookings?travelerId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": 1,
    "checkInDate": "2025-08-15",
    "checkOutDate": "2025-08-17",
    "roomType": "DELUXE",
    "numberOfRooms": 1,
    "numberOfGuests": 2,
    "paymentMethod": "CREDIT_CARD",
    "cardholderName": "John Doe",
    "cardLastFour": "1234",
    "paymentAmount": 700.00,
    "currencyCode": "USD"
  }'
```

### 5. Get Traveler Bookings
```bash
curl -X GET http://localhost:8080/api/hotels/bookings/traveler/1
```

---

## Expected Response Examples

### Successful Hotel Search Response:
```json
[
  {
    "id": 1,
    "name": "Grand Colombo Hotel",
    "address": "123 Galle Road, Colombo 03, Sri Lanka",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "rating": 4.5,
    "totalRatings": 1250,
    "priceLevel": 4,
    "googlePlaceId": "GOOGLE_PLACE_ID_001",
    "phoneNumber": "+94 11 234 5678",
    "websiteUrl": "https://grandcolombo.com",
    "photoUrl": "https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image",
    "mockDataTemplate": "LUXURY_RESORT",
    "amenities": [
      "Swimming Pool",
      "Spa & Wellness Center",
      "Fine Dining Restaurant",
      "Beach Access",
      "Golf Course"
    ]
  }
]
```

### Successful Booking Response:
```json
{
  "id": 1,
  "bookingReference": "HTL1720789123456",
  "hotel": { /* hotel details */ },
  "checkInDate": "2025-08-15",
  "checkOutDate": "2025-08-17",
  "roomType": "DELUXE",
  "numberOfRooms": 1,
  "numberOfGuests": 2,
  "totalPrice": 700.00,
  "bookingStatus": "CONFIRMED",
  "paymentMethod": "CREDIT_CARD",
  "cardLastFour": "1234",
  "paymentStatus": "COMPLETED",
  "transactionId": "TXN12345678"
}
```

---

## Testing Notes:

1. **Prerequisites**: Make sure the Spring Boot application is running and the database is seeded with initial hotel data.

2. **Traveler IDs**: You'll need valid traveler IDs in your database. The seeder should create some test travelers.

3. **Date Formats**: All dates should be in ISO format (YYYY-MM-DD).

4. **Error Responses**: The API returns appropriate HTTP status codes:
   - 200: Success
   - 201: Created (for bookings)
   - 400: Bad Request (validation errors)
   - 404: Not Found
   - 500: Internal Server Error

5. **Booking References**: After creating a booking, use the returned `bookingReference` for subsequent operations.

6. **Mock Data**: The system generates different room types and pricing based on the hotel's mock data template.

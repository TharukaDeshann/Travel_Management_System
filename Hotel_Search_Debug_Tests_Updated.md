# Hotel Search Debug Test Cases
# Updated with improved Google Places API integration

## 🧪 Test 1: Check All Database Hotels
GET http://localhost:8080/api/hotels/debug/all-hotels

---

## 🧪 Test 2: Test Database Search (Colombo area)
GET http://localhost:8080/api/hotels/debug/database-search?latitude=6.9271&longitude=79.8612&radiusKm=10&minRating=3.0

---

## 🧪 Test 3: Test Google Places API Directly (Colombo)
GET http://localhost:8080/api/hotels/debug/google-places-test?latitude=6.9271&longitude=79.8612&radius=2000

---

## 🧪 Test 4: Test Google Places API (Kandy)
GET http://localhost:8080/api/hotels/debug/google-places-test?latitude=7.2906&longitude=80.6337&radius=2000

---

## 🧪 Test 5: Test Google Places API (Galle)  
GET http://localhost:8080/api/hotels/debug/google-places-test?latitude=6.0329&longitude=80.2168&radius=2000

---

## 🏨 Test 6: Full Hotel Search (Colombo to Kandy route)
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 3000,
    "minRating": 2.0,
    "maxResults": 10
}

---

## 🏨 Test 7: Full Hotel Search (Lower rating threshold)
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 2000,
    "minRating": 1.0,
    "maxResults": 15
}

---

## 🏨 Test 8: Hotel Search in Tourist Area (Bentota)
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.4260,
    "startLongitude": 79.9956,
    "endLatitude": 6.4360,
    "endLongitude": 80.0056,
    "radius": 1500,
    "minRating": 1.0,
    "maxResults": 10
}

---

## 📋 DEBUGGING CHECKLIST:

1. **Check Database Hotels**: Test 1 should show your 10 seeded hotels
2. **Check Database Search**: Test 2 should find hotels within 10km of Colombo
3. **Check Google API**: Tests 3-5 should return Google Places API results
4. **Check Full Integration**: Tests 6-8 should combine database + Google results

## 🔧 TROUBLESHOOTING:

### If Test 1 returns 0 hotels:
- Database seeding didn't work
- Check application startup logs

### If Test 2 returns 0 hotels:
- Radius too small or coordinates wrong
- Check hotel coordinates in database

### If Tests 3-5 return 0 hotels:
- Google Places API key issue
- API quota exceeded
- Network/firewall issues

### If Tests 6-8 return 0 hotels:
- Combination of above issues
- Check logs for specific error messages

## 📍 COORDINATES REFERENCE:
- Colombo: 6.9271, 79.8612
- Kandy: 7.2906, 80.6337
- Galle: 6.0329, 80.2168
- Bentota: 6.4260, 79.9956 (Tourist area with many hotels)

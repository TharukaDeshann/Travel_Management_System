# Hotel Search Debug Test Cases - OpenStreetMap Edition
# Updated to use FREE OpenStreetMap API instead of Google Places

## 🧪 Test 1: Check All Database Hotels
GET http://localhost:8080/api/hotels/debug/all-hotels

---

## 🧪 Test 2: Test Database Search (Colombo area)
GET http://localhost:8080/api/hotels/debug/database-search?latitude=6.9271&longitude=79.8612&radiusKm=10&minRating=3.0

---

## 🗺️ Test 3: Test OpenStreetMap API (Colombo)
GET http://localhost:8080/api/hotels/debug/osm-hotels-test?latitude=6.9271&longitude=79.8612&radius=2000

---

## 🗺️ Test 4: Test OpenStreetMap API (Kandy)
GET http://localhost:8080/api/hotels/debug/osm-hotels-test?latitude=7.2906&longitude=80.6337&radius=3000

---

## 🗺️ Test 5: Test OpenStreetMap API (Galle)  
GET http://localhost:8080/api/hotels/debug/osm-hotels-test?latitude=6.0329&longitude=80.2168&radius=2000

---

## 🗺️ Test 6: Test OpenStreetMap API (Negombo - Tourist Area)  
GET http://localhost:8080/api/hotels/debug/osm-hotels-test?latitude=7.2084&longitude=79.8380&radius=3000

---

## 🏨 Test 7: Full Hotel Search (Colombo to Kandy route)
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

## 🏨 Test 8: Full Hotel Search (Lower rating threshold)
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

## 🏨 Test 9: Hotel Search in Beach Area (Bentota to Hikkaduwa)
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.4260,
    "startLongitude": 79.9956,
    "endLatitude": 6.1411,
    "endLongitude": 80.1040,
    "radius": 2000,
    "minRating": 1.0,
    "maxResults": 10
}

---

## 📋 DEBUGGING CHECKLIST:

1. **Check Database Hotels**: Test 1 should show your 10 seeded hotels
2. **Check Database Search**: Test 2 should find hotels within 10km of Colombo
3. **Check OpenStreetMap API**: Tests 3-6 should return OSM hotel data
4. **Check Full Integration**: Tests 7-9 should combine database + OSM results

## 🔧 TROUBLESHOOTING:

### If Test 1 returns 0 hotels:
- Database seeding didn't work
- Check application startup logs

### If Test 2 returns 0 hotels:
- Radius too small or coordinates wrong
- Check hotel coordinates in database

### If Tests 3-6 return 0 hotels:
- OpenStreetMap API timeout or network issues
- OSM data might be sparse in that area

### If Tests 7-9 return 0 hotels:
- Combination of above issues
- Check logs for specific error messages

## ✅ ADVANTAGES OF OPENSTREETMAP:

1. **🆓 Completely FREE** - No API key required
2. **🌍 Global Coverage** - Good data for Sri Lanka
3. **🔓 No Restrictions** - No quotas or billing
4. **📊 Community Data** - Constantly updated by volunteers
5. **🚫 No REQUEST_DENIED errors**

## 📍 TEST COORDINATES:
- **Colombo**: 6.9271, 79.8612 (Commercial center)
- **Kandy**: 7.2906, 80.6337 (Tourist city)
- **Galle**: 6.0329, 80.2168 (Historic fort city)
- **Negombo**: 7.2084, 79.8380 (Beach resort area)
- **Bentota**: 6.4260, 79.9956 (Beach hotels)
- **Hikkaduwa**: 6.1411, 80.1040 (Surfing/beach area)

## 🗺️ OPENSTREETMAP DATA TYPES:
The API searches for:
- `tourism=hotel` (Main hotels)
- `tourism=motel` (Motels)
- `tourism=guest_house` (Guest houses)
- `tourism=hostel` (Budget hostels)

## 🧪 START TESTING:
1. **Run Test 3** first to check if OSM API works
2. **Check logs** for detailed OSM API responses
3. **If working**, proceed with full integration tests 7-9

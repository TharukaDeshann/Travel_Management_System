# Hotel Search Debugging - Test Cases

## Problem Diagnosis

Based on your issue where POST search returns empty array, here are step-by-step debugging tests:

## 1. Check Database Hotels First

**Test:** Verify if hotels exist in database
```http
GET http://localhost:8080/api/hotels/debug/database-hotels
```

**Expected Result:** Should return 10 seeded hotels from Sri Lanka

---

## 2. Test Individual Hotel Details

**Test:** Get specific hotel by ID
```http
GET http://localhost:8080/api/hotels/1
```

**Expected Result:** Should return Grand Colombo Hotel details

---

## 3. Test Hotel Search with Debugging

**Test:** Search hotels with logging enabled
```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 50000,
    "minRating": 3.0,
    "maxResults": 10
}
```

**Note:** Increased radius to 50km to ensure we catch database hotels

---

## 4. Test Google Places API Integration

**Test:** Check if Google Places API is being called
```http
GET http://localhost:8080/api/hotels/test-google-places?startLat=6.9271&startLng=79.8612&endLat=7.2906&endLng=80.6337
```

---

## 5. Test Simpler Search (Same City)

**Test:** Search within same city (Colombo area)
```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 6.9371,
    "endLongitude": 79.8712,
    "radius": 10000,
    "minRating": 3.0,
    "maxResults": 5
}
```

---

## Debugging Commands (Check Application Logs)

When running these tests, check the application logs for these messages:

### Expected Log Messages:
```
INFO  - Searching hotels along route from (6.9271, 79.8612) to (7.2906, 80.6337)
INFO  - Found X hotels in database
INFO  - Need more hotels, calling Google Places API...
INFO  - Google Places API returned X hotels
INFO  - Total hotels found: X
```

### If You See Empty Results:

1. **Check Database Connection:**
   - Verify application.properties database settings
   - Check if database tables are created
   - Verify hotel data was seeded

2. **Check Query Issues:**
   - The repository query might have issues with distance calculation
   - Radius conversion might be wrong

3. **Check Data Issues:**
   - Hotel coordinates might be incorrect
   - Rating filters might be too strict

---

## Database Query Debugging

If database search is failing, try these direct SQL queries in your database:

```sql
-- Check if hotels exist
SELECT COUNT(*) FROM hotels;

-- Check specific hotels
SELECT id, name, latitude, longitude, rating FROM hotels LIMIT 5;

-- Test distance calculation manually
SELECT *, 
       (6371 * acos(cos(radians(6.9271)) * cos(radians(latitude)) * 
       cos(radians(longitude) - radians(79.8612)) + 
       sin(radians(6.9271)) * sin(radians(latitude)))) AS distance
FROM hotels
HAVING distance <= 50
ORDER BY distance;
```

---

## Common Issues & Solutions

### Issue 1: Empty Database
**Solution:** Run the application to trigger hotel data seeding

### Issue 2: Query Parameter Issues
**Solution:** Check if request body validation is passing

### Issue 3: Google Places API Not Working
**Solution:** 
- Set environment variable: `GOOGLE_PLACES_API_KEY=your_key`
- Or the API will gracefully fallback to database-only search

### Issue 4: Distance Calculation Issues
**Solution:** The repository query might need adjustment for your specific database

---

## Quick Fix Test

Try this minimal search request:

```json
POST http://localhost:8080/api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9,
    "startLongitude": 79.8,
    "endLatitude": 7.0,
    "endLongitude": 80.0,
    "maxResults": 5
}
```

This uses minimal required fields and should return database hotels if they exist.

# Google Places API Integration - Hotel Search Implementation

## Overview
The `GooglePlacesService` provides comprehensive hotel search functionality along travel routes using Google Places API.

## Key Features Implemented

### 🎯 **Route-Based Hotel Search**
- **Multi-Point Search**: Calculates search points every ~50km along the route
- **Intelligent Coverage**: Ensures hotels are found along the entire journey, not just start/end
- **Duplicate Filtering**: Removes duplicate hotels based on Google Place ID
- **Rating-Based Filtering**: Filters hotels by minimum rating requirements

### 🔍 **Search Algorithm**
1. **Route Analysis**: Calculates total distance and determines optimal search points
2. **Progressive Search**: Searches for hotels at each calculated point along the route
3. **Data Aggregation**: Combines results from all search points
4. **Smart Filtering**: Removes duplicates and applies rating/distance filters
5. **Result Optimization**: Sorts by rating and limits results as requested

### 🏨 **Hotel Data Mapping**
Maps Google Places API response to internal Hotel entity:
- **Basic Info**: Name, address, location coordinates
- **Ratings**: Google rating and total review count
- **Pricing**: Price level indicator (1-4 scale)
- **Photos**: Photo references for hotel images
- **Metadata**: Google Place ID for future reference

## Implementation Details

### **Core Method: `searchHotelsAlongRoute()`**
```java
public List<Hotel> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest)
```

**Flow:**
1. **Validation**: Checks if Google Places API key is configured
2. **Route Calculation**: Determines search points along the route
3. **API Calls**: Performs nearby search at each point
4. **Data Processing**: Converts Google Places data to Hotel entities
5. **Filtering & Sorting**: Applies filters and sorts by rating
6. **Result Limiting**: Returns top results based on maxResults parameter

### **Route Point Calculation**
```java
private List<SearchPoint> calculateSearchPointsAlongRoute(...)
```
- Calculates intermediate points every 50km along the route
- Ensures comprehensive coverage for long-distance travel
- Includes start point, intermediate points, and end point

### **Google Places API Integration**
```java
private List<Hotel> searchHotelsNearby(...)
```
- Uses Google Places Nearby Search API
- Searches for `type=lodging` establishments
- Applies radius and rating filters
- Handles API errors gracefully

### **Distance Calculation**
```java
private double calculateDistance(...)
```
- Uses Haversine formula for accurate distance calculation
- Calculates great-circle distance between coordinates
- Returns distance in kilometers

## API Configuration

### **Required Properties** (application.properties)
```properties
# Google Places API configuration
google.places.api.key=${GOOGLE_PLACES_API_KEY}
google.places.api.url=https://maps.googleapis.com/maps/api/place
```

### **Environment Variables**
```bash
export GOOGLE_PLACES_API_KEY="your_google_places_api_key_here"
```

## Data Flow

### **Request Flow:**
```
Frontend Request → HotelController → HotelService → GooglePlacesService → Google Places API
```

### **Response Flow:**
```
Google Places API → GooglePlacesService → HotelService (+ Mock Data) → HotelController → Frontend
```

### **Data Integration:**
1. **Database Hotels**: First searches existing database hotels
2. **Google Places Hotels**: If insufficient results, fetches from Google Places API
3. **Transient Processing**: Google Places hotels are processed as transient data (not saved to database)
4. **Mock Data Assignment**: Assigns random mock infrastructure data to Google Places hotels
5. **Combined Results**: Returns combined database + Google Places results

## API Endpoints

### **Hotel Search with Google Places Integration**
```http
POST /api/hotels/search
Content-Type: application/json

{
    "startLatitude": 6.9271,
    "startLongitude": 79.8612,
    "endLatitude": 7.2906,
    "endLongitude": 80.6337,
    "radius": 10000,
    "minRating": 3.0,
    "maxResults": 10
}
```

### **Test Google Places API**
```http
GET /api/hotels/test-google-places?startLat=6.9271&startLng=79.8612&endLat=7.2906&endLng=80.6337
```

## Sample Test Cases

### **1. Colombo to Kandy Route**
```bash
curl -X GET "http://localhost:8080/api/hotels/test-google-places?startLat=6.9271&startLng=79.8612&endLat=7.2906&endLng=80.6337"
```

### **2. Colombo to Galle Route**
```bash
curl -X GET "http://localhost:8080/api/hotels/test-google-places?startLat=6.9271&startLng=79.8612&endLat=6.0367&endLng=80.2170"
```

### **3. Long Distance Route (Jaffna to Galle)**
```bash
curl -X GET "http://localhost:8080/api/hotels/test-google-places?startLat=9.6615&startLng=80.0255&endLat=6.0367&endLng=80.2170"
```

## Error Handling

### **API Key Not Configured**
- Returns empty list with warning log
- Falls back to database-only search
- Graceful degradation of service

### **API Rate Limiting**
- Catches and logs API errors
- Returns partial results if some API calls succeed
- Continues processing with available data

### **Network Issues**
- Handles connection timeouts
- Logs errors for debugging
- Returns database results as fallback

## Performance Optimizations

### **Implemented:**
- ✅ Efficient route point calculation
- ✅ Duplicate removal by Google Place ID
- ✅ Early termination when maxResults reached
- ✅ Minimal API calls based on route distance

### **Future Optimizations:**
- 🔄 Result caching for frequently searched routes
- 🔄 Batch API calls for better performance
- 🔄 Integration with Google Directions API for more accurate routes
- 🔄 Database caching of frequently accessed Google Places data

## Setup Instructions

### **1. Get Google Places API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Places API
4. Create API credentials (API Key)
5. Restrict API key to Places API only

### **2. Configure Application**
```properties
# Add to application.properties
google.places.api.key=YOUR_API_KEY_HERE
```

### **3. Set Environment Variable**
```bash
# Linux/Mac
export GOOGLE_PLACES_API_KEY="your_api_key_here"

# Windows
set GOOGLE_PLACES_API_KEY=your_api_key_here
```

### **4. Test Integration**
```bash
# Test the integration
curl -X GET "http://localhost:8080/api/hotels/test-google-places?startLat=6.9271&startLng=79.8612&endLat=7.2906&endLng=80.6337"
```

## Integration Benefits

### **For Your Trip Planning Application:**
1. **Real Hotel Data**: Access to millions of real hotels worldwide
2. **Accurate Locations**: Precise coordinates from Google's database
3. **Current Information**: Up-to-date hotel ratings and reviews
4. **Rich Metadata**: Photos, contact information, and amenities
5. **Global Coverage**: Works for any route worldwide
6. **Scalable Solution**: Handles both short and long-distance routes

### **Combined with Mock Data System:**
- **Real Discovery**: Google Places API finds real hotels
- **Rich Infrastructure**: Mock data provides detailed room/booking information
- **Seamless Experience**: Users get real hotel discovery + complete booking capability
- **No Database Bloat**: Google Places hotels are transient, keeping database clean

The implementation provides a robust foundation for hotel discovery while maintaining the flexibility of your mock data system for booking functionality.

import axios from "axios";

// Search for locations using OpenStreetMap Nominatim API
export const searchLocations = async (query) => {
  
  if (query.length <= 2) return [];
  
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          format: 'json',
          q: query
        },
        headers: {
          'User-Agent': 'YourAppName/1.0'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

// Backend api call to save route details


export const saveRoute = async (routeData) => {
  try {
    const response = await fetch('http://localhost:8080/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save route');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving route:', error);
    throw error;
  }
};

// Calculate haversine distance between two points (used for fallback optimization)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
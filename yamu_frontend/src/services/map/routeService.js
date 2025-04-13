import axios from "axios";
import { calculateDistance } from "./locationService";

// API key should ideally be an environment variable
const API_KEY = "5b3ce3597851110001cf6248a4fb779cca8e41479aadb5d5d341af06";

// Fetch route between multiple locations
export const fetchRoute = async (locations, travelMode) => {
  try {
    const coords = locations.map((loc) => [loc.lon, loc.lat]);
    
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${travelMode}/geojson`,
      { coordinates: coords },
      {
        headers: {
          "Authorization": API_KEY,
          "Content-Type": "application/json",
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching route:", error);
    throw error;
  }
};

// Optimize route order using OpenRouteService API
export const optimizeRoute = async (locations, travelMode) => {
  if (locations.length < 3) {
    throw new Error("Need at least 3 locations to optimize route");
  }
  
  try {
    // Extract the first location as the starting point (and eventually ending point)
    const startLocation = locations[0];
    const endLocation = locations[0]; // Can be changed if you want different start/end points
    
    // Prepare locations for the API (excluding start/end)
    const waypointLocations = locations.slice(1);
    
    // Prepare data for the optimization API
    const requestBody = {
      jobs: waypointLocations.map((loc, index) => ({
        id: index + 1,
        location: [parseFloat(loc.lon), parseFloat(loc.lat)]
      })),
      vehicles: [{
        id: 1,
        profile: travelMode,
        start: [parseFloat(startLocation.lon), parseFloat(startLocation.lat)],
        end: [parseFloat(endLocation.lon), parseFloat(endLocation.lat)]
      }]
    };
    
    // Call the optimization API
    const response = await axios.post(
      "https://api.openrouteservice.org/optimization",
      requestBody,
      {
        headers: {
          "Authorization": "5b3ce3597851110001cf6248a4fb779cca8e41479aadb5d5d341af06",
          "Content-Type": "application/json"
        }
      }
    );
    
    const data = response.data;
    
    if (data.routes && data.routes.length > 0) {
      // Extract the optimized order from the response
      const optimizedOrder = data.routes[0].steps.map(step => step.job || 0);
      
      // Reorder locations based on optimization result
      const optimizedLocations = [startLocation];
      
      optimizedOrder.forEach(jobId => {
        if (jobId !== 0) { // Skip the 'start' and 'end' job IDs
          optimizedLocations.push(waypointLocations[jobId - 1]);
        }
      });
      
      return optimizedLocations;
    }
    
    throw new Error("No optimized routes returned from API");
  } catch (error) {
    console.error("Error optimizing route:", error);
    throw error;
  }
};

// Fallback optimization using nearest neighbor algorithm
export const nearestNeighborOptimization = (locations) => {
  if (locations.length <= 2) return locations;
  
  const start = locations[0];
  const result = [start];
  const remaining = locations.slice(1);
  
  let current = start;
  
  while (remaining.length > 0) {
    // Find the nearest location to the current one
    let nearestIndex = 0;
    let minDistance = calculateDistance(
      current.lat, current.lon,
      remaining[0].lat, remaining[0].lon
    );
    
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.lat, current.lon,
        remaining[i].lat, remaining[i].lon
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add the nearest location to the result
    current = remaining[nearestIndex];
    result.push(current);
    remaining.splice(nearestIndex, 1);
  }
  
  return result;
};
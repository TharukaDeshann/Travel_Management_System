import apiClient from './axiosInstance';

//Service for handling Facebook events

const eventService = {
  /**
   * Fetch Facebook events from the backend
   * @returns {Promise} Promise resolving to Facebook events data
   */
  getFacebookEvents: async () => {
    try {
      console.log('EventService: Fetching Facebook events from backend...');
      
      try {
        // First try using the axios instance
        const response = await apiClient.get('/api/facebook-events');
        console.log('EventService: Response received:', response.data);
        return response.data;
      } catch (axiosError) {
        // If there's a 401 error, try direct fetch which doesn't send credentials/tokens
        if (axiosError.response && axiosError.response.status === 401) {
          console.log('EventService: Axios request failed with 401, trying direct fetch...');
          return await eventService.directFetch();
        }
        throw axiosError;
      }
    } catch (error) {
      console.error('EventService: Error fetching Facebook events:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('EventService: Error response data:', error.response.data);
        console.error('EventService: Error response status:', error.response.status);
        console.error('EventService: Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('EventService: No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('EventService: Error message:', error.message);
      }
      // Generate local mock data as a last resort
      console.log('EventService: All attempts failed, returning local mock data');
      return eventService.generateLocalMockEvents();
    }
  },

  /**
   * Fetch mock events for testing
   * @returns {Promise} Promise resolving to mock events data
   */
  getMockEvents: async () => {
    try {
      console.log('EventService: Fetching mock events...');
      
      try {
        // First try using the axios instance
        const response = await apiClient.get('/api/facebook-events/mock');
        console.log('EventService: Mock response received:', response.data);
        return response.data;
      } catch (axiosError) {
        // If there's a 401 error, try direct fetch which doesn't send credentials/tokens
        if (axiosError.response && axiosError.response.status === 401) {
          console.log('EventService: Axios request for mock failed with 401, trying direct fetch...');
          try {
            const response = await fetch('http://localhost:8080/api/facebook-events/mock');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('EventService: Direct fetch mock response:', data);
            return data;
          } catch (fetchError) {
            console.error('EventService: Direct fetch for mock also failed:', fetchError);
            // Generate local mock data if both attempts fail
            return eventService.generateLocalMockEvents();
          }
        }
        throw axiosError;
      }
    } catch (error) {
      console.error('EventService: Error fetching mock events:', error);
      // Generate local mock data as a last resort
      console.log('EventService: All attempts failed, returning local mock data');
      return eventService.generateLocalMockEvents();
    }
  },

  /**
   * Direct fetch for testing or when Axios requests fail with 401
   */
  directFetch: async () => {
    try {
      console.log('EventService: Performing direct fetch to Facebook events API...');
      const response = await fetch('http://localhost:8080/api/facebook-events');//fetch the events from the backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('EventService: Direct fetch response:', data);
      return data;
    } catch (error) {
      console.error('EventService: Direct fetch error:', error);
      // Generate local mock data if the direct fetch fails
      console.log('EventService: Direct fetch failed, returning local mock data');
      return eventService.generateLocalMockEvents();
    }
  },

  /**
   * Generate mock events locally in the browser
   * This is used as a last resort when all server calls fail
   */
  generateLocalMockEvents: () => {
    console.log('EventService: Generating local mock events');
    
    const now = new Date();
    const mockEvents = [];
    
    // Default images - using direct color values instead of placeholder.com
    const eventImages = [
      'https://dummyimage.com/300x200/f44336/ffffff&text=Sri+Lanka+Event+1',
      'https://dummyimage.com/300x200/2196f3/ffffff&text=Sri+Lanka+Event+2',
      'https://dummyimage.com/300x200/4caf50/ffffff&text=Sri+Lanka+Event+3',
      'https://dummyimage.com/300x200/ff9800/ffffff&text=Sri+Lanka+Event+4',
      'https://dummyimage.com/300x200/9c27b0/ffffff&text=Sri+Lanka+Event+5'
    ];
    
    // Event names related to Sri Lanka
    const eventNames = [
      'Kandy Esala Perahera Festival',
      'Colombo International Music Festival',
      'Nuwara Eliya Flower Exhibition',
      'Galle Literary Festival',
      'Adam\'s Peak Pilgrimage Season'
    ];
    
    // Event descriptions
    const eventDescriptions = [
      'The most famous cultural and religious festival in Sri Lanka featuring traditional dancers and decorated elephants.',
      'International music celebration featuring both local and global artists across multiple venues in Colombo.',
      'Annual flower exhibition showcasing the beautiful flora of Sri Lanka\'s hill country.',
      'Annual literary festival in the historic UNESCO World Heritage city of Galle.',
      'The annual pilgrimage season for the sacred Adam\'s Peak, attracting thousands of pilgrims.'
    ];
    
    for (let i = 0; i < 5; i++) {
      const eventDate = new Date(now);//creates a copy of the current date
      eventDate.setDate(now.getDate() + (i + 1) * 3); // Events every 3 days
      
      mockEvents.push({
        id: `local-mock-${i+1}`,
        name: eventNames[i],
        description: eventDescriptions[i],
        image_url: eventImages[i],
        formatted_date: eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        formatted_time: eventDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }
    
    return mockEvents;
  }
};

export default eventService; 
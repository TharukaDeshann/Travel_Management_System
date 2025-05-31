import React, { useState, useEffect } from 'react';
import eventService from '../services/eventService';
import EventModal from '../components/EventModal';
import '../styles/Modal.css';

const TestFacebookEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('default');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [useMockData, selectedEndpoint]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log(`Fetching events from ${selectedEndpoint} endpoint...`);
      
      let data;
      
      if (useMockData) {
        // Use the service's mock data endpoint
        try {
          // Try using fetch directly to avoid authentication issues
          const response = await fetch('http://localhost:8080/api/facebook-events/mock');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          data = await response.json();
          console.log("Mock data received:", data);
        } catch (error) {
          console.error("Error with direct fetch, trying service:", error);
          data = await eventService.getMockEvents();
        }
      } else {
        switch (selectedEndpoint) {
          case 'debug':
            // Use direct fetch for debug endpoint
            const debugResponse = await fetch('http://localhost:8080/api/facebook-events/debug');
            data = await debugResponse.json();
            break;
          case 'alternative':
            // Use direct fetch for alternative endpoint
            const altResponse = await fetch('http://localhost:8080/api/facebook-events/alternative');
            data = await altResponse.json();
            break;
          default:
            // Use the service's main function which handles fallbacks
            data = await eventService.getFacebookEvents();
        }
      }
      
      console.log("Response received:", data);
      setRawResponse(JSON.stringify(data, null, 2));
      
      if (selectedEndpoint === 'debug') {
        setDebugInfo(data);
        setEvents([]);
        setError(null);
      } else if (Array.isArray(data)) {
        setEvents(data);
        setError(null);
        setDebugInfo(null);
      } else if (data && typeof data === 'object') {
        if (data.error) {
          setError(`API Error: ${data.error}`);
        } else {
          setError("Unexpected response format. See console for details.");
        }
        setEvents([]);
        setDebugInfo(null);
      } else {
        setError("Invalid response format from server");
        setEvents([]);
        setDebugInfo(null);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Failed to fetch events: ${err.message}`);
      setEvents([]);
      setDebugInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const toggleMockData = () => {
    setUseMockData(!useMockData);
    setSelectedEndpoint('default');
  };

  const selectEndpoint = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setUseMockData(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Facebook Events Test Page</h1>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <h2 className="text-lg font-semibold mb-2">API Information</h2>
        <p>Page ID: 708620612326863</p>
        <p>Page Name: EVENT SRI LANKA</p>
        <p>Current API Endpoint: {useMockData 
          ? 'http://localhost:8080/api/facebook-events/mock' 
          : `http://localhost:8080/api/facebook-events${selectedEndpoint === 'default' ? '' : '/' + selectedEndpoint}`}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={toggleMockData}
            className={`px-4 py-2 rounded ${useMockData 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'}`}
          >
            {useMockData ? 'Using Mock Data' : 'Use Mock Data'}
          </button>
          
          <button 
            onClick={() => selectEndpoint('default')}
            className={`px-4 py-2 rounded ${selectedEndpoint === 'default' && !useMockData
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'}`}
          >
            Standard Endpoint
          </button>
          
          <button 
            onClick={() => selectEndpoint('alternative')}
            className={`px-4 py-2 rounded ${selectedEndpoint === 'alternative' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'}`}
          >
            Alternative Endpoint
          </button>
          
          <button 
            onClick={() => selectEndpoint('debug')}
            className={`px-4 py-2 rounded ${selectedEndpoint === 'debug' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'}`}
          >
            Debug API
          </button>
          
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-lg">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && selectedEndpoint !== 'debug' && events.length === 0 && (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-4">
          <p>No events found. Please check your API credentials or the page might not have any events.</p>
        </div>
      )}

      {debugInfo && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-bold">Primary Page Info:</h4>
            <pre className="overflow-auto text-sm mt-2" style={{ maxHeight: '200px' }}>
              {JSON.stringify(debugInfo.primary_page_info, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-bold">Alternative Page Info:</h4>
            <pre className="overflow-auto text-sm mt-2" style={{ maxHeight: '200px' }}>
              {JSON.stringify(debugInfo.alternative_page_info, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-bold">Token Info:</h4>
            <pre className="overflow-auto text-sm mt-2" style={{ maxHeight: '200px' }}>
              {JSON.stringify(debugInfo.token_info, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-bold">Primary Events Response:</h4>
            <pre className="overflow-auto text-sm mt-2" style={{ maxHeight: '200px' }}>
              {JSON.stringify(debugInfo.primary_events_basic, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-bold">Alternative Events Response:</h4>
            <pre className="overflow-auto text-sm mt-2" style={{ maxHeight: '200px' }}>
              {JSON.stringify(debugInfo.alternative_events_basic, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {rawResponse && selectedEndpoint !== 'debug' && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Raw API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm" style={{ maxHeight: '200px' }}>
            {rawResponse}
          </pre>
        </div>
      )}

      {selectedEndpoint !== 'debug' && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, index) => (
            <div 
              key={event.id || index} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.image_url || "https://dummyimage.com/300x200/cccccc/666666&text=No+Image"} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://dummyimage.com/300x200/cccccc/666666&text=Error+Loading+Image";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{event.name || "Unnamed Event"}</h3>
                {event.formatted_date && (
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {event.formatted_date}
                  </p>
                )}
                {event.formatted_time && (
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {event.formatted_time}
                  </p>
                )}
                {event.description && (
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {event.description.substring(0, 100)}
                    {event.description.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
        <ol className="list-decimal pl-5">
          <li className="mb-2">Make sure your Spring Boot backend is running on port 8080</li>
          <li className="mb-2">Check that the Facebook access token is valid and not expired</li>
          <li className="mb-2">Verify that the page ID is correct</li>
          <li className="mb-2">Check browser console for CORS errors</li>
          <li className="mb-2">Make sure the Facebook page has public events</li>
          <li className="mb-2">Try the Alternative Endpoint if standard endpoint returns no events</li>
          <li className="mb-2">Use the Debug API to see detailed information about the token and API responses</li>
          <li className="mb-2">Try using the mock data option above to test the UI</li>
        </ol>
      </div>
    </div>
  );
};

export default TestFacebookEvents; 
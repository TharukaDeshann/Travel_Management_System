import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Routing({ from, to }) {
  const map = useMap();
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!from || !to) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          setRoute(data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
          
          // Fit the map to the route bounds
          const bounds = L.latLngBounds(
            data.routes[0].geometry.coordinates.map(coord => L.latLng(coord[1], coord[0]))
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [from, to, map]);

  return route ? (
    <Polyline 
      positions={route} 
      color="blue" 
      weight={4} 
      opacity={0.7}
    />
  ) : null;
}

const DirectionsModal = ({ place, userLocation, onClose }) => {
  const [directions, setDirections] = useState(null);

  return (
    <div style={styles.mapModalOverlay}>
      <div style={styles.mapModalContainer}>
        <div style={styles.mapModalHeader}>
          <h2>
            {userLocation ? "Directions" : "Location"} 
            {` to ${place.name}`}
          </h2>
          <button 
            style={styles.closeMapModal}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div style={styles.mapContainer}>
          <MapContainer 
            center={[place.latitude, place.longitude]} 
            zoom={userLocation ? 10 : 13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lon]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            
            <Marker position={[place.latitude, place.longitude]}>
              <Popup>{place.name}</Popup>
            </Marker>
            
            {userLocation && (
              <Routing 
                from={{ lat: userLocation.lat, lon: userLocation.lon }} 
                to={{ lat: place.latitude, lon: place.longitude }} 
              />
            )}
          </MapContainer>
        </div>
        
        <div style={styles.mapModalActions}>
          <button 
            style={styles.actionButton}
            onClick={() => {
              // Open in Google Maps
              if (userLocation) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${place.latitude},${place.longitude}&travelmode=driving`,
                  '_blank'
                );
              } else {
                window.open(
                  `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
                  '_blank'
                );
              }
            }}
          >
            Open in Google Maps
          </button>
          
          <button 
            style={styles.actionButtonSecondary}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  mapModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  mapModalContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mapModalHeader: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    height: '500px',
    width: '100%',
  },
  mapModalActions: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dee2e6',
  },
  closeMapModal: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6c757d',
    ':hover': {
      color: '#495057',
    },
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#532321',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#3a1817',
    },
  },
  actionButtonSecondary: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#4b5563',
    },
  },
};

export default DirectionsModal;
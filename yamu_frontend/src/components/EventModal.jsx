import React from 'react';
import '../styles/Modal.css';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{event.name}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.name} 
              className="event-image"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }} 
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x200?text=Event";
              }}
            />
          )}
          
          <div className="event-details">
            <div className="event-info">
              <p><strong>Date:</strong> {event.formatted_date}</p>
              {event.formatted_time && <p><strong>Time:</strong> {event.formatted_time}</p>}
              
              {event.description && (
                <div className="event-description">
                  <h3>Description</h3>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {event.id && (
            <div className="event-actions">
              <a 
                href={`https://www.facebook.com/events/${event.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fb-button"
              >
                View on Facebook
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal; 
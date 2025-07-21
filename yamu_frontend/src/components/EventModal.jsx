import React from 'react';
import { X } from 'lucide-react';
import '../styles/EventModal.css';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    return `${dateStr} at ${timeStr}`;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="event-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-modal-content">
        <div className="event-modal-header">
          <h2 className="event-modal-title">{event.name}</h2>
          <button className="event-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="event-modal-body">
          <div className="event-image-container">
            <img 
              src={event.image_url} 
              alt={event.name} 
              className="event-modal-image"
              onError={(e) => {
                e.target.src = "/src/images/default-event.jpg";
              }}
            />
          </div>
          
          <div className="event-details">
            <div className="event-datetime">
              <h3>Date & Time</h3>
              <p>{formatDateTime(event.formatted_date, event.formatted_time)}</p>
            </div>
            
            <div className="event-description">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>
            
           
          </div>
        </div>
        
        <div className="event-modal-footer">
          <button className="event-modal-button primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

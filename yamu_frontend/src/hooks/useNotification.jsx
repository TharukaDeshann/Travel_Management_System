import { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { keyframes } from 'styled-components';

// Notification Container Styles
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
`;

const NotificationItem = styled.div`
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  animation: ${props => props.isClosing ? slideOut : slideIn} 0.3s ease-in-out;
  pointer-events: all;
  
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return '#e8f5e9';
      case 'error':
        return '#ffebee';
      case 'warning':
        return '#fff8e1';
      default:
        return '#e3f2fd';
    }
  }};
  
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success':
        return '#388e3c';
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#f57c00';
      default:
        return '#1976d2';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    switch (props.type) {
      case 'success':
        return '#2e7d32';
      case 'error':
        return '#c62828';
      case 'warning':
        return '#ef6c00';
      default:
        return '#1565c0';
    }
  }};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #757575;
  font-size: 18px;
  line-height: 1;
  margin-left: 8px;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

// Notification component
const Notification = ({ id, title, message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match the animation duration
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto close after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <NotificationItem type={type} isClosing={isClosing}>
      <NotificationContent>
        <NotificationTitle type={type}>{title}</NotificationTitle>
        <NotificationMessage>{message}</NotificationMessage>
      </NotificationContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </NotificationItem>
  );
};

// Global reference for notification root
let notificationRoot = null;

// Main notification hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const notificationRootRef = useRef(null);
  
  // Initialize notification root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      let containerEl = document.getElementById('notification-root');
      
      if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.id = 'notification-root';
        document.body.appendChild(containerEl);
        notificationRoot = createRoot(containerEl);
      }
      
      notificationRootRef.current = containerEl;
      
      return () => {
        // Cleanup on unmount
        if (containerEl && containerEl.parentNode) {
          containerEl.parentNode.removeChild(containerEl);
        }
      };
    }
  }, []);
  
  // Remove notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Create a new notification
  const createNotification = useCallback((type, title, message) => {
    console.log(`Creating ${type} notification: ${title} - ${message}`); // Debug log
    const id = Date.now().toString();
    
    const newNotification = {
      id,
      type,
      title,
      message,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);
  
  // Render notifications
  useEffect(() => {
    if (notificationRoot && notifications.length >= 0) {
      console.log(`Rendering ${notifications.length} notifications`); // Debug log
      
      notificationRoot.render(
        <NotificationContainer>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              id={notification.id}
              title={notification.title}
              message={notification.message}
              type={notification.type}
              onClose={removeNotification}
            />
          ))}
        </NotificationContainer>
      );
    }
  }, [notifications, removeNotification]);
  
  // Helper functions
  const showSuccess = useCallback((message, title = 'Success') => {
    console.log('Showing success notification:', message); // Debug log
    return createNotification('success', title, message);
  }, [createNotification]);
  
  const showError = useCallback((message, title = 'Error') => {
    console.log('Showing error notification:', message); // Debug log
    return createNotification('error', title, message);
  }, [createNotification]);
  
  const showWarning = useCallback((message, title = 'Warning') => {
    return createNotification('warning', title, message);
  }, [createNotification]);
  
  const showInfo = useCallback((message, title = 'Information') => {
    return createNotification('info', title, message);
  }, [createNotification]);
  
  return {
    showSuccess,
    showError,
    showWarning, 
    showInfo,
    removeNotification
  };
};

export default useNotification;
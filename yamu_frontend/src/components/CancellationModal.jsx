import React, { useState } from 'react';
import Modal from 'react-modal';
import apiClient from '../services/axiosInstance';
import { fetchLoggedInUser } from '../services/authService';

const CancellationModal = ({ 
  isOpen, 
  onRequestClose, 
  onConfirm, 
  isGuide 
}) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');

  const guideReasons = [
    'Emergency or personal issue',
    'Health-related reason',
    'Weather or unforeseen circumstances',
    'Travel restrictions',
    'Miscommunication with traveler',
    'Other'
  ];

  const travelerReasons = [
    'Change of travel plans',
    'Found another guide',
    'Cost-related',
    'Communication issues',
    'Other'
  ];

  const reasons = isGuide ? guideReasons : travelerReasons;

  const handleConfirm = async () => {
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    if (isGuide && !acknowledged) {
      setError('Please acknowledge the cancellation policy');
      return;
    }

    const fullReason = reason === 'Other' ? `Other: ${otherReason}` : reason;

    try {
      const user = await fetchLoggedInUser();
      if (!user || !user.id) {
        setError('User information not available. Please login again.');
        return;
      }

      const response = await apiClient.post(
        '/api/reservations/cancel',
        { reason: fullReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      onConfirm(fullReason);
      onRequestClose();
    } catch (err) {
      console.error('Error canceling reservation:', err);
      setError('Failed to cancel reservation. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Cancellation Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        },
        content: {
          maxWidth: '500px',
          margin: 'auto',
          borderRadius: '8px',
          padding: '20px'
        }
      }}
    >
      <h2 style={{ color: '#532321', marginBottom: '20px' }}>
        {isGuide ? 'Cancel Confirmed Reservation' : 'Cancel Reservation'}
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          {isGuide ? 'Why are you canceling this confirmed reservation?' : 'Reason for cancellation'}
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">Select a reason</option>
          {reasons.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        
        {reason === 'Other' && (
          <textarea
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            placeholder="Please explain..."
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minHeight: '80px'
            }}
          />
        )}
      </div>
      
      {isGuide && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>
              I understand this cancellation may affect my ratings or result in penalties based on platform policy.
            </span>
          </label>
        </div>
      )}
      
      {error && (
        <div style={{ color: '#F44336', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={onRequestClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          style={{
            padding: '8px 16px',
            backgroundColor: '#532321',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Confirm Cancellation
        </button>
      </div>
    </Modal>
  );
};

export default CancellationModal;
import React, { useState } from 'react';
import { Modal, Button, Input, Checkbox, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteUser } from '../../../services/userService';
import { useUser } from '../../../context/UserContext';
import useNotification from '../../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ visible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [hasConfirmedConsequences, setHasConfirmedConsequences] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  const { user} = useUser();

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';
  const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;
  const canProceed = isConfirmationValid && hasConfirmedConsequences && (!showPasswordField || password.length > 0);

  const handleDeleteAccount = async () => {
    if (!canProceed) return;
    
    setIsLoading(true);
    
    try {
      await deleteUser(user.id);
      
      // Show success message
      showSuccess('Your account has been successfully deleted.');
      
      navigate('/login');
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error deleting account:', error);
      
      if (error.response?.status === 401) {
        showError('Invalid password. Please try again.');
      } else if (error.response?.status === 403) {
        showError('You are not authorized to delete this account.');
      } else if (error.response?.status === 404) {
        showError('Account not found.');
      } else {
        showError('Failed to delete account. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset all states
    setConfirmationText('');
    setHasConfirmedConsequences(false);
    setPassword('');
    setShowPasswordField(false);
    setIsLoading(false);
    onClose();
  };

  const consequences = [
    'All your personal data will be permanently deleted',
    'Your booking history will be removed',
    'Any ongoing bookings will be cancelled',
    'You will lose access to your account immediately',
    'This action cannot be undone or reversed'
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 text-red-600">
          <ExclamationCircleOutlined className="text-xl" />
          <span className="text-lg font-semibold">Delete Account</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      maskClosable={false}
      className="delete-account-modal"
    >
      <div className="space-y-6">
        {/* Warning Alert */}
        <Alert
          message="This action is permanent and cannot be undone!"
          description="Please read the consequences carefully before proceeding."
          type="error"
          showIcon
          className="mb-4"
        />

        {/* Consequences List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            What happens when you delete your account:
          </h3>
          <ul className="space-y-2">
            {consequences.map((consequence, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">•</span>
                <span>{consequence}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Checkbox
            checked={hasConfirmedConsequences}
            onChange={(e) => setHasConfirmedConsequences(e.target.checked)}
            className="mb-3"
          >
            <span className="text-sm font-medium">
              I understand the consequences and want to permanently delete my account
            </span>
          </Checkbox>
        </div>

        {/* Confirmation Text Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">{CONFIRMATION_TEXT}</span> to confirm:
          </label>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type the confirmation text"
            className={`${isConfirmationValid ? 'border-green-500' : 'border-gray-300'}`}
            disabled={!hasConfirmedConsequences}
          />
          {confirmationText && !isConfirmationValid && (
            <p className="text-sm text-red-500">
              Please type exactly: {CONFIRMATION_TEXT}
            </p>
          )}
        </div>

        {/* Password Field (Optional - uncomment if password verification is required) */}
        {showPasswordField && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter your password to confirm:
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={!isConfirmationValid}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleDeleteAccount}
            loading={isLoading}
            disabled={!canProceed}
            size="large"
          >
            {isLoading ? 'Deleting Account...' : 'Delete My Account'}
          </Button>
        </div>

        {/* Additional Warning */}
        <div className="text-center text-sm text-gray-500 italic">
          Once deleted, your account cannot be recovered. Please be certain about this decision.
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
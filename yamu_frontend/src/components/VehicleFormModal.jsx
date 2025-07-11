// components/VehicleFormModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, FlexContainer } from './StyledComponents';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
`;

const ButtonContainer = styled(FlexContainer)`
  gap: 12px;
  margin-top: 24px;
`;

const VehicleFormModal = ({ isOpen, onClose, onSubmit, vehicle = null, loading = false }) => {
  const [formData, setFormData] = useState({
    type: '',
    model: '',
    capacity: '',
    airConditioned: false,
    available: true,
    vehicleImageUrl: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type || '',
        model: vehicle.model || '',
        capacity: vehicle.capacity || '',
        airConditioned: vehicle.airConditioned || false,
        available: vehicle.available !== undefined ? vehicle.available : true,
        vehicleImageUrl: vehicle.vehicleImageUrl || ''
      });
    } else {
      setFormData({
        type: '',
        model: '',
        capacity: '',
        airConditioned: false,
        available: true,
        vehicleImageUrl: ''
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'Vehicle type is required';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }
    
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity)
    };
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Vehicle Type</Label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select vehicle type</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
              <option value="Bus">Bus</option>
              <option value="SUV">SUV</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Tuk-Tuk">Tuk-Tuk</option>
              <option value="Other">Other</option>
            </Select>
            {errors.type && <ErrorMessage>{errors.type}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label>Model</Label>
            <Input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Toyota Corolla"
              required
            />
            {errors.model && <ErrorMessage>{errors.model}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label>Capacity (Number of passengers)</Label>
            <Input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="50"
              required
            />
            {errors.capacity && <ErrorMessage>{errors.capacity}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label>Vehicle Image URL (Optional)</Label>
            <Input
              type="url"
              name="vehicleImageUrl"
              value={formData.vehicleImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/vehicle-image.jpg"
            />
          </FormGroup>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="airConditioned"
                checked={formData.airConditioned}
                onChange={handleChange}
              />
              <Label style={{ marginBottom: 0 }}>Air Conditioned</Label>
            </CheckboxContainer>
          </FormGroup>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
              <Label style={{ marginBottom: 0 }}>Available for booking</Label>
            </CheckboxContainer>
          </FormGroup>
          
          <ButtonContainer>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </Button>
          </ButtonContainer>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default VehicleFormModal;
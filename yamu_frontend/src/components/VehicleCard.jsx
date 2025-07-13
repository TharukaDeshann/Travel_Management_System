import React from 'react';
import styled from 'styled-components';
import { Card, Button, Badge, FlexContainer } from './StyledComponents';

const VehicleCardContainer = styled(Card)`
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const VehicleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const VehicleImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 48px;
  margin-bottom: 12px;
`;

const VehicleInfo = styled.div`
  margin-bottom: 12px;
`;

const VehicleTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
`;

const VehicleDetail = styled.p`
  margin: 4px 0;
  color: #666;
  font-size: 14px;
`;

const ActionButtons = styled(FlexContainer)`
  gap: 8px;
  margin-top: 16px;
`;

const VehicleCard = ({ vehicle, isOwner = false, onEdit, onDelete }) => {
  const handleEdit = () => {
    if (onEdit) onEdit(vehicle);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(vehicle.id);
  };

  return (
    <VehicleCardContainer>
      {vehicle.vehicleImageUrl ? (
        <VehicleImage src={vehicle.vehicleImageUrl} alt={`${vehicle.type} ${vehicle.model}`} />
      ) : (
        <VehicleImagePlaceholder>
          🚗
        </VehicleImagePlaceholder>
      )}
      
      <VehicleInfo>
        <VehicleTitle>{vehicle.type} - {vehicle.model}</VehicleTitle>
        <VehicleDetail><strong>Capacity:</strong> {vehicle.capacity} passengers</VehicleDetail>
        <VehicleDetail>
          <strong>Air Conditioning:</strong> {vehicle.airConditioned ? 'Yes' : 'No'}
        </VehicleDetail>
        <VehicleDetail>
          <strong>Status:</strong> 
          <Badge variant={vehicle.available ? 'success' : 'danger'} style={{ marginLeft: '8px' }}>
            {vehicle.available ? 'Available' : 'Not Available'}
          </Badge>
        </VehicleDetail>
      </VehicleInfo>
      
      {isOwner && (
        <ActionButtons>
          <Button onClick={handleEdit} variant="primary">
            Edit
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Delete
          </Button>
        </ActionButtons>
      )}
    </VehicleCardContainer>
  );
};

export default VehicleCard;
// components/VehicleManagement.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { vehicleService } from '../services/vehicleService';
import { useNotification } from '../hooks/useNotification';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';
import { Button, Grid, SectionTitle, Card, Text } from './StyledComponents';

const VehicleManagementContainer = styled.div`
  margin-top: 24px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px 0;
`;

const EmptyState = styled(Card)`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const VehicleGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ConfirmModal = styled.div`
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

const ConfirmContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const VehicleManagement = ({ guideId, isOwner = false }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadVehicles();
  }, [guideId]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehicleService.getVehiclesByGuideId(guideId);
      setVehicles(vehicleData);
      console.log("Loaded vehicles:", vehicleData);
    } catch (error) {
      showError('Failed to load vehicles');
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    setDeleteConfirm(vehicleId);
  };

  const confirmDelete = async () => {
    try {
      await vehicleService.deleteVehicle(deleteConfirm);
      setVehicles(vehicles.filter(v => v.id !== deleteConfirm));
      showSuccess('Vehicle deleted successfully');
    } catch (error) {
      showError('Failed to delete vehicle');
      console.error('Error deleting vehicle:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingVehicle) {
        // Update existing vehicle
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        setVehicles(vehicles.map(v => 
          v.id === editingVehicle.id ? { ...v, ...formData } : v
        ));
        showSuccess('Vehicle updated successfully');
      } else {
        // Add new vehicle
        await vehicleService.addVehicle(formData);
        // Reload vehicles to get the new one with ID
        await loadVehicles();
        showSuccess('Vehicle added successfully');
      }
      
      setShowModal(false);
      setEditingVehicle(null);
    } catch (error) {
      showError(editingVehicle ? 'Failed to update vehicle' : 'Failed to add vehicle');
      console.error('Error saving vehicle:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  if (loading) {
    return (
      <VehicleManagementContainer>
        <SectionTitle>Vehicles</SectionTitle>
        <LoadingContainer>
          <div className="loading-spinner"></div>
          <Text>Loading vehicles...</Text>
        </LoadingContainer>
      </VehicleManagementContainer>
    );
  }

  return (
    <VehicleManagementContainer>
      <HeaderSection>
        <SectionTitle>
          {isOwner ? 'My Vehicles' : 'Available Vehicles'}
        </SectionTitle>
        {isOwner && (
          <Button onClick={handleAddVehicle} variant="primary">
            + Add Vehicle
          </Button>
        )}
      </HeaderSection>

      {vehicles.length === 0 ? (
        <EmptyState>
          <Text size="18px" color="#666">
            {isOwner ? 'You haven\'t added any vehicles yet.' : 'No vehicles available.'}
          </Text>
          {isOwner && (
            <Button onClick={handleAddVehicle} variant="primary" style={{ marginTop: '16px' }}>
              Add Your First Vehicle
            </Button>
          )}
        </EmptyState>
      ) : (
        <VehicleGrid>
          {vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isOwner={isOwner}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />
          ))}
        </VehicleGrid>
      )}

      {/* Vehicle Form Modal */}
      <VehicleFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        vehicle={editingVehicle}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal>
          <ConfirmContent>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <ConfirmButtons>
              <Button onClick={() => setDeleteConfirm(null)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={confirmDelete} variant="danger">
                Delete
              </Button>
            </ConfirmButtons>
          </ConfirmContent>
        </ConfirmModal>
      )}
    </VehicleManagementContainer>
  );
};

export default VehicleManagement;
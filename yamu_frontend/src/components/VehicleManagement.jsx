// Updated VehicleManagement.jsx - Better integrated with profile page
import React, { useState, useEffect } from 'react';
import { Plus, Car, Edit, Trash2, AlertCircle } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { useNotification } from '../hooks/useNotification';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';

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
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        setVehicles(vehicles.map(v => 
          v.id === editingVehicle.id ? { ...v, ...formData } : v
        ));
        showSuccess('Vehicle updated successfully');
      } else {
        await vehicleService.addVehicle(formData);
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
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            {isOwner ? 'My Vehicles' : 'Available Vehicles'}
          </h3>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gradient-to-r from-indigo-500 to-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isOwner ? 'My Vehicles' : 'Available Vehicles'}
          </h3>
          <p className="text-gray-600">
            {isOwner 
              ? 'Manage your vehicle fleet and availability' 
              : `Browse ${vehicles.length} available vehicles`
            }
          </p>
        </div>
        {isOwner && (
          <button
            onClick={handleAddVehicle}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Vehicles Grid or Empty State */}
      {vehicles.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-indigo-600" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-3">
            {isOwner ? 'No vehicles added yet' : 'No vehicles available'}
          </h4>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {isOwner 
              ? 'Start building your fleet by adding your first vehicle. This will help travelers find and book your services.'
              : 'This guide hasn\'t added any vehicles yet. Check back later or browse other guides.'
            }
          </p>
          {isOwner && (
            <button
              onClick={handleAddVehicle}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="transform transition-all duration-300 hover:scale-105">
              <VehicleCard
                vehicle={vehicle}
                isOwner={isOwner}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
              />
            </div>
          ))}
        </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
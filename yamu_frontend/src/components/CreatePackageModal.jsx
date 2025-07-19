import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock,
  Hotel,
  User
} from 'lucide-react';
import packageService from '../services/packageService';

const CreatePackageModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    durationDays: 1,
    status: 'DRAFT',
    selectedHotelId: '',
    selectedDriverId: '',
    dayPlans: [
      {
        dayNumber: 1,
        plannedLocations: [''],
        plannedActivities: [''],
        estimatedCostPerPerson: 0
      }
    ]
  });

  const [availableResources, setAvailableResources] = useState({
    hotels: [],
    drivers: []
  });

  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetCalculation, setBudgetCalculation] = useState(null);

  // Load available resources on component mount
  useEffect(() => {
    loadAvailableResources();
  }, []);

  // Calculate budget when form data changes
  useEffect(() => {
    calculateBudget();
  }, [formData]);

  const loadAvailableResources = async () => {
    try {
      setResourcesLoading(true);
      const [hotels, drivers] = await Promise.all([
        packageService.getAvailableHotels(),
        packageService.getAvailableDrivers()
      ]);
      
      setAvailableResources({ hotels, drivers });
    } catch (err) {
      console.error('Error loading resources:', err);
      setError('Failed to load available resources');
    } finally {
      setResourcesLoading(false);
    }
  };

  const calculateBudget = async () => {
    try {
      if (formData.selectedHotelId && formData.selectedDriverId) {
        const budget = await packageService.calculatePackageBudget({
          durationDays: formData.durationDays,
          selectedHotelId: formData.selectedHotelId,
          selectedDriverId: formData.selectedDriverId,
          dayPlans: formData.dayPlans
        });
        setBudgetCalculation(budget);
      }
    } catch (err) {
      console.error('Error calculating budget:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    const newDayPlans = [];
    
    for (let i = 1; i <= newDuration; i++) {
      if (formData.dayPlans[i - 1]) {
        newDayPlans.push(formData.dayPlans[i - 1]);
      } else {
        newDayPlans.push({
          dayNumber: i,
          plannedLocations: [''],
          plannedActivities: [''],
          estimatedCostPerPerson: 0
        });
      }
    }

    setFormData(prev => ({
      ...prev,
      durationDays: newDuration,
      dayPlans: newDayPlans
    }));
  };

  const updateDayPlan = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const addLocationToDayPlan = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { ...day, plannedLocations: [...day.plannedLocations, ''] }
          : day
      )
    }));
  };

  const removeLocationFromDayPlan = (dayIndex, locationIndex) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              plannedLocations: day.plannedLocations.filter((_, i) => i !== locationIndex)
            }
          : day
      )
    }));
  };

  const addActivityToDayPlan = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { ...day, plannedActivities: [...day.plannedActivities, ''] }
          : day
      )
    }));
  };

  const removeActivityFromDayPlan = (dayIndex, activityIndex) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              plannedActivities: day.plannedActivities.filter((_, i) => i !== activityIndex)
            }
          : day
      )
    }));
  };

  const updateLocationInDayPlan = (dayIndex, locationIndex, value) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              plannedLocations: day.plannedLocations.map((loc, i) => 
                i === locationIndex ? value : loc
              )
            }
          : day
      )
    }));
  };

  const updateActivityInDayPlan = (dayIndex, activityIndex, value) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              plannedActivities: day.plannedActivities.map((activity, i) => 
                i === activityIndex ? value : activity
              )
            }
          : day
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validation = packageService.validatePackageData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return;
      }

      // Clean up day plans data
      const cleanedDayPlans = formData.dayPlans.map(day => ({
        dayNumber: day.dayNumber,
        plannedLocations: day.plannedLocations.filter(loc => loc.trim() !== ''),
        plannedActivities: day.plannedActivities.filter(activity => activity.trim() !== ''),
        estimatedCostPerPerson: parseFloat(day.estimatedCostPerPerson) || 0
      }));

      const packageData = {
        ...formData,
        budgetPerPerson: budgetCalculation?.totalBudget || 0,
        dayPlans: cleanedDayPlans
      };

      await packageService.createPackage(packageData);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Package</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Package Name</label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter package name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.durationDays}
                  onChange={handleDurationChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe your package..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Resource Selection */}
          {resourcesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading resources...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Select Resources</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <Hotel className="inline w-4 h-4 mr-1" />
                    Hotel
                  </label>
                  <select
                    name="selectedHotelId"
                    value={formData.selectedHotelId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a hotel</option>
                    {availableResources.hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} - {hotel.address} - {hotel.rating}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <User className="inline w-4 h-4 mr-1" />
                    Driver & Vehicle
                  </label>
                  <select
                    name="selectedDriverId"
                    value={formData.selectedDriverId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a driver with vehicle</option>
                    {availableResources.drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.vehicleType} {driver.brand} {driver.model} ({driver.vehicleNumber}) - {formatCurrency(driver.ratePerLng)}/day
                      </option>
                    ))}
                  </select>
                  {formData.selectedDriverId && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      {(() => {
                        const selectedDriver = availableResources.drivers.find(d => d.id == formData.selectedDriverId);
                        return selectedDriver ? (
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Driver:</span> {selectedDriver.name}</p>
                            <p><span className="font-medium">Rating:</span> ⭐ {selectedDriver.rating}/5</p>
                            <p><span className="font-medium">Vehicle:</span> {selectedDriver.vehicleType} - {selectedDriver.brand} {selectedDriver.model}</p>
                            <p><span className="font-medium">License:</span> {selectedDriver.vehicleNumber}</p>
                            <p><span className="font-medium">Color:</span> {selectedDriver.color}</p>
                            <p><span className="font-medium">Rate:</span> {formatCurrency(selectedDriver.ratePerLng)}/day</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Budget Calculation */}
          {budgetCalculation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-blue-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Estimated Budget per Person
              </h4>
              <div className="mt-2 space-y-1 text-sm text-blue-800">
                <p>Hotel Cost: {formatCurrency(budgetCalculation.hotelCost)}</p>
                <p>Transport Cost: {formatCurrency(budgetCalculation.transportCost)}</p>
                <p>Activity Cost: {formatCurrency(budgetCalculation.activityCost)}</p>
                <p>Miscellaneous (10%): {formatCurrency(budgetCalculation.miscellaneousCost)}</p>
                <hr className="border-blue-300" />
                <p className="font-medium text-lg">Total: {formatCurrency(budgetCalculation.totalBudget)}</p>
              </div>
            </div>
          )}

          {/* Day Plans */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Day-by-Day Planning</h4>
            
            {formData.dayPlans.map((day, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h5 className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Day {day.dayNumber}
                </h5>

                {/* Planned Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Planned Locations
                  </label>
                  {day.plannedLocations.map((location, locIndex) => (
                    <div key={locIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => updateLocationInDayPlan(dayIndex, locIndex, e.target.value)}
                        placeholder="Enter location"
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {day.plannedLocations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocationFromDayPlan(dayIndex, locIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLocationToDayPlan(dayIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Location
                  </button>
                </div>

                {/* Planned Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Planned Activities
                  </label>
                  {day.plannedActivities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateActivityInDayPlan(dayIndex, actIndex, e.target.value)}
                        placeholder="Enter activity"
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {day.plannedActivities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeActivityFromDayPlan(dayIndex, actIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addActivityToDayPlan(dayIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Activity
                  </button>
                </div>

                {/* Estimated Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Additional Cost per Person (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={day.estimatedCostPerPerson}
                    onChange={(e) => updateDayPlan(dayIndex, 'estimatedCostPerPerson', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackageModal;

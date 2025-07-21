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
  User,
  ChevronDown
} from 'lucide-react';
import packageService from '../services/packageService';
import HotelSelectorModal from './HotelSelectorModal';
import DriverSelectorModal from './DriverSelectorModal';
import GuideSelectorModal from './GuideSelectorModal';
import PackageDayPlanLocationSelector from './PackageDayPlanLocationSelector';

const EditPackageModal = ({ package: packageToEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    durationDays: 1,
    status: 'DRAFT',
    selectedHotelId: '',
    selectedDriverId: '',
    selectedGuideId: '',
    budgetPerPerson: 0,
    currency: 'LKR',
    dayPlans: []
  });

  const [availableResources, setAvailableResources] = useState({
    hotels: [],
    drivers: [],
    guides: []
  });

  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState({
    hotels: false,
    drivers: false,
    guides: false
  });
  const [error, setError] = useState(null);
  
  // Modal states
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  console.log("Edit Package Modal opened for package:", packageToEdit);
  // Initialize form data from package
  useEffect(() => {
    if (packageToEdit) {
      // Parse day plans to convert JSON strings to arrays
      const parsedDayPlans = packageToEdit.dayPlans ? packageToEdit.dayPlans.map(day => ({
        dayNumber: day.dayNumber,
        plannedLocations: day.plannedLocations ? JSON.parse(day.plannedLocations) : [''],
        plannedActivities: day.activities ? JSON.parse(day.activities) : [''],
        estimatedCostPerPerson: day.estimatedCostPerPerson || 0,
        packageLocations: day.packageLocations || [],
        packageRoute: day.packageRoute || null
      })) : [];

      setFormData({
        packageName: packageToEdit.packageName || '',
        description: packageToEdit.description || '',
        durationDays: packageToEdit.durationDays || 1,
        status: packageToEdit.status || 'DRAFT',
        selectedHotelId: packageToEdit.selectedHotel?.id || '',
        selectedDriverId: packageToEdit.selectedDriver?.id || '',
        selectedGuideId: packageToEdit.selectedGuide?.id || '',
        budgetPerPerson: packageToEdit.budgetPerPerson || 0,
        currency: packageToEdit.currency || 'LKR',
        dayPlans: parsedDayPlans
      });
    }
  }, [packageToEdit]);

  const loadHotels = async () => {
    if (availableResources.hotels.length > 0) return; // Already loaded
    
    try {
      setResourcesLoading(prev => ({ ...prev, hotels: true }));
      const hotels = await packageService.getAvailableHotels();
      setAvailableResources(prev => ({ ...prev, hotels }));
    } catch (err) {
      console.error('Error loading hotels:', err);
      setError('Failed to load available hotels');
    } finally {
      setResourcesLoading(prev => ({ ...prev, hotels: false }));
    }
  };

  const loadDrivers = async () => {
    if (availableResources.drivers.length > 0) return; // Already loaded
    
    try {
      setResourcesLoading(prev => ({ ...prev, drivers: true }));
      const drivers = await packageService.getAvailableDrivers();
      setAvailableResources(prev => ({ ...prev, drivers }));
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load available drivers');
    } finally {
      setResourcesLoading(prev => ({ ...prev, drivers: false }));
    }
  };

  const loadGuides = async () => {
    if (availableResources.guides.length > 0) return; // Already loaded
    
    try {
      setResourcesLoading(prev => ({ ...prev, guides: true }));
      const guides = await packageService.getAvailableGuides();
      setAvailableResources(prev => ({ ...prev, guides }));
    } catch (err) {
      console.error('Error loading guides:', err);
      setError('Failed to load available guides');
    } finally {
      setResourcesLoading(prev => ({ ...prev, guides: false }));
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
        newDayPlans.push({ ...formData.dayPlans[i - 1], dayNumber: i });
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

  // Calculate total budget per person from day plans
  const calculateBudgetPerPerson = () => {
    return formData.dayPlans.reduce((total, day) => {
      return total + (parseFloat(day.estimatedCostPerPerson) || 0);
    }, 0);
  };

  // Update budget per person whenever day plans change
  useEffect(() => {
    const calculatedBudget = calculateBudgetPerPerson();
    setFormData(prev => ({
      ...prev,
      budgetPerPerson: calculatedBudget
    }));
  }, [formData.dayPlans]);

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

  // New handlers for package locations and routes
  const updatePackageLocationsInDayPlan = (dayIndex, locations) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { ...day, packageLocations: locations }
          : day
      )
    }));
  };

  const updatePackageRouteInDayPlan = (dayIndex, route) => {
    setFormData(prev => ({
      ...prev,
      dayPlans: prev.dayPlans.map((day, index) => 
        index === dayIndex 
          ? { ...day, packageRoute: route }
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
      // Check if hotel, driver, and guide are selected
      if (!formData.selectedHotelId) {
        setError('Please select a hotel');
        setLoading(false);
        return;
      }

      if (!formData.selectedDriverId) {
        setError('Please select a driver');
        setLoading(false);
        return;
      }

      if (!formData.selectedGuideId) {
        setError('Please select a guide');
        setLoading(false);
        return;
      }

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
        dayTitle: day.dayTitle || `Day ${day.dayNumber}`,
        description: day.description || '',
        plannedLocations: Array.isArray(day.plannedLocations) 
          ? day.plannedLocations.filter(loc => loc.trim() !== '')
          : [],
        plannedActivities: Array.isArray(day.plannedActivities)
          ? day.plannedActivities.filter(activity => activity.trim() !== '')
          : [],
        estimatedCostPerPerson: parseFloat(day.estimatedCostPerPerson) || 0,
        transportationDetails: day.transportationDetails || '',
        mealPlans: day.mealPlans || '',
        notes: day.notes || '',
        packageLocations: day.packageLocations || [],
        packageRoute: day.packageRoute || null
      }));

      console.log('EditModal - Sending day plans with locations and routes:', cleanedDayPlans);

      const packageData = {
        ...formData,
        budgetPerPerson: parseFloat(formData.budgetPerPerson) || 0,
        dayPlans: cleanedDayPlans
      };

      await packageService.updatePackage(packageToEdit.id, packageData);
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

  const handleHotelSelect = (hotel) => {
    setFormData(prev => ({
      ...prev,
      selectedHotelId: hotel.id
    }));
  };

  const handleDriverSelect = (driver) => {
    setFormData(prev => ({
      ...prev,
      selectedDriverId: driver.id
    }));
  };

  const handleGuideSelect = (guide) => {
    setFormData(prev => ({
      ...prev,
      selectedGuideId: guide.id
    }));
  };

  const handleHotelModalOpen = async () => {
    await loadHotels();
    setIsHotelModalOpen(true);
  };

  const handleDriverModalOpen = async () => {
    await loadDrivers();
    setIsDriverModalOpen(true);
  };

  const handleGuideModalOpen = async () => {
    await loadGuides();
    setIsGuideModalOpen(true);
  };

  const getSelectedHotel = () => {
    // First check if hotel data is available in packageToEdit
    if (packageToEdit?.selectedHotel && packageToEdit.selectedHotel.id == formData.selectedHotelId) {
      return packageToEdit.selectedHotel;
    }
    // Fall back to available resources
    return availableResources.hotels.find(hotel => hotel.id == formData.selectedHotelId);
  };

  const getSelectedDriver = () => {
    // First check if driver data is available in packageToEdit
    if (packageToEdit?.selectedDriver && packageToEdit.selectedDriver.id == formData.selectedDriverId) {
      return packageToEdit.selectedDriver;
    }
    // Fall back to available resources
    return availableResources.drivers.find(driver => driver.id == formData.selectedDriverId);
  };

  const getSelectedGuide = () => {
    // First check if guide data is available in packageToEdit
    if (packageToEdit?.selectedGuide && packageToEdit.selectedGuide.id == formData.selectedGuideId) {
      return packageToEdit.selectedGuide;
    }
    // Fall back to available resources
    return availableResources.guides.find(guide => guide.id == formData.selectedGuideId);
  };

  // Ensure day plans have proper structure
  const ensureDayPlansStructure = (dayPlans) => {
    return dayPlans.map(day => ({
      ...day,
      plannedLocations: Array.isArray(day.plannedLocations) 
        ? day.plannedLocations 
        : (day.plannedLocations ? [day.plannedLocations] : ['']),
      plannedActivities: Array.isArray(day.plannedActivities) 
        ? day.plannedActivities 
        : (day.plannedActivities ? [day.plannedActivities] : [''])
    }));
  };

  // Apply structure fix when form data is set
  useEffect(() => {
    if (formData.dayPlans.length > 0) {
      const structuredDayPlans = ensureDayPlansStructure(formData.dayPlans);
      if (JSON.stringify(structuredDayPlans) !== JSON.stringify(formData.dayPlans)) {
        setFormData(prev => ({
          ...prev,
          dayPlans: structuredDayPlans
        }));
      }
    }
  }, [formData.dayPlans]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Edit Package: {packageToEdit?.packageName}
          </h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Budget per Person (LKR)</label>
                <div className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 px-3 py-2 text-sm text-gray-900">
                  {formatCurrency(calculateBudgetPerPerson())}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Automatically calculated from day-by-day costs
                </p>
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
          </div>

          {/* Resource Selection */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Select Resources</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {/* Hotel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hotel className="inline w-4 h-4 mr-1" />
                  Hotel
                </label>
                
                {getSelectedHotel() ? (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{getSelectedHotel().name}</h5>
                      <button
                        type="button"
                        onClick={handleHotelModalOpen}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        disabled={resourcesLoading.hotels}
                      >
                        {resourcesLoading.hotels ? 'Loading...' : 'Change'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {getSelectedHotel().address}
                    </p>
                    <p className="text-sm text-gray-600">Rating: ⭐ {getSelectedHotel().rating}/5</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleHotelModalOpen}
                    disabled={resourcesLoading.hotels}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <Hotel className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {resourcesLoading.hotels ? 'Loading hotels...' : 'Click to select a hotel'}
                    </p>
                    <p className="text-sm text-gray-400">Browse available hotels with filters</p>
                  </button>
                )}
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Driver & Vehicle
                </label>
                
                {getSelectedDriver() ? (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{getSelectedDriver().name}</h5>
                      <button
                        type="button"
                        onClick={handleDriverModalOpen}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        disabled={resourcesLoading.drivers}
                      >
                        {resourcesLoading.drivers ? 'Loading...' : 'Change'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">⭐ {getSelectedDriver().rating}/5</p>
                    {(getSelectedDriver().vehicleType || getSelectedDriver().brand || getSelectedDriver().model) && (
                      <p className="text-sm text-gray-600">
                        {[getSelectedDriver().vehicleType, getSelectedDriver().brand, getSelectedDriver().model]
                          .filter(Boolean).join(' - ')}
                      </p>
                    )}
                    <p className="text-sm font-medium text-blue-600">
                      {formatCurrency(getSelectedDriver().ratePerLng)}/km
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDriverModalOpen}
                    disabled={resourcesLoading.drivers}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {resourcesLoading.drivers ? 'Loading drivers...' : 'Click to select a driver'}
                    </p>
                    <p className="text-sm text-gray-400">Browse drivers with vehicle details</p>
                  </button>
                )}
              </div>

              {/* Guide Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Guide
                </label>
                
                {getSelectedGuide() ? (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{getSelectedGuide().firstName} {getSelectedGuide().lastName}</h5>
                      <button
                        type="button"
                        onClick={handleGuideModalOpen}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        disabled={resourcesLoading.guides}
                      >
                        {resourcesLoading.guides ? 'Loading...' : 'Change'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {getSelectedGuide().expertiseCityRegion}
                    </p>
                    <p className="text-sm text-gray-600">🗣️ {getSelectedGuide().language}</p>
                    {getSelectedGuide().vehicleAvailability && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                        Vehicle Available
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGuideModalOpen}
                    disabled={resourcesLoading.guides}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {resourcesLoading.guides ? 'Loading guides...' : 'Click to select a guide'}
                    </p>
                    <p className="text-sm text-gray-400">Browse guides with expertise details</p>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Day Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Day-by-Day Planning</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-800 font-medium">
                  Total Budget: {formatCurrency(calculateBudgetPerPerson())}
                </div>
                <div className="text-xs text-blue-600">
                  Per person for {formData.durationDays} day{formData.durationDays !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {formData.dayPlans.map((day, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h5 className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Day {day.dayNumber}
                </h5>

                {/* Package Locations and Route */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Locations & Route Planning
                  </label>
                  <PackageDayPlanLocationSelector
                    selectedLocations={day.packageLocations || []}
                    onLocationsChange={(locations) => updatePackageLocationsInDayPlan(dayIndex, locations)}
                    onRouteChange={(route) => updatePackageRouteInDayPlan(dayIndex, route)}
                    dayNumber={day.dayNumber}
                    travelMode="driving-car"
                  />
                </div>

                {/* Legacy Planned Locations (for backward compatibility) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Additional Locations (Text)
                  </label>
                  {Array.isArray(day.plannedLocations) && day.plannedLocations.map((location, locIndex) => (
                    <div key={locIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => updateLocationInDayPlan(dayIndex, locIndex, e.target.value)}
                        placeholder="Enter additional location notes"
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {Array.isArray(day.plannedLocations) && day.plannedLocations.length > 1 && (
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
                    Add Text Location
                  </button>
                </div>

                {/* Planned Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Planned Activities
                  </label>
                  {Array.isArray(day.plannedActivities) && day.plannedActivities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateActivityInDayPlan(dayIndex, actIndex, e.target.value)}
                        placeholder="Enter activity"
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {Array.isArray(day.plannedActivities) && day.plannedActivities.length > 1 && (
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
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Estimated Cost per Person (LKR)
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
                  <p className="mt-1 text-xs text-gray-500">
                    Cost per person for activities, meals, entrance fees, etc.
                  </p>
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
              {loading ? 'Updating...' : 'Update Package'}
            </button>
          </div>
        </form>

        {/* Hotel Selector Modal */}
        <HotelSelectorModal
          isOpen={isHotelModalOpen}
          onClose={() => setIsHotelModalOpen(false)}
          onSelect={handleHotelSelect}
          hotels={availableResources.hotels}
          selectedHotelId={formData.selectedHotelId}
          loading={resourcesLoading.hotels}
        />

        {/* Driver Selector Modal */}
        <DriverSelectorModal
          isOpen={isDriverModalOpen}
          onClose={() => setIsDriverModalOpen(false)}
          onSelect={handleDriverSelect}
          drivers={availableResources.drivers}
          selectedDriverId={formData.selectedDriverId}
          loading={resourcesLoading.drivers}
        />

        {/* Guide Selector Modal */}
        <GuideSelectorModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          onSelect={handleGuideSelect}
          guides={availableResources.guides}
          selectedGuideId={formData.selectedGuideId}
          loading={resourcesLoading.guides}
        />
      </div>
    </div>
  );
};

export default EditPackageModal;

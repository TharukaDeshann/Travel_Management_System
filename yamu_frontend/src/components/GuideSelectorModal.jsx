import React, { useState } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Globe, 
  User,
  CheckCircle
} from 'lucide-react';

const GuideSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  guides, 
  selectedGuideId, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  if (!isOpen) return null;

  // Get unique languages and regions for filters
  const uniqueLanguages = [...new Set(guides.map(guide => guide.language).filter(Boolean))];
  const uniqueRegions = [...new Set(guides.map(guide => guide.expertiseCityRegion).filter(Boolean))];

  // Filter guides based on search and filters
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = !searchTerm || 
      `${guide.firstName} ${guide.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.expertiseCityRegion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.language?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = !languageFilter || guide.language === languageFilter;
    const matchesRegion = !regionFilter || guide.expertiseCityRegion === regionFilter;
    
    return matchesSearch && matchesLanguage && matchesRegion;
  });

  const handleGuideSelect = (guide) => {
    onSelect(guide);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Select Guide</h3>
            <p className="text-sm text-gray-500">Choose a guide for your travel package</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guides by name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guides List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading guides...</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No guides found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedGuideId == guide.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleGuideSelect(guide)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Guide Avatar */}
                    <div className="flex-shrink-0">
                      {guide.profileImageUrl ? (
                        <img
                          src={guide.profileImageUrl}
                          alt={`${guide.firstName} ${guide.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Guide Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {guide.firstName} {guide.lastName}
                        </h4>
                        {selectedGuideId == guide.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{guide.expertiseCityRegion}</span>
                        </p>
                        
                        <p className="text-sm text-gray-600 flex items-center">
                          <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{guide.language}</span>
                        </p>

                        {guide.vehicleAvailability && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Vehicle Available
                          </span>
                        )}
                      </div>

                      {guide.about && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                          {guide.about}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} available
            {searchTerm || languageFilter || regionFilter ? ' (filtered)' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideSelectorModal;

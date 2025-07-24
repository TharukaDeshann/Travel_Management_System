import React from 'react';
import { Select, Spin } from 'antd';
import InputField from '../components/InputField';

const { Option } = Select;

const GuideSection = ({ 
  formData,
  errors,
  countries,
  regions,
  languages,
  loadingCountries,
  loadingRegions,
  loadingLanguages,
  selectedCountry,
  handleChange,
  handleSelectChange,
  handleLanguageChange,
  getSelectedLanguages
}) => {
  return (
    <div className="border-b border-gray-200 py-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Guide Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <Select
            id="nationality"
            value={formData.nationality || undefined}
            onChange={(value) => handleSelectChange('nationality', value)}
            placeholder="Select your country"
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            loading={loadingCountries}
            notFoundContent={loadingCountries ? <Spin size="small" /> : 'No countries found'}
          >
            {countries.map(country => (
              <Option key={country.code} value={country.name}>
                {country.name}
              </Option>
            ))}
          </Select>
          {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
        </div>
        
        {/* Region Selection */}
        <div className="space-y-2">
          <label htmlFor="expertiseCityRegion" className="block text-sm font-medium text-gray-700">
            Expertise City/Region
          </label>
          <Select
            id="expertiseCityRegion"
            value={formData.expertiseCityRegion || undefined}
            onChange={(value) => handleSelectChange('expertiseCityRegion', value)}
            placeholder="Select city/region of expertise"
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            loading={loadingRegions}
            disabled={!selectedCountry}
            notFoundContent={
              loadingRegions 
                ? <Spin size="small" /> 
                : selectedCountry 
                  ? 'No regions found' 
                  : 'Please select a country first'
            }
          >
            {regions.map(region => (
              <Option key={region.id} value={region.name}>
                {region.name}
              </Option>
            ))}
          </Select>
          {errors.expertiseCityRegion && <p className="text-sm text-red-500">{errors.expertiseCityRegion}</p>}
        </div>
      </div>
      
      {/* Languages Selection */}
      <div className="mt-6 space-y-2">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Languages
        </label>
        <Select
          id="language"
          mode="multiple"
          value={getSelectedLanguages()}
          onChange={handleLanguageChange}
          placeholder="Select languages you speak"
          className="w-full"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          loading={loadingLanguages}
          notFoundContent={loadingLanguages ? <Spin size="small" /> : 'No languages found'}
        >
          {languages.map(language => (
            <Option key={language.code} value={language.name}>
              {language.name}
            </Option>
          ))}
        </Select>
        {errors.language && <p className="text-sm text-red-500">{errors.language}</p>}
      </div>
      
      {/* About Section */}
      <div className="mt-6">
        <InputField
          id="about"
          name="about"
          label="About"
          value={formData.about}
          onChange={handleChange}
          error={errors.about}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>
    </div>
  );
};

export default GuideSection;
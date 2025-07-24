import React from 'react';
import InputField from '../components/InputField';

const BasicInformationSection = ({ formData, errors, handleChange }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="firstName"
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="First Name"
        />
        
        <InputField
          id="lastName"
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Last Name"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <InputField
          id="contactNumber"
          name="contactNumber"
          label="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          error={errors.contactNumber}
          placeholder="Contact Number"
        />
        
        <InputField
          id="address"
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Address"
        />
      </div>
    </div>
  );
};

export default BasicInformationSection;
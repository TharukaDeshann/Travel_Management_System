import React from "react";
import { Select, Spin } from "antd";

const { Option } = Select;

const TravelerSection = ({
  formData,
  errors,
  countries,
  loadingCountries,
  handleSelectChange,
}) => {
  return (
    <div className="border-b border-gray-200 py-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Traveler Details
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="nationality"
          className="block text-sm font-medium text-gray-700"
        >
          Nationality
        </label>
        <Select
          id="nationality"
          value={formData.nationality || undefined}
          onChange={(value) => handleSelectChange("nationality", value)}
          placeholder="Select your nationality"
          className="w-full"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          loading={loadingCountries}
          notFoundContent={
            loadingCountries ? <Spin size="small" /> : "No countries found"
          }
        >
          {countries.map((country) => (
            <Option key={country.code} value={country.name}>
              {country.name}
            </Option>
          ))}
        </Select>
        {errors.nationality && (
          <p className="text-sm text-red-500">{errors.nationality}</p>
        )}
      </div>
    </div>
  );
};

export default TravelerSection;

import React from "react";

const InputField = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  rows = null, // for textarea
}) => {
  const inputClasses = `w-full px-3 py-2 border rounded-md ${
    error ? "border-red-500" : "border-gray-300"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {rows ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;

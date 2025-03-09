import React from "react";

export const FormInput = ({ formik, id, icon: Icon, placeholder, type = "text", error }) => (
  <div>
    <div className="relative">
      <Icon className="absolute left-3 top-3 text-[#1A365D]" />
      <input
        id={id}
        type={type}
        {...formik.getFieldProps(id)}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all duration-200 bg-[#FAFBFC] text-[#333333]"
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
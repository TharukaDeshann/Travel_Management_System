// AuthLayout.jsx
import React from "react";

export const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-[#F0F0F0]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A365D]">{title}</h1>
        <p className="text-[#666666] mt-2">{subtitle}</p>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full"></div>
      </div>
      {children}
    </div>
  </div>
);
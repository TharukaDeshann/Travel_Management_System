import React from "react";

export const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F7F2] border border-[#E9DCCD]">
    <span className="font-medium text-[#2E5E4E]">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        checked ? "bg-[#D76F30]" : "bg-[#E9DCCD]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);
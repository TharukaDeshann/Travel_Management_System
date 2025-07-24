import React from 'react';

const SecuritySection = ({ onShowEmailModal, onShowPasswordModal, onShowDeleteModal }) => {
  return (
    <div className="py-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Account & Security</h2>
      <p className="text-gray-600 mb-6">
        Update your email address, change your password, or manage your account settings to keep your account secure.
      </p>
      
      {/* Account Management Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Account Management</h3>
          <div className="flex flex-wrap gap-4">
            <button 
              type="button" 
              onClick={onShowEmailModal}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Change Email
            </button>
            
            <button 
              type="button" 
              onClick={onShowPasswordModal}
              className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-red-100">
          <h3 className="text-lg font-medium text-red-700 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-3">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button 
            type="button" 
            onClick={onShowDeleteModal}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 hover:shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
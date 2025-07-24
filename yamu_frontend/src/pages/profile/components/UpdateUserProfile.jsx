import React, { useState } from 'react';
import { Button } from 'antd';
import { useUserProfile } from '../../../hooks/useUserProfile';
import UpdatePasswordModal from './UpdatePasswordModal';
import UpdateEmailModal from './UpdateEmailModal';
import DeleteAccountModal from './DeleteAccountModal';
import BackButton from '../../../components/BackButton';
import BasicInformationSection from './sections/BasicInformationSection';
import TravelerSection from './sections/TravelerSection';
import GuideSection from './sections/GuideSection';
import SecuritySection from './sections/SecuritySection';


const UpdateUserProfile = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    isLoading,
    errors,
    formData,
    userType,
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
    handleSubmit,
    getSelectedLanguages,
  } = useUserProfile();

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Update Profile</h1>
          <p className="text-gray-600 mt-2">Update your account information</p>
          
          <form onSubmit={handleSubmit} className="mt-6">
            {/* Basic Information Section */}
            <BasicInformationSection 
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
            
            {/* Role-specific sections */}
            {userType === 'TRAVELER' && (
              <TravelerSection 
                formData={formData}
                errors={errors}
                countries={countries}
                loadingCountries={loadingCountries}
                handleSelectChange={handleSelectChange}
              />
            )}
            
            {userType === 'GUIDE' && (
              <GuideSection 
                formData={formData}
                errors={errors}
                countries={countries}
                regions={regions}
                languages={languages}
                loadingCountries={loadingCountries}
                loadingRegions={loadingRegions}
                loadingLanguages={loadingLanguages}
                selectedCountry={selectedCountry}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleLanguageChange={handleLanguageChange}
                getSelectedLanguages={getSelectedLanguages}
              />
            )}
            
            {/* Security Settings Section */}
            <SecuritySection 
              onShowEmailModal={() => setShowEmailModal(true)}
              onShowPasswordModal={() => setShowPasswordModal(true)}
              onShowDeleteModal={() => setShowDeleteModal(true)}
            />
            
            {/* Submit Section */}
            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
              >
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
              <BackButton/>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modals */}
      {showPasswordModal && (
        <UpdatePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      
      {showEmailModal && (
        <UpdateEmailModal
          visible={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      )}



    </div>
  );
};

export default UpdateUserProfile;
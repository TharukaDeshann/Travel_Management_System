import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",
  cancelButtonClass = "px-4 py-2 text-gray-600 hover:text-gray-800",
  isLoading = false,
  loadingText = "Processing...",
  variant = "danger", // 'danger', 'warning', 'info', 'success'
}) => {
  if (!isOpen) {
    return null;
  }

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          confirmClass: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400",
          iconColor: "text-red-600",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
        };
      case "warning":
        return {
          confirmClass: "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-yellow-400",
          iconColor: "text-yellow-600",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
        };
      case "info":
        return {
          confirmClass: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400",
          iconColor: "text-blue-600",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case "success":
        return {
          confirmClass: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400",
          iconColor: "text-green-600",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      default:
        return {
          confirmClass: confirmButtonClass,
          iconColor: "text-gray-600",
          icon: null,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const finalConfirmClass = confirmButtonClass !== "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
    ? confirmButtonClass 
    : variantStyles.confirmClass;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {variantStyles.icon && (
            <div className={`flex-shrink-0 ${variantStyles.iconColor} mr-3`}>
              {variantStyles.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>
        
        {message && (
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${cancelButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${finalConfirmClass} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
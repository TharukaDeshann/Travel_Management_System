
export const validateUserProfile = (formData) => {
  const errors = {};
  
  // First name validation
  if (formData.firstName && formData.firstName.length < 3) {
    errors.firstName = 'First name must be at least 3 characters';
  }
  
  // Contact number validation
  if (formData.contactNumber && !/^[0-9]{10,15}$/.test(formData.contactNumber)) {
    errors.contactNumber = 'Contact number must be 10-15 digits';
  }
  
  // Email validation (if needed)
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Last name validation (optional)
  if (formData.lastName && formData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Additional validation rules
export const validationRules = {
  required: (value, fieldName) => 
    !value ? `${fieldName} is required` : null,
    
  minLength: (value, min, fieldName) => 
    value && value.length < min ? `${fieldName} must be at least ${min} characters` : null,
    
  maxLength: (value, max, fieldName) => 
    value && value.length > max ? `${fieldName} must not exceed ${max} characters` : null,
    
  phone: (value) => 
    value && !/^[0-9]{10,15}$/.test(value) ? 'Invalid phone number format' : null,
    
  email: (value) => 
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : null,
};

// Generic form validator
export const validateField = (value, rules, fieldName) => {
  for (const rule of rules) {
    const error = rule(value, fieldName);
    if (error) return error;
  }
  return null;
};
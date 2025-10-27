export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const getValidationErrors = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Invalid email format';
    } else if (fieldRules.username && !validateUsername(value)) {
      errors[field] = 'Username must be 3-20 characters, alphanumeric and underscore only';
    } else if (fieldRules.password && !validatePassword(value)) {
      errors[field] = 'Password must be at least 6 characters';
    } else if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
    } else if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Must be at most ${fieldRules.maxLength} characters`;
    }
  });

  return errors;
};

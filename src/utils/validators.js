/**
 * Reusable Validation Functions
 * Provides composable validators for form validation
 */
import { USERNAME_CONSTRAINTS } from './constants';

/**
 * Create a validator from an array of rules
 * @param {Array<{test: Function, message: string, transform?: Function}>} rules
 * @returns {Function} Validator function
 */
export const createValidator = (rules) => (value) => {
  const errors = [];
  let transformedValue = value;

  for (const rule of rules) {
    // Apply transformation if provided
    if (rule.transform) {
      transformedValue = rule.transform(transformedValue);
    }

    // Test the (possibly transformed) value
    if (!rule.test(transformedValue)) {
      errors.push(rule.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    value: transformedValue
  };
};

/**
 * Common validation rules
 */
export const validators = {
  /**
   * Check if value is not empty
   */
  required: (message = 'This field is required') => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  /**
   * Check minimum length
   */
  minLength: (length, message) => ({
    test: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`
  }),

  /**
   * Check maximum length
   */
  maxLength: (length, message) => ({
    test: (value) => value.length <= length,
    message: message || `Must be at most ${length} characters`
  }),

  /**
   * Check if value matches pattern
   */
  pattern: (regex, message = 'Invalid format') => ({
    test: (value) => regex.test(value),
    message
  }),

  /**
   * Transform value by trimming whitespace
   */
  trim: () => ({
    test: () => true,
    transform: (value) => value.trim(),
    message: ''
  }),

  /**
   * Check if value is a number
   */
  isNumber: (message = 'Must be a number') => ({
    test: (value) => !isNaN(Number(value)),
    message
  }),

  /**
   * Check minimum numeric value
   */
  min: (minValue, message) => ({
    test: (value) => Number(value) >= minValue,
    message: message || `Must be at least ${minValue}`
  }),

  /**
   * Check maximum numeric value
   */
  max: (maxValue, message) => ({
    test: (value) => Number(value) <= maxValue,
    message: message || `Must be at most ${maxValue}`
  }),
};

/**
 * Username validator
 * Validates username against app constraints
 */
export const validateUsername = createValidator([
  validators.trim(),
  validators.required('Username is required'),
  validators.minLength(USERNAME_CONSTRAINTS.MIN_LENGTH),
  validators.maxLength(USERNAME_CONSTRAINTS.MAX_LENGTH),
  validators.pattern(
    USERNAME_CONSTRAINTS.ALLOWED_PATTERN,
    'Username can only contain letters, numbers, spaces, underscores, and hyphens'
  ),
]);

/**
 * Convenience function to validate username (alternative API)
 * @param {string} username
 * @returns {{valid: boolean, errors: string[], trimmed: string}}
 */
export const checkUsername = (username) => {
  const result = validateUsername(username);
  return {
    valid: result.valid,
    errors: result.errors,
    trimmed: result.value
  };
};

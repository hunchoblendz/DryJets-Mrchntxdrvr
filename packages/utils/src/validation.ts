/**
 * Validation Utilities
 *
 * Common validation functions
 */

/**
 * Validate an email address
 *
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a phone number (US format)
 *
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // US phone: 10 digits, or 11 with country code
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @param options - Validation requirements
 * @returns Object with validation result and messages
 */
export function isValidPassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a US zip code
 *
 * @param zip - Zip code to validate
 * @returns True if valid
 */
export function isValidZipCode(zip: string): boolean {
  // US zip: 5 digits or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Validate order items
 *
 * @param items - Order items to validate
 * @returns Object with validation result and errors
 */
export function validateOrderItems(
  items: Array<{
    serviceId?: string;
    itemType?: string;
    quantity?: number;
    price?: number;
  }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('At least one item is required');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.serviceId && !item.itemType) {
      errors.push(`Item ${index + 1}: Service or item type is required`);
    }

    if (item.quantity !== undefined && item.quantity < 1) {
      errors.push(`Item ${index + 1}: Quantity must be at least 1`);
    }

    if (item.price !== undefined && item.price < 0) {
      errors.push(`Item ${index + 1}: Price cannot be negative`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate coordinates
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns True if valid coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Sanitize a string for safe display (prevent XSS)
 *
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

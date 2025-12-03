/**
 * Order Short Code Generator
 *
 * Generates unique, easy-to-reference order codes for the DryJets platform.
 * Format: DJ-XXXX (e.g., DJ-1234, DJ-5678)
 *
 * Uses the last 4 digits of the BigInt order ID for easy tracking.
 * BigInt IDs can go up to 2^63-1 (9,223,372,036,854,775,807), so we cycle every 10,000 orders.
 */

/**
 * Generate a short order code from a BigInt order ID
 * @param orderId - The BigInt order ID from the database
 * @returns A short code like "DJ-1234"
 */
export function generateOrderShortCode(orderId: bigint | number): string {
  const id = typeof orderId === 'bigint' ? orderId : BigInt(orderId);
  const last4Digits = Number(id % BigInt(10000));
  return `DJ-${last4Digits.toString().padStart(4, '0')}`;
}

/**
 * Validate a short order code format
 * @param shortCode - The short code to validate (e.g., "DJ-1234")
 * @returns True if valid format
 */
export function isValidOrderShortCode(shortCode: string): boolean {
  const regex = /^DJ-\d{4}$/;
  return regex.test(shortCode);
}

/**
 * Extract numeric part from short code
 * @param shortCode - The short code (e.g., "DJ-1234")
 * @returns The numeric part as a number (e.g., 1234)
 */
export function extractShortCodeNumber(shortCode: string): number | null {
  if (!isValidOrderShortCode(shortCode)) {
    return null;
  }
  return parseInt(shortCode.split('-')[1], 10);
}

/**
 * Format order ID for display (shows full number with commas for readability)
 * @param orderId - The BigInt order ID
 * @returns Formatted string like "1,234,567"
 */
export function formatOrderId(orderId: bigint | number): string {
  return orderId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get display-friendly order reference
 * @param orderId - The BigInt order ID
 * @param shortCode - The short code
 * @returns A formatted string like "Order DJ-1234 (#1234567)"
 */
export function formatOrderReference(orderId: bigint | number, shortCode: string): string {
  return `Order ${shortCode} (#${formatOrderId(orderId)})`;
}

// Example usage:
// const orderId = 1234567n;
// const shortCode = generateOrderShortCode(orderId); // "DJ-7567"
// console.log(formatOrderReference(orderId, shortCode)); // "Order DJ-7567 (#1,234,567)"

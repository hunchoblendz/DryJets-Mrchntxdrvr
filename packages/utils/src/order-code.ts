/**
 * Order Code Utilities
 *
 * Generates and parses short, customer-friendly order codes
 * Format: DJ-XXXX (e.g., DJ-1234, DJ-9999)
 */

const PREFIX = 'DJ';
const CODE_LENGTH = 4;

/**
 * Generate a short code from an order ID
 *
 * Uses last 4 digits of the order ID for easy recall
 * Example: orderId 1234567 -> "DJ-4567"
 *
 * @param orderId - The BigInt or number order ID
 * @returns Short code string (e.g., "DJ-1234")
 */
export function generateOrderShortCode(orderId: bigint | number | string): string {
  const id = typeof orderId === 'string' ? BigInt(orderId) : BigInt(orderId);

  // Get last 4 digits
  const lastDigits = id % BigInt(10000);

  // Pad with zeros if needed
  const code = lastDigits.toString().padStart(CODE_LENGTH, '0');

  return `${PREFIX}-${code}`;
}

/**
 * Parse a short code to extract the numeric part
 *
 * @param shortCode - The short code (e.g., "DJ-1234")
 * @returns The numeric part or null if invalid
 */
export function parseOrderShortCode(shortCode: string): number | null {
  const cleaned = shortCode.toUpperCase().trim();
  const regex = new RegExp(`^${PREFIX}-(\\d{${CODE_LENGTH}})$`);
  const match = cleaned.match(regex);

  if (!match) {
    return null;
  }

  return parseInt(match[1], 10);
}

/**
 * Check if a string is a valid short code format
 *
 * @param shortCode - The string to check
 * @returns True if valid format
 */
export function isValidShortCode(shortCode: string): boolean {
  return parseOrderShortCode(shortCode) !== null;
}

/**
 * Format an order ID for display
 * Handles BigInt serialization and formatting
 *
 * @param orderId - The order ID (BigInt, number, or string)
 * @param format - 'short' for DJ-XXXX, 'full' for complete ID
 * @returns Formatted string
 */
export function formatOrderId(
  orderId: bigint | number | string,
  format: 'short' | 'full' = 'short'
): string {
  if (format === 'short') {
    return generateOrderShortCode(orderId);
  }

  // Full format - add thousands separators
  const id = typeof orderId === 'string' ? orderId : orderId.toString();
  return id.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Search helper - check if query matches order code or ID
 *
 * @param query - Search query (e.g., "DJ-1234", "1234", "1234567")
 * @param orderId - The order ID to match against
 * @param shortCode - The short code to match against
 * @returns True if query matches
 */
export function matchesOrderQuery(
  query: string,
  orderId: bigint | number | string,
  shortCode?: string
): boolean {
  const cleanQuery = query.toUpperCase().trim();

  // Check short code match
  if (shortCode && shortCode.toUpperCase().includes(cleanQuery)) {
    return true;
  }

  // Check if query is a short code format
  if (isValidShortCode(cleanQuery) && shortCode) {
    return shortCode.toUpperCase() === cleanQuery;
  }

  // Check numeric ID match
  const idStr = orderId.toString();
  if (cleanQuery.replace(/[^0-9]/g, '') === idStr) {
    return true;
  }

  // Partial match on ID
  if (idStr.includes(cleanQuery.replace(/[^0-9]/g, ''))) {
    return true;
  }

  return false;
}

/**
 * Formatting Utilities
 *
 * Common formatting functions for display
 */

/**
 * Format a number as currency
 *
 * @param amount - The amount in cents or dollars
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$12.99")
 */
export function formatCurrency(
  amount: number,
  options: {
    currency?: string;
    locale?: string;
    cents?: boolean;
  } = {}
): string {
  const { currency = 'USD', locale = 'en-US', cents = true } = options;
  const value = cents ? amount / 100 : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a date for display
 *
 * @param date - Date object or string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    locale?: string;
  } = {}
): string {
  const { format = 'medium', locale = 'en-US' } = options;
  const d = typeof date === 'string' ? new Date(date) : date;

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return d.toLocaleDateString(locale, formatOptions[format]);
}

/**
 * Format a time for display
 *
 * @param date - Date object or string
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  options: {
    format?: '12h' | '24h';
    locale?: string;
    showSeconds?: boolean;
  } = {}
): string {
  const { format = '12h', locale = 'en-US', showSeconds = false } = options;
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: format === '12h',
  });
}

/**
 * Format date and time together
 *
 * @param date - Date object or string
 * @param options - Formatting options
 * @returns Formatted datetime string
 */
export function formatDateTime(
  date: Date | string,
  options: {
    locale?: string;
    dateFormat?: 'short' | 'medium' | 'long';
    timeFormat?: '12h' | '24h';
  } = {}
): string {
  const { locale = 'en-US', dateFormat = 'medium', timeFormat = '12h' } = options;

  const dateStr = formatDate(date, { format: dateFormat, locale });
  const timeStr = formatTime(date, { format: timeFormat, locale });

  return `${dateStr} at ${timeStr}`;
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date object or string
 * @param locale - Locale for formatting
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (seconds < 60) {
    return rtf.format(diff > 0 ? seconds : -seconds, 'second');
  } else if (minutes < 60) {
    return rtf.format(diff > 0 ? minutes : -minutes, 'minute');
  } else if (hours < 24) {
    return rtf.format(diff > 0 ? hours : -hours, 'hour');
  } else if (days < 7) {
    return rtf.format(diff > 0 ? days : -days, 'day');
  } else if (weeks < 4) {
    return rtf.format(diff > 0 ? weeks : -weeks, 'week');
  } else if (months < 12) {
    return rtf.format(diff > 0 ? months : -months, 'month');
  } else {
    return rtf.format(diff > 0 ? years : -years, 'year');
  }
}

/**
 * Format a phone number for display
 *
 * @param phone - Raw phone number
 * @param format - Output format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(
  phone: string,
  format: 'national' | 'international' = 'national'
): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    // US format: (XXX) XXX-XXXX
    if (format === 'national') {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits[0] === '1') {
    // US with country code
    if (format === 'national') {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Return as-is if unknown format
  return phone;
}

/**
 * Format an address for display
 *
 * @param address - Address components
 * @returns Formatted address string
 */
export function formatAddress(address: {
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): string {
  const parts: string[] = [];

  if (address.street) {
    let line1 = address.street;
    if (address.unit) {
      line1 += `, ${address.unit}`;
    }
    parts.push(line1);
  }

  const line2Parts: string[] = [];
  if (address.city) line2Parts.push(address.city);
  if (address.state) line2Parts.push(address.state);
  if (address.zip) line2Parts.push(address.zip);

  if (line2Parts.length > 0) {
    parts.push(line2Parts.join(', '));
  }

  if (address.country && address.country !== 'US' && address.country !== 'USA') {
    parts.push(address.country);
  }

  return parts.join('\n');
}

/**
 * Format distance for display
 *
 * @param meters - Distance in meters
 * @param unit - Display unit
 * @returns Formatted distance string
 */
export function formatDistance(
  meters: number,
  unit: 'km' | 'mi' | 'auto' = 'auto'
): string {
  let displayUnit = unit;

  // Auto-select based on locale (US uses miles)
  if (unit === 'auto') {
    displayUnit = 'mi'; // Default to miles for US
  }

  if (displayUnit === 'mi') {
    const miles = meters / 1609.344;
    if (miles < 0.1) {
      return `${Math.round(meters * 3.28084)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 *
 * @param seconds - Duration in seconds
 * @param format - Output format
 * @returns Formatted duration string
 */
export function formatDuration(
  seconds: number,
  format: 'short' | 'long' = 'short'
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (format === 'short') {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${secs}s`;
  }

  // Long format
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }

  return parts.join(' ') || '0 seconds';
}

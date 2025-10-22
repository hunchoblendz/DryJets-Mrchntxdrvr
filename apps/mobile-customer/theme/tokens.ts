/**
 * DryJets Mobile Design Tokens
 * Adapted for consumer marketplace app with vibrant, trustworthy aesthetics
 */

export const colors = {
  // Brand Colors
  primary: {
    50: '#E5F2FF',
    100: '#B8DCFF',
    200: '#8AC6FF',
    300: '#5CB0FF',
    400: '#2E9AFF',
    500: '#0084FF', // Main brand blue
    600: '#006AD1',
    700: '#0050A3',
    800: '#003675',
    900: '#001C47',
  },

  // Secondary - Fresh Teal
  secondary: {
    50: '#E6F9F7',
    100: '#B3EDE7',
    200: '#80E1D7',
    300: '#4DD5C7',
    400: '#1AC9B7',
    500: '#00BDA7', // Main teal
    600: '#009786',
    700: '#007165',
    800: '#004B44',
    900: '#002523',
  },

  // Success
  success: {
    50: '#E8F9F0',
    100: '#B8EDD0',
    200: '#88E1B0',
    300: '#58D590',
    400: '#28C970',
    500: '#10B759',
    600: '#0D9247',
    700: '#0A6D35',
    800: '#074823',
    900: '#042311',
  },

  // Warning
  warning: {
    50: '#FFF8E6',
    100: '#FFEBB3',
    200: '#FFDE80',
    300: '#FFD14D',
    400: '#FFC41A',
    500: '#FFB700',
    600: '#CC9200',
    700: '#996E00',
    800: '#664900',
    900: '#332500',
  },

  // Error
  error: {
    50: '#FFE9E6',
    100: '#FFC0B8',
    200: '#FF978A',
    300: '#FF6E5C',
    400: '#FF452E',
    500: '#FF1C00',
    600: '#CC1600',
    700: '#991000',
    800: '#660B00',
    900: '#330500',
  },

  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  border: {
    light: '#E5E7EB',
    DEFAULT: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Service Type Colors
  serviceTypes: {
    dryClean: '#0084FF',
    laundry: '#00BDA7',
    alterations: '#9B59B6',
    shoeRepair: '#E67E22',
  },

  // Order Status Colors
  orderStatus: {
    pending: '#FFB700',
    confirmed: '#0084FF',
    assigned: '#9B59B6',
    pickedUp: '#00BDA7',
    inProcess: '#FF8C00',
    readyForDelivery: '#10B759',
    outForDelivery: '#0084FF',
    delivered: '#10B759',
    cancelled: '#FF1C00',
  },

  // Status Colors
  status: {
    warning: '#FFB700',
    error: '#FF1C00',
    success: '#10B759',
    info: '#0084FF',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Body text styles
  body: {
    xs: {
      fontSize: 10,
      lineHeight: 1.2,
      fontWeight: '400' as const,
    },
    sm: {
      fontSize: 12,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
    base: {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
    lg: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400' as const,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: 40,
      lineHeight: 1.2,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 32,
      lineHeight: 1.2,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 24,
      lineHeight: 1.2,
      fontWeight: '700' as const,
    },
    h4: {
      fontSize: 20,
      lineHeight: 1.2,
      fontWeight: '600' as const,
    },
    h5: {
      fontSize: 18,
      lineHeight: 1.2,
      fontWeight: '600' as const,
    },
    h6: {
      fontSize: 16,
      lineHeight: 1.2,
      fontWeight: '600' as const,
    },
  },

  // Alternative property names for compatibility
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  timing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
};

export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  sectionSpacing: spacing.lg,

  bottomNav: {
    height: 72,
    iconSize: 24,
  },

  header: {
    height: 56,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
  layout,
};

export type Theme = typeof theme;

// For backwards compatibility with Phase 4 components
export const tokens = theme;

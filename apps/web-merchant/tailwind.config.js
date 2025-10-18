/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DryJets Brand Colors
        brand: {
          primary: '#0A78FF',
          eco: '#00B7A5',
          warning: '#FFB74D',
          error: '#FF6B6B',
        },
        // Deep Tech Blue (Primary)
        primary: {
          DEFAULT: '#0A78FF',
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CEFF',
          300: '#66B6FF',
          400: '#339DFF',
          500: '#0A78FF',
          600: '#0060CC',
          700: '#004899',
          800: '#003066',
          900: '#001833',
          950: '#000C1A',
          foreground: '#FFFFFF',
        },
        // Fresh Teal (Eco/Efficiency)
        eco: {
          DEFAULT: '#00B7A5',
          50: '#E6F9F7',
          100: '#CCF3EF',
          200: '#99E7DF',
          300: '#66DBCF',
          400: '#33CFBF',
          500: '#00B7A5',
          600: '#009284',
          700: '#006E63',
          800: '#004942',
          900: '#002521',
          950: '#001311',
        },
        // Warm Amber (Warnings)
        warning: {
          DEFAULT: '#FFB74D',
          50: '#FFF5E6',
          100: '#FFEBCC',
          200: '#FFD799',
          300: '#FFC366',
          400: '#FFAF33',
          500: '#FFB74D',
          600: '#CC8F3E',
          700: '#99682E',
          800: '#66451F',
          900: '#33230F',
          950: '#1A1208',
        },
        // Coral Red (Errors/Critical)
        error: {
          DEFAULT: '#FF6B6B',
          50: '#FFE6E6',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#FF6B6B',
          600: '#CC5656',
          700: '#994040',
          800: '#662B2B',
          900: '#331515',
          950: '#1A0B0B',
        },
        // Neutrals
        dark: {
          text: '#0B1B2B',
          muted: '#425466',
          surface: '#F6F8FA',
          deep: '#0F1724',
        },
        // Shadcn/UI compatible colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'lift': '0 4px 12px rgba(10, 120, 255, 0.15)',
        'lift-lg': '0 8px 24px rgba(10, 120, 255, 0.2)',
        'glow': '0 0 20px rgba(10, 120, 255, 0.3)',
        'eco-glow': '0 0 20px rgba(0, 183, 165, 0.3)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0A78FF 0%, #00B7A5 100%)',
        'eco-gradient': 'linear-gradient(135deg, #00B7A5 0%, #33CFBF 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0A78FF 0%, #339DFF 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FFB74D 0%, #FFC366 100%)',
        'error-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FF9999 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        'fast': '120ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

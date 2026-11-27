import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Graphik', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Graphik', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // iLovePDF brand colors extracted from SVG fills and CSS
        primary: {
          DEFAULT: '#EE6C4D',
          container: '#FF7651',
        },
        secondary: '#295795',
        tertiary: '#ab6993',
        quaternary: '#B7A001',
        // Surface colors
        surface: {
          DEFAULT: '#f5f5fa',
          container: '#e8e8ed',
        },
        'on-surface': {
          DEFAULT: '#161616',
          variant: '#47474f',
        },
        // Accent colors from SVG icons
        accent: {
          orange: '#EE6C4D',
          'orange-dark': '#D04526',
          green: '#8FBC5D',
          'green-dark': '#2E7237',
          blue: '#295795',
          'blue-light': '#5F83C6',
          purple: '#ab6993',
          yellow: '#FBEFA8',
          'yellow-dark': '#B7A001',
          gold: '#D6BF2D',
          'red-accent': '#FF7651',
        },
        outline: '#c4c4cc',
        border: '#e8e8ef',
        // Brand red variants (from existing codebase, kept for compatibility)
        'brand-red': '#e5322d',
        'brand-red-container': '#ff6a58',
        'brand-red-50': '#fbeae7',
        'brand-red-100': '#f6d4d0',
      },
      fontSize: {
        display: ['3.75rem', { lineHeight: '4.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['2.625rem', { lineHeight: '3.125rem', fontWeight: '600' }],
        'headline-md': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '600' }],
        'title-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,32,0.06), 0 1px 1px rgba(16,24,32,0.04)',
        'card-hover': '0 8px 24px rgba(16,24,32,0.12), 0 2px 6px rgba(16,24,32,0.06)',
        header: '0 1px 2px rgba(16,24,32,0.05)',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

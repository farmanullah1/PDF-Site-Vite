import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        slab: ['"Roboto Slab"', 'Rockwell', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#F5F5FA',
        ribbon: '#F2E9EC',
        surface: '#FFFFFF',
        border: '#EBEBF0',
        brand: '#E5322D',
        'brand-hover': '#C92420',
        ink: '#33333B',
        slate: '#2B2B33',
        body: '#6E6E7A',
        muted: '#D8D8E0',
        inactive: '#222222',
        premium: '#FFF9EC',
        premiumGold: '#FFB800',
        coral: '#E55B3C',
        green: '#78B833',
        royal: '#3B66B8',
        burnt: '#E55B3C',
        forest: '#2E7D32',
        amber: '#E6A100',
        plum: '#9B518E',
        teal: '#2A6F97',
        navy: '#3B5998',
      },
      fontSize: {
        'display': ['42px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'title-lg': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '1.45', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.45', fontWeight: '400' }],
        'nav-sm': ['13px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '0.04em' }],
        'pill-sm': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      boxShadow: {
        header: '0 2px 6px rgba(0,0,0,0.04)',
        cardHover: '0 10px 24px rgba(25, 25, 40, 0.07)',
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '6px',
        pill: '9999px',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

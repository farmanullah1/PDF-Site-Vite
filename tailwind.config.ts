import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#e5322d',
          container: '#ff6a58',
        },
        surface: {
          DEFAULT: '#f5f5fa',
          container: '#e8e8ed',
        },
        'on-surface': {
          DEFAULT: '#161616',
          variant: '#47474f',
        },
        secondary: '#4a7aab',
        tertiary: '#7253e2',
        outline: '#c4c4cc',
      },
        fontSize: {
        display: ['3.75rem', { lineHeight: '4.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['2.625rem', { lineHeight: '3.125rem', fontWeight: '600' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'title-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }],
        'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,32,0.06), 0 1px 1px rgba(16,24,32,0.04)',
        'card-hover': '0 8px 24px rgba(16,24,32,0.12), 0 2px 6px rgba(16,24,32,0.06)',
        header: '0 1px 2px rgba(16,24,32,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config;

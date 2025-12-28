import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      container: { center: true, padding: '1rem' },
      borderRadius: { '2xl': '1rem' }
    }
  },
  plugins: []
} satisfies Config;

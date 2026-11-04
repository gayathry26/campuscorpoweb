/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
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
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // CampusCorpo Global Typography Scale
        'page-title': ['2.375rem', { lineHeight: '1.18', letterSpacing: '-0.025em', fontWeight: '700' }], // 38px (36–42px)
        'section-title': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }], // 30px (28–32px)
        'module-title': ['1.4375rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '600' }], // 23px (22–24px)
        'card-title': ['1.1875rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }], // 19px (18–20px)
        'body-base': ['1rem', { lineHeight: '1.625', fontWeight: '400' }], // 16px
        'secondary': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        'nav-link': ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }], // 15px (14–15px)
        'form-label': ['0.84375rem', { lineHeight: '1.35', fontWeight: '500' }], // 13.5px (13–14px)
        'metric-stat': ['1.875rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 30px (28–32px)
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 20px 40px -10px rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

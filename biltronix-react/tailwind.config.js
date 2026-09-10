/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Professional neutral palette
        'glass-bg': '#f8fafc',
        'glass-surface': 'rgba(255, 255, 255, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.5)',
        'glass-shadow': 'rgba(0, 0, 0, 0.08)',
        
        // Primary - Uniform Luxury Navy
        'primary': '#001F3F',
        'primary-light': '#001F3F',
        'primary-50': '#001F3F',
        'primary-100': '#001F3F',
        'primary-200': '#001F3F',
        'primary-300': '#001F3F',
        'primary-400': '#001F3F',
        'primary-500': '#001F3F',
        'primary-600': '#001F3F',
        'primary-700': '#001F3F',
        'primary-800': '#001F3F',
        'primary-900': '#001F3F',
        
        // Slate neutrals
        'slate-50': '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-400': '#94a3b8',
        'slate-500': '#64748b',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
        
        // Semantic colors
        'success': '#10b981',
        'success-light': '#d1fae5',
        'warning': '#f59e0b',
        'warning-light': '#fef3c7',
        'error': '#ef4444',
        'error-light': '#fee2e2',
        
        // Text colors
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',

        // Luxury brand tokens (navy + gold)
        'brand-navy': '#001F3F',
        'brand-navy-deep': '#001326',
        'brand-bone': '#f5f5f0',
        'brand-copper': '#cfa78a',
        'brand-copper-light': '#e0c3a7',
        'brand-copper-dark': '#b3876a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
        luxury: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.1)',
        'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.12)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'float': '0 4px 16px rgba(10, 31, 77, 0.18)',
      },
      borderRadius: {
        'glass': '16px',
        'glass-lg': '24px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        luxLine: {
          '0%': { transform: 'translateX(0)', opacity: '0' },
          '6%': { opacity: '1' },
          '94%': { opacity: '0.8' },
          '100%': { transform: 'translateX(-155vw)', opacity: '0' },
        },
        luxGoldShimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '300% center' },
        },
        luxBeamPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        luxGroundPulse: {
          '0%, 100%': { transform: 'scaleX(0.88)', opacity: '0.7' },
          '50%': { transform: 'scaleX(1.12)', opacity: '1' },
        },
        luxSlideIn: {
          '0%': { transform: 'translateX(115%)', opacity: '0' },
          '55%': { transform: 'translateX(-2.5%)', opacity: '1' },
          '78%': { transform: 'translateX(1.2%)' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        luxFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-13px)' },
        },
        luxScrollBounce: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.35' },
          '50%': { transform: 'translateY(9px)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

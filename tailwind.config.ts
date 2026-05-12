import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1180px',
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          soft: '#1f2937',
          muted: '#5a6b7a',
        },
        brand: {
          50: '#eef9fb',
          100: '#d4f0f4',
          200: '#a9e2ea',
          300: '#7cd1de',
          400: '#5DD4D4',
          500: '#088395',
          600: '#0a4d68',
          700: '#073b50',
          800: '#053b53',
          900: '#02283a',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f7f9fb',
          mid: '#eef5f7',
          edge: '#e4ebf0',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'Cairo', 'Tajawal', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      fontSize: {
        '3xs': '0.625rem',
        '2xs': '0.7rem',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(8, 18, 30, 0.04), 0 8px 20px rgba(8, 18, 30, 0.06)',
        lift: '0 4px 8px rgba(8, 18, 30, 0.06), 0 22px 44px rgba(8, 18, 30, 0.14)',
        glow: '0 12px 30px rgba(8, 131, 149, 0.30)',
        ring: '0 0 0 1px rgba(8, 131, 149, 0.12)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #02283a 0%, #0a4d68 45%, #088395 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #088395 0%, #0a4d68 100%)',
        'gradient-ring': 'conic-gradient(from 200deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(93,212,212,.55) 60deg, rgba(255,255,255,0) 130deg, rgba(93,212,212,.45) 240deg, rgba(255,255,255,0) 320deg)',
      },
      animation: {
        'float-a': 'floatA 14s ease-in-out infinite',
        'float-b': 'floatB 18s ease-in-out infinite',
        'float-c': 'floatC 22s ease-in-out infinite',
        'doctor-float': 'doctorFloat 8s ease-in-out infinite',
        'ring-spin': 'ringSpin 18s linear infinite',
        'shimmer': 'shimmer 2.4s ease-in-out infinite',
      },
      keyframes: {
        floatA: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-20px, 28px, 0)' },
        },
        floatB: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(24px, -22px, 0)' },
        },
        floatC: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(16px, -14px, 0) scale(1.06)' },
        },
        doctorFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ringSpin: {
          to: { transform: 'rotate(1turn)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

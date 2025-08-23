/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/App.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jumanji Arcade Theme Colors
        jumanji: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Deep Black/Charcoal (Dark Mode)
        void: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          1000: '#000000',
        },
        // Light Mode Colors
        light: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfd',
          300: '#fafafa',
          400: '#f5f5f5',
          500: '#e5e5e5',
          600: '#d4d4d4',
          700: '#a3a3a3',
          800: '#737373',
          900: '#525252',
          950: '#404040',
          1000: '#ffffff',
        },
        // Bold Golden Yellow
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          // Custom bright gold
          bright: '#FFD700',
          neon: '#FFED4E',
        },
        // Vibrant Neon Purple
        neon: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          // Custom neon purple
          bright: '#9D4EDD',
          glow: '#B75CFF',
        },
        // Accent colors
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        'jumanji': ['Cinzel', 'serif'],
        'arcade': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'jumanji-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23FFD700\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'dice-pattern': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%239D4EDD\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z\"/%3E%3C/g%3E%3C/svg%3E')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #9D4EDD, 0 0 10px #9D4EDD, 0 0 15px #9D4EDD',
          },
          '100%': { 
            boxShadow: '0 0 10px #9D4EDD, 0 0 20px #9D4EDD, 0 0 30px #9D4EDD',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'jumanji': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'jumanji-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'neon': '0 0 5px #9D4EDD, 0 0 10px #9D4EDD, 0 0 15px #9D4EDD',
        'neon-lg': '0 0 10px #9D4EDD, 0 0 20px #9D4EDD, 0 0 30px #9D4EDD',
        'gold': '0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700',
        'gold-lg': '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
      },
      textShadow: {
        'neon': '0 0 5px #9D4EDD, 0 0 10px #9D4EDD',
        'gold': '0 0 5px #FFD700, 0 0 10px #FFD700',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

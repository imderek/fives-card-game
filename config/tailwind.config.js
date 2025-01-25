const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'selector',
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}',
    './node_modules/flowbite/**/*.js',
    './app/javascript/components/**/*.jsx'
  ],
  theme: {
    extend: {
      keyframes: {
        'card-enter': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'enter-scale': {
          '0%': { opacity: '0', transform: 'scale(60%)' },
          '100%': { opacity: '1', transform: 'scale(100%)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        'scale-up': {
          '0%': { transform: 'scale(1.0)' },
          '50%': { transform: 'scale(1.07)' },
          '100%': { transform: 'scale(1.0)' }
        },
        'float-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(0px) translateX(0px)',
          },
          '10%': { 
            opacity: '0.8',
            transform: 'translateY(-10px) translateX(calc(var(--x-drift) * 0.1))',
          },
          '60%': { 
            opacity: '0',
            transform: 'translateY(-39px) translateX(var(--x-drift))',
          },
          '100%': { 
            opacity: '0',
            transform: 'translateY(-39px) translateX(var(--x-drift))',
          }
        },
        'twinkle': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1)',
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(0)',
          }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'card-enter': 'card-enter 500ms ease-out forwards',
        'enter-scale': 'enter-scale 200ms ease-out forwards',
        'shimmer': 'shimmer 4s linear infinite',
        'scale-up': 'scale-up 200ms ease-out forwards',
        'particle-float': 'float-up 3s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'fade-in': 'fade-in 300ms ease-out forwards'
      },
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['B612 Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: {
          50: colors.emerald[50],
          100: colors.emerald[100],
          200: colors.emerald[200],
          300: colors.emerald[300],
          400: colors.emerald[400],
          500: colors.emerald[500],
          600: colors.emerald[600],
          700: colors.emerald[700],
          800: colors.emerald[800],
          900: colors.emerald[900],
          950: colors.emerald[950],
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require('flowbite/plugin')({
        charts: true,
    }),
  ]
}

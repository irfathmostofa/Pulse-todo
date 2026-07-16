/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
          surface: 'rgb(var(--color-ink-surface) / <alpha-value>)',
          line: 'rgb(var(--color-ink-line) / <alpha-value>)'
        },
        pulse: {
          DEFAULT: '#FF5D73',
          soft: '#FF8A9A'
        },
        volt: {
          DEFAULT: '#C98A00',
          soft: '#F2B807'
        },
        mint: {
          DEFAULT: '#20B387',
          soft: '#4FE3B0'
        },
        ghost: {
          DEFAULT: 'rgb(var(--color-ghost) / <alpha-value>)',
          muted: 'rgb(var(--color-ghost-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ghost-faint) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      fontWeight: {
        600: '600',
        700: '700',
        800: '800'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,93,115,0.25), 0 8px 30px -8px rgba(255,93,115,0.35)',
        card: '0 1px 0 rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.6)'
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' }
        },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        pulseRing: 'pulseRing 2.4s ease-in-out infinite',
        floatIn: 'floatIn 0.35s ease-out',
        slideUp: 'slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        fadeIn: 'fadeIn 0.2s ease-out'
      }
    }
  },
  plugins: []
}

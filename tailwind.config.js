/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'oklch(1 0 0)',
        surface: 'oklch(0.985 0 0)',
        border: 'oklch(0.88 0 0)',
        ink: 'oklch(0.18 0 0)',
        muted: 'oklch(0.5 0 0)',
        accent: 'oklch(0.45 0.06 240)',
      },
      fontFamily: {
        display: ['General Sans', 'sans-serif'],
        body: ['General Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        headline: ['1.25rem', { lineHeight: '1.3' }],
        title: ['1rem', { lineHeight: '1.3' }],
        body: ['1rem', { lineHeight: '1.6' }],
        label: ['0.7rem', { lineHeight: '1.4', letterSpacing: '0.03em', fontWeight: '500' }],
        caption: ['0.7rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
      },
      zIndex: {
        modal: '40',
        toast: '50',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}

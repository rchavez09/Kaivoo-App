/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sand: '#FAF8F5',
        navy: '#1A1F2E',
        teal: '#3B8C8C',
        'teal-hover': '#327878',
        storm: '#4A5E78',
        sage: '#6B8F7A',
        dusk: '#C4A08A',
        ember: '#C75C3A',
        lavender: '#9B8EB0',
        amber: '#D4A952',
        ocean: {
          foam: '#D4EDE4',
          shallow: '#7EC8C8',
          surface: '#3B8C8C',
          mid: '#2B6E8A',
          deep: '#1E4D7A',
          twilight: '#1E3364',
          abyss: '#2A1B4E',
          trench: '#1A1232',
        },
        abyss: {
          canvas: '#12101E',
          card: '#1A1832',
          elevated: '#232040',
          overlay: '#2D294E',
        },
      },
      fontFamily: {
        brand: ['"Neue Haas Grotesk Display Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-mobile': ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'headline': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'headline-mobile': ['1.75rem', { lineHeight: '1.25' }],
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
};

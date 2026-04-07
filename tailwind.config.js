/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/**/*.html',
    'src/**/*.ts',
    'project/**/*.html',
    'project/**/*.ts',
    'library/**/*.html',
    'library/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Disable Tailwind's base reset to avoid conflicts with Angular Material & Bootstrap
  corePlugins: {
    preflight: false,
  },
}

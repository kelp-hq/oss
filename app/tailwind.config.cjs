/** @type {import('tailwindcss').Config} */ module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {},
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  logs: false,
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
    // darkTheme: 'macula',
    themes: ['dark']
  }
};

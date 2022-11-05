/** @type {import('tailwindcss').Config} */ module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {},
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
    // darkTheme: 'macula',
    themes: ['dark']
  }
};

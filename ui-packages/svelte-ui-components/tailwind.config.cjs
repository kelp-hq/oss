/** @type {import('tailwindcss').Config} */ module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { container: { center: true } },
  // plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('daisyui')], // this messes up daisyui. for example it adds the ✅ to the checkox
  plugins: [require('daisyui')],
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

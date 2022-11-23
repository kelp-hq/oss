module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' ? null : require('postcss-import'),
    require('postcss-nested'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer')
  ]
};

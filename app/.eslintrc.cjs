module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // add the TypeScript parser

  extends: [
    'eslint:recommended',
    'prettier'
    // 'plugin:@typescript-eslint/recommended' // breaks the stuff for svelte
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  plugins: [
    'svelte3',
    'unused-imports',
    'simple-import-sort',
    '@typescript-eslint' // add the TypeScript plugin
  ],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],

  rules: {
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'unused-imports/no-unused-imports': 'error',
    'css-unused-selector': 'off',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  },
  settings: {
    // 'svelte3/typescript': function () {
    //   return require('typescript');
    // }
    'svelte3/typescript': true // load TypeScript as peer dependency
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
    es6: true
  }
};

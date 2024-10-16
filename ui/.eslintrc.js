const path = require("path");

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.join(__dirname, 'tsconfig.json')],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    // allow any
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'prefer-rest-params': 'off',
    // pass function
    '@typescript-eslint/unbound-method': 'off',
  },
};

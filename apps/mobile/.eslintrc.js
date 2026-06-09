module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
  },
};

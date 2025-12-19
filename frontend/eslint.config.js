import vuetify from 'eslint-config-vuetify'

export default vuetify({
  rules: {
    // No semicolons allowed
    'semi': ['error', 'never'],
    'no-extra-semi': 'error',

    // Always require trailing commas
    'comma-dangle': ['error', 'always-multiline'],

    // Unused variables and functions
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-unused-expressions': 'error',

    // Code quality
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    // Formatting
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
  },
})

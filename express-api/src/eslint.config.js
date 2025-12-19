export default [
  {
    ignores: [
      'node_modules/',
      '*.log',
      '.env',
      '.env.local',
      '.env.*.local',
      'dist/',
      'build/',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
      },
    },
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
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
    },
  },
]

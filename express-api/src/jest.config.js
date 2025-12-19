/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Use ts-jest's ESM preset for TypeScript + ES modules support
  preset: 'ts-jest/presets/default-esm',

  // Run tests in Node.js environment (not browser/jsdom)
  testEnvironment: 'node',

  // Treat .ts files as ES modules (required for ESM support)
  extensionsToTreatAsEsm: ['.ts'],

  // Rewrite import paths for Jest's module resolution
  moduleNameMapper: {
    // Strip .js extension from relative imports (ESM requires .js but source is .ts)
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Map Node.js subpath imports (#alias/path.js) to actual source paths
    // Example: #common/services/redis.js → <rootDir>/src/common/services/redis
    '^#([^/]+)/(.*)\\.js$': '<rootDir>/src/$1/$2',
  },

  // Configure ts-jest to transpile TypeScript files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // Enable ES module output from ts-jest
        useESM: true,
      },
    ],
  },

  // Pattern to find test files (any file ending in .test.ts)
  testMatch: ['**/*.test.ts'],

  // Files to include in coverage reports (exclude test files themselves)
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],

  // Output directory for coverage reports
  coverageDirectory: 'coverage',

  // Show individual test results in output
  verbose: true,
}

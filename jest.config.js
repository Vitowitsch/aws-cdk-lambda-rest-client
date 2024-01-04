/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'], // Only run files ending with .test.ts
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**",
    "!**/lib/**", "!**/bin/**"],
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

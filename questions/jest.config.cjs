/** @type {import('ts-jest').JestConfigWithTsJest} **/

const testEnvironment =  "node";
const transform = { "^.+.tsx?$": ["ts-jest",{}] }

module.exports = {
    preset: 'ts-jest',  // Usa el preset ts-jest
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',  // Usa tu archivo tsconfig.json
      },
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
      "src/**/*.{js,ts}",
      "services/**/*.{js,ts}",
      "!**/node_modules/**",
      "!**/test/**",
      "!**/__tests__/**"
    ],
  };


module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).js'],
  collectCoverage: true,
  collectCoverageFrom: ['gateway-service.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

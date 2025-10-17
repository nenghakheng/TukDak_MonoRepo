module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Match all test files under __tests__ ending with .test.ts
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/repositories/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/scripts/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
};

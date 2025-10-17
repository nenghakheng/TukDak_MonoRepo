// Jest types
import 'jest';

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Add fail function for better test assertions
global.fail = (message?: string) => {
  throw new Error(message || 'Test failed');
};

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
};

// Extend Jest expect for custom error testing
expect.extend({
  toBeValidationError(received, expectedMessage) {
    const pass = received instanceof Error && 
                 received.constructor.name === 'ValidationError' &&
                 received.message === expectedMessage;
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be ValidationError with message "${expectedMessage}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be ValidationError with message "${expectedMessage}"`,
        pass: false,
      };
    }
  },
});
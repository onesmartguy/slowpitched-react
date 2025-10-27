module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/shared'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/utils/src/$1',
    '^@components/(.*)$': '<rootDir>/apps/mobile/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/apps/mobile/src/screens/$1',
    '^@utils/(.*)$': '<rootDir>/apps/mobile/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/apps/mobile/src/types/$1',
    '^@hooks/(.*)$': '<rootDir>/apps/mobile/src/hooks/$1',
    '^@store/(.*)$': '<rootDir>/apps/mobile/src/store/$1',
  },
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/dist/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

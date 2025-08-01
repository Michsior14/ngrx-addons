export default {
  displayName: 'persist-state',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/persist-state',
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/**/+(*.)+(spec|feature.module|root.module).ts',
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 80,
      lines: 85,
    },
  },
};

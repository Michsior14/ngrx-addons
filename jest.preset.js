const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  clearMocks: true,
  restoreMocks: true,
};

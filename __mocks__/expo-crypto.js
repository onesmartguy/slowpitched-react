/**
 * Mock for expo-crypto module
 * Used in tests to avoid requiring the actual Expo native module
 */

module.exports = {
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
    SHA1: 'SHA1',
    SHA512: 'SHA512',
    MD5: 'MD5',
  },
};

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Support monorepo structure
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
};

module.exports = config;

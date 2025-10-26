// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .bin weights are bundled by Metro
config.resolver.assetExts.push('bin');

module.exports = config;
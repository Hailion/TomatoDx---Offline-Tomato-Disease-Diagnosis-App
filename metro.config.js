// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .bin files (TensorFlow.js model weights)
config.resolver.assetExts.push('bin');

// Optionally add other asset extensions if needed
// config.resolver.assetExts.push('tflite', 'pb');

module.exports = config;

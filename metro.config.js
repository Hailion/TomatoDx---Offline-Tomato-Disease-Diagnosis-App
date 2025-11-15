// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .bin files (TensorFlow.js model weights)
config.resolver.assetExts.push('bin');

// Optionally add other asset extensions if needed
// config.resolver.assetExts.push('tflite', 'pb');

// Optimize Metro bundler for smaller bundle size
config.transformer = {
  ...config.transformer,
  // Enable minification in production
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    // Terser options for better minification
    ecma: 8,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    mangle: {
      module: true,
      keep_classnames: false,
      keep_fnames: false,
    },
    compress: {
      // Aggressive compression
      passes: 3,
      drop_console: true, // Remove console.log in production
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      dead_code: true,
      unused: true,
    },
  },
};

// Optimize resolver for tree shaking
config.resolver = {
  ...config.resolver,
  // Enable tree shaking
  unstable_enablePackageExports: true,
};

module.exports = config;

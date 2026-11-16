// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build ships a .wasm file. Only needed for the web preview.
config.resolver.assetExts.push('wasm');

module.exports = config;

/**
 * Dynamic Expo config on top of app.json.
 *
 * EXPO_BASE_URL: sub-path the web app is served from.
 *   GitHub Pages project site → "/<repository-name>" (set by the deploy workflow)
 *   Local preview / own domain → "" (default)
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? '',
  },
});

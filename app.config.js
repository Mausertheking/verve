/**
 * Dynamic layer over app.json.
 *
 * experiments.baseUrl is for the GitHub Pages web build only (served under
 * /verve). It must NOT reach native builds: it also prefixes native asset
 * paths with "verve/", and inside "Verve.app" that folder collides with the
 * app's executable "Verve" on case-insensitive build machines, failing the
 * iOS build with ENOTDIR. So it is set only when exporting for the web:
 *
 *   EXPO_WEB_BASE_URL=/verve npx expo export -p web
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_WEB_BASE_URL ? { baseUrl: process.env.EXPO_WEB_BASE_URL } : {}),
  },
});

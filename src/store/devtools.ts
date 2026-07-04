/**
 * Redux DevTools Debug Utilities
 *
 * Helper functions for debugging RTK Query and Redux state.
 * Redux DevTools Extension integration is built-in via configureStore.
 *
 * Install browser extension:
 * - Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmjabgkhbjedaepkggjblnlklplomlad
 * - Firefox: https://addons.mozilla.org/firefox/addon/reduxdevtools/
 */

declare const __DEV__: boolean;

/**
 * Debug helper to log messages with timestamps.
 * Useful for console debugging during development.
 */
export function debugLog(label: string, data?: unknown) {
  if (!__DEV__) return;

  const timestamp = new Date().toISOString().split('T')[1]; // HH:MM:SS.mmm
  console.debug(`[${label}] ${timestamp}`, data);
}

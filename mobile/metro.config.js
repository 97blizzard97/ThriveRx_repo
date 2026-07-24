const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prefer Node watchers on Windows; Watchman is often absent/unreliable here.
config.watcher = {
  ...config.watcher,
  useWatchman: false,
};

config.resolver.unstable_enableSymlinks = true;

module.exports = config;

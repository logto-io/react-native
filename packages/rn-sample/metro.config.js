/**
 * @fileoverview https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
 */

const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
// eslint-disable-next-line @silverhand/fp/no-mutation
config.watchFolders = [monorepoRoot];
// 2. Let Metro know where to resolve packages and in what order
// eslint-disable-next-line @silverhand/fp/no-mutation
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;

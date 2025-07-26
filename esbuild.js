// esbuild.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/extension.ts'], // Your main extension file
  bundle: true, // Crucial: bundles all dependencies
  outfile: 'out/extension.js', // Output file
  external: ['vscode'], // Don't bundle the 'vscode' module, it's provided by VS Code
  format: 'cjs', // CommonJS format for Node.js environment
  platform: 'node', // Target Node.js environment
  sourcemap: true, // Generate sourcemaps for debugging
  // You might need to add this if you have other native modules or specific requirements
  // plugins: [
  //   // Add plugins here if needed, e.g., for handling native modules
  // ]
}).catch(() => process.exit(1));

// If you also have a webview JS file that needs bundling
esbuild.build({
  entryPoints: ['src/getWebviewContent.ts'], // Your webview content file
  bundle: true,
  outfile: 'out/getWebviewContent.js', // Output file for webview
  format: 'esm', // Or 'iife' if you prefer, for browser environment
  platform: 'browser', // Target browser environment
  sourcemap: true,
}).catch(() => process.exit(1));
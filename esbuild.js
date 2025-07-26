
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true, 
  outfile: 'out/extension.js', 
  external: ['vscode'], 
  format: 'cjs', 
  platform: 'node', 
  sourcemap: true, 
  
}).catch(() => process.exit(1));


esbuild.build({
  entryPoints: ['src/getWebviewContent.ts'],
  bundle: true,
  outfile: 'out/getWebviewContent.js', 
  format: 'esm', 
  platform: 'browser', 
  sourcemap: true,
}).catch(() => process.exit(1));
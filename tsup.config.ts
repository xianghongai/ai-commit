import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  sourcemap: true,
  external: ['vscode'],
  noExternal: ['@google/generative-ai', 'fs-extra', 'openai', 'simple-git'],
  outDir: 'dist',
  clean: !options.watch,
  minify: options.minify ?? false,
  treeshake: true,
}));

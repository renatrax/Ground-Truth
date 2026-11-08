// Copies Pyodide's runtime files from node_modules into public/pyodide/ so the
// game always loads Python from its own origin (never a CDN). Runs before
// `pnpm dev` and `pnpm build`; Vite then copies public/ into dist/.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

export const PYODIDE_FILES = [
  'pyodide.mjs',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
] as const;

const require = createRequire(import.meta.url);
const srcDir = dirname(require.resolve('pyodide/package.json'));
const outDir = resolve(import.meta.dirname, '..', 'public', 'pyodide');
const version = (JSON.parse(readFileSync(join(srcDir, 'package.json'), 'utf8')) as { version: string })
  .version;

mkdirSync(outDir, { recursive: true });
let copied = 0;
for (const file of PYODIDE_FILES) {
  const from = join(srcDir, file);
  const to = join(outDir, file);
  if (!existsSync(from)) {
    throw new Error(`Pyodide file missing from node_modules: ${file}`);
  }
  // Skip files that are already up to date.
  if (
    existsSync(to) &&
    statSync(to).size === statSync(from).size &&
    statSync(to).mtimeMs >= statSync(from).mtimeMs
  ) {
    continue;
  }
  copyFileSync(from, to);
  copied++;
}
console.log(`pyodide ${version}: ${copied} file(s) copied to public/pyodide/`);

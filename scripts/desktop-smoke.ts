// Starts the built desktop app with GT_SMOKE=1 and waits for it to report
// whether Python loaded and answered 2 + 2. Usage:
//   pnpm desktop:smoke [path/to/binary]
// Defaults to the release binary from `pnpm desktop:build --no-bundle`.
// On Linux without a display, run it under `xvfb-run`.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const exe = process.platform === 'win32' ? 'ground-truth.exe' : 'ground-truth';
const bin = resolve(
  process.argv[2] ?? resolve(import.meta.dirname, '..', 'src-tauri', 'target', 'release', exe),
);
if (!existsSync(bin)) {
  console.error(`Desktop binary not found: ${bin}\nBuild it first: pnpm desktop:build --no-bundle`);
  process.exit(2);
}

const TIMEOUT_MS = 90_000;
const child = spawn(bin, [], {
  env: { ...process.env, GT_SMOKE: '1' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
let out = '';
child.stdout.on('data', (d: Buffer) => {
  out += d.toString();
  process.stdout.write(d);
});
const timer = setTimeout(() => {
  console.error(`\nTimed out after ${TIMEOUT_MS / 1000}s waiting for the smoke report.`);
  child.kill();
  process.exit(1);
}, TIMEOUT_MS);
child.on('exit', (code) => {
  clearTimeout(timer);
  const passed = code === 0 && out.includes('GT_SMOKE PASS');
  console.log(passed ? 'Desktop smoke test passed.' : `Desktop smoke test failed (exit ${code}).`);
  process.exit(passed ? 0 : 1);
});

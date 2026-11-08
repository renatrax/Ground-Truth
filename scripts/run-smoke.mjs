// Runs the desktop smoke test, wrapping it in xvfb-run on Linux when there is no display.
import { spawnSync } from 'node:child_process';

const headlessLinux = process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY;
const [cmd, args] = headlessLinux
  ? ['xvfb-run', ['-a', 'pnpm', 'desktop:smoke']]
  : ['pnpm', ['desktop:smoke']];
const r = spawnSync(cmd, args, { stdio: 'inherit' });
process.exit(r.status ?? 1);

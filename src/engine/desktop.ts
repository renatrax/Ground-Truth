// Bridge to the desktop shell (src-tauri). Everything here is a no-op when
// the frontend runs in a plain browser (dev server, Playwright).
import { invoke, isTauri } from '@tauri-apps/api/core';

/** True when the app was started with GT_SMOKE=1 (startup smoke test). */
export async function isSmokeRun(): Promise<boolean> {
  if (!isTauri()) return false;
  return invoke<boolean>('smoke_mode');
}

/** Reports the smoke result; the desktop app prints it and exits. */
export async function reportSmoke(ok: boolean, detail: string): Promise<void> {
  if (!isTauri()) return;
  await invoke('smoke_report', { ok, detail });
}

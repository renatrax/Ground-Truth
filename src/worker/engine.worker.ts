/// <reference lib="webworker" />
// The engine worker: the only place player code will ever run.
// M0: load Pyodide from our own origin and answer simple eval requests.
import type { PyodideInterface } from 'pyodide';
import type { MainToWorker, WorkerToMain } from '../engine/protocol';

declare const self: DedicatedWorkerGlobalScope;

let pyodide: PyodideInterface | null = null;

function post(msg: WorkerToMain): void {
  self.postMessage(msg);
}

async function init(pyodideBase: string): Promise<void> {
  try {
    post({ type: 'progress', stage: 'Downloading Python…' });
    // Load the loader itself from the self-hosted folder so its version always
    // matches the wasm/stdlib next to it. Never from a CDN.
    const mod = (await import(/* @vite-ignore */ `${pyodideBase}pyodide.mjs`)) as {
      loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>;
    };
    post({ type: 'progress', stage: 'Starting Python…' });
    pyodide = await mod.loadPyodide({ indexURL: pyodideBase });
    const version = String(pyodide.runPython('import sys; sys.version.split()[0]'));
    post({ type: 'ready', pythonVersion: version });
  } catch (err) {
    post({ type: 'initFailed', reason: err instanceof Error ? err.message : String(err) });
  }
}

self.onmessage = (e: MessageEvent<MainToWorker>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'init':
      void init(msg.pyodideBase);
      break;
    case 'eval': {
      if (!pyodide) {
        post({ type: 'evalResult', id: msg.id, ok: false, error: 'Python is not ready yet.' });
        return;
      }
      try {
        const value: unknown = pyodide.runPython(msg.code);
        post({ type: 'evalResult', id: msg.id, ok: true, value: String(value) });
      } catch (err) {
        post({ type: 'evalResult', id: msg.id, ok: false, error: err instanceof Error ? err.message : String(err) });
      }
      break;
    }
  }
};

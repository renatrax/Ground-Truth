// Main-thread side of the engine worker. M1 adds the watchdog and snapshot restore.
import type { MainToWorker, WorkerToMain } from './protocol';
import { pyodideBaseUrl } from './pyodideBase';

export type EngineStatus =
  | { kind: 'loading'; stage: string }
  | { kind: 'ready'; pythonVersion: string }
  | { kind: 'failed'; reason: string };

export class EngineClient {
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: string) => void; reject: (e: Error) => void }>();

  constructor(private onStatus: (s: EngineStatus) => void) {
    this.worker = new Worker(new URL('../worker/engine.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<WorkerToMain>) => this.handle(e.data);
    this.worker.onerror = (e) =>
      this.onStatus({ kind: 'failed', reason: e.message || 'The engine worker crashed.' });
    this.send({ type: 'init', pyodideBase: pyodideBaseUrl(import.meta.env.BASE_URL, location.href) });
  }

  eval(code: string): Promise<string> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.send({ type: 'eval', id, code });
    });
  }

  dispose(): void {
    this.worker.terminate();
    for (const p of this.pending.values()) p.reject(new Error('Engine stopped.'));
    this.pending.clear();
  }

  private send(msg: MainToWorker): void {
    this.worker.postMessage(msg);
  }

  private handle(msg: WorkerToMain): void {
    switch (msg.type) {
      case 'progress':
        this.onStatus({ kind: 'loading', stage: msg.stage });
        break;
      case 'ready':
        this.onStatus({ kind: 'ready', pythonVersion: msg.pythonVersion });
        break;
      case 'initFailed':
        this.onStatus({ kind: 'failed', reason: msg.reason });
        break;
      case 'evalResult': {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        if (msg.ok) p.resolve(msg.value);
        else p.reject(new Error(msg.error));
        break;
      }
    }
  }
}

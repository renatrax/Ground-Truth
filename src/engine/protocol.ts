// Messages between the main thread and the engine worker.
// M0 only has the handshake; later milestones add setFiles, runDay, etc.
// (see docs/02-architecture.md).

export type MainToWorker = { type: 'init'; pyodideBase: string } | { type: 'eval'; id: number; code: string };

export type WorkerToMain =
  | { type: 'progress'; stage: string }
  | { type: 'ready'; pythonVersion: string }
  | { type: 'initFailed'; reason: string }
  | { type: 'evalResult'; id: number; ok: true; value: string }
  | { type: 'evalResult'; id: number; ok: false; error: string };

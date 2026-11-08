import { useEffect, useState } from 'react';
import { isSmokeRun, reportSmoke } from '../engine/desktop';
import { EngineClient, type EngineStatus } from '../engine/workerClient';

/** Starts the engine worker once and runs the M0 check (2 + 2). */
export function useEngine(): { status: EngineStatus; smoke: string | null } {
  const [status, setStatus] = useState<EngineStatus>({ kind: 'loading', stage: 'Starting engine…' });
  const [smoke, setSmoke] = useState<string | null>(null);

  useEffect(() => {
    const smokeRun = isSmokeRun().catch(() => false);
    const report = (ok: boolean, detail: string) =>
      void smokeRun.then((on) => (on ? reportSmoke(ok, detail) : undefined));

    const client = new EngineClient((s) => {
      setStatus(s);
      if (s.kind === 'failed') report(false, `python failed to load: ${s.reason}`);
      if (s.kind === 'ready') {
        client.eval('2 + 2').then(
          (value) => {
            setSmoke(value);
            report(value === '4', `python ${s.pythonVersion}: 2 + 2 = ${value}`);
          },
          (e: Error) => {
            setSmoke(`error: ${e.message}`);
            report(false, `eval failed: ${e.message}`);
          },
        );
      }
    });
    return () => client.dispose();
  }, []);

  return { status, smoke };
}

import { useEffect, useState } from 'react';
import { EngineClient, type EngineStatus } from '../engine/workerClient';

/** Starts the engine worker once and runs the M0 smoke check (2 + 2). */
export function useEngine(): { status: EngineStatus; smoke: string | null } {
  const [status, setStatus] = useState<EngineStatus>({ kind: 'loading', stage: 'Starting engine…' });
  const [smoke, setSmoke] = useState<string | null>(null);

  useEffect(() => {
    const client = new EngineClient((s) => {
      setStatus(s);
      if (s.kind === 'ready') {
        client.eval('2 + 2').then(setSmoke, (e: Error) => setSmoke(`error: ${e.message}`));
      }
    });
    return () => client.dispose();
  }, []);

  return { status, smoke };
}

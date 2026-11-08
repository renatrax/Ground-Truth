import { useEngine } from './useEngine';

const TABS = ['Code', 'Tools', 'Syntax', 'Mentor', 'Journal'] as const;

export function App() {
  const { status, smoke } = useEngine();

  return (
    <div className="layout">
      <header className="header">
        <h1 className="title">Ground Truth</h1>
        <div className="stats">
          <Stat label="Day" value="—" />
          <Stat label="Houses" value="—" />
          <Stat label="Happy" value="—" />
          <Stat label="Coins" value="—" />
        </div>
      </header>

      <main className="town" aria-label="Town">
        <p className="placeholder">The town will appear here.</p>
      </main>

      <aside className="panel">
        <section className="ticket">
          <h2>Ticket</h2>
          <p className="placeholder">No mission yet.</p>
        </section>
        <nav className="tabs" role="tablist">
          {TABS.map((t, i) => (
            <button key={t} role="tab" aria-selected={i === 0} className="tab" disabled={i !== 0}>
              {t}
            </button>
          ))}
        </nav>
        <section className="tab-body">
          <p className="placeholder">The editor arrives in M2.</p>
        </section>
        <section className="console" aria-label="Console">
          <EngineLine status={status} smoke={smoke} />
        </section>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function EngineLine({ status, smoke }: { status: ReturnType<typeof useEngine>['status']; smoke: string | null }) {
  if (status.kind === 'failed') {
    return (
      <p className="log log-error" data-testid="engine-status">
        Python couldn't load: {status.reason}
      </p>
    );
  }
  if (status.kind === 'loading') {
    return (
      <p className="log" data-testid="engine-status">
        {status.stage}
      </p>
    );
  }
  return (
    <p className="log log-ok" data-testid="engine-status">
      Python {status.pythonVersion} ready{smoke !== null ? ` · 2 + 2 = ${smoke}` : ''}
    </p>
  );
}

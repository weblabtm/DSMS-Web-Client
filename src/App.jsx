import { useEffect, useState } from 'react'
import { useRuntimeConfig } from './shared/hooks/use-runtime-config.js'
import { dsmsApi } from './shared/api/dsms-api.js'
import './App.css'

function App() {
  const { config, error, refresh, status } = useRuntimeConfig()
  const [health, setHealth] = useState({ status: 'loading', message: 'Checking backend...' })
  const [lastCheckedAt, setLastCheckedAt] = useState(null)

  useEffect(() => {
    let active = true

    const checkHealth = async () => {
      setHealth({ status: 'loading', message: 'Checking backend...' })

      try {
        const payload = await dsmsApi.getHealth()

        if (active) {
          setHealth({
            status: payload?.status ?? 'ok',
            message: payload?.message ?? 'Backend is reachable',
          })
          setLastCheckedAt(new Date().toLocaleTimeString())
        }
      } catch (checkError) {
        if (active) {
          setHealth({
            status: 'error',
            message: checkError instanceof Error ? checkError.message : String(checkError),
          })
          setLastCheckedAt(new Date().toLocaleTimeString())
        }
      }
    }

    if (status !== 'loading') {
      checkHealth()
    }

    return () => {
      active = false
    }
  }, [status, config.hostname])

  const handleRefresh = async () => {
    await refresh()
  }

  const apiBaseLabel = config.apiBaseUrl.replace(/^https?:\/\//, '')
  const tenantLabel = config.tenantSlug ?? 'global host'

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">DSMS Web Client</span>
          <h1>Production-ready client infrastructure, wired to the server contract.</h1>
          <p className="hero-text">
            This shell loads runtime tenant config from <code>/config</code>, checks backend health,
            and keeps the client ready for subdomain-based deployment when you add a real domain.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={handleRefresh}>
              Refresh runtime config
            </button>
            <a className="secondary-button" href="#infrastructure">
              View infrastructure
            </a>
          </div>
        </div>

        <div className="status-panel">
          <div className={`status-chip status-${status}`}>
            {status === 'loading' ? 'Bootstrapping' : status === 'ready' ? 'Connected' : 'Fallback mode'}
          </div>
          <dl className="status-grid">
            <div>
              <dt>Host</dt>
              <dd>{config.host}</dd>
            </div>
            <div>
              <dt>Hostname</dt>
              <dd>{config.hostname}</dd>
            </div>
            <div>
              <dt>Tenant</dt>
              <dd>{tenantLabel}</dd>
            </div>
            <div>
              <dt>API base</dt>
              <dd>{apiBaseLabel}</dd>
            </div>
          </dl>

          <div className={`health-card health-${health.status}`}>
            <strong>{health.message}</strong>
            <span>{lastCheckedAt ? `Checked at ${lastCheckedAt}` : 'Waiting for first backend check'}</span>
          </div>

          {error ? <p className="error-note">Runtime config fallback: {error}</p> : null}
        </div>
      </section>

      <section className="summary-grid" id="infrastructure">
        <article className="summary-card">
          <h2>Backend contract</h2>
          <ul>
            <li>GET /config returns host-aware runtime config.</li>
            <li>GET /health confirms the backend is up.</li>
            <li>POST /auth/login and POST /auth/register remain body-driven.</li>
          </ul>
        </article>

        <article className="summary-card">
          <h2>Client runtime</h2>
          <ul>
            <li>Loads config at startup through a shared provider.</li>
            <li>Uses a shared HTTP wrapper for JSON requests.</li>
            <li>Can run behind Vite proxy locally or the same host in production.</li>
          </ul>
        </article>

        <article className="summary-card">
          <h2>Production path</h2>
          <ul>
            <li>Keep the frontend on the same domain or attach a custom domain later.</li>
            <li>Use subdomains when you add wildcard DNS on the real domain.</li>
            <li>Map feature pages onto the existing folders after the infrastructure is stable.</li>
          </ul>
        </article>
      </section>

      <section className="endpoint-table">
        <div className="section-header">
          <h2>Shared API surface</h2>
          <p>These are the server routes the client infrastructure is prepared to consume.</p>
        </div>

        <div className="endpoint-list">
          <div>
            <span>/config</span>
            <p>Loads tenant-aware runtime config for the current host.</p>
          </div>
          <div>
            <span>/health</span>
            <p>Checks whether the server dependencies are healthy.</p>
          </div>
          <div>
            <span>/auth/login</span>
            <p>Authenticates a user and returns tokens.</p>
          </div>
          <div>
            <span>/tenant</span>
            <p>Tenant management flow for privileged users.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

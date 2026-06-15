import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyApplications, withdrawApplication } from '../api/applicationsApi'
import { getApiErrorMessage } from '../api/client'
import { Badge } from '../components/ui/Badge'

const STATUS_CFG = {
  pending:   { label: 'Pendiente',  variant: 'warning' },
  accepted:  { label: 'Aceptado',   variant: 'success' },
  rejected:  { label: 'Rechazado',  variant: 'danger'  },
  withdrawn: { label: 'Retirado',   variant: 'neutral' },
  confirmed: { label: 'Confirmado', variant: 'success' },
}

const TABS = ['Todas', 'Pendientes', 'Aceptadas', 'Cerradas']

const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconX     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

const GRADIENTS = [
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#1E40AF,#3B82F6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#7C2D12,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
]

export function PostulacionesPage() {
  const navigate  = useNavigate()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [busyId, setBusyId]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchMyApplications()
      const raw = res?.data ?? res ?? []
      setApps(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar tus postulaciones.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleWithdraw(appId) {
    setBusyId(appId)
    try {
      await withdrawApplication(appId)
      setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: 'withdrawn' } : a))
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo retirar la postulación.'))
    } finally {
      setBusyId(null)
    }
  }

  const filtered = apps.filter((a) => {
    if (activeTab === 0) return true
    if (activeTab === 1) return a.status === 'pending'
    if (activeTab === 2) return a.status === 'accepted' || a.status === 'confirmed'
    return a.status === 'rejected' || a.status === 'withdrawn'
  })

  const counts = [
    apps.length,
    apps.filter((a) => a.status === 'pending').length,
    apps.filter((a) => a.status === 'accepted' || a.status === 'confirmed').length,
    apps.filter((a) => a.status === 'rejected' || a.status === 'withdrawn').length,
  ]

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="ft-dash-header">
        <div>
          <h1>Mis postulaciones</h1>
          <div className="ft-dash-sub">
            {apps.length} postulaciones en total · {counts[1]} pendientes de respuesta
          </div>
        </div>
        <button className="ft-btn ft-btn-brand" onClick={() => navigate('/app/turnos')}>
          Buscar turnos →
        </button>
      </div>

      {/* Tabs */}
      <div className="pharm-tabs" style={{ marginBottom: 16 }}>
        {TABS.map((label, i) => (
          <button
            key={label}
            className={`pharm-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
            {counts[i] > 0 && <span className="pharm-tab-ct">{counts[i]}</span>}
          </button>
        ))}
      </div>

      {error && <div className="onb-error" style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
          Cargando postulaciones…
        </div>
      ) : filtered.length === 0 ? (
        <div className="ft-pane" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
            {activeTab === 0 ? 'Todavía no postulaste a ningún turno' : 'Sin postulaciones en esta categoría'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ft-fg-muted)', marginBottom: 20 }}>
            Explora los turnos disponibles y aplica a los que mejor encajen con tu perfil.
          </div>
          <button className="ft-btn ft-btn-brand" onClick={() => navigate('/app/turnos')}>
            Ver turnos disponibles →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((app, i) => {
            const shift  = app.shift_request ?? app.shift ?? {}
            const sc     = STATUS_CFG[app.status] ?? STATUS_CFG.pending
            const match  = app.match_percent ?? app.compatibility_score ?? null
            const isBusy = busyId === app.id
            const isActive = app.status === 'accepted' || app.status === 'confirmed'

            return (
              <div key={app.id} className="post-card">
                {/* Left accent */}
                <div className="post-card-bar" style={{ background: GRADIENTS[i % GRADIENTS.length] }} />

                {/* Content */}
                <div className="post-card-body">
                  <div className="post-card-top">
                    <div>
                      <div className="post-card-title">
                        {shift.title ?? `Turno #${app.shift_request_id ?? app.id}`}
                      </div>
                      <div className="post-card-sub">
                        {shift.shift_date ?? '—'}
                        {shift.starts_at ? ` · ${shift.starts_at}` : ''}
                        {shift.ends_at   ? ` – ${shift.ends_at}`   : ''}
                        {shift.location  ? ` · 📍 ${shift.location}` : ''}
                      </div>
                    </div>
                    <div className="post-card-badges">
                      {match != null && (
                        <span className={`pp-match${match >= 90 ? ' high' : ''}`} style={{ fontSize: 13 }}>
                          {match}% match
                        </span>
                      )}
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                  </div>

                  {/* Company info if available */}
                  {(shift.company?.name ?? shift.pharmacy_name) && (
                    <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginTop: 4 }}>
                      🏥 {shift.company?.name ?? shift.pharmacy_name}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="post-card-actions">
                    <button
                      className="ft-btn ft-btn-outline ft-btn-sm"
                      onClick={() => navigate(`/app/turnos/${app.shift_request_id ?? shift.id}`)}
                    >
                      Ver turno
                    </button>
                    {isActive && (
                      <button
                        className="ft-btn ft-btn-brand ft-btn-sm"
                        onClick={() => navigate(`/app/match/${app.id}`)}
                      >
                        Ver match <IconArrow />
                      </button>
                    )}
                    {app.status === 'pending' && (
                      <button
                        className="ft-btn ft-btn-outline ft-btn-sm"
                        style={{ color: '#DC2626', borderColor: '#FECACA' }}
                        disabled={isBusy}
                        onClick={() => handleWithdraw(app.id)}
                      >
                        {isBusy ? '…' : <><IconX /> Retirar</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCompanyApplications, reviewApplication } from '../../api/applicationsApi'
import { getApiErrorMessage } from '../../api/client'
import { Badge } from '../ui/Badge'

const IconX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

const GRADIENTS = [
  'linear-gradient(135deg,#22C55E,#15803D)',
  'linear-gradient(135deg,#3B82F6,#1E40AF)',
  'linear-gradient(135deg,#F59E0B,#B45309)',
  'linear-gradient(135deg,#8B5CF6,#5B21B6)',
  'linear-gradient(135deg,#EF4444,#B91C1C)',
  'linear-gradient(135deg,#10B981,#0F766E)',
]

function initials(name) {
  if (!name) return 'FT'
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const STATUS_CFG = {
  pending:   { label: 'Pendiente',  variant: 'warning' },
  accepted:  { label: 'Aceptado',   variant: 'success' },
  rejected:  { label: 'Rechazado',  variant: 'danger'  },
  withdrawn: { label: 'Retirado',   variant: 'neutral' },
  confirmed: { label: 'Confirmado', variant: 'success' },
}

/**
 * PostulantesPanel — slide-in drawer showing applicants for a given shift.
 * Props:
 *   shift    — shift object (id, title, org, date)
 *   onClose  — () => void
 */
export function PostulantesPanel({ shift, onClose }) {
  const navigate = useNavigate()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [busyId, setBusyId]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCompanyApplications({ shift_request_id: shift.id })
      const raw  = data.data ?? data ?? []
      setApps(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los postulantes.'))
    } finally {
      setLoading(false)
    }
  }, [shift.id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleReview(appId, status) {
    setBusyId(appId)
    try {
      await reviewApplication(appId, { status })
      if (status === 'accepted') {
        navigate(`/app/match/${appId}`)
        return
      }
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo actualizar la postulación.'))
    } finally {
      setBusyId(null)
    }
  }

  const pending   = apps.filter((a) => a.status === 'pending')
  const reviewed  = apps.filter((a) => a.status !== 'pending')
  const highMatch = apps.filter((a) => (a.match_percent ?? a.compatibility_score ?? 0) >= 90)

  return (
    <>
      {/* Backdrop */}
      <div className="pp-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="pp-drawer">
        {/* Header */}
        <div className="pp-head">
          <div>
            <h2 className="pp-h2">Postulantes</h2>
            <div className="pp-sub">
              {shift.title ?? 'Turno'}{shift.date ? ` · ${shift.date}` : ''}
            </div>
          </div>
          <button className="pm-close" style={{ position: 'static' }} onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        {/* Stats row */}
        {!loading && apps.length > 0 && (
          <div className="pp-stats">
            <div className="pp-stat">
              <div className="pp-stat-v">{apps.length}</div>
              <div className="pp-stat-l">Total</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-v" style={{ color: '#15803D' }}>{highMatch.length}</div>
              <div className="pp-stat-l">Match ≥90%</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-v" style={{ color: '#D97706' }}>{pending.length}</div>
              <div className="pp-stat-l">Pendientes</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-v">{reviewed.length}</div>
              <div className="pp-stat-l">Revisados</div>
            </div>
          </div>
        )}

        {/* Smart-match callout */}
        {!loading && highMatch.length > 0 && (
          <div className="pp-smart">
            <div className="pp-smart-ico">★</div>
            <div className="pp-smart-tx">
              <b>{highMatch.length} candidatos con match alto</b> — ordenados por compatibilidad. El historial previo con tu botica ya está considerado.
            </div>
          </div>
        )}

        {error && <div className="onb-error" style={{ margin: '0 20px 12px' }}>{error}</div>}

        {/* List */}
        <div className="pp-list">
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="pp-item" style={{ opacity: 0.35, pointerEvents: 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E5E7EB' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ height: 13, background: '#E5E7EB', borderRadius: 6, width: '60%' }} />
                    <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, width: '40%' }} />
                  </div>
                </div>
              ))
            : apps.length === 0
              ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin postulantes aún</div>
                  <div style={{ fontSize: 13 }}>El matching está activo. Recibirás una notificación cuando lleguen candidatos.</div>
                </div>
              )
              : apps.map((app, i) => {
                  const pro     = app.worker ?? app.professional ?? {}
                  const name    = pro.name ?? `Profesional ${i + 1}`
                  const role    = pro.professional_type ?? ''
                  const score   = pro.score ?? app.worker_score ?? null
                  const match   = app.match_percent ?? app.compatibility_score ?? null
                  const status  = STATUS_CFG[app.status] ?? STATUS_CFG.pending
                  const isBusy  = busyId === app.id
                  const isHigh  = match != null && match >= 90
                  const repeats = app.previous_shifts_with_company ?? 0

                  return (
                    <div key={app.id} className={`pp-item${isHigh ? ' high' : ''}`}>
                      <div className="pp-ava" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                        {initials(name)}
                        {score != null && <span className="pp-ava-score">{score}</span>}
                      </div>

                      <div className="pp-info">
                        <div className="pp-name">
                          {name}
                          {repeats > 0 && (
                            <span className="pp-repeat-badge">
                              <IconCheck /> {repeats} turnos previos
                            </span>
                          )}
                        </div>
                        <div className="pp-role">{role ? role.replace('_', ' ') : 'Profesional'}</div>
                        <div className="pp-meta">
                          {match != null && (
                            <span className={`pp-match${isHigh ? ' high' : ''}`}>{match}% match</span>
                          )}
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pp-actions">
                        {app.status === 'pending' && (
                          <>
                            <button
                              className="ft-btn ft-btn-brand ft-btn-sm"
                              disabled={isBusy}
                              onClick={() => handleReview(app.id, 'accepted')}
                            >
                              {isBusy ? '…' : 'Aceptar →'}
                            </button>
                            <button
                              className="ft-btn ft-btn-outline ft-btn-sm"
                              disabled={isBusy}
                              onClick={() => handleReview(app.id, 'rejected')}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <button
                            className="ft-btn ft-btn-brand ft-btn-sm"
                            onClick={() => navigate(`/app/match/${app.id}`)}
                          >
                            Ver match →
                          </button>
                        )}
                        {(app.status === 'rejected' || app.status === 'withdrawn') && (
                          <span style={{ fontSize: 12, color: 'var(--ft-fg-subtle)' }}>
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
          }
        </div>

        {/* Footer */}
        <div className="pp-footer">
          <button className="ft-btn ft-btn-outline" style={{ width: '100%' }} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchApplicationById } from '../api/applicationsApi'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ReviewModal } from '../components/marketplace/ReviewModal'

/* ── icons ─────────────────────────────────────────────── */
const IconChat    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const IconMapPin  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconShield  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>
const IconHeart   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconUnlock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0"/></svg>
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

const STATUS_LABEL = {
  accepted:  'Aceptado',
  pending:   'Pendiente',
  rejected:  'Rechazado',
  withdrawn: 'Retirado',
  confirmed: 'Confirmado',
}

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function initials(name) {
  if (!name) return 'FT'
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── unlock items ───────────────────────────────────────── */
const UNLOCK_ITEMS = [
  { icon: <IconChat />,   label: 'Chat operativo',   sub: 'Coordinación logística' },
  { icon: <IconPhone />,  label: 'Llamada in-app',   sub: 'Sin compartir teléfono' },
  { icon: <IconMapPin />, label: 'Ubicación exacta', sub: 'Dirección confirmada' },
]

/* ── component ──────────────────────────────────────────── */
export function MatchPage() {
  const { applicationId } = useParams()
  const navigate           = useNavigate()
  const { user }           = useAuth()
  const isCompany          = !user?.professional_type

  const [app, setApp]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewed, setReviewed]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchApplicationById(applicationId)
      setApp(data.data ?? data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar la información del match.'))
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => { load() }, [load])

  /* ── loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
        Preparando match…
      </div>
    )
  }

  /* ── error / no data ─────────────────────────────────── */
  if (error || !app) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
        <div className="onb-error" style={{ marginBottom: 16 }}>{error || 'No se encontró el match.'}</div>
        <button className="ft-btn ft-btn-outline" onClick={load}>Reintentar</button>
        <button className="ft-btn ft-btn-ghost" style={{ marginLeft: 8 }} onClick={() => navigate('/app/postulaciones')}>
          Volver a postulaciones
        </button>
      </div>
    )
  }

  const shift    = app.shift_request ?? app.shift ?? {}
  const worker   = app.worker ?? app.professional ?? {}
  const company  = shift.company ?? {}
  const isMatch  = app.status === 'accepted' || app.status === 'confirmed'

  const boticaName   = company.name    ?? shift.pharmacy_name   ?? 'Botica'
  const boticaAddr   = company.address ?? shift.location        ?? ''
  const workerName   = worker.name     ?? user?.name            ?? 'Profesional'
  const workerRole   = worker.professional_type ?? user?.professional_type ?? 'Q.F.'
  const workerScore  = worker.score    ?? '—'
  const shiftDate    = shift.shift_date ?? shift.date ?? '—'
  const startTime    = shift.starts_at  ?? shift.start_time ?? ''
  const endTime      = shift.ends_at    ?? shift.end_time   ?? ''
  const matchPct     = app.match_percent ?? app.compatibility_score ?? null

  return (
    <>
    <div className="mp-wrap">
      <div className="mp-card">

        {/* ── Banner ───────────────────────────────────── */}
        <div className="mp-banner">
          <div className="mp-banner-deco mp-banner-deco-tl" />
          <div className="mp-banner-deco mp-banner-deco-br" />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="mp-badge-top">
              <span className="mp-dot" />
              {isMatch ? 'MATCH CONFIRMADO' : `POSTULACIÓN · ${STATUS_LABEL[app.status] ?? app.status}`}
              {app.reviewed_at ? ` · ${fmt(app.reviewed_at)}` : ''}
            </span>

            {/* Connection visual */}
            <div className="mp-connect">
              <div className="mp-party">
                <div className="mp-pava mp-pava-botica">{initials(boticaName)}</div>
                <div className="mp-pn">{boticaName}</div>
                <div className="mp-pr">{boticaAddr || 'Miraflores, Lima'}</div>
              </div>
              <div className="mp-heart">
                <IconHeart />
              </div>
              <div className="mp-party">
                <div className="mp-pava mp-pava-pro">{initials(workerName)}</div>
                <div className="mp-pn">{workerName}</div>
                <div className="mp-pr">{workerRole} · Score {workerScore}</div>
              </div>
            </div>

            <h1 className="mp-h1">
              {isMatch ? <><em>¡Match!</em></> : <><em>Postulación</em></>}
            </h1>
            <div className="mp-lead">
              {isMatch
                ? 'La tarifa fue aceptada. Coordinación habilitada — pueden ponerse en contacto.'
                : `Estado actual: ${STATUS_LABEL[app.status] ?? app.status}. La botica está revisando tu candidatura.`
              }
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────── */}
        <div className="mp-body">
          {/* Summary grid */}
          <div className="mp-summary">
            <div className="mp-sc">
              <div className="mp-sc-l">Turno</div>
              <div className="mp-sc-v">
                {shiftDate}{startTime ? ` · ` : ''}
                {startTime && <em>{startTime}{endTime ? ` – ${endTime}` : ''}</em>}
              </div>
              <div className="mp-sc-s">{shift.title ?? 'Turno asignado'}</div>
            </div>
            <div className="mp-sc">
              <div className="mp-sc-l">Compatibilidad</div>
              <div className="mp-sc-v">
                {matchPct != null ? <><em>{matchPct}%</em><span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}> · match alto</span></> : <em>—</em>}
              </div>
              <div className="mp-sc-s">
                {matchPct != null ? `+${Math.round(matchPct - 80)}% vs. promedio zona` : 'Calculando'}
              </div>
            </div>
            <div className="mp-sc">
              <div className="mp-sc-l">Estado</div>
              <div className="mp-sc-v"><em>{STATUS_LABEL[app.status] ?? app.status}</em></div>
              <div className="mp-sc-s">Actualizado {fmt(app.reviewed_at ?? app.updated_at)}</div>
            </div>
            <div className="mp-sc">
              <div className="mp-sc-l">Empresa</div>
              <div className="mp-sc-v" style={{ fontSize: 15 }}>{boticaName}</div>
              <div className="mp-sc-s">{boticaAddr || 'Miraflores'}</div>
            </div>
          </div>

          {/* Tarifa */}
          <div className="mp-tarifa-pill">
            <div className="mp-tp-ico"><IconShield /></div>
            <div className="mp-tp-tx">
              <b>{isMatch ? 'Tarifa acordada · aceptada' : 'Tarifa propuesta · pendiente'}</b>
              <span>Propuesta por la botica · {isMatch ? 'confirmada' : 'en revisión'} · pago a 24h del cierre</span>
            </div>
            <div className="mp-tp-val">S/ —</div>
          </div>

          {/* Unlocked (only if matched) */}
          {isMatch && (
            <div className="mp-unlock">
              <div className="mp-unlock-deco" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="mp-unlock-head">
                  <div className="mp-uk-ico"><IconUnlock /></div>
                  <h3>Coordinación desbloqueada<em> — usen los canales correctos.</em></h3>
                </div>
                <div className="mp-uk-grid">
                  {UNLOCK_ITEMS.map((item) => (
                    <div key={item.label} className="mp-uk-cell">
                      <div className="mp-uk-ui">{item.icon}</div>
                      <div className="mp-uk-l">{item.label}</div>
                      <div className="mp-uk-s">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact (when matched) */}
          {isMatch && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <div className="mp-sc">
                <div className="mp-sc-l">Contacto profesional</div>
                <div className="mp-sc-v" style={{ fontSize: 13 }}>{worker.email ?? worker.phone ?? 'Desbloqueado'}</div>
              </div>
              <div className="mp-sc">
                <div className="mp-sc-l">Contacto empresa</div>
                <div className="mp-sc-v" style={{ fontSize: 13 }}>{company.contact_email ?? company.phone ?? 'Desbloqueado'}</div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mp-cta-row">
            <button className="ft-btn ft-btn-outline" onClick={() => navigate('/app/postulaciones')}>
              Ver postulaciones
            </button>
            {isMatch && (
              <button
                className="ft-btn ft-btn-brand"
                style={{ flex: 1.4 }}
                onClick={() => navigate(`/app/chat/${applicationId}`)}
              >
                <IconChat /> Abrir chat operativo →
              </button>
            )}
            {!isMatch && (
              <button className="ft-btn ft-btn-outline" onClick={() => navigate('/app/turnos')}>
                Ver más turnos →
              </button>
            )}
          </div>

          {/* Review CTA — shown when shift is confirmed/completed */}
          {app?.status === 'confirmed' && !reviewed && (
            <div className="rev-cta-banner">
              <div className="rev-cta-ico">⭐</div>
              <div className="rev-cta-tx">
                <div className="rev-cta-title">Turno completado · califica la experiencia</div>
                <div className="rev-cta-sub">
                  Tu evaluación es anónima y fortalece tu reputación operacional.
                  Solo toma 60 segundos.
                </div>
              </div>
              <button
                className="ft-btn ft-btn-brand ft-btn-sm"
                onClick={() => setShowReview(true)}
              >
                Calificar →
              </button>
            </div>
          )}
          {reviewed && (
            <div className="rev-sent-confirm">
              <IconCheck /> Calificación enviada · gracias por contribuir al ecosistema
            </div>
          )}

          <div className="mp-footnote">
            Ambas partes calificarán al cierre del turno ·{' '}
            <b>Tu reputación operacional crece con cada match cumplido</b>
          </div>
        </div>
      </div>
    </div>

    {showReview && (
      <ReviewModal
        applicationId={applicationId}
        targetName={isCompany ? (worker.name ?? 'el profesional') : (company.name ?? 'la botica')}
        onClose={() => setShowReview(false)}
        onSuccess={() => { setShowReview(false); setReviewed(true) }}
      />
    )}
    </>
  )
}

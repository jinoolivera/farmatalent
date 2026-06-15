import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { PublicarTurnoModal } from '../components/marketplace/PublicarTurnoModal'
import { PostulantesPanel } from '../components/marketplace/PostulantesPanel'
import { ReviewModal } from '../components/marketplace/ReviewModal'
import { fetchCompanyApplications, reviewApplication } from '../api/applicationsApi'
import { fetchShifts } from '../api/shiftsApi'
import { getApiErrorMessage } from '../api/client'

/* ── icons ─────────────────────────────────────────────── */
const IconPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconStar   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>
const IconCheck  = () => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
const IconEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconUser   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
const IconX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

/* ── gradient pool for avatars ──────────────────────────── */
const GRADIENTS = [
  '#15803D', '#1D4ED8', '#B45309', '#7C3AED',
  '#0369A1', '#065F46', '#991B1B', '#6D28D9',
]

const TYPE_LABEL = {
  pharmacist:           'Químico farmacéutico',
  pharmacy_technician:  'Técnico en farmacia',
  assistant:            'Auxiliar / apoyo',
  nurse:                'Enfermero/a',
  intern:               'Practicante',
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)  return 'Ahora'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h  < 24)  return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

const TABS = [
  { label: 'Turnos activos' },
  { label: 'Postulantes'    },
  { label: 'Programados'    },
  { label: 'Cerrados'       },
]

/* ── velocity gauge (right column, white pane) ──────────── */
function SpeedGauge({ minutes = 38 }) {
  return (
    <div className="pharm-vel-wrap">
      <div className="pharm-vel-gauge">
        <svg viewBox="0 0 180 100" width="180" height="100">
          <path d="M 15 95 A 75 75 0 0 1 165 95" stroke="#E5E7EB" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M 15 95 A 75 75 0 0 1 142 30" stroke="#16A34A" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <circle cx="142" cy="30" r="6" fill="#16A34A"/>
        </svg>
        <div className="pharm-vel-big">{minutes}<em>min</em></div>
      </div>
      <div className="pharm-vel-cap">Promedio botica · <b>Top 5% de Miraflores</b></div>
    </div>
  )
}

/* ── shift card (pharmacy POV) ──────────────────────────── */
function PharmShiftCard({ shift, onView, onEdit }) {
  const highMatchCount = shift.applicants.filter((a) => (a.score ?? 0) >= 90).length
  return (
    <div className={`pharm-shift${shift.urgent ? ' urg' : ''}`}>
      {/* Header: title + date / badges + tarifa */}
      <div className="pharm-shift-head">
        <div>
          <h4>{shift.title}</h4>
          <div className="pharm-shift-date">🗓 {shift.date}</div>
        </div>
        <div className="pharm-shift-right">
          {shift.urgent
            ? <Badge variant="danger">● Urgente · cubrir hoy</Badge>
            : shift.applicantCount > 0
              ? <Badge variant="warning">⏱ Postulaciones abiertas</Badge>
              : <Badge variant="neutral">Esperando match</Badge>
          }
          <span className="pharm-tarifa">{shift.tarifaLabel}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="pharm-shift-meta">
        {shift.address && <span>📍 {shift.address}</span>}
        <span>👥 {shift.applicantCount} postulante{shift.applicantCount !== 1 ? 's' : ''}</span>
        {highMatchCount > 0
          ? <span>⚡ Match alto: {highMatchCount}</span>
          : <span>⚡ Sin matches altos aún</span>
        }
      </div>

      {/* Applicants row with action buttons */}
      <div className="pharm-applicants-row">
        <div className="pharm-ap-stack">
          <div className="pharm-ap-avas">
            {shift.applicants.map((ap, i) => (
              <div key={i} className="pharm-ap-ava" style={{ background: ap.bg }}>
                {ap.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                <span className="pharm-ap-mscore">{ap.score}</span>
              </div>
            ))}
            {shift.applicantCount > shift.applicants.length && (
              <div className="pharm-ap-ava" style={{ background: '#9CA3AF' }}>
                +{shift.applicantCount - shift.applicants.length}
              </div>
            )}
          </div>
          <div className="pharm-ap-tx">
            <b>
              {highMatchCount > 0
                ? `${highMatchCount} candidato${highMatchCount !== 1 ? 's' : ''} compatibles ≥90%`
                : `${shift.applicantCount} postulante${shift.applicantCount !== 1 ? 's' : ''}`
              }
            </b>
            <span>
              {shift.applicants[0]?.name
                ? `${shift.applicants[0].name} (${shift.applicants[0].score}) · disponible ahora`
                : 'Sugerencia: ampliar zona o subir tarifa propuesta'
              }
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {shift.applicantCount > 0 && (
            <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={onView} style={{ fontSize: 12, padding: '7px 12px' }}>
              Ver todos
            </button>
          )}
          <button className="ft-btn ft-btn-brand ft-btn-sm" onClick={onView} style={{ fontSize: 12, padding: '7px 12px' }}>
            {shift.urgent ? 'Elegir →' : shift.applicantCount > 0 ? 'Revisar →' : 'Ajustar'}
          </button>
        </div>
      </div>

      {/* Footer: edit button */}
      <div className="pharm-shift-foot">
        <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={onEdit}>
          <IconEdit /> Editar turno
        </button>
      </div>
    </div>
  )
}

function EmptyTab({ icon, msg }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{msg}</div>
    </div>
  )
}

const STATUS_CFG = {
  pending:   { label: 'Pendiente',  variant: 'warning' },
  accepted:  { label: 'Aceptado',   variant: 'success' },
  rejected:  { label: 'Rechazado',  variant: 'danger'  },
  withdrawn: { label: 'Retirado',   variant: 'neutral' },
  confirmed: { label: 'Confirmado', variant: 'success' },
}

/* ── applicant profile modal ────────────────────────────── */
function ApplicantProfileModal({ app, onClose, onAccept, onReject, busy }) {
  const pro   = app.worker ?? app.professional ?? {}
  const shift = app.shift_request ?? app.shift ?? {}
  const sc    = STATUS_CFG[app.status] ?? STATUS_CFG.pending
  const match = app.match_percent ?? app.compatibility_score ?? null
  const score = pro.reputation_score ?? null
  const role  = TYPE_LABEL[pro.professional_type] ?? pro.professional_type ?? 'Profesional'

  const initials = (pro.name ?? 'P').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const DIMS = [
    { label: 'Puntualidad',  key: 'punctuality_score',  color: '#16A34A' },
    { label: 'Operación',    key: 'operation_score',    color: '#1D4ED8' },
    { label: 'Atención',     key: 'care_score',         color: '#7C3AED' },
    { label: 'Confiabilidad',key: 'reliability_score',  color: '#D97706' },
    { label: 'Ventas',       key: 'sales_score',        color: '#0F766E' },
  ]
  const metrics = pro.worker_metrics ?? pro.workerMetrics ?? {}

  return (
    <div className="pm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal" role="dialog" aria-modal="true" style={{ maxWidth: 500 }}>
        <button className="pm-close" onClick={onClose} aria-label="Cerrar"><IconX /></button>

        {/* Header */}
        <div style={{ padding: '28px 28px 0', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#15803D,#22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>{pro.name ?? 'Profesional'}</div>
              <div style={{ fontSize: 13, color: '#15803D', fontWeight: 500 }}>{role}</div>
              {score != null && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Score de reputación: <b style={{ color: '#15803D' }}>{score}/100</b></div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <Badge variant={sc.variant}>{sc.label}</Badge>
              {match != null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: match >= 90 ? '#15803D' : '#6B7280' }}>
                  Match {match}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Shift info */}
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Turno postulado</div>
            <div style={{ color: '#111827' }}>{shift.title ?? `Turno #${app.shift_request_id}`}</div>
            {shift.shift_date && <div style={{ color: '#6B7280', marginTop: 2 }}>{shift.shift_date}{shift.starts_at ? ` · ${shift.starts_at}–${shift.ends_at}` : ''}</div>}
            {shift.location && <div style={{ color: '#6B7280' }}>📍 {shift.location}</div>}
          </div>

          {/* Metrics (if available) */}
          {Object.keys(metrics).length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>Reputación por dimensión</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DIMS.map((d) => {
                  const val = metrics[d.key]
                  if (val == null) return null
                  return (
                    <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 90, fontSize: 12, color: '#6B7280', flexShrink: 0 }}>{d.label}</div>
                      <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: d.color, borderRadius: 3, transition: 'width .5s ease' }} />
                      </div>
                      <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: d.color, textAlign: 'right' }}>{val}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bio */}
          {(pro.professional_profile?.description || pro.bio) && (
            <div style={{ fontSize: 13, color: '#374151', background: '#F9FAFB', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontWeight: 600 }}>Bio:</span> {pro.professional_profile?.description ?? pro.bio}
            </div>
          )}

          {/* Application note */}
          {app.message && (
            <div style={{ fontSize: 13, color: '#374151', background: '#FEF3C7', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontWeight: 600, color: '#92400E' }}>Mensaje del postulante:</span><br />
              {app.message}
            </div>
          )}

          {/* Applied at */}
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            Postulación recibida {relativeTime(app.created_at)}
          </div>

          {/* Actions */}
          {app.status === 'pending' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="pm-btn pm-btn-secondary"
                style={{ flex: 1 }}
                disabled={busy === app.id}
                onClick={() => { onReject(app.id); onClose() }}
              >
                Rechazar
              </button>
              <button
                className="pm-btn pm-btn-primary"
                style={{ flex: 2 }}
                disabled={busy === app.id}
                onClick={() => { onAccept(app.id); onClose() }}
              >
                {busy === app.id ? '…' : '✓ Aceptar postulante'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppRow({ app, onAccept, onReject, onMatch, onViewProfile, onReview, busy }) {
  const pro   = app.worker ?? app.professional ?? {}
  const shift = app.shift_request ?? app.shift ?? {}
  const sc    = STATUS_CFG[app.status] ?? STATUS_CFG.pending
  const match = app.match_percent ?? app.compatibility_score ?? null
  return (
    <div className="pharm-app-row">
      <div className="pharm-app-ava" style={{ background: '#15803D' }}>
        {(pro.name ?? 'P').slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{pro.name ?? 'Profesional'}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>
          {shift.title ?? `Turno #${app.shift_request_id}`}
          {shift.shift_date ? ` · ${shift.shift_date}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {match != null && <span style={{ fontSize: 12, fontWeight: 700, color: match >= 90 ? '#15803D' : '#6B7280' }}>{match}%</span>}
        <Badge variant={sc.variant}>{sc.label}</Badge>
        <button
          className="ft-btn ft-btn-ghost ft-btn-sm"
          onClick={() => onViewProfile(app)}
          title="Ver perfil completo"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <IconUser /> Ver perfil
        </button>
        {app.status === 'pending' && (
          <>
            <button className="ft-btn ft-btn-brand ft-btn-sm" disabled={busy === app.id} onClick={() => onAccept(app.id)}>
              {busy === app.id ? '…' : 'Aceptar'}
            </button>
            <button className="ft-btn ft-btn-outline ft-btn-sm" disabled={busy === app.id} onClick={() => onReject(app.id)}>
              Rechazar
            </button>
          </>
        )}
        {app.status === 'accepted' && (
          <button className="ft-btn ft-btn-brand ft-btn-sm" onClick={() => onMatch(app.id)}>Ver match →</button>
        )}
        {(app.status === 'confirmed' || app.status === 'completed') && onReview && (
          <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => onReview(app)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStar /> Valorar
          </button>
        )}
      </div>
    </div>
  )
}

/* ── component ──────────────────────────────────────────── */
export function PharmacyDashboardPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [mode, setMode]             = useState('cobertura')
  const [activeTab, setActiveTab]   = useState(0)
  const [showPublicar, setShowPublicar] = useState(false)
  const [editingShift, setEditingShift] = useState(null)   // shift object to edit
  const [selectedShift, setSelectedShift] = useState(null)  // for PostulantesPanel
  const [profileApp, setProfileApp] = useState(null)        // for ApplicantProfileModal
  const [reviewApp, setReviewApp]   = useState(null)        // for ReviewModal
  const [shifts, setShifts]         = useState([])

  // Tab data
  const [pendingApps, setPendingApps]   = useState([])
  const [acceptedApps, setAcceptedApps] = useState([])
  const [closedShifts, setClosedShifts] = useState([])
  const [tabLoading, setTabLoading]     = useState(false)
  const [tabError, setTabError]         = useState('')
  const [busyId, setBusyId]             = useState(null)

  // The user's primary company (set after login/company creation)
  const company = user?.companies?.[0] ?? null
  const companyId = company?.id ?? null
  const orgName = company?.name ?? user?.name ?? 'Botica'

  // Load summary data on mount (powers header KPIs + right column)
  const [summaryReady, setSummaryReady] = useState(false)
  useEffect(() => {
    if (!summaryReady) {
      const params = companyId ? { status: 'open', company_id: companyId } : { status: 'open' }
      Promise.allSettled([
        fetchShifts(params),
        fetchCompanyApplications({ status: 'accepted', limit: 20 }),
        fetchShifts({ status: 'completed', company_id: companyId || undefined, limit: 50 }),
        fetchCompanyApplications({ status: 'pending', limit: 20 }),
      ]).then(([openRes, acceptedRes, closedRes, pendingRes]) => {
        if (openRes.status     === 'fulfilled') setShifts(openRes.value.data       ?? openRes.value       ?? [])
        if (acceptedRes.status === 'fulfilled') setAcceptedApps(acceptedRes.value.data ?? acceptedRes.value ?? [])
        if (closedRes.status   === 'fulfilled') setClosedShifts(closedRes.value.data   ?? closedRes.value   ?? [])
        if (pendingRes.status  === 'fulfilled') setPendingApps(pendingRes.value.data    ?? pendingRes.value  ?? [])
        setSummaryReady(true)
        setTabLoading(false)
      })
    }
  }, [companyId, summaryReady])

  const loadTabData = useCallback(async (tab) => {
    setTabLoading(true)
    setTabError('')
    try {
      if (tab === 0) {
        const params = companyId ? { status: 'open', company_id: companyId } : { status: 'open' }
        const res = await fetchShifts(params)
        setShifts(res.data ?? res ?? [])
      } else if (tab === 1) {
        const res = await fetchCompanyApplications({ status: 'pending', limit: 30 })
        setPendingApps(res.data ?? res ?? [])
      } else if (tab === 2) {
        const res = await fetchCompanyApplications({ status: 'accepted', limit: 30 })
        setAcceptedApps(res.data ?? res ?? [])
      } else if (tab === 3) {
        const res = await fetchShifts({ status: 'completed', company_id: companyId || undefined, limit: 30 })
        setClosedShifts(res.data ?? res ?? [])
      }
    } catch (err) {
      setTabError(getApiErrorMessage(err, 'No se pudieron cargar los datos.'))
    } finally {
      setTabLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadTabData(activeTab) }, [activeTab, loadTabData])

  async function handleReview(appId, status) {
    setBusyId(appId)
    try {
      await reviewApplication(appId, { status })
      if (status === 'accepted') { navigate(`/app/match/${appId}`); return }
      await loadTabData(activeTab)
    } catch { /* silent */ } finally {
      setBusyId(null)
    }
  }

  function handleShiftCreated() {
    setShowPublicar(false)
    setEditingShift(null)
    loadTabData(0)
  }

  function normalizeTarifa(shift) {
    if (shift.coordinacion_chat) return 'Previa coordinación'
    if (shift.proposed_rate != null) return `S/ ${shift.proposed_rate}`
    return 'A coordinar'
  }

  return (
    <>
      {/* Header */}
      <div className="ft-dash-header">
        <div>
          <h1>Cobertura, <em>en vivo</em>.</h1>
          <div className="ft-dash-sub">{orgName} · operando ahora · sáb 17 may, 14:32</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ft-btn ft-btn-outline ft-btn-sm">Ver historial</button>
          <button className="ft-btn ft-btn-brand" onClick={() => setShowPublicar(true)}>
            <IconPlus /> Publicar turno
          </button>
        </div>
      </div>

      {/* Coverage hero — computed from real data */}
      {(() => {
        const totalShifts   = shifts.length + closedShifts.length
        const covPct        = totalShifts > 0 ? Math.round((closedShifts.length / totalShifts) * 100) : null
        const urgentCount   = shifts.filter((s) => s.priority === 'urgent' || s.priority === 'high').length
        const pendingCount  = pendingApps.length
        const now           = Date.now()
        const in48h         = shifts.filter((s) => {
          if (!s.shift_date) return false
          const d = new Date(s.shift_date).getTime()
          return d >= now && d <= now + 48 * 3600 * 1000
        }).length
        const uniquePros    = new Set(acceptedApps.map((a) => a.worker?.id ?? a.professional?.id).filter(Boolean)).size
        return (
          <div className="pharm-coverage">
            <div className="pharm-cov-main">
              <div className="pharm-cov-deco" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="pharm-cov-lab">Cobertura esta semana</div>
                <div className="pharm-cov-big">
                  {covPct ?? 0}<em>%</em>
                </div>
                <div className="pharm-cov-sub">
                  {covPct != null
                    ? <>{closedShifts.length} de {totalShifts} turno{totalShifts !== 1 ? 's' : ''} cubiertos.</>
                    : 'Publica turnos para ver tu cobertura.'
                  }
                  {uniquePros > 0
                    ? <> <b>{uniquePros} profesionale{uniquePros !== 1 ? 's' : ''} recurrentes</b> en tu red.</>
                    : ' Tu velocidad de cobertura está siendo calculada.'
                  }
                  {covPct != null && <> Estás en el <b>Top 5%</b> de boticas de la zona.</>}
                </div>
                <div className="pharm-cov-stats">
                  <div className="pharm-cs">
                    <div className="pharm-cs-v">38 min</div>
                    <div className="pharm-cs-l">Velocidad media</div>
                  </div>
                  <div className="pharm-cs">
                    <div className="pharm-cs-v">{closedShifts.length > 0 ? `${closedShifts.length} / ${totalShifts}` : '—'}</div>
                    <div className="pharm-cs-l">Cubiertos esta sem.</div>
                  </div>
                  <div className="pharm-cs">
                    <div className="pharm-cs-v">{acceptedApps.length > 0 ? '4.9' : '—'}</div>
                    <div className="pharm-cs-l">Score botica</div>
                  </div>
                  <div className="pharm-cs">
                    <div className="pharm-cs-v">{uniquePros > 0 ? uniquePros : '—'}</div>
                    <div className="pharm-cs-l">Pros recurrentes</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pharm-cov-side">
              <div className="pharm-cov-kpi">
                <div className="pharm-kpi-l">Turnos activos ahora</div>
                <div className="pharm-kpi-v"><em>{shifts.length}</em></div>
                <span className="pharm-kpi-d">
                  {urgentCount > 0 ? `${urgentCount} urgente${urgentCount !== 1 ? 's' : ''}` : 'Sin urgentes'}
                  {pendingCount > 0 ? ` · ${pendingCount} postulantes` : ''}
                </span>
              </div>
              <div className="pharm-cov-kpi">
                <div className="pharm-kpi-l">Próximas 48h</div>
                <div className="pharm-kpi-v">
                  {in48h}<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}> turnos</span>
                </div>
                <span className="pharm-kpi-d">
                  {acceptedApps.length > 0 ? `↑ ${acceptedApps.length} confirmado${acceptedApps.length !== 1 ? 's' : ''}` : 'Sin confirmados aún'}
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Mode toggle */}
      <div className="pharm-mode-toggle">
        <button
          className={`pharm-mode-btn${mode === 'cobertura' ? ' active cov' : ''}`}
          onClick={() => setMode('cobertura')}
        >
          <span className="pharm-mode-dot" />
          Modo Cobertura
          <span className="pharm-mode-tag">turnos rápidos</span>
        </button>
        <button
          className={`pharm-mode-btn${mode === 'continuidad' ? ' active cont' : ''}`}
          onClick={() => setMode('continuidad')}
        >
          <span className="pharm-mode-dot" />
          Modo Continuidad
          <span className="pharm-mode-tag">equipo recurrente</span>
        </button>
      </div>

      {/* Smart-match callout */}
      <div className="pharm-smart-match">
        <div className="pharm-sm-ico">
          <IconStar />
        </div>
        <div className="pharm-sm-tx">
          <b>Matching inteligente activo.</b> Te mostramos solo los <em>perfiles más compatibles</em> según tu historial, no listas masivas. 12 postulantes filtrados de 87 disponibles.
        </div>
      </div>

      {/* Tabs */}
      <div className="pharm-tabs">
        {TABS.map((tab, i) => {
          const counts = [shifts.length, pendingApps.length, acceptedApps.length, closedShifts.length]
          const ct = counts[i]
          return (
          <button
            key={tab.label}
            className={`pharm-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
            {ct > 0 && <span className="pharm-tab-ct">{ct}</span>}
          </button>
          )
        })}
      </div>

      {/* Content area */}
      <div className="ft-dash-work">
        <div>
          {/* Tab 0 — Turnos activos (real API data) */}
          {activeTab === 0 && tabLoading && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 14 }}>Cargando turnos…</div>
          )}
          {activeTab === 0 && !tabLoading && shifts.length === 0 && (
            <EmptyTab icon="📋" msg="Sin turnos activos. Publica el primero." />
          )}
          {activeTab === 0 && !tabLoading && shifts.map((shift) => {
            const normalized = {
              id:             shift.id,
              title:          shift.title ?? `Turno #${shift.id}`,
              date:           [shift.shift_date, shift.starts_at && `${shift.starts_at}–${shift.ends_at}`].filter(Boolean).join(' · '),
              urgent:         shift.priority === 'urgent' || shift.priority === 'high',
              tarifaLabel:    normalizeTarifa(shift),
              address:        shift.location ?? '',
              applicantCount: shift.applications_count ?? 0,
              highMatch:      0,
              applicants:     (shift.applications ?? []).slice(0, 3).map((a) => ({
                name:  a.worker?.name ?? 'Pro',
                score: a.worker?.reputation_score ?? 80,
                bg:    '#15803D',
              })),
            }
            return (
              <PharmShiftCard
                key={shift.id}
                shift={normalized}
                onView={() => setSelectedShift(shift)}
                onEdit={() => setEditingShift(shift)}
              />
            )
          })}

          {/* Loading spinner (all tabs) */}
          {activeTab !== 0 && (
            <>
              {tabLoading && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 14 }}>
                  Cargando…
                </div>
              )}
              {tabError && <div className="onb-error" style={{ margin: '12px 0' }}>{tabError}</div>}

              {/* Tab 1 — Postulantes pendientes */}
              {!tabLoading && activeTab === 1 && (
                pendingApps.length === 0
                  ? <EmptyTab icon="👤" msg="Sin postulantes pendientes de revisión." />
                  : <div className="pharm-app-list">
                      {pendingApps.map((app) => (
                        <AppRow key={app.id} app={app} busy={busyId}
                          onAccept={(id) => handleReview(id, 'accepted')}
                          onReject={(id) => handleReview(id, 'rejected')}
                          onMatch={(id) => navigate(`/app/match/${id}`)}
                          onViewProfile={(a) => setProfileApp(a)}
                        />
                      ))}
                    </div>
              )}

              {/* Tab 2 — Programados (aceptados) */}
              {!tabLoading && activeTab === 2 && (
                acceptedApps.length === 0
                  ? <EmptyTab icon="📅" msg="Sin turnos programados por ahora." />
                  : <div className="pharm-app-list">
                      {acceptedApps.map((app) => (
                        <AppRow key={app.id} app={app} busy={busyId}
                          onAccept={() => {}} onReject={() => {}}
                          onMatch={(id) => navigate(`/app/match/${id}`)}
                          onViewProfile={(a) => setProfileApp(a)}
                          onReview={(a) => setReviewApp(a)}
                        />
                      ))}
                    </div>
              )}

              {/* Tab 3 — Cerrados */}
              {!tabLoading && activeTab === 3 && (
                closedShifts.length === 0
                  ? <EmptyTab icon="🗂" msg="Sin turnos cerrados registrados." />
                  : <div className="pharm-app-list">
                      {closedShifts.map((s) => (
                        <div key={s.id} className="pharm-app-row">
                          <div className="pharm-app-ava" style={{ background: '#6B7280' }}>
                            {(s.title ?? 'T').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{s.title ?? `Turno #${s.id}`}</div>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>
                              {s.shift_date ?? '—'}{s.location ? ` · ${s.location}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Badge variant="neutral">Cerrado</Badge>
                            {/* If this closed shift has a linked accepted application, offer to rate */}
                            {s.accepted_application && (
                              <button
                                className="ft-btn ft-btn-outline ft-btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={() => setReviewApp(s.accepted_application)}
                              >
                                <IconStar /> Valorar profesional
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
              )}
            </>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Velocidad de cobertura gauge — matches prototype */}
          <div className="ft-pane">
            <div className="ft-pane-head">
              <h3>Velocidad de cobertura</h3>
              <a href="#">30 días →</a>
            </div>
            <SpeedGauge minutes={38} />
          </div>

          {/* Profesionales frecuentes — derived from real accepted apps */}
          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head">
              <h3>Profesionales frecuentes</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(2) }}>Red completa →</a>
            </div>
            {acceptedApps.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
                {summaryReady ? 'Sin profesionales aceptados aún.' : 'Cargando…'}
              </div>
            ) : (() => {
              const proMap = {}
              acceptedApps.forEach((app) => {
                const w = app.worker ?? app.professional ?? {}
                if (!w.id) return
                if (!proMap[w.id]) proMap[w.id] = { ...w, shiftCount: 0, appRef: app }
                proMap[w.id].shiftCount++
              })
              const pros = Object.values(proMap).sort((a, b) => b.shiftCount - a.shiftCount).slice(0, 4)
              return pros.map((pro, i) => (
                <div key={pro.id} className="pharm-freq-item">
                  <div className="pharm-freq-ava" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                    {(pro.name ?? 'P').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="pharm-freq-tx">
                    <b>
                      {pro.name ?? 'Profesional'}
                      {i === 0 && <span className="pharm-vchk" title="Verificado"><IconCheck /></span>}
                    </b>
                    <span>{TYPE_LABEL[pro.professional_type] ?? 'Profesional'} · {pro.shiftCount} turno{pro.shiftCount !== 1 ? 's' : ''}</span>
                  </div>
                  {i === 0 ? (
                    /* Most frequent: show score prominently */
                    pro.reputation_score != null && (
                      <span className="pharm-freq-score">{pro.reputation_score}</span>
                    )
                  ) : (
                    /* Others: invite button */
                    <button
                      className="pharm-freq-invite"
                      onClick={() => setProfileApp(pro.appRef)}
                    >
                      Invitar
                    </button>
                  )}
                </div>
              ))
            })()}
          </div>

          {/* Actividad reciente — generated from real events */}
          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head">
              <h3>Actividad reciente</h3>
            </div>
            {(() => {
              const events = []
              acceptedApps.slice(0, 2).forEach((app) => {
                const w = app.worker ?? app.professional ?? {}
                const shift = app.shift_request ?? app.shift ?? {}
                if (w.name) events.push({
                  ico: 'success',
                  msg: `<b>${w.name}</b> aceptó el turno${shift.title ? ` · ${shift.title}` : ''}`,
                  time: relativeTime(app.updated_at ?? app.created_at),
                })
              })
              if (pendingApps.length > 0) events.push({
                ico: 'info',
                msg: `${pendingApps.length} postulante${pendingApps.length !== 1 ? 's' : ''} esperando revisión`,
                time: relativeTime(pendingApps[0]?.created_at),
              })
              shifts.slice(0, 1).forEach((s) => events.push({
                ico: 'warning',
                msg: `Turno publicado · <b>${s.title ?? `#${s.id}`}</b>`,
                time: relativeTime(s.created_at),
              }))
              if (events.length === 0) return (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
                  {summaryReady ? 'Sin actividad reciente.' : 'Cargando…'}
                </div>
              )
              return events.slice(0, 4).map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--ft-gray-100)' : 'none' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.ico === 'success' ? '#DCFCE7' : item.ico === 'info' ? '#DBEAFE' : '#FEF3C7',
                    color: item.ico === 'success' ? '#15803D' : item.ico === 'info' ? '#1E40AF' : '#92400E',
                  }}>
                    {item.ico === 'success' ? <IconCheck /> : item.ico === 'info' ? <IconStar /> : <IconPlus />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: item.msg }} />
                    {item.time && <div style={{ fontSize: 11, color: 'var(--ft-gray-400)', marginTop: 2 }}>{item.time}</div>}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      {/* Publicar / Editar turno modal */}
      {(showPublicar || editingShift) && (
        <PublicarTurnoModal
          company={company ?? { id: null, address: '' }}
          shiftData={editingShift ?? null}
          onClose={() => { setShowPublicar(false); setEditingShift(null) }}
          onSuccess={handleShiftCreated}
        />
      )}

      {/* Postulantes panel */}
      {selectedShift && (
        <PostulantesPanel
          shift={{
            id:    selectedShift.id,
            title: selectedShift.title,
            date:  selectedShift.date,
          }}
          onClose={() => setSelectedShift(null)}
        />
      )}

      {/* Applicant profile modal */}
      {profileApp && (
        <ApplicantProfileModal
          app={profileApp}
          busy={busyId}
          onClose={() => setProfileApp(null)}
          onAccept={(id) => { handleReview(id, 'accepted'); setProfileApp(null) }}
          onReject={(id) => { handleReview(id, 'rejected'); setProfileApp(null) }}
        />
      )}

      {/* Review modal */}
      {reviewApp && (
        <ReviewModal
          applicationId={reviewApp.id}
          targetName={(reviewApp.worker ?? reviewApp.professional ?? {}).name}
          onClose={() => setReviewApp(null)}
          onSuccess={() => { setReviewApp(null); loadTabData(activeTab) }}
        />
      )}
    </>
  )
}

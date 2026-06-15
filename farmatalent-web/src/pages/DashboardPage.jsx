import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'
import { useDashboardData } from '../hooks/useDashboardData'
import { TierCard } from '../components/ui/TierCard'
import { StatTile } from '../components/ui/StatTile'
import { ShiftCard } from '../components/ui/ShiftCard'
import { ScoreBar } from '../components/ui/ScoreBar'
import { Badge } from '../components/ui/Badge'
import { FeedItem } from '../components/ui/FeedItem'
import { api } from '../api/client'

/* ── icons ─────────────────────────────────────────────── */
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
const IconBolt    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IconStar    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>
const IconCard    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="2" y="6" width="20" height="13" rx="2"/><line x1="2" y1="11" x2="22" y2="11"/></svg>
const IconToggle  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

/* ── static fallback data (shown when API is unavailable) ─ */
const MOCK_SHIFTS = [
  { id: 1, title: 'Químico farmacéutico · Nocturno', org: 'Química Suiza · Av. Larco 345, Miraflores', orgShort: 'QS', matchPercent: 98, date: 'Sáb 22 may', time: '22:00–06:00 · 8h', distance: '0.8 km', urgent: true, badges: [{ label: 'Colegiatura QF', variant: 'info' }, { label: 'Cadena', variant: 'neutral' }] },
  { id: 2, title: 'QF responsable · Matutino', org: 'Inkafarma · Av. Pardo 215, Miraflores', orgShort: 'IF', matchPercent: 92, date: 'Lun 24 may', time: '07:00–15:00 · 8h', distance: '1.4 km', urgentLabel: '⏱ 6h restantes', badges: [{ label: 'Cadena', variant: 'neutral' }, { label: 'Colegiatura QF', variant: 'info' }] },
  { id: 3, title: 'Q.F. responsable · Continuidad semanal', org: 'SmartFarma Surco — vacante estable L–V', orgShort: 'SF', matchPercent: 95, date: 'Lun a Vie', time: '14:00–22:00 · 8h/día', distance: '4.2 km', recurring: true, badges: [{ label: 'Equipo recurrente', variant: 'warning' }, { label: 'Disponibilidad fija', variant: 'info' }] },
  { id: 4, title: 'QF en guardia · 24h', org: 'Clínica Internacional · Av. Garcilaso, Lima Centro', orgShort: 'CI', matchPercent: 91, date: 'Vie 21 may', time: '08:00 (24h)', distance: '2.2 km', urgent: true, badges: [{ label: 'Hospitalario', variant: 'info' }, { label: 'Colegiatura QF', variant: 'info' }] },
  { id: 5, title: 'QF · Vie + Sáb nocturno', org: 'Boticas BTL · Av. Diagonal 530, Miraflores', orgShort: 'BT', matchPercent: 92, date: 'Vie 21 + Sáb 22', time: '22:00–06:00', distance: '1.1 km', badges: [{ label: '2 turnos', variant: 'info' }] },
]

/* ── tier computation from reputation_score ─────────────── */
function computeTier(score) {
  if (score == null) return { label: 'Bronce', progress: 0, left: 70, topPercent: null }
  if (score >= 93) return { label: 'Elite',  progress: Math.min(100, Math.round((score - 93) / 7 * 100)), left: null, topPercent: 5 }
  if (score >= 85) return { label: 'Oro',    progress: Math.round((score - 85) / 8 * 100),  left: 93 - score, topPercent: 15 }
  if (score >= 70) return { label: 'Plata',  progress: Math.round((score - 70) / 15 * 100), left: 85 - score, topPercent: 30 }
  return               { label: 'Bronce', progress: Math.round(score / 70 * 100),        left: 70 - score, topPercent: null }
}

const FILTERS = [
  { label: 'Todos', key: null },
  { label: 'Nocturno', key: 'nocturno' },
  { label: 'Fin de semana', key: 'weekend' },
  { label: '≤3 km', key: 'nearby' },
  { label: 'Match ≥90%', key: 'high_match' },
]

function normalizeShift(s) {
  const companyName = s.company?.name ?? s.pharmacy_name ?? s.company_name ?? 'Farmacia'
  const meta        = s.metadata ?? {}
  const district    = meta.district ?? s.district ?? ''
  const local       = meta.local ?? ''
  const tags        = meta.tags ?? []
  const orgLine     = local || [companyName, district].filter(Boolean).join(' · ')
  return {
    id:          s.id,
    title:       s.title ?? s.role ?? 'Turno',
    org:         [orgLine, s.location ?? s.address].filter(Boolean).join(' · '),
    orgShort:    companyName.slice(0, 2).toUpperCase(),
    matchPercent: s.match_percent ?? s.compatibility_score ?? null,
    date:        s.shift_date ?? s.date ?? '',
    time:        s.time ?? [s.starts_at ?? s.start_time, s.ends_at ?? s.end_time].filter(Boolean).join('–'),
    distance:    s.distance_km ? `${s.distance_km} km` : null,
    urgent:      s.priority === 'urgent' || s.priority === 'high' || s.urgent === true,
    recurring:   tags.includes('turno_estable') || s.recurring === true,
    badges:      s.badges ?? (tags.includes('turno_estable') ? [{ label: 'Estable', variant: 'success' }] : []),
    metadata:    meta,
  }
}

/* ── availability toggle ────────────────────────────────── */
function useAvailability(initial = true) {
  const [available, setAvailable] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setSaving(true)
    const next = !available
    setAvailable(next)
    try {
      // Backend expects { is_available: boolean } not { available }
      await api.post('/professional/availability', { is_available: next })
    } catch {
      setAvailable(!next)
    } finally {
      setSaving(false)
    }
  }

  return { available, saving, toggle }
}

/* ── component ──────────────────────────────────────────── */
export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(0)
  const [selectedShift, setSelectedShift] = useState(null)
  const { available, saving, toggle } = useAvailability(true)

  const { shifts: apiShifts, applications, metrics: apiMetrics, loadingShifts } = useDashboardData()

  // Redirect company accounts to their dashboard (after hooks)
  if (isCompanyAccount(user)) {
    return <Navigate to="/app/farmacia" replace />
  }

  // Derive real KPI values from backend data
  const repScore      = apiMetrics?.reputation_score ?? null
  const tierData      = computeTier(repScore)
  const acceptedCount = applications.filter((a) => a.status === 'accepted' || a.status === 'confirmed').length
  const closedCount   = applications.filter((a) => ['accepted', 'confirmed', 'rejected', 'withdrawn'].includes(a.status)).length
  const acceptRate    = closedCount > 0 ? Math.round((acceptedCount / closedCount) * 100) : null

  const metrics   = apiMetrics ?? {}
  const rawShifts = apiShifts.length > 0 ? apiShifts.map(normalizeShift) : MOCK_SHIFTS
  const firstName = user?.name?.split(' ')[0] ?? 'profesional'

  // Apply active filter
  const activeKey = FILTERS[activeFilter]?.key
  const displayedShifts = rawShifts.filter((s) => {
    if (!activeKey) return true
    if (activeKey === 'nocturno') {
      const t = (s.time ?? '').toLowerCase()
      return t.includes('22:') || t.includes('23:') || (s.title ?? '').toLowerCase().includes('nocturn')
    }
    if (activeKey === 'weekend') {
      if (!s.date) return false
      const d = new Date(s.date)
      return d.getDay() === 0 || d.getDay() === 6
    }
    if (activeKey === 'nearby') {
      if (!s.distance) return false
      return parseFloat(s.distance) <= 3
    }
    if (activeKey === 'high_match') {
      return (s.matchPercent ?? 0) >= 90
    }
    return true
  }).slice(0, 6)

  // Derive turnos completados
  const completedCount = applications.filter((a) => a.status === 'confirmed' || a.status === 'completed').length
  const totalCompleted = metrics.completed_shifts ?? completedCount

  return (
    <>
      {/* Header */}
      <div className="ft-dash-header">
        <div>
          <h1>Buenos días, <em>{firstName}</em>.</h1>
          <div className="ft-dash-sub">
            {rawShifts.length} turnos disponibles cerca
            {repScore != null ? ` · tu match promedio: ${repScore}/100` : ''}
            {acceptedCount > 0 ? <> · <b style={{ color: '#15803D' }}>{acceptedCount} postulaciones aceptadas</b></> : ''}
          </div>
        </div>
        <button
          className={`ft-btn ${available ? 'ft-btn-brand' : 'ft-btn-outline'} ft-btn-sm`}
          onClick={toggle}
          disabled={saving}
          style={{ gap: 6 }}
        >
          <IconToggle />
          {saving ? 'Guardando…' : available ? 'Disponible ahora' : 'No disponible'}
        </button>
      </div>

      {/* Tier card */}
      <TierCard
        tier={tierData.label}
        progress={tierData.progress}
        turnosParaSiguiente={tierData.left}
        topPercent={tierData.topPercent}
      />

      {/* KPI row — matches prototype */}
      <div className="ft-kpi-row">
        <StatTile
          label="Turnos completados"
          valueDisplay={<em>{totalCompleted > 0 ? totalCompleted : '—'}</em>}
          delta={totalCompleted > 0 ? `↑ ${Math.max(1, Math.round(totalCompleted * 0.05))} este mes` : 'Sin datos aún'}
          deltaType="up"
        />
        <StatTile
          label="Score global"
          valueDisplay={repScore != null
            ? <>{repScore}<span style={{ fontSize: 18, color: 'var(--ft-gray-400)', fontWeight: 500 }}>/100</span></>
            : <span style={{ fontSize: 18, color: 'var(--ft-gray-400)' }}>—</span>
          }
          delta={repScore != null ? '→ Estable' : 'Completá turnos para obtener score'}
          deltaType="flat"
        />
        <StatTile
          label="Ranking local"
          valueDisplay={metrics.ranking != null
            ? <>#<span style={{ letterSpacing: '-0.01em' }}>{metrics.ranking}</span><span style={{ fontSize: 16, color: 'var(--ft-gray-400)', fontWeight: 500 }}> de {metrics.ranking_total ?? 480}</span></>
            : <span style={{ fontSize: 18, color: 'var(--ft-gray-400)' }}>—</span>
          }
          delta={metrics.ranking != null ? '↑ subiste 3' : 'Sin datos aún'}
          deltaType="up"
        />
        <StatTile
          label="Tasa de aceptación"
          valueDisplay={acceptRate != null ? `${acceptRate}%` : <span style={{ fontSize: 18, color: 'var(--ft-gray-400)' }}>—</span>}
          delta={acceptRate != null ? `↑ ${closedCount > 0 ? '3.2%' : '0%'}` : 'Sin datos aún'}
          deltaType={acceptRate != null && acceptRate >= 70 ? 'up' : 'flat'}
        />
      </div>

      {/* Filter chips */}
      <div className="ft-filter-bar">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            className={`ft-chip${activeFilter === i ? ' active' : ''}`}
            onClick={() => setActiveFilter(i)}
          >
            {f.label}
            {i === 0 && <span className="ft-chip-count">{rawShifts.length}</span>}
          </button>
        ))}
      </div>

      {/* Main work area */}
      <div className="ft-dash-work">
        <div>
          {loadingShifts
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="ft-shift-card" style={{ opacity: 0.4, animation: 'none' }}>
                  <div style={{ height: 80, background: 'var(--ft-gray-100)', borderRadius: 8 }} />
                </div>
              ))
            : displayedShifts.map((shift, i) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  colorIndex={i}
                  selected={selectedShift === shift.id}
                  onApply={() => navigate(`/app/turnos/${shift.id}`)}
                  onDetail={() => { setSelectedShift(shift.id); navigate(`/app/turnos/${shift.id}`) }}
                />
              ))
          }
        </div>

        {/* Right column */}
        <div>
          <div className="ft-pane">
            <div className="ft-pane-head">
              <h3>Tu reputación esta semana</h3>
              <a href="/app/reputacion">Ver todo →</a>
            </div>
            <div className="ft-perf-grid">
              <ScoreBar label="Puntualidad"   value={metrics.punctuality_score  ?? metrics.score_punctuality  ?? 98} />
              <ScoreBar label="Operación"     value={metrics.operation_score    ?? metrics.score_operation    ?? 94} />
              <ScoreBar label="Atención"      value={metrics.care_score         ?? metrics.score_attention    ?? 96} />
              <ScoreBar label="Confiabilidad" value={metrics.reliability_score  ?? metrics.score_reliability  ?? 99} />
            </div>
            <div className="ft-badges-row">
              <Badge variant="success">Puntual</Badge>
              <Badge variant="info">Operador clave</Badge>
              <Badge variant="coral">Top ventas</Badge>
              <Badge variant="warning">Nocturno pro</Badge>
            </div>
          </div>

          <div className="ft-pane">
            <div className="ft-pane-head">
              <h3>Actividad reciente</h3>
            </div>
            <FeedItem variant="success" icon={<IconCheck />} message="<b>Inkafarma Pardo</b> confirmó tu turno" time="Hace 12 min" />
            <FeedItem variant="coral"   icon={<IconBolt />}  message="3 turnos urgentes cerca · <b>match alto</b>" time="Hace 1 hora" />
            <FeedItem variant="info"    icon={<IconStar />}  message="Subiste a nivel <b>Oro</b> 🎉" time="Ayer" />
            <FeedItem variant="warning" icon={<IconCard />}  message="Pago de tu última semana depositado" time="Hace 2 días" />
          </div>
        </div>
      </div>
    </>
  )
}

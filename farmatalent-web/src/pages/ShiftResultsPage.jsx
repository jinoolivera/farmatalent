/**
 * ShiftResultsPage — página standalone de búsqueda de turnos.
 * Layout idéntico al prototipo: nav propio + search bar compacto + split panel/mapa.
 * No requiere autenticación (pública). El botón Aplicar pide login si no hay sesión.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { fetchMyApplications, reviewApplication, withdrawApplication } from '../api/applicationsApi'
import { fetchShifts } from '../api/shiftsApi'
import { getApiErrorMessage } from '../api/client'
import { PostulacionModal } from '../components/marketplace/PostulacionModal'
import { ShiftMap } from '../components/map/ShiftMap'

/* ── gradientes por tipo ────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#1E40AF,#3B82F6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#7C2D12,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
]

const QUICK_CHIPS = [
  { label: '🌙 Nocturnos',   key: 'night'  },
  { label: '⚡ Urgentes',    key: 'urgent' },
  { label: '🔁 Continuidad', key: 'recur'  },
  { label: '📍 ≤3 km',       key: 'nearby' },
  { label: '⭐ Match ≥90%',  key: 'high'   },
]

/* ── icons ──────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconRecur = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/>
  </svg>
)
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

/* ── URL base del storage Laravel (funciona con proxy Vite y URL absoluta) ── */
const _apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
const API_BASE = _apiUrl.startsWith('http') ? _apiUrl.replace(/\/api\/v\d+$/, '') : ''

/* ── normalizar shift de API ────────────────────────────── */
function norm(s, idx) {
  const orgName  = s.pharmacy_name ?? s.company?.name ?? s.company_name ?? 'Farmacia'
  const logoPath = s.company?.logo_path
  const logoUrl  = logoPath ? `${API_BASE}/storage/${logoPath}` : null
  const meta    = s.metadata ?? {}
  const tags    = meta.tags ?? []
  return {
    id:              s.id,
    title:           s.title ?? s.role ?? 'Turno',
    org:             meta.local ?? orgName,
    orgShort:        orgName.slice(0, 2).toUpperCase(),
    logoUrl,
    colorIdx:        idx % GRADIENTS.length,
    matchPercent:    s.match_percent ?? s.compatibility_score ?? null,
    date:            s.shift_date ?? s.date ?? '',
    startTime:       s.starts_at ?? s.start_time ?? '',
    endTime:         s.ends_at   ?? s.end_time   ?? '',
    address:         s.location  ?? s.address    ?? '',
    distanceKm:      s.distance_km ? `${s.distance_km} km` : null,
    urgent:          s.urgent ?? s.priority === 'high',
    recurring:       tags.includes('turno_estable') || s.recurring === true,
    requiresLicense: s.requires_license ?? false,
    description:     s.description ?? '',
    status:          s.status ?? 'open',
    metadata:        meta,
    company:         s.company,
    professional_type: s.professional_type,
    starts_at:       s.starts_at,
    ends_at:         s.ends_at,
    location:        s.location,
  }
}

/* ── nav (prototipo) ────────────────────────────────────── */
function SearchNav({ user, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : ''
  return (
    <nav className="sr-nav">
      <div className="sr-nav-in">
        <Link to="/" className="sr-nav-logo">
          <img src="/farmatalent-logo.svg" alt="FarmaTalent" height="28" style={{ display: 'block' }} />
        </Link>
        <div className="sr-mode">
          <Link to="/" className="sr-mode-btn">Buscar talento</Link>
          <button className="sr-mode-btn active">Encontrar turnos</button>
        </div>
        <div className="sr-nav-right">
          <Link className="sr-nav-link" to="/">Inicio</Link>
          {user ? (
            <>
              <Link className="sr-nav-link" to="/app">Dashboard</Link>
              <Link className="sr-nav-link" to="/app/perfil">Mi perfil</Link>
              <div className="sr-nav-ava" title={user.name}>{initials}</div>
              <button
                onClick={onLogout}
                className="sr-nav-link"
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#6B7280', fontWeight: 500 }}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link className="sr-nav-link" to="/login">Iniciar sesión</Link>
              <Link className="sr-nav-link sr-nav-cta" to="/registro/profesional">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ── tarjeta de turno en el panel ───────────────────────── */
function ShiftItem({ shift, active, onSelect, onApply, applied, busy }) {
  const matchHigh = (shift.matchPercent ?? 0) >= 90
  return (
    <div className={`sr-item${active ? ' active' : ''}`} onClick={() => onSelect(shift)}>
      <div className="sr-it-logo" style={{ background: shift.logoUrl ? '#fff' : GRADIENTS[shift.colorIdx] }}>
        {shift.logoUrl
          ? <img src={shift.logoUrl} alt={shift.org} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', padding: 2 }} />
          : shift.orgShort}
      </div>
      <div className="sr-it-body">
        <div className="sr-it-top">
          <div style={{ minWidth: 0 }}>
            <div className="sr-it-title">{shift.title}</div>
            <div className="sr-it-org">
              {shift.org}{shift.address ? ` · ${shift.address}` : ''}
            </div>
          </div>
          {shift.matchPercent != null && (
            <span className={`sr-match-pill${matchHigh ? '' : ' mid'}`}>
              {shift.matchPercent}% match
            </span>
          )}
        </div>

        <div className="sr-it-meta">
          {shift.date      && <span>🗓 {shift.date}</span>}
          {(shift.startTime || shift.endTime) && (
            <span>🕐 {shift.startTime}{shift.endTime ? `–${shift.endTime}` : ''}</span>
          )}
          {shift.distanceKm && <span>📍 {shift.distanceKm}</span>}
        </div>

        <div className="sr-it-tags">
          {shift.urgent         && <span className="sr-tag urg"><span className="sr-ud" />Urgente</span>}
          {shift.recurring      && <span className="sr-tag recur"><IconRecur />Continuidad</span>}
          {shift.requiresLicense && <span className="sr-tag col">Colegiatura QF</span>}
        </div>

        <div className="sr-it-pay">
          <div className="sr-pay-est">
            <span className="sr-pay-ico">✓</span>
            {shift.recurring ? 'Posición estable · sin contrato' : 'Tarifa propuesta por la botica'}
          </div>
          <button
            className="sr-apply-btn"
            disabled={applied || busy}
            onClick={(e) => { e.stopPropagation(); onApply(shift.id) }}
          >
            {applied ? 'Postulado' : busy ? '…' : shift.recurring ? 'Postular' : 'Aplicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── preview flotante al seleccionar pin/tarjeta ─────────── */
function PreviewCard({ shift, applied, busy, onApply, onDetail, onClose }) {
  if (!shift) return null
  const durH = shift.startTime && shift.endTime
    ? (() => {
        const [sh, sm] = shift.startTime.split(':').map(Number)
        const [eh, em] = shift.endTime.split(':').map(Number)
        const diff = (eh * 60 + em - sh * 60 - sm + 1440) % 1440
        return `${Math.floor(diff / 60)}h`
      })()
    : null

  return (
    <div className="sr-preview">
      <div className="sr-pv-cover" style={{ background: GRADIENTS[shift.colorIdx] }}>
        {shift.urgent && (
          <span className="sr-pv-urg"><span className="sr-pud" />Urgente · necesitan cubrir</span>
        )}
        <button className="sr-pv-cross" onClick={onClose} aria-label="Cerrar"><IconX /></button>
        <div className="sr-pv-logo" style={shift.logoUrl ? { background: '#fff', padding: 6 } : {}}>
          {shift.logoUrl
            ? <img src={shift.logoUrl} alt={shift.org} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : shift.orgShort}
        </div>
      </div>
      <div className="sr-pv-bd">
        <h3>{shift.title}</h3>
        <div className="sr-pv-org">
          📍 {shift.org}{shift.address ? ` · ${shift.address}` : ''}{shift.distanceKm ? ` · ${shift.distanceKm}` : ''}
        </div>
        <div className="sr-pv-grid">
          {shift.matchPercent != null && (
            <div className="sr-pv-cell">
              <div className="sr-pv-l">Match</div>
              <div className="sr-pv-v" style={{ color: '#15803D' }}>{shift.matchPercent}%</div>
            </div>
          )}
          <div className="sr-pv-cell">
            <div className="sr-pv-l">Fecha</div>
            <div className="sr-pv-v">{shift.date || '—'}</div>
          </div>
          <div className="sr-pv-cell">
            <div className="sr-pv-l">Horario</div>
            <div className="sr-pv-v">{shift.startTime}{shift.endTime ? ` – ${shift.endTime}` : ''}</div>
          </div>
          {durH && (
            <div className="sr-pv-cell">
              <div className="sr-pv-l">Duración</div>
              <div className="sr-pv-v">{durH}</div>
            </div>
          )}
        </div>
        <div className="sr-pv-pay">
          <div className="sr-pv-pi"><IconShield /></div>
          <div className="sr-pv-pt">
            <b>Tarifa propuesta · acepta, negocia o rechaza</b>
            <span>
              {shift.matchPercent != null
                ? `Tu nivel actual: Compatible ${shift.matchPercent}%`
                : 'Verificado por FarmaTalent'}
            </span>
          </div>
        </div>
        <div className="sr-pv-cta">
          <button
            className="sr-pv-btn-pri"
            disabled={applied || busy}
            onClick={() => onApply(shift.id)}
          >
            {applied ? 'Ya postulaste' : busy ? 'Postulando…' : 'Aplicar al turno →'}
          </button>
          <button className="sr-pv-btn-out" onClick={() => onDetail(shift.id)}>
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── componente principal ───────────────────────────────── */
export function ShiftResultsPage() {
  const { user, logout }                = useAuth()
  const navigate                        = useNavigate()
  const location                        = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const isLoggedIn       = !!user
  const isCompanyAccount = isLoggedIn && !user?.professional_type

  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [appliedIds,   setAppliedIds]   = useState(new Set())
  const [activeShift,  setActiveShift]  = useState(null)
  const [modalShift,   setModalShift]   = useState(null)
  const [activeChip,   setActiveChip]   = useState(null)
  const [sort,         setSort]         = useState('match')
  const [userLocation, setUserLocation] = useState(null)

  /* barra de búsqueda local — se aplica al presionar buscar */
  const [search, setSearch] = useState({
    distrito:    searchParams.get('district')          ?? '',
    profesional: searchParams.get('professional_type') ?? '',
    fecha:       searchParams.get('shift_date')        ?? '',
    horario:     searchParams.get('horario')           ?? '',
  })

  const filters = useMemo(() => ({
    status:            searchParams.get('status')            ?? 'open',
    professional_type: searchParams.get('professional_type') ?? '',
    district:          searchParams.get('district')          ?? '',
    shift_date:        searchParams.get('shift_date')        ?? '',
    horario:           searchParams.get('horario')           ?? '',
    page:              Number(searchParams.get('page') ?? 1),
  }), [searchParams])

  /* geolocalización al montar */
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  /* cargar turnos */
  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchShifts({
        status:            filters.status            || undefined,
        professional_type: filters.professional_type || undefined,
        district:          filters.district          || undefined,
        shift_date:        filters.shift_date        || undefined,
        horario:           filters.horario           || undefined,
        page:              filters.page,
      })
      setItems(data.data ?? [])

      if (isLoggedIn && !isCompanyAccount) {
        const apps = await fetchMyApplications()
        setAppliedIds(new Set((apps.data ?? []).map((a) => a.shift_request_id)))
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los turnos.'))
    } finally {
      setLoading(false)
    }
  }, [filters, isLoggedIn, isCompanyAccount])

  useEffect(() => { loadData() }, [loadData])

  /* sincronizar barra de búsqueda con URL cuando cambia desde fuera */
  useEffect(() => {
    setSearch({
      distrito:    searchParams.get('district')          ?? '',
      profesional: searchParams.get('professional_type') ?? '',
      fecha:       searchParams.get('shift_date')        ?? '',
      horario:     searchParams.get('horario')           ?? '',
    })
  }, [searchParams])

  /* ── handlers ─────────────────────────────────────────── */
  function handleSearch() {
    const params = new URLSearchParams()
    params.set('status', 'open')
    if (search.profesional) params.set('professional_type', search.profesional)
    if (search.distrito)    params.set('district',          search.distrito)
    if (search.fecha)       params.set('shift_date',        search.fecha)
    if (search.horario)     params.set('horario',           search.horario)
    setSearchParams(params, { replace: true })
    setActiveShift(null)
  }

  function handleApply(shiftId) {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    const shift = displayShifts.find((s) => s.id === shiftId)
    if (shift) setModalShift(shift)
  }

  function handleModalSuccess(applicationId) {
    setModalShift(null)
    setActiveShift(null)
    loadData()
    if (applicationId) navigate(`/app/match/${applicationId}`)
  }

  /* ── lista filtrada y ordenada ──────────────────────────── */
  const displayShifts = useMemo(() => {
    let list = items.map((s, i) => norm(s, i))

    if (activeChip === 'night')  list = list.filter((s) => s.startTime >= '22:00' || /noc/i.test(s.title))
    if (activeChip === 'urgent') list = list.filter((s) => s.urgent)
    if (activeChip === 'recur')  list = list.filter((s) => s.recurring)
    if (activeChip === 'nearby') list = list.filter((s) => s.distanceKm && parseFloat(s.distanceKm) <= 3)
    if (activeChip === 'high')   list = list.filter((s) => (s.matchPercent ?? 0) >= 90)

    if (sort === 'match')  return [...list].sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0))
    if (sort === 'urgent') return [...list].sort((a, b) => Number(b.urgent) - Number(a.urgent))
    if (sort === 'recent') return [...list].sort((a, b) => b.id - a.id)
    return list
  }, [items, sort, activeChip])

  const coverageCount  = displayShifts.filter((s) => !s.recurring).length
  const continuidadCount = displayShifts.filter((s) => s.recurring).length

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="sr-shell">

      {/* ── nav (prototipo) ── */}
      <SearchNav user={user} onLogout={async () => { await logout(); navigate('/') }} />

      {/* ── search bar compacto ── */}
      <div className="sr-search">
        <div className="sr-sbar">
          <div className="sr-sb-pill">
            <div className="sr-sf">
              <div className="sr-sf-lbl">Distrito</div>
              <input
                className="sr-sf-input"
                placeholder="SJL, Ate, Lima…"
                value={search.distrito}
                onChange={(e) => setSearch((s) => ({ ...s, distrito: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="sr-sf">
              <div className="sr-sf-lbl">Profesional</div>
              <select
                className="sr-sf-input"
                value={search.profesional}
                onChange={(e) => setSearch((s) => ({ ...s, profesional: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="pharmacist">Q.F. responsable</option>
                <option value="pharmacy_technician">Técnico farmacia</option>
                <option value="assistant">Auxiliar / apoyo</option>
                <option value="doctor">Médico</option>
              </select>
            </div>
            <div className="sr-sf">
              <div className="sr-sf-lbl">Fecha</div>
              <input
                className="sr-sf-input"
                type="date"
                value={search.fecha}
                onChange={(e) => setSearch((s) => ({ ...s, fecha: e.target.value }))}
              />
            </div>
            <div className="sr-sf">
              <div className="sr-sf-lbl">Horario</div>
              <select
                className="sr-sf-input"
                value={search.horario}
                onChange={(e) => setSearch((s) => ({ ...s, horario: e.target.value }))}
              >
                <option value="">Cualquier horario</option>
                <option value="matutino">Matutino (07–15)</option>
                <option value="vespertino">Vespertino (14–22)</option>
                <option value="nocturno">Nocturno (22–06)</option>
              </select>
            </div>
            <button className="sr-go" aria-label="Buscar" onClick={handleSearch}>
              <IconSearch />
            </button>
          </div>

          <div className="sr-filter-row">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.key}
                className={`sr-qchip${activeChip === chip.key ? ' on' : ''}`}
                onClick={() => setActiveChip(activeChip === chip.key ? null : chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* error */}
      {error && (
        <div style={{
          background: '#FEF2F2', borderBottom: '1px solid #FCA5A5',
          color: '#B91C1C', padding: '10px 24px', fontSize: 13, flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      {/* ── split principal ── */}
      <div className="sr-main">

        {/* panel izquierdo */}
        <div className="sr-panel">
          <div className="sr-panel-head">
            <h2><em>{displayShifts.length}</em> oportunidades encontradas</h2>
            <div className="sr-panel-sub">
              {filters.district || 'Todo el Perú'}{' · '}
              <b style={{ color: '#0F2A14' }}>{coverageCount} cobertura</b>{' + '}
              <b style={{ color: '#B45309' }}>{continuidadCount} continuidad</b>
            </div>
            <div className="sr-sort">
              <span>Ordenar por</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="match">Mejor match</option>
                <option value="nearby">Más cercano</option>
                <option value="recent">Más reciente</option>
                <option value="urgent">Más urgente</option>
              </select>
            </div>
          </div>

          <div className="sr-list">
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="sr-item" style={{ opacity: 0.25, pointerEvents: 'none' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E5E7EB', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 14, background: '#E5E7EB', borderRadius: 6, width: '70%' }} />
                      <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, width: '50%' }} />
                      <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, width: '40%' }} />
                    </div>
                  </div>
                ))
              : displayShifts.length === 0
                ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 6 }}>No hay turnos para este filtro</div>
                    <div style={{ fontSize: 13 }}>Probá con otro distrito, profesional o fecha.</div>
                  </div>
                )
                : displayShifts.map((shift) => (
                  <ShiftItem
                    key={shift.id}
                    shift={shift}
                    active={activeShift?.id === shift.id}
                    onSelect={(s) => setActiveShift(activeShift?.id === s.id ? null : s)}
                    onApply={handleApply}
                    applied={appliedIds.has(shift.id)}
                    busy={false}
                  />
                ))
            }
          </div>
        </div>

        {/* mapa Leaflet (columna derecha) */}
        <ShiftMap
          shifts={displayShifts}
          activeId={activeShift?.id}
          onPinClick={(s) => setActiveShift(activeShift?.id === s.id ? null : s)}
          userLocation={userLocation}
        />

        {/* preview flotante */}
        {activeShift && (
          <PreviewCard
            shift={activeShift}
            applied={appliedIds.has(activeShift.id)}
            busy={false}
            onApply={handleApply}
            onDetail={(id) => navigate(`/app/turnos/${id}`)}
            onClose={() => setActiveShift(null)}
          />
        )}
      </div>

      {/* modal de postulación */}
      {modalShift && (
        <PostulacionModal
          shift={modalShift}
          onClose={() => setModalShift(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

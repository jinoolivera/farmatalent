import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { fetchShifts } from '../api/shiftsApi'
import { fetchProfessionalsCount } from '../api/profileApi'

/* ── ticker de actividad reciente (generado desde turnos reales) ── */
function relativeTime(dateStr) {
  if (!dateStr) return 'Recién'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${Math.round(hours / 24)} d`
}

function buildTickerItems(shifts) {
  return shifts
    .slice()
    .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
    .slice(0, 8)
    .map((s) => {
      const meta    = s.metadata ?? {}
      const company = s.company?.name ?? meta.local ?? 'Farmacia'
      const place   = meta.district ?? s.location ?? 'Perú'
      const tipo    = TYPE_LABEL[s.professional_type] ?? 'profesional'
      const time    = s.starts_at && s.ends_at ? `${s.starts_at}–${s.ends_at}` : ''
      const stable  = (meta.tags ?? []).includes('turno_estable')
      const verb    = s.assigned_user_id ? 'confirmó cobertura de' : stable ? 'publicó posición estable de' : 'publicó turno de'
      return `${relativeTime(s.created_at)} · ${company} (${place}) ${verb} ${tipo}${time ? ` · ${time}` : ''}`
    })
}

/* chips de búsqueda rápida */
const QUICK_CHIPS = [
  { label: '🌙 Nocturnos',          horario: 'nocturno'  },
  { label: '📅 Este fin de semana', weekend: true         },
  { label: '💵 Mejor tarifa',       sortBy: 'tarifa'      },
  { label: '📍 Cerca de mí',        nearby: true          },
  { label: '⚡ Urgente',            urgent: true          },
  { label: '⏱ Guardias 24h',       horario: '24h'        },
]

/* gradientes por tipo */
const TYPE_GRADIENT = {
  pharmacy_technician: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
  assistant:           'linear-gradient(135deg,#B45309,#F59E0B)',
  pharmacist:          'linear-gradient(135deg,#15803D,#22C55E)',
  doctor:              'linear-gradient(135deg,#7C2D12,#EF4444)',
}
const TYPE_LABEL = {
  pharmacy_technician: 'Técnico',
  assistant:           'Practicante',
  pharmacist:          'Q.F.',
  doctor:              'Dr.',
}

/* ── tarjeta de distrito ─────────────────────────────────── */
function DistrictCard({ district, shifts, featured }) {
  const total  = shifts.length
  const sample = shifts.slice(0, featured ? 4 : 2)

  return (
    <div className={`lp-city${featured ? ' lp-city-feat' : ''}`}>
      <div className="lp-city-top">
        <div>
          <h3>{district}</h3>
          <div className="lp-city-area">Lima · Perú</div>
        </div>
        <span className="lp-live-badge">
          <span className="lp-dot" />{featured ? 'En vivo' : `${total} turnos`}
        </span>
      </div>
      <div className="lp-city-stats">
        <div className="lp-cstat">
          <div className="lp-cstat-v">{total}</div>
          <div className="lp-cstat-l">{featured ? 'turnos abiertos' : 'turnos'}</div>
        </div>
        <div className="lp-cstat">
          <div className="lp-cstat-v">
            {shifts.filter((s) => (s.metadata?.tags ?? []).includes('turno_estable')).length}
          </div>
          <div className="lp-cstat-l">posiciones estables</div>
        </div>
      </div>
      <div className="lp-city-shifts">
        {sample.map((s) => {
          const meta    = s.metadata ?? {}
          const local   = meta.local ?? s.company?.name ?? s.company_name ?? 'Farmacia'
          const time    = `${s.starts_at?.slice(0,5) ?? ''} – ${s.ends_at?.slice(0,5) ?? ''}`
          const stable  = (meta.tags ?? []).includes('turno_estable')
          // Iniciales del establecimiento (ej: "Botica San Marcos" → "BS", "Inkafarma" → "IN")
          const initials = local.split(' ').filter(w => w.length > 1).map(w => w[0]).slice(0,2).join('').toUpperCase() || 'SF'
          return (
            <div key={s.id} className={`lp-shift-mini${stable ? ' recurring' : ''}`}>
              <div className="lp-shift-code" style={stable ? { color: '#B45309' } : {}}>
                {initials}
              </div>
              <div className="lp-shift-tx">
                <b>{local}</b>
                <span>{stable ? `★ Posición estable · ${time}` : time}</span>
              </div>
              <div className={`lp-shift-arrow${stable ? ' gold' : ''}`}>{stable ? '★' : '→'}</div>
            </div>
          )
        })}
      </div>
      <Link
        className="lp-city-cta"
        to={`/app/turnos?status=open&district=${encodeURIComponent(district)}`}
      >
        {featured ? `Ver ${total} turnos en mapa →` : 'Ver todos →'}
      </Link>
    </div>
  )
}

/* ── returns next Saturday in YYYY-MM-DD ─────────────────── */
function nextSaturday() {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  return d.toISOString().slice(0, 10)
}

/* ── componente principal ───────────────────────────────── */
export function LandingPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [mode, setMode]             = useState('profesional')
  const [district, setDistrict]     = useState('')
  const [professional, setProfessional] = useState('')
  const [fecha, setFecha]           = useState('')
  const [horario, setHorario]       = useState('')
  const [activeChip, setActiveChip] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  /* turnos y profesionales reales desde la API */
  const [shifts, setShifts]         = useState([])
  const [totalShifts, setTotalShifts] = useState(14)
  const [loadingShifts, setLoadingShifts] = useState(true)
  const [proCount, setProCount]     = useState(null)

  const comoRef    = useRef(null)
  const preciosRef = useRef(null)

  /* ticker de actividad — derivado de los turnos reales, vacío si no hay datos */
  const tickerItems  = buildTickerItems(shifts)
  const tickerDouble = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : []

  /* fetch al montar */
  useEffect(() => {
    fetchShifts({ status: 'open', per_page: 50 })
      .then((res) => {
        const data = res.data ?? []
        setShifts(data)
        setTotalShifts(res.meta?.total ?? res.total ?? data.length)
      })
      .catch(() => {})
      .finally(() => setLoadingShifts(false))

    fetchProfessionalsCount()
      .then((count) => { if (count != null) setProCount(Math.max(50, count)) })
      .catch(() => {})
  }, [])

  /* agrupar shifts por distrito */
  const districtMap = shifts.reduce((acc, s) => {
    const d = s.metadata?.district ?? s.location ?? 'Lima'
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  /* ordenar: primero el de más turnos (featured) */
  const districtList = Object.entries(districtMap)
    .sort((a, b) => b[1].length - a[1].length)

  function scrollTo(ref) {
    setMobileNavOpen(false)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function applyChip(chip) {
    if (activeChip?.label === chip.label) {
      setActiveChip(null)
      if (chip.horario)     setHorario('')
      if (chip.professional) setProfessional('')
      return
    }
    setActiveChip(chip)
    if (chip.horario)      setHorario(chip.horario)
    if (chip.professional) setProfessional(chip.professional)
    if (chip.weekend)      setFecha(nextSaturday())
  }

  function handleSearch(e) {
    e?.preventDefault()
    const params = new URLSearchParams()
    params.set('status', 'open')
    if (district)      params.set('district',          district)
    if (professional)  params.set('professional_type', professional)
    if (fecha)         params.set('shift_date',        fecha)
    if (horario && horario !== '24h') params.set('horario', horario)
    navigate(`/app/turnos?${params.toString()}`)
  }

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="lp">

      {/* ===== Nav ===== */}
      <nav className="lp-nav">
        <div className="lp-c lp-nav-in">
          <img src="/farmatalent-logo.svg" alt="FarmaTalent" className="lp-logo" height="30" />
          <div className="lp-mode-toggle">
            <button
              className={`lp-mode-btn${mode === 'empresa' ? ' active' : ''}`}
              onClick={() => setMode('empresa')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
              Buscar talento
            </button>
            <button
              className={`lp-mode-btn${mode === 'profesional' ? ' active' : ''}`}
              onClick={() => setMode('profesional')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Encontrar turnos
            </button>
          </div>
          <div className="lp-nav-right">
            <button className="lp-nav-link" onClick={() => scrollTo(comoRef)}>Cómo funciona</button>
            <button className="lp-nav-link" onClick={() => scrollTo(preciosRef)}>Red</button>
            <Link className="lp-nav-link" to="/login">Iniciar sesión</Link>
            <Link
              className="lp-btn lp-btn-brand"
              to={mode === 'empresa' ? '/registro/farmacia' : '/registro/profesional'}
            >
              Crear cuenta
            </Link>
          </div>

          <button
            className={`lp-nav-burger${mobileNavOpen ? ' active' : ''}`}
            aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>

        {mobileNavOpen && (
          <div className="lp-nav-drawer">
            <div className="lp-mode-toggle lp-nav-drawer-toggle">
              <button
                className={`lp-mode-btn${mode === 'empresa' ? ' active' : ''}`}
                onClick={() => setMode('empresa')}
              >
                Buscar talento
              </button>
              <button
                className={`lp-mode-btn${mode === 'profesional' ? ' active' : ''}`}
                onClick={() => setMode('profesional')}
              >
                Encontrar turnos
              </button>
            </div>
            <button className="lp-nav-drawer-link" onClick={() => scrollTo(comoRef)}>Cómo funciona</button>
            <button className="lp-nav-drawer-link" onClick={() => scrollTo(preciosRef)}>Red</button>
            <Link className="lp-nav-drawer-link" to="/login" onClick={() => setMobileNavOpen(false)}>Iniciar sesión</Link>
            <Link
              className="lp-btn lp-btn-brand lp-nav-drawer-cta"
              to={mode === 'empresa' ? '/registro/farmacia' : '/registro/profesional'}
              onClick={() => setMobileNavOpen(false)}
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>

      {/* ===== Hero ===== */}
      <section className="lp-hero">
        <div className="lp-c">
          <span className="lp-pill">
            <span className="lp-dot" />
            {totalShifts} turnos activos en Perú · ahora mismo
          </span>

          {mode === 'profesional' ? (
            <h1>El <em>talento farmacéutico</em><br />del Perú, en un toque.</h1>
          ) : (
            <h1>Cubre tu próximo turno<br /><em>en menos de 38 minutos.</em></h1>
          )}

          <p className="lp-lead">
            {mode === 'profesional'
              ? 'Marketplace en tiempo real para farmacias, boticas y profesionales de salud. Matching inteligente, reputación operacional, coordinación rápida.'
              : 'Publica tu vacante, recibe postulantes verificados con score real. Sin comisión hasta cubrir tu primer turno.'}
          </p>

          <form className="lp-search" onSubmit={handleSearch}>
            <div className="lp-sf">
              <div className="lp-sf-label">Distrito o zona</div>
              <input
                className="lp-sf-input"
                placeholder="SJL, Ate, El Agustino…"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="lp-sf">
              <div className="lp-sf-label">Profesional</div>
              <select className="lp-sf-input" value={professional} onChange={(e) => setProfessional(e.target.value)}>
                <option value="">Todos</option>
                <option value="pharmacist">Químico farmacéutico</option>
                <option value="pharmacy_technician">Técnico farmacia</option>
                <option value="assistant">Practicante / auxiliar</option>
                <option value="doctor">Médico</option>
              </select>
            </div>
            <div className="lp-sf">
              <div className="lp-sf-label">Fecha</div>
              <input
                className="lp-sf-input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="lp-sf lp-sf-wide">
              <div className="lp-sf-label">Horario</div>
              <select className="lp-sf-input" value={horario} onChange={(e) => setHorario(e.target.value)}>
                <option value="">Cualquier horario</option>
                <option value="matutino">Matutino (08–17)</option>
                <option value="vespertino">Vespertino (14–20)</option>
                <option value="nocturno">Nocturno (22–06)</option>
              </select>
            </div>
            <button type="submit" className="lp-search-go" aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>

          <div className="lp-quick">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className={`lp-qchip${activeChip?.label === chip.label ? ' active' : ''}`}
                onClick={() => applyChip(chip)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="lp-trust">
            <div className="lp-avas">
              <div className="lp-ava" style={{ background: 'linear-gradient(135deg,#22C55E,#15803D)' }}>AG</div>
              <div className="lp-ava" style={{ background: 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>RM</div>
              <div className="lp-ava" style={{ background: 'linear-gradient(135deg,#B45309,#F59E0B)' }}>LP</div>
              <div className="lp-ava" style={{ background: '#F3F4F6', color: '#4B5563' }}>+</div>
            </div>
            <span><b style={{ color: '#111827' }}>{proCount != null ? `${proCount.toLocaleString('es-PE')}+ profesionales activos` : '50+ profesionales activos'}</b> en Perú</span>
          </div>
        </div>
      </section>

      {/* ===== Ticker ===== */}
      {tickerDouble.length > 0 && (
        <div className="lp-ticker">
          <div className="lp-ticker-row">
            {tickerDouble.map((item, i) => (
              <span key={i}><span className="lp-ticker-dot" />{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ===== Marketplace en vivo ===== */}
      <section className="lp-live">
        <div className="lp-c">
          <div className="lp-live-head">
            <div>
              <span className="lp-eyebrow">Marketplace en vivo · Perú</span>
              <h2>Turnos abiertos <em>ahora mismo</em>.</h2>
              <p className="lp-live-sub">
                Posiciones estables y coberturas en farmacias y boticas de todo el Perú.
                Toca un distrito para ver el mapa con ubicación exacta.
              </p>
            </div>
            <div className="lp-live-right">
              <div className="lp-live-num">
                <em>{loadingShifts ? '—' : totalShifts}</em>
              </div>
              <div className="lp-live-nl">turnos activos hoy</div>
            </div>
          </div>

          <div className="lp-cities">
            {loadingShifts ? (
              /* skeleton mientras carga */
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`lp-city${i === 0 ? ' lp-city-feat' : ''}`} style={{ opacity: 0.35 }}>
                  <div style={{ height: 18, background: '#E5E7EB', borderRadius: 6, width: '60%', marginBottom: 8 }} />
                  <div style={{ height: 13, background: '#F3F4F6', borderRadius: 6, width: '40%' }} />
                </div>
              ))
            ) : districtList.length === 0 ? (
              <div style={{ padding: '32px', color: '#6B7280', fontSize: 14 }}>
                No hay turnos disponibles en este momento.
              </div>
            ) : (
              districtList.map(([dist, distShifts], idx) => (
                <DistrictCard
                  key={dist}
                  district={dist}
                  shifts={distShifts}
                  featured={idx === 0}
                />
              ))
            )}

            {/* card para ver todos */}
            {!loadingShifts && districtList.length > 0 && (
              <div className="lp-city">
                <div className="lp-city-top">
                  <div>
                    <h3>Ver todos los turnos</h3>
                    <div className="lp-city-area">Mapa interactivo · Perú</div>
                  </div>
                  <span className="lp-live-badge">
                    <span className="lp-dot" />{totalShifts} activos
                  </span>
                </div>
                <div className="lp-city-stats">
                  <div className="lp-cstat">
                    <div className="lp-cstat-v">{districtList.length}</div>
                    <div className="lp-cstat-l">distritos</div>
                  </div>
                  <div className="lp-cstat">
                    <div className="lp-cstat-v">{districtList.length > 0 ? districtList.reduce((s, [, sh]) => s + sh.length, 0) : totalShifts}</div>
                    <div className="lp-cstat-l">turnos abiertos</div>
                  </div>
                </div>
                <Link className="lp-city-cta" to="/app/turnos?status=open" style={{ marginTop: 6 }}>
                  Explorar mapa completo →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Audiencias / Precios ===== */}
      <section className="lp-section" ref={preciosRef}>
        <div className="lp-c">
          <div className="lp-shead">
            <span className="lp-eyebrow">Quién usa FarmaTalent</span>
            <h2>Una red, <em>tres formas</em> de operar.</h2>
            <p>No somos una bolsa de trabajo. Somos el marketplace donde el sector salud del Perú encuentra al talento correcto para cada turno.</p>
          </div>
          <div className="lp-aud-grid">
            {[
              {
                icon: '👤', color: 'green', title: 'Profesionales',
                desc: 'Químicos farmacéuticos, técnicos, auxiliares. Perfil verificado, scores reales, elige cuándo y dónde trabajas.',
                stats: [['TF', 'técnico farmacia'], ['PP', 'practicante'], ['QF', 'responsable']],
                link: 'Soy profesional →', to: '/registro/profesional',
              },
              {
                icon: '🏪', color: 'amber', title: 'Farmacias y boticas',
                desc: 'Publica tu vacante, recibe candidatos verificados y gestiona todos tus locales desde una sola plataforma.',
                stats: [['38 min', 'cobertura media'], ['94%', 'satisfacción'], ['48h', 'tiempo match']],
                link: 'Tengo una botica →', to: '/registro/farmacia',
              },
              {
                icon: '🏥', color: 'coral', title: 'Clínicas y hospitales',
                desc: 'Equipos completos para turnos especializados y guardias. Reputación operacional verificada por FarmaTalent.',
                stats: [['24/7', 'cobertura'], ['QF', 'colegiados'], ['+3', 'especialidades']],
                link: 'Soy clínica →', to: '/registro/farmacia',
              },
            ].map((aud) => (
              <div key={aud.title} className="lp-aud-card">
                <div className={`lp-aud-icon lp-aud-${aud.color}`}>{aud.icon}</div>
                <h3>{aud.title}</h3>
                <p>{aud.desc}</p>
                <div className="lp-aud-stats">
                  {aud.stats.map(([v, l]) => (
                    <div key={l} className="lp-aud-stat">
                      <div className="lp-aud-v">{v}</div>
                      <div className="lp-aud-l">{l}</div>
                    </div>
                  ))}
                </div>
                <Link className="lp-aud-link" to={aud.to}>{aud.link}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DOS MODOS, UNA RED ===== */}
      <section className="lp-modes">
        <div className="lp-c">
          <div className="lp-shead">
            <span className="lp-eyebrow">DOS MODOS, UNA RED</span>
            <h2>Cobertura puntual o equipo <em>de confianza</em>.</h2>
            <p>FarmaTalent no es una bolsa de trabajo. Es la infraestructura del talento farmacéutico en el Perú.</p>
          </div>
          <div className="lp-modes-grid">
            {/* Cobertura inmediata */}
            <div className="lp-mode-card lp-mode-cov">
              <div className="lp-mode-img">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                  alt="Cobertura inmediata"
                  loading="lazy"
                />
                <div className="lp-mode-overlay" />
                <div className="lp-mode-tag">⚡ Cobertura inmediata</div>
                <div className="lp-mode-mini">
                  <div className="lp-mode-mini-num">38 min</div>
                  <div className="lp-mode-mini-l">tiempo medio de cobertura</div>
                </div>
              </div>
              <div className="lp-mode-body">
                <div className="lp-mode-num">01</div>
                <h3>Turno cubierto antes de que lo notes.</h3>
                <p>Publica una guardia de urgencia y el sistema notifica a profesionales verificados con match alto. Sin llamadas, sin WhatsApp.</p>
                <div className="lp-mode-stats">
                  <div><b>+900</b><span>postulantes activos</span></div>
                  <div><b>38 min</b><span>cobertura media</span></div>
                  <div><b>Top 5%</b><span>Miraflores</span></div>
                </div>
                <Link className="lp-mode-link" to="/registro/farmacia">Publicar turno urgente →</Link>
              </div>
            </div>

            {/* Continuidad profesional */}
            <div className="lp-mode-card lp-mode-cont">
              <div className="lp-mode-img">
                <img
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80"
                  alt="Continuidad profesional"
                  loading="lazy"
                />
                <div className="lp-mode-overlay" />
                <div className="lp-mode-tag">🔁 Continuidad profesional</div>
                <div className="lp-mode-mini">
                  <div className="lp-mode-mini-num">★ 4.9</div>
                  <div className="lp-mode-mini-l">score promedio equipo</div>
                </div>
              </div>
              <div className="lp-mode-body">
                <div className="lp-mode-num">02</div>
                <h3>Tu equipo recurrente, sin fricción.</h3>
                <p>Construye un panel de profesionales frecuentes. Reputación operacional acumulada, disponibilidad actualizada, historial compartido.</p>
                <div className="lp-mode-stats">
                  <div><b>L–V</b><span>posiciones estables</span></div>
                  <div><b>4.9★</b><span>score promedio</span></div>
                  <div><b>−40%</b><span>rotación</span></div>
                </div>
                <Link className="lp-mode-link" to="/registro/farmacia">Armar mi equipo →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tu carrera farmacéutica ===== */}
      <section className="lp-growth">
        <div className="lp-c">
          <div className="lp-grow-grid">
            {/* Left: photo + badge */}
            <div className="lp-grow-img">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
                alt="Profesional farmacéutica"
                loading="lazy"
              />
              <div className="lp-grow-badge">
                <div className="lp-gb-num">94<span>/100</span></div>
                <div className="lp-gb-tier">★ Nivel Oro · Top 12%</div>
                <div className="lp-gb-sub">Score de reputación FarmaTalent</div>
              </div>
            </div>

            {/* Right: text + tier track */}
            <div className="lp-grow-body">
              <span className="lp-eyebrow">Tu carrera farmacéutica</span>
              <h2>No es un turnito.<br /><em>Es tu reputación.</em></h2>
              <p>Cada turno que completas suma a tu score operacional: puntualidad, atención, confiabilidad. Subes de nivel, accedes a turnos mejor pagados y te conviertes en el profesional que las boticas buscan primero.</p>
              <div className="lp-grow-tiers">
                {[
                  { label: 'Bronce', sub: 'Empiezas aquí',  cls: 'done'  },
                  { label: 'Plata',  sub: '70+ puntos',    cls: 'done'  },
                  { label: 'Oro',    sub: '85+ · Top 15%', cls: 'now'   },
                  { label: 'Elite',  sub: '93+ · Top 5%',  cls: 'elite' },
                ].map((t) => (
                  <div key={t.label} className={`lp-gt lp-gt-${t.cls}`}>
                    <div className="lp-gt-dot" />
                    <div className="lp-gt-label">{t.label}</div>
                    <div className="lp-gt-sub">{t.sub}</div>
                  </div>
                ))}
              </div>
              <Link className="lp-btn lp-btn-brand" to="/registro/profesional" style={{ marginTop: 32, alignSelf: 'flex-start' }}>
                Empezar a construir mi reputación →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section className="lp-how" ref={comoRef}>
        <div className="lp-c">
          <div className="lp-shead">
            <span className="lp-eyebrow">Cómo funciona</span>
            <h2>De vacante crítica a turno cubierto, <em>en tres pasos</em>.</h2>
          </div>
          <div className="lp-steps">
            {[
              { n: '01.', title: 'Publica o busca', desc: 'Menos de 90 segundos. Configura tu disponibilidad y especialidad. El sistema filtra solo los turnos con match alto.' },
              { n: '02.', title: 'Matching inteligente', desc: 'Filtramos por reputación, distancia, especialidad, colegiatura y disponibilidad. Solo ves lo que es relevante.' },
              { n: '03.', title: 'Confirma y opera', desc: 'Aplica con un toque. La botica revisa scores, decide. Check-in, check-out y coordinación completa en plataforma.' },
            ].map((s) => (
              <article key={s.n} className="lp-step">
                <div className="lp-step-n">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="lp-ctas">
        <div className="lp-c">
          <div className="lp-cta-box">
            <div className="lp-cta-inner">
              <span className="lp-eyebrow" style={{ color: '#86EFAC' }}>EMPIEZA HOY · ES GRATIS</span>
              <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 'clamp(36px,4.5vw,52px)', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '12px 0 0' }}>
                Tu próximo turno —<br />
                <em style={{ fontFamily: 'var(--ft-font-display)', fontStyle: 'italic', fontWeight: 400, color: '#86EFAC' }}>
                  o tu próximo profesional
                </em>{' '}— a un toque.
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,.7)', margin: '16px 0 28px', maxWidth: 540, lineHeight: 1.5 }}>
                Crear cuenta es gratis. Sin contratos, sin permanencia, sin comisión hasta cubrir tu primer turno.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  className="lp-btn lp-btn-brand lp-btn-lg"
                  to={mode === 'empresa' ? '/registro/farmacia' : '/registro/profesional'}
                >
                  Crear cuenta gratis →
                </Link>
                <a className="lp-btn-ghost" href="mailto:hola@farmatalent.pe">
                  Hablar con ventas
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="lp-footer">
        <div className="lp-c">
          <div className="lp-footer-grid">
            <div>
              <img src="/farmatalent-logo.svg" alt="FarmaTalent" className="lp-logo" height="26" style={{ marginBottom: 12 }} />
              <p className="lp-footer-desc">
                El marketplace del talento farmacéutico en el Perú. Reputación verificada, matching inteligente, coordinación rápida.
              </p>
            </div>
            {[
              { title: 'Producto', links: [
                  { label: 'Para profesionales', to: '/registro/profesional' },
                  { label: 'Para boticas', to: '/registro/farmacia' },
                  { label: 'Para clínicas', to: '/registro/farmacia' },
                  { label: 'Comunidad', to: '/#comunidad' },
                ]},
              { title: 'Compañía', links: [
                  { label: 'Sobre nosotros', to: '/' },
                  { label: 'Blog', to: '/' },
                  { label: 'Trabaja con nosotros', href: 'mailto:hola@farmatalent.pe' },
                  { label: 'Contacto', href: 'mailto:hola@farmatalent.pe' },
                ]},
              { title: 'Legal', links: [
                  { label: 'Privacidad', to: '/privacidad' },
                  { label: 'Términos', to: '/terminos' },
                  { label: 'Cookies', to: '/cookies' },
                ]},
            ].map((col) => (
              <div key={col.title} className="lp-footer-col">
                <h6>{col.title}</h6>
                {col.links.map((l) =>
                  l.href
                    ? <a key={l.label} href={l.href}>{l.label}</a>
                    : <Link key={l.label} to={l.to}>{l.label}</Link>
                )}
              </div>
            ))}
          </div>
          <div className="lp-footer-btm">
            <span>© 2026 FarmaTalent Perú · Todos los derechos reservados</span>
            <span>Hecho con cuidado · Lima, Perú 🇵🇪</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

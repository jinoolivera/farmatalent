import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { fetchMyApplications, fetchCompanyApplications } from '../api/applicationsApi'
import { fetchChatMessages, sendChatMessage } from '../api/chatApi'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'

const POLL_MS = 5000

/* ── helpers ─────────────────────────────────────────────── */
function initials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}
function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}
function fmtRelative(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso)
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'Ahora'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h`
  if (h < 48)   return 'ayer'
  const DAYS = ['dom','lun','mar','mié','jue','vie','sáb']
  return DAYS[new Date(iso).getDay()]
}
function shiftTag(app) {
  const s    = app.shift_request ?? app.shift ?? {}
  const date = s.shift_date ? new Date(s.shift_date) : null
  if (app.status === 'confirmed') return { cls: 'tag-done',   label: 'Cerrado · ★5' }
  if (date) {
    const diff = (date - Date.now()) / (1000 * 3600)
    if (diff >= 0 && diff < 24) return { cls: 'tag-active', label: `● Turno hoy · ${s.starts_at?.slice(0,5) ?? ''}` }
    const WD = ['dom','lun','mar','mié','jue','vie','sáb']
    return { cls: 'tag-soon', label: `${WD[date.getDay()]} ${date.getDate()} · ${s.starts_at?.slice(0,5) ?? ''}` }
  }
  return { cls: 'tag-active', label: 'Aceptado' }
}

const THREAD_COLORS = [
  { bg: 'linear-gradient(135deg,#fff,#E5E7EB)', color: '#15803D' },
  { bg: 'linear-gradient(135deg,#3B82F6,#1E40AF)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#F59E0B,#B45309)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#7C2D12,#EF4444)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#5B21B6,#8B5CF6)', color: '#fff' },
  { bg: 'linear-gradient(135deg,#0F766E,#14B8A6)', color: '#fff' },
]

const TYPE_LABEL = {
  pharmacist:          'Q.F. responsable',
  pharmacy_technician: 'Técnico farmacia',
  assistant:           'Auxiliar / apoyo',
  nurse:               'Enfermero/a',
  intern:              'Practicante',
}

const QUICK_ACTIONS = [
  { label: '📍 Estoy en camino', event: true  },
  { label: '🚪 Llegué',          event: true  },
  { label: '⏱ Inicio turno',    event: false },
  { label: '✓ Cierro turno',    event: false },
  { label: '⚠️ Reportar',        event: false },
  { label: '📦 Pedido stock',    event: false },
]

/* ── Icons ───────────────────────────────────────────────── */
const IcoSearch = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IcoCheck  = () => <svg width="9"  height="9"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
const IcoSend   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor"/></svg>
const IcoPhone  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const IcoDots   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
const IcoPin    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>
const IcoAttach = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
const IcoMic    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
const IcoMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>

/* ── Stepper ─────────────────────────────────────────────── */
function Stepper({ app }) {
  const shift = app?.shift_request ?? app?.shift ?? {}
  const steps = [
    { label: 'Match confirmado',     detail: 'ambos aceptaron',           state: 'done'    },
    { label: 'Coordinación inicial', detail: 'chat habilitado',           state: 'done'    },
    { label: 'En camino al turno',   detail: 'ETA por coordinar',         state: 'cur'     },
    { label: 'Inicio de turno',      detail: shift.starts_at?.slice(0,5) ?? '—', state: 'pending' },
    { label: 'Cierre y calificación',detail: shift.ends_at?.slice(0,5)   ?? '—', state: 'pending' },
  ]
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className={`ms-step ms-step-${s.state}`}>
          <div className="ms-step-dot">{s.state === 'done' ? <IcoCheck /> : i + 1}</div>
          <div className="ms-step-tx"><b>{s.label}</b><span>{s.detail}</span></div>
        </div>
      ))}
    </div>
  )
}

/* ── Center chat panel ───────────────────────────────────── */
function ChatCenter({ app, user, isCompany, onBack }) {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const bottomRef = useRef(null)
  const appId = app?.id

  const load = useCallback(async () => {
    if (!appId) return
    try {
      const data = await fetchChatMessages(appId)
      setMessages(data.data ?? [])
      setError('')
    } catch (e) {
      setError(getApiErrorMessage(e, 'Error al cargar mensajes.'))
    } finally { setLoading(false) }
  }, [appId])

  useEffect(() => { setLoading(true); setMessages([]); load() }, [load])
  useEffect(() => {
    if (!appId) return
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load, appId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [messages]
  )

  async function handleSend(e) {
    e?.preventDefault()
    const msg = text.trim()
    if (!msg || !appId) return
    setSending(true)
    try { await sendChatMessage(appId, { message: msg }); setText(''); await load() }
    catch (e) { setError(getApiErrorMessage(e, 'No se pudo enviar.')) }
    finally { setSending(false) }
  }

  async function sendQuick(label) {
    if (!appId) return
    try { await sendChatMessage(appId, { message: label }); await load() }
    catch { /* silent */ }
  }

  if (!app) {
    return (
      <div className="ms-chat-empty-state">
        <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 6 }}>Selecciona una conversación</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>El chat se habilita cuando una botica acepta tu postulación.</div>
      </div>
    )
  }

  const shift       = app.shift_request ?? app.shift ?? {}
  const company     = shift.company ?? {}
  const companyName = company.name ?? 'Botica'
  const branchLabel = shift.location ? ` · ${shift.location.split(',')[0]}` : ''
  const otherName   = isCompany ? (app.worker?.name ?? 'Profesional') : companyName
  const shiftTime   = [shift.starts_at?.slice(0,5), shift.ends_at?.slice(0,5)].filter(Boolean).join('–')

  return (
    <section className="ms-chat">
      {/* Chat header */}
      <div className="ms-chat-head">
        <button className="ms-back-btn" aria-label="Volver a conversaciones" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div className="ms-ch-ava">
          {initials(companyName)}
          <span className="ms-vchk"><IcoCheck /></span>
        </div>
        <div className="ms-ch-info">
          <h3>{companyName}{branchLabel}</h3>
          <div className="ms-ch-meta">
            <span className="ms-live"><span className="ms-live-dot" />{otherName} en línea</span>
            {shiftTime && <> · Turno {shiftTime}{shift.shift_date ? ` · ${shift.shift_date}` : ''}</>}
          </div>
        </div>
        <div className="ms-ch-actions">
          <button className="ms-ic-btn" title="Llamar"><IcoPhone /></button>
          <button className="ms-ic-btn" title="Ubicación"><IcoMapPin /></button>
          <button className="ms-ic-btn" title="Más"><IcoDots /></button>
        </div>
      </div>

      {/* Pinned shift card */}
      {shift.shift_date && (
        <div className="ms-pin-card">
          <div className="ms-pin-ico"><IcoPin /></div>
          <div className="ms-pin-tx">
            <b>{shift.title ?? 'Turno programado'}</b>
            <span>{shift.location ? `${shift.location} · ` : ''}{shiftTime}{shift.shift_date ? ` · ${shift.shift_date}` : ''}</span>
          </div>
          <div className="ms-pin-eta">Turno activo</div>
        </div>
      )}

      {/* Messages */}
      <div className="ms-msgs">
        <div className="ms-sys">
          <span className="ms-sys-ico"><IcoCheck /></span>
          Match confirmado · coordinación habilitada
          <span className="ms-sys-time">{fmtRelative(app.updated_at ?? app.created_at)}</span>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '20px 0' }}>Cargando mensajes…</div>}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '32px 0' }}>
            Sin mensajes aún — iniciá la coordinación con los botones de abajo.
          </div>
        )}

        {sorted.map((msg, i) => {
          const mine    = msg.sender_user_id === user?.id
          const sender  = msg.sender?.name ?? (mine ? (user?.name ?? 'Tú') : otherName)
          const prev    = sorted[i - 1]
          const showAva = !prev || prev.sender_user_id !== msg.sender_user_id
          return (
            <div key={msg.id} className={`ms-msg${mine ? ' me' : ''}`}>
              {!mine && <div className={`ms-msg-ava ms-ava-them${showAva ? '' : ' ms-invis'}`}>{initials(sender)}</div>}
              <div className="ms-bubble">
                {msg.message}
                <span className="ms-bubble-time">{fmtTime(msg.created_at)} ✓✓</span>
              </div>
              {mine && <div className={`ms-msg-ava ms-ava-me${showAva ? '' : ' ms-invis'}`}>{initials(user?.name)}</div>}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="ms-composer">
        <div className="ms-quick-actions">
          {QUICK_ACTIONS.map((qa) => (
            <button key={qa.label} className={`ms-qa${qa.event ? ' event' : ''}`} onClick={() => sendQuick(qa.label)}>
              {qa.label}
            </button>
          ))}
        </div>
        {error && <div className="onb-error" style={{ marginBottom: 8, fontSize: 12 }}>{error}</div>}
        <form onSubmit={handleSend}>
          <div className="ms-input-row">
            <textarea
              className="ms-textarea"
              placeholder="Escribí un mensaje operativo…"
              value={text}
              rows={1}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
            <div className="ms-ir-actions">
              <button type="button" className="ms-ir-btn" title="Adjuntar"><IcoAttach /></button>
              <button type="button" className="ms-ir-btn" title="Audio"><IcoMic /></button>
              <button type="submit" className="ms-send" disabled={sending || !text.trim()}><IcoSend /></button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

/* ── Right sidebar — shift details ───────────────────────── */
function ShiftSidebar({ app }) {
  if (!app) return (
    <aside className="ms-side-r">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#9CA3AF', gap:10, padding:24, textAlign:'center' }}>
        <div style={{ fontSize: 32 }}>📋</div>
        <div style={{ fontSize: 13 }}>Seleccioná una conversación para ver los detalles del turno.</div>
      </div>
    </aside>
  )

  const shift   = app.shift_request ?? app.shift ?? {}
  const company = shift.company ?? {}

  const tarifaDisplay = shift.coordinacion_chat
    ? 'Previa coordinación'
    : shift.proposed_rate != null  ? `S/ ${parseFloat(shift.proposed_rate).toFixed(0)}`
    : app.proposed_rate   != null  ? `S/ ${parseFloat(app.proposed_rate).toFixed(0)}`
    : 'A coordinar'

  const durH = (() => {
    if (!shift.starts_at || !shift.ends_at) return null
    const [sh, sm] = shift.starts_at.split(':').map(Number)
    const [eh, em] = shift.ends_at.split(':').map(Number)
    let d = (eh * 60 + em) - (sh * 60 + sm)
    if (d < 0) d += 1440
    return `${Math.floor(d/60)} horas${d%60 ? ` ${d%60}min` : ''}`
  })()

  const info = [
    { l: 'Botica',    v: company.name ?? '—' },
    { l: 'Dirección', v: shift.location ?? '—' },
    { l: 'Rol',       v: TYPE_LABEL[shift.professional_type] ?? shift.professional_type ?? '—' },
    { l: 'Horario',   v: shift.starts_at && shift.ends_at ? `${shift.starts_at.slice(0,5)} – ${shift.ends_at.slice(0,5)}` : '—' },
    { l: 'Fecha',     v: shift.shift_date ?? '—' },
    { l: 'Duración',  v: durH ?? '—' },
  ]

  return (
    <aside className="ms-side-r">
      <div className="ms-side-head">Detalles del turno</div>

      <div className="ms-sr-card ms-sr-tarifa">
        <div className="ms-tarifa-lab">Tarifa propuesta · acordada</div>
        <div className="ms-tarifa-big" style={{ fontSize: tarifaDisplay.startsWith('S/') ? 30 : 20 }}>
          {tarifaDisplay}
        </div>
        <div className="ms-tarifa-sub">
          {shift.coordinacion_chat ? 'Negociada por chat' : 'Pago a 24h del cierre del turno'}
        </div>
      </div>

      <div className="ms-sr-card">
        <h4>Información</h4>
        {info.map(({ l, v }) => (
          <div key={l} className="ms-sr-row">
            <span className="ms-sr-l">{l}</span>
            <span className="ms-sr-v">{v}</span>
          </div>
        ))}
      </div>

      <div className="ms-side-head">Estado del turno</div>
      <div className="ms-sr-card"><Stepper app={app} /></div>

      <button className="ms-danger-link">⚠ Reportar problema · cancelar turno</button>
    </aside>
  )
}

/* ── Root ─────────────────────────────────────────────────── */
export function MensajesPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const isCompany        = isCompanyAccount(user)

  const [threads,  setThreads]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        let apps = []
        if (isCompany) {
          const res = await fetchCompanyApplications({ status: 'accepted', limit: 50 })
          apps = res.data ?? res ?? []
        } else {
          const res = await fetchMyApplications()
          const raw = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []
          apps = raw.filter((a) => a.status === 'accepted' || a.status === 'confirmed')
        }
        setThreads(apps)
        if (apps.length > 0) setSelected((prev) => prev ?? apps[0])
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [isCompany])

  const filtered = threads.filter((app) => {
    if (!search) return true
    const s    = app.shift_request ?? app.shift ?? {}
    const name = (s.company?.name ?? '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const activeCount = threads.filter((a) => a.status === 'accepted').length

  // Nav items (same as prototype)
  const isPharmacy = isCompany
  const navLinks = [
    { label: 'Turnos',     to: isPharmacy ? '/app/farmacia' : '/app/turnos' },
    { label: 'Dashboard',  to: isPharmacy ? '/app/farmacia' : '/app'        },
    { label: 'Mensajes',   to: '/app/mensajes'                               },
    { label: 'Mi perfil',  to: '/app/perfil'                                },
  ]

  return (
    <div className="ms-page">
      {/* ── Top nav (prototipo) ── */}
      <nav className="ms-nav">
        <div className="ms-nav-in">
          <img src="/farmatalent-logo.svg" alt="FarmaTalent" height="28" style={{ display:'block' }} />
          <div className="ms-nav-tabs">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/app'}
                className={({ isActive }) => `ms-nav-tab${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <button
            className="ms-nav-ava"
            onClick={async () => { await logout(); navigate('/login', { replace: true }) }}
            title="Cerrar sesión"
          >
            {initials(user?.name)}
          </button>
        </div>
      </nav>

      {/* ── 3-panel layout ── */}
      <div className={`mensajes-shell${selected ? ' ms-chat-open' : ''}`}>

        {/* Left: threads */}
        <aside className="ms-threads">
          <div className="ms-threads-head">
            <h2>Coordinación</h2>
            <div className="ms-threads-sub">
              {activeCount > 0
                ? `${activeCount} match${activeCount !== 1 ? 'es' : ''} activo${activeCount !== 1 ? 's' : ''}`
                : 'Sin matches activos'}
            </div>
            <div className="ms-threads-search">
              <IcoSearch />
              <input
                placeholder="Buscar conversación…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ms-threads-list">
            {loading && (
              <div style={{ padding:'32px 16px', textAlign:'center', color:'#9CA3AF', fontSize:13 }}>Cargando…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'#9CA3AF' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
                <div style={{ fontSize:13 }}>
                  {threads.length === 0
                    ? 'El chat se habilita cuando aceptan tu postulación.'
                    : 'Sin resultados.'}
                </div>
                {threads.length === 0 && !isCompany && (
                  <button className="ft-btn ft-btn-brand ft-btn-sm" style={{ marginTop:14 }} onClick={() => navigate('/app/turnos')}>
                    Buscar turnos →
                  </button>
                )}
              </div>
            )}

            {filtered.map((app, i) => {
              const shift   = app.shift_request ?? app.shift ?? {}
              const company = shift.company ?? {}
              const name    = company.name ?? 'Botica'
              const tag     = shiftTag(app)
              const active  = selected?.id === app.id
              const col     = THREAD_COLORS[i % THREAD_COLORS.length]
              return (
                <div
                  key={app.id}
                  className={`ms-thread${active ? ' active' : ''}`}
                  onClick={() => setSelected(app)}
                >
                  <div className="ms-th-ava" style={{ background: col.bg, color: col.color }}>
                    {initials(name)}
                    <span className="ms-vchk"><IcoCheck /></span>
                  </div>
                  <div className="ms-th-body">
                    <div className="ms-th-top">
                      <span className="ms-th-name">
                        {name}{shift.location ? ` · ${shift.location.split(',')[0]}` : ''}
                      </span>
                      <span className="ms-th-time">{fmtRelative(app.updated_at ?? app.created_at)}</span>
                    </div>
                    <div className="ms-th-last">
                      {shift.title ?? `Turno #${app.shift_request_id ?? app.id}`}
                      {shift.shift_date ? ` · ${shift.shift_date}` : ''}
                    </div>
                    <div className="ms-th-meta">
                      <span className={`ms-th-tag ${tag.cls}`}>{tag.label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Center: chat */}
        <ChatCenter app={selected} user={user} isCompany={isCompany} onBack={() => setSelected(null)} />

        {/* Right: shift details */}
        <ShiftSidebar app={selected} />
      </div>
    </div>
  )
}

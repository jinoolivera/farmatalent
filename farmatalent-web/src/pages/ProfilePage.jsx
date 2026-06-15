import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'
import { fetchProfile, updateProfile } from '../api/profileApi'
import { fetchMyApplications } from '../api/applicationsApi'
import { fetchCompanyById, updateCompany } from '../api/companiesApi'
import { fetchShifts } from '../api/shiftsApi'
import { getApiErrorMessage } from '../api/client'
import { Badge } from '../components/ui/Badge'

/* ── icons ─────────────────────────────────────────────── */
const IconEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>
const IconMapPin = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconClock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconStar   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>

const TYPE_LABEL = {
  pharmacist:           'Químico farmacéutico',
  pharmacy_technician:  'Técnico en farmacia',
  assistant:            'Auxiliar / apoyo',
  nurse:                'Enfermero/a',
  intern:               'Practicante',
  doctor:               'Doctor',
}

// Keys match WorkerMetricResource: punctuality_score, operation_score, care_score, reliability_score, sales_score
const DIMS = [
  { key: 'punctuality_score',  label: 'Puntualidad',   color: '#16A34A', track: '#DCFCE7' },
  { key: 'operation_score',    label: 'Operación',      color: '#1D4ED8', track: '#DBEAFE' },
  { key: 'care_score',         label: 'Atención',       color: '#7C3AED', track: '#EDE9FE' },
  { key: 'reliability_score',  label: 'Confiabilidad',  color: '#D97706', track: '#FEF3C7' },
  { key: 'sales_score',        label: 'Ventas',         color: '#0F766E', track: '#CCFBF1' },
]

// cond receives (userObj, workerMetrics)
const BADGES = [
  { id: 'punctual',  label: '⚡ Siempre a tiempo',  cond: (p, m) => (m?.punctuality_score  ?? 0) >= 90 },
  { id: 'reliable',  label: '🔒 Alta confiabilidad', cond: (p, m) => (m?.reliability_score  ?? 0) >= 88 },
  { id: 'top_sales', label: '📈 Top ventas',         cond: (p, m) => (m?.sales_score        ?? 0) >= 88 },
  { id: 'veteran',   label: '🏅 Veterano 30+',       cond: (p, m) => (m?.metadata?.total_shifts ?? p?.total_shifts ?? 0) >= 30 },
  { id: 'elite',     label: '✨ Elite',              cond: (p, m) => (p?.reputation_score   ?? m?.reputation_score ?? 0) >= 93 },
  { id: 'repeat',    label: '🔁 Recurrente',         cond: (p, m) => (m?.metadata?.recurring_shifts ?? p?.recurring_shifts ?? 0) >= 5 },
]

function getTier(score) {
  if (score >= 93) return { label: 'Elite',   color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' }
  if (score >= 85) return { label: 'Oro',     color: '#D97706', bg: '#FEF9EE', border: '#FDE68A' }
  if (score >= 70) return { label: 'Plata',   color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' }
  return               { label: 'Bronce',  color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' }
}

function initials(name) {
  if (!name) return 'FT'
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── SVG score ring ─────────────────────────────────────── */
function ScoreRing({ value = 0, color = '#16A34A', track = '#E5E7EB', size = 72 }) {
  const r   = (size / 2) - 6
  const cx  = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth="7" />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      <text x={cx} y={cx + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: '#111827', fontFamily: 'inherit' }}>
        {value ?? '—'}
      </text>
    </svg>
  )
}

/* ── edit modal ─────────────────────────────────────────── */
function EditModal({ profile, onClose, onSaved }) {
  // bio maps to professional_profile.description (accepted by PUT /profile)
  const profProfile = profile.professional_profile ?? {}
  const [form, setForm] = useState({
    name: profile.name ?? '',
    bio:  profProfile.description ?? profile.bio ?? '',
  })
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      // PUT /profile accepts: name, professional_type, professional_profile.*
      const res = await updateProfile({
        name: form.name,
        professional_profile: { description: form.bio },
      })
      onSaved(res)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el perfil.'))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pm-backdrop"  onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal" role="dialog" aria-modal="true" style={{ maxWidth: 480 }}>
        <div style={{ padding: '24px 28px 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Editar perfil</h2>
          <p style={{ fontSize: 13, color: 'var(--ft-fg-muted)', margin: 0 }}>Solo tú ves el teléfono hasta confirmar el match.</p>
        </div>
        <form style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div className="pt-field">
            <label className="pt-label">Nombre completo</label>
            <input className="onb-input" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="pt-field">
            <label className="pt-label">Bio profesional <span className="pt-opt">opcional</span></label>
            <textarea className="pm-msg-box" style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 10, padding: '10px 12px', fontFamily: 'inherit', fontSize: 13, resize: 'none', height: 72, outline: 0 }}
              placeholder="Ej.: QF con 8 años en cadenas de boticas, especializado en receta controlada."
              value={form.bio} onChange={(e) => set('bio', e.target.value)} />
          </div>
          {error && <div className="onb-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="pm-btn pm-btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={busy}>Cancelar</button>
            <button type="submit" className="pm-btn pm-btn-primary" style={{ flex: 2 }} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── company type labels ────────────────────────────────── */
const COMPANY_TYPE_LABEL = {
  pharmacy:       'Botica / Farmacia',
  clinic:         'Clínica / Hospital',
  health_company: 'Empresa de salud',
}

/* ── edit modal for company ─────────────────────────────── */
function CompanyEditModal({ company, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:          company.name          ?? '',
    address:       company.address       ?? '',
    contact_email: company.contact_email ?? '',
    contact_phone: company.contact_phone ?? '',
    tax_id:        company.tax_id        ?? '',
  })
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await updateCompany(company.id, {
        name:          form.name,
        address:       form.address       || undefined,
        contact_email: form.contact_email || undefined,
        contact_phone: form.contact_phone || undefined,
        tax_id:        form.tax_id        || undefined,
      })
      onSaved(res?.data ?? res)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el perfil.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pm-backdrop"  onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal" role="dialog" aria-modal="true" style={{ maxWidth: 480 }}>
        <div style={{ padding: '24px 28px 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Editar perfil de empresa</h2>
          <p style={{ fontSize: 13, color: 'var(--ft-fg-muted)', margin: 0 }}>Datos visibles para los profesionales al confirmar un match.</p>
        </div>
        <form style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
          <div className="pt-field">
            <label className="pt-label">Nombre de la empresa</label>
            <input className="onb-input" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="pt-field">
            <label className="pt-label">Dirección <span className="pt-opt">opcional</span></label>
            <input className="onb-input" type="text" placeholder="Av. Larco 345, Miraflores" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="pt-row">
            <div className="pt-field">
              <label className="pt-label">Email de contacto <span className="pt-opt">opcional</span></label>
              <input className="onb-input" type="email" placeholder="contacto@empresa.com" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
            </div>
            <div className="pt-field">
              <label className="pt-label">Teléfono <span className="pt-opt">opcional</span></label>
              <input className="onb-input" type="tel" placeholder="+51 1 234 5678" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
            </div>
          </div>
          <div className="pt-field">
            <label className="pt-label">RUC <span className="pt-opt">opcional</span></label>
            <input className="onb-input" type="text" placeholder="20123456789" maxLength={11} value={form.tax_id} onChange={(e) => set('tax_id', e.target.value)} />
          </div>
          {error && <div className="onb-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="pm-btn pm-btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={busy}>Cancelar</button>
            <button type="submit" className="pm-btn pm-btn-primary" style={{ flex: 2 }} disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── company profile view ───────────────────────────────── */
function CompanyProfileView({ user }) {
  const navigate   = useNavigate()
  const company0   = user?.companies?.[0] ?? null
  const [company, setCompany]   = useState(company0)
  const [shifts, setShifts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    if (!company0?.id) { setLoading(false); return }
    Promise.allSettled([
      fetchCompanyById(company0.id),
      fetchShifts({ company_id: company0.id, limit: 5 }),
    ]).then(([compRes, shiftsRes]) => {
      if (compRes.status   === 'fulfilled') setCompany(compRes.value?.data   ?? compRes.value   ?? company0)
      if (shiftsRes.status === 'fulfilled') setShifts(shiftsRes.value?.data  ?? shiftsRes.value  ?? [])
      setLoading(false)
    })
  }, [company0?.id])

  const c        = company ?? company0 ?? {}
  const typeLabel = COMPANY_TYPE_LABEL[c.type] ?? c.type ?? 'Empresa'
  const initials  = (c.name ?? 'FT').slice(0, 2).toUpperCase()

  if (loading) return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>Cargando perfil…</div>

  if (!company0) return (
    <div className="ft-pane" style={{ padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
      <div style={{ fontWeight: 600, fontSize: 15 }}>Sin empresa registrada</div>
      <div style={{ fontSize: 13, color: 'var(--ft-fg-muted)', marginTop: 6 }}>Registrá tu botica para acceder al pool de profesionales.</div>
    </div>
  )

  return (
    <div className="prof-page">
      {/* Hero */}
      <div className="prof-hero">
        <div className="prof-hero-deco" />
        <div className="prof-hero-inner">
          <div className="prof-ava-wrap">
            <div className="prof-ava" style={{ background: 'linear-gradient(135deg,#15803D,#22C55E)', fontSize: 28 }}>
              {initials}
            </div>
          </div>
          <div className="prof-hero-info">
            <div className="prof-tier-chip" style={{ background: '#DCFCE7', color: '#15803D', borderColor: '#86EFAC' }}>
              🏥 {typeLabel}
            </div>
            <h1 className="prof-name">{c.name ?? 'Mi empresa'}</h1>
            <div className="prof-role">{user?.email ?? ''}</div>
            <div className="prof-hero-meta">
              {c.address       && <span><IconMapPin /> {c.address}</span>}
              {c.contact_phone && <span><IconClock /> {c.contact_phone}</span>}
            </div>
            {c.tax_id && <p className="prof-bio" style={{ fontSize: 13 }}>RUC: {c.tax_id}</p>}
          </div>
          <button className="prof-edit-btn" onClick={() => setShowEdit(true)}>
            <IconEdit /> Editar
          </button>
        </div>
      </div>

      <div className="prof-body">
        {/* Shifts published */}
        <div>
          <div className="ft-pane">
            <div className="ft-pane-head">
              <h3>Turnos publicados</h3>
              <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => navigate('/app/farmacia')}>Ver todos →</button>
            </div>
            {shifts.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
                Todavía no publicaste turnos.
                <button className="ft-btn ft-btn-brand ft-btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/app/farmacia')}>
                  Publicar turno →
                </button>
              </div>
            ) : shifts.map((s, i) => {
              const statusColors = { open: { bg: '#DCFCE7', color: '#15803D', label: 'Abierto' }, completed: { bg: '#F3F4F6', color: '#6B7280', label: 'Completado' }, cancelled: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelado' } }
              const sc = statusColors[s.status] ?? statusColors.open
              return (
                <div key={s.id} className="prof-hist-item" style={{ borderBottom: i < shifts.length - 1 ? '1px solid var(--ft-gray-100)' : 'none' }}>
                  <div className="prof-hist-dot" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{s.title ?? `Turno #${s.id}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginTop: 2 }}>
                      {s.shift_date ?? '—'}{s.location ? ` · ${s.location}` : ''}
                      {s.starts_at ? ` · ${s.starts_at}` : ''}{s.ends_at ? `–${s.ends_at}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aside */}
        <div>
          <div className="ft-pane">
            <div className="ft-pane-head"><h3>Datos de la empresa</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Tipo',      value: typeLabel },
                { label: 'Dirección', value: c.address       || '—' },
                { label: 'Email',     value: c.contact_email || '—' },
                { label: 'Teléfono',  value: c.contact_phone || '—' },
                { label: 'RUC',       value: c.tax_id        || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ft-fg-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head"><h3>Accesos rápidos</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '📋 Postulantes recibidos', path: '/app/farmacia' },
                { label: '💬 Mensajes activos',      path: '/app/mensajes' },
                { label: '📅 Turnos programados',    path: '/app/farmacia' },
              ].map((item) => (
                <button key={item.label} className="ft-btn ft-btn-outline ft-btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}
                  onClick={() => navigate(item.path)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEdit && c.id && (
        <CompanyEditModal
          company={c}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setCompany(updated); setShowEdit(false) }}
        />
      )}
    </div>
  )
}

/* ── professional profile (hooks-safe inner component) ──── */
function ProfessionalProfile() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showEdit, setShowEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profRes, appsRes] = await Promise.allSettled([
        fetchProfile(),
        fetchMyApplications(),
      ])
      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value?.data ?? profRes.value)
      } else {
        setProfile(user ?? {})
      }
      if (appsRes.status === 'fulfilled') {
        const raw = appsRes.value?.data ?? appsRes.value ?? []
        setApps(Array.isArray(raw) ? raw.slice(0, 6) : [])
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el perfil.'))
      setProfile(user ?? {})
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const p       = profile ?? user ?? {}
  // professional_profile relation (snake_case serialization)
  const profProfile = p.professional_profile ?? p.professionalProfile ?? {}
  // workerMetrics relation serializes to snake_case: worker_metrics
  const metrics = p.worker_metrics ?? p.workerMetrics ?? {}
  const score   = p.reputation_score ?? metrics.reputation_score ?? null
  const tier    = getTier(score ?? 0)
  const role    = TYPE_LABEL[p.professional_type] ?? p.professional_type ?? 'Profesional'
  // bio comes from professional_profile.description
  const bio     = profProfile.description ?? p.bio ?? null
  const earnedBadges = BADGES.filter((b) => b.cond(p, metrics))

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>Cargando perfil…</div>
    )
  }

  return (
    <div className="prof-page">
      {/* Hero */}
      <div className="prof-hero">
        <div className="prof-hero-deco" />
        <div className="prof-hero-inner">
          <div className="prof-ava-wrap">
            <div className="prof-ava">
              {initials(p.name)}
            </div>
            {score != null && (
              <div className="prof-ava-ring">
                <ScoreRing value={score} color="#86EFAC" track="rgba(255,255,255,.2)" size={88} />
              </div>
            )}
          </div>
          <div className="prof-hero-info">
            <div className="prof-tier-chip" style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}>
              <IconStar /> {tier.label}
            </div>
            <h1 className="prof-name">{p.name ?? 'Mi perfil'}</h1>
            <div className="prof-role">{role}</div>
            <div className="prof-hero-meta">
              {p.location && <span><IconMapPin /> {p.location}</span>}
              {p.total_shifts != null && <span><IconClock /> {p.total_shifts} turnos completados</span>}
            </div>
            {bio && <p className="prof-bio">{bio}</p>}
          </div>
          <button className="prof-edit-btn" onClick={() => setShowEdit(true)}>
            <IconEdit /> Editar
          </button>
        </div>
      </div>

      <div className="prof-body">
        {/* Main column */}
        <div>
          {/* Score dimensions */}
          <div className="ft-pane">
            <div className="ft-pane-head"><h3>Reputación por dimensión</h3></div>
            {score == null ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
                Completa tu primer turno para desbloquear tu score.
              </div>
            ) : (
              <div className="prof-dims">
                {DIMS.map((d) => {
                  const val = metrics[d.key] ?? score
                  return (
                    <div key={d.key} className="prof-dim">
                      <ScoreRing value={val} color={d.color} track={d.track} size={72} />
                      <div className="prof-dim-label">{d.label}</div>
                      <div className="prof-dim-val" style={{ color: d.color }}>{val}/100</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Shift history */}
          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head">
              <h3>Historial de turnos</h3>
              <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => navigate('/app/postulaciones')}>Ver todos →</button>
            </div>
            {apps.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
                Aún no tienes postulaciones registradas.
              </div>
            ) : (
              apps.map((app, i) => {
                const shift  = app.shift_request ?? app.shift ?? {}
                const status = app.status
                const varMap = { accepted: 'success', rejected: 'danger', pending: 'warning', confirmed: 'success', withdrawn: 'neutral' }
                const lblMap = { accepted: 'Aceptado', rejected: 'Rechazado', pending: 'Pendiente', confirmed: 'Confirmado', withdrawn: 'Retirado' }
                return (
                  <div key={app.id} className="prof-hist-item" style={{ borderBottom: i < apps.length - 1 ? '1px solid var(--ft-gray-100)' : 'none' }}>
                    <div className="prof-hist-dot" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{shift.title ?? `Turno #${app.shift_request_id ?? app.id}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginTop: 2 }}>
                        {shift.shift_date ?? shift.date ?? '—'}{shift.location ? ` · ${shift.location}` : ''}
                      </div>
                    </div>
                    <Badge variant={varMap[status] ?? 'neutral'}>{lblMap[status] ?? status}</Badge>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Aside */}
        <div>
          {/* Badges */}
          <div className="ft-pane">
            <div className="ft-pane-head"><h3>Insignias</h3></div>
            {earnedBadges.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--ft-fg-muted)', padding: '8px 0' }}>
                Completa turnos para desbloquear insignias.
              </div>
            ) : (
              <div className="prof-badges">
                {earnedBadges.map((b) => (
                  <span key={b.id} className="prof-badge">{b.label}</span>
                ))}
              </div>
            )}

            {/* Tier progress */}
            <div className="prof-tier-block" style={{ background: tier.bg, borderColor: tier.border }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: tier.color }}>{tier.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                {score != null ? `Score global: ${score}/100` : 'Sin score aún'}
              </div>
              {score != null && score < 93 && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
                  {score < 70 ? `+${70 - score} pts para Plata`
                    : score < 85 ? `+${85 - score} pts para Oro`
                    : `+${93 - score} pts para Elite`}
                </div>
              )}
            </div>
          </div>

          {/* Privacy */}
          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head"><h3>Privacidad</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <IconShield />, title: 'Perfil anónimo', desc: 'Tu nombre y contacto solo se revelan al confirmar el match.' },
                { icon: <IconShield />, title: 'DNI protegido',  desc: 'El número de documento nunca aparece en listados públicos.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="onb-error" style={{ margin: '12px 0' }}>{error}</div>}

      {showEdit && (
        <EditModal
          profile={p}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setProfile(updated); setShowEdit(false) }}
        />
      )}
    </div>
  )
}

/* ── public export — dispatches to correct view ─────────── */
export function ProfilePage() {
  const { user } = useAuth()
  if (isCompanyAccount(user)) return <CompanyProfileView user={user} />
  return <ProfessionalProfile />
}

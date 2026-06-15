import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { createCompany } from '../api/companiesApi'
import { setAuthToken, getApiErrorMessage } from '../api/client'
import { fetchProfessionalsCount } from '../api/profileApi'

/* ── honeypot anti-bot ───────────────────────────────────── */
const HONEY_FIELD = 'website'

/* ── valores de backend ─────────────────────────────────── */
// CompanyRequest enum: pharmacy | clinic | health_company
const TIPOS = [
  { value: 'pharmacy',       label: 'Botica / farmacia',   desc: 'Cadena o independiente', icon: '🏪' },
  { value: 'clinic',         label: 'Clínica / hospital',  desc: 'Área farmacéutica clínica', icon: '🏥' },
  { value: 'health_company', label: 'Empresa de salud',    desc: 'Distribuidora u otro', icon: '🏢' },
]

/* ── Distritos de todo el Perú ───────────────────────────── */
const DISTRITOS = [
  // Lima — Centro y Moderno
  'Miraflores', 'San Isidro', 'Barranco', 'Santiago de Surco', 'La Molina',
  'San Borja', 'Lince', 'Jesús María', 'Magdalena del Mar', 'Pueblo Libre',
  'Surquillo', 'San Miguel', 'Lima (Cercado)', 'Rímac', 'Breña', 'La Victoria',
  // Lima — Norte
  'Los Olivos', 'San Martín de Porres', 'Independencia', 'Comas',
  'Carabayllo', 'Puente Piedra', 'Ancón',
  // Lima — Este
  'Ate', 'Santa Anita', 'El Agustino', 'San Juan de Lurigancho',
  'Lurigancho-Chosica', 'Chaclacayo', 'Cieneguilla',
  // Lima — Sur
  'Chorrillos', 'San Juan de Miraflores', 'Villa El Salvador',
  'Villa María del Triunfo', 'Lurín', 'Pachacámac',
  // Callao
  'Callao', 'Ventanilla', 'Mi Perú', 'La Perla', 'Bellavista', 'Carmen de la Legua',
  // Arequipa
  'Arequipa', 'Cayma', 'Cerro Colorado', 'Alto Selva Alegre',
  'Yanahuara', 'Socabaya', 'José Luis Bustamante y Rivero', 'Miraflores (Arequipa)',
  // Trujillo
  'Trujillo', 'La Esperanza', 'El Porvenir', 'Víctor Larco Herrera',
  'Huanchaco', 'Florencia de Mora', 'Moche',
  // Chiclayo
  'Chiclayo', 'José Leonardo Ortiz', 'La Victoria (Chiclayo)', 'Pimentel', 'Pomalca',
  // Piura
  'Piura', 'Castilla', 'Sullana', 'Talara', 'Paita', 'Chulucanas',
  // Cusco
  'Cusco', 'San Sebastián', 'Wanchaq', 'Santiago (Cusco)', 'San Jerónimo (Cusco)',
  // Iquitos
  'Iquitos', 'San Juan Bautista', 'Punchana', 'Belén (Iquitos)',
  // Otras ciudades
  'Huancayo', 'Ica', 'Chimbote', 'Nuevo Chimbote', 'Tacna',
  'Pucallpa', 'Huánuco', 'Ayacucho', 'Puno', 'Juliaca',
  'Tarapoto', 'Cajamarca', 'Tumbes', 'Moquegua', 'Abancay',
  // Otro
  'Otro',
]

/* ── íconos ─────────────────────────────────────────────── */
const IconCheck  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>

/* ── pasos del panel izquierdo ──────────────────────────── */
const STAGES = [
  { label: 'Datos de la botica',   sub: 'Nombre, tipo, ubicación — 60 segundos' },
  { label: 'Tu cuenta de acceso',  sub: 'Nombre, email y contraseña' },
  { label: 'Primera vacante',      sub: 'Publicas en menos de 90 segundos' },
  { label: 'Profesional asignado', sub: 'Match verificado · cobertura lista' },
]

/* ── benefits del panel izquierdo (stats dinámicos) ─────── */
const BENEFITS_BASE = [
  { key: 'pro',  v: '50+',    l: 'profesionales activos' },
  { key: 'time', v: '38 min', l: 'cobertura media' },
  { key: 'rate', v: '87%',    l: 'match alto' },
]

/* ── componente principal ───────────────────────────────── */
export function RegisterFarmaciaPage() {
  const navigate               = useNavigate()
  const { register, refreshUser } = useAuth()
  const [step, setStep]        = useState(1)
  const [busy, setBusy]        = useState(false)
  const [error, setError]      = useState('')
  const [proCount, setProCount] = useState(null)
  const [termsOk, setTermsOk]   = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [formStart, setFormStart] = useState(null)

  useEffect(() => {
    fetchProfessionalsCount()
      .then((n) => { if (n != null) setProCount(Math.max(50, n)) })
      .catch(() => {})
  }, [])

  const BENEFITS = BENEFITS_BASE.map((b) =>
    b.key === 'pro' && proCount != null
      ? { ...b, v: `${proCount.toLocaleString('es-PE')}+` }
      : b
  )

  const [form, setForm] = useState({
    company_name:          '',
    company_type:          'pharmacy',
    ruc:                   '',
    address:               '',
    district:              '',
    phone:                 '',
    name:                  '',
    email:                 '',
    password:              '',
    password_confirmation: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  /* validación paso 1 */
  function validateStep1() {
    if (!form.company_name.trim()) return 'Ingresa el nombre de la botica.'
    if (!form.address.trim())      return 'Ingresa la dirección principal.'
    if (!form.district)            return 'Selecciona un distrito.'
    return null
  }

  function handleStep1(e) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    /* ── protección anti-bot ─────────────────────────────── */
    if (honeypot) return
    if (formStart && Date.now() - formStart < 2000) {
      await new Promise((r) => setTimeout(r, 2000))
    }

    if (!form.name.trim())  { setError('Ingresa tu nombre completo.'); return }
    if (!form.email.trim()) { setError('Ingresa tu email.'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (form.password !== form.password_confirmation) { setError('Las contraseñas no coinciden.'); return }
    if (!termsOk) { setError('Debes aceptar los Términos de Uso y la Política de Privacidad para continuar.'); return }

    setBusy(true)
    setError('')
    try {
      const data = await register({
        name:                  form.name.trim(),
        email:                 form.email.trim(),
        password:              form.password,
        password_confirmation: form.password_confirmation,
        account_type:          'company',
      })

      if (data?.token) setAuthToken(data.token)

      await createCompany({
        name:          form.company_name.trim(),
        type:          form.company_type,
        tax_id:        form.ruc.trim()   || undefined,
        address:       [form.address.trim(), form.district].filter(Boolean).join(', ') || undefined,
        contact_phone: form.phone.trim() || undefined,
      })

      await refreshUser()
      navigate('/app/farmacia', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear la cuenta. Intenta nuevamente.'))
    } finally {
      setBusy(false)
    }
  }

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="onb-shell">

      {/* ══ Panel izquierdo de marca (oscuro / empresa) ══ */}
      <div className="onb-brand onb-brand-bo">
        <Link to="/" className="onb-logo">FarmaTalent</Link>

        <div className="onb-brand-hero" style={{ marginTop: 24 }}>
          <h1 className="onb-brand-h1">
            <em>Tu botica,</em><br />siempre<br />cubierta.
          </h1>
          <p className="onb-brand-p">
            Publica una vacante y recibe profesionales verificados con score real en menos de 38 minutos. Sin llamadas, sin WhatsApp.
          </p>
        </div>

        {/* Stats */}
        <div className="onb-bo-stats">
          {BENEFITS.map((b) => (
            <div key={b.l} className="onb-bo-stat">
              <div className="onb-bo-stat-v">{b.v}</div>
              <div className="onb-bo-stat-l">{b.l}</div>
            </div>
          ))}
        </div>

        {/* Pasos */}
        <div className="onb-grow-box" style={{ marginTop: 24 }}>
          <div className="onb-grow-label">Cómo funciona</div>
          <h4 className="onb-grow-title">De vacante a cobertura en 4 pasos.</h4>
          <div className="onb-stages">
            {STAGES.map((s, i) => (
              <div key={s.label} className={`onb-stage${i === step - 1 ? ' now' : i < step - 1 ? ' done' : ''}`}>
                <div className={`onb-stage-dot${i === step - 1 ? ' now' : i < step - 1 ? ' done' : ''}`}>
                  {i < step - 1 ? <IconCheck /> : i + 1}
                </div>
                <div>
                  <b>{s.label}</b>
                  <span>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="onb-brand-foot">
          Presiona <span className="onb-kbd">⏎ Enter</span> para continuar · puedes salir y retomar cuando quieras
        </div>
      </div>

      {/* ══ Panel derecho — formulario ══ */}
      <main className="onb-form-panel">

        {/* Cabecera del paso */}
        <div className="onb-top-row">
          <div className="onb-step-pill">
            Paso <b>{step}</b> de 2 · <b>{step === 1 ? 'Datos de la botica' : 'Tu cuenta'}</b>
          </div>
          <Link to="/login" className="onb-lang" style={{ textDecoration: 'none' }}>
            ¿Ya tienes cuenta? <b style={{ color: '#0F2A14' }}>Inicia sesión</b>
          </Link>
        </div>

        {/* Barra de progreso */}
        <div className="onb-progress">
          <div className={`onb-pseg${step >= 1 ? ' done' : ''}`} />
          <div className={`onb-pseg${step >= 2 ? ' done' : step === 1 ? ' cur' : ''}`} />
        </div>

        {/* ── PASO 1: Datos de la botica ── */}
        {step === 1 && (
          <>
            <div className="onb-step-head">
              <span className="onb-step-num"><span className="onb-step-dot" />PASO 1 · Tu establecimiento</span>
              <h2 className="onb-step-h2">Cuéntanos sobre <em>tu botica</em>.</h2>
              <p className="onb-step-p">
                Solo necesitamos lo básico para activar tu cuenta. Puedes agregar locales adicionales después.
              </p>
            </div>

            <form className="onb-form" onSubmit={handleStep1}>

              {/* Tipo de establecimiento */}
              <div className="onb-field" style={{ marginBottom: 18 }}>
                <label className="onb-label">Tipo de establecimiento</label>
                <div className="onb-tipo-grid">
                  {TIPOS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`onb-tipo${form.company_type === t.value ? ' on' : ''}`}
                      onClick={() => set('company_type', t.value)}
                    >
                      <span className="onb-tipo-ico">{t.icon}</span>
                      <b>{t.label}</b>
                      <span>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div className="onb-field" style={{ marginBottom: 14 }}>
                <label className="onb-label">Nombre de la botica / cadena</label>
                <input
                  className="onb-input"
                  type="text"
                  placeholder="Ej.: Botica Central Miraflores"
                  value={form.company_name}
                  onChange={(e) => set('company_name', e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* RUC + Teléfono */}
              <div className="onb-row">
                <div className="onb-field">
                  <label className="onb-label">
                    RUC <span className="onb-opt">opcional</span>
                  </label>
                  <input
                    className="onb-input"
                    type="text"
                    placeholder="20123456789"
                    value={form.ruc}
                    onChange={(e) => set('ruc', e.target.value)}
                    maxLength={11}
                  />
                </div>
                <div className="onb-field">
                  <label className="onb-label">
                    Teléfono <span className="onb-opt">opcional</span>
                  </label>
                  <input
                    className="onb-input"
                    type="tel"
                    placeholder="+51 1 234 5678"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="onb-field" style={{ marginBottom: 14 }}>
                <label className="onb-label">Dirección principal</label>
                <input
                  className="onb-input"
                  type="text"
                  placeholder="Av. Larco 345"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  required
                />
              </div>

              {/* Distrito */}
              <div className="onb-field" style={{ marginBottom: 14 }}>
                <label className="onb-label">Distrito</label>
                <select
                  className="onb-input"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  required
                >
                  <option value="">Selecciona un distrito…</option>
                  {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {error && <div className="onb-error">{error}</div>}

              <div className="onb-footer-actions">
                <Link className="onb-back" to="/registro">← Volver</Link>
                <button className="onb-next" type="submit">
                  Continuar →
                </button>
              </div>

              <div className="onb-privacy">
                🔒 <b>Datos seguros.</b> Tu RUC y dirección solo se comparten con profesionales que aceptaron un match confirmado.
              </div>
            </form>
          </>
        )}

        {/* ── PASO 2: Cuenta de acceso ── */}
        {step === 2 && (
          <>
            <div className="onb-step-head">
              <span className="onb-step-num"><span className="onb-step-dot" />PASO 2 · Tu cuenta de acceso</span>
              <h2 className="onb-step-h2">Datos del <em>responsable</em>.</h2>
              <p className="onb-step-p">
                Esta persona administrará las vacantes y recibirá las notificaciones de match.
              </p>
            </div>

            <form
              className="onb-form"
              onSubmit={handleSubmit}
              onFocus={() => { if (!formStart) setFormStart(Date.now()) }}
            >
              {/* ── honeypot anti-bot (invisible) ────────── */}
              <input
                name={HONEY_FIELD}
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
              />

              {/* Nombre */}
              <div className="onb-field" style={{ marginBottom: 14 }}>
                <label className="onb-label">Nombre completo</label>
                <input
                  className="onb-input"
                  type="text"
                  placeholder="Juan Pérez Gómez"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="onb-field" style={{ marginBottom: 14 }}>
                <label className="onb-label">Email corporativo</label>
                <input
                  className="onb-input"
                  type="email"
                  placeholder="juan@boticacentral.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                />
              </div>

              {/* Contraseñas */}
              <div className="onb-row">
                <div className="onb-field">
                  <label className="onb-label">Contraseña</label>
                  <input
                    className="onb-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    required
                  />
                </div>
                <div className="onb-field">
                  <label className="onb-label">Confirmar contraseña</label>
                  <input
                    className="onb-input"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={form.password_confirmation}
                    onChange={(e) => set('password_confirmation', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Resumen de la botica */}
              <div className="onb-bo-summary">
                <div className="onb-bo-summary-ico">🏪</div>
                <div>
                  <div className="onb-bo-summary-name">
                    {form.company_name || 'Tu botica'}
                  </div>
                  <div className="onb-bo-summary-addr">
                    {[form.address, form.district].filter(Boolean).join(', ') || 'Sin dirección aún'}
                  </div>
                </div>
                <button
                  type="button"
                  className="onb-bo-summary-edit"
                  onClick={() => { setStep(1); setError('') }}
                >
                  Editar
                </button>
              </div>

              {/* ── Aceptación de términos (requerida) ─────── */}
              <label className={`onb-terms${!termsOk && error.includes('Términos') ? ' onb-terms-error' : ''}`}>
                <input
                  type="checkbox"
                  checked={termsOk}
                  onChange={(e) => { setTermsOk(e.target.checked); setError('') }}
                  required
                />
                <span>
                  He leído y acepto los{' '}
                  <Link to="/terminos" target="_blank" className="onb-terms-link">Términos y Condiciones</Link>
                  {' '}y la{' '}
                  <Link to="/privacidad" target="_blank" className="onb-terms-link">Política de Privacidad</Link>
                  {' '}de FarmaTalent, incluyendo el tratamiento de mis datos conforme a la Ley N° 29733.
                </span>
              </label>

              {/* Nota de privacidad */}
              <div className="onb-privacy">
                <IconShield />
                <span>
                  <b>DIGEMID y privacidad.</b> Tu RUC y datos de contacto solo se comparten con profesionales que aceptaron un match confirmado.
                </span>
              </div>

              {error && <div className="onb-error">{error}</div>}

              <div className="onb-footer-actions">
                <button
                  type="button"
                  className="onb-back"
                  onClick={() => { setStep(1); setError('') }}
                >
                  ← Atrás
                </button>
                <button className="onb-next" type="submit" disabled={busy || !termsOk}>
                  {busy ? 'Creando cuenta…' : 'Crear cuenta →'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Link a profesional */}
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
          ¿Eres profesional?{' '}
          <Link to="/registro/profesional" style={{ color: '#15803D', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </div>

      </main>
    </div>
  )
}

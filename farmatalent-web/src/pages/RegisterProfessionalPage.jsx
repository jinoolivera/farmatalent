import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/client'
import { getPostLoginPath } from '../auth/authRouting'

/* ── honeypot: campo oculto para detectar bots ───────────── */
// Los bots suelen rellenar todos los campos; nosotros lo ignoramos si tiene valor.
const HONEY_FIELD = 'website'

const ROLES = [
  { id: 'pharmacist', label: 'Q.F. responsable', sub: 'Colegiatura activa', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l2 4h4v13H3V7h4z"/><circle cx="12" cy="14" r="3"/></svg> },
  { id: 'pharmacy_technician', label: 'Técnico farmacia', sub: 'Título técnico', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/></svg> },
  { id: 'assistant', label: 'Auxiliar / apoyo', sub: 'Sin requisitos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg> },
  { id: 'nurse', label: 'Enfermero/a', sub: 'Colegiatura activa', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg> },
  { id: 'intern', label: 'Practicante', sub: 'Universidad activa', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><polyline points="17 11 19 13 23 9"/></svg> },
  { id: 'other', label: 'Otro', sub: 'Especificar', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

const SPECIALTIES = ['Operación nocturna', 'Receta controlada', 'Hospitalario', 'Inventario crítico', 'Quimioterapia', 'Atención al cliente', 'POS de cadena', 'Farmacovigilancia']
const ZONES = ['📍 Miraflores', 'San Isidro', 'Surco', 'San Borja', 'Barranco', 'La Molina', 'Magdalena', 'Otros distritos']

const STAGES = [
  { label: 'Datos básicos', sub: 'Rol, zona y disponibilidad — 90 segundos' },
  { label: 'Primeros turnos', sub: 'Postulas · aplicas · operas' },
  { label: 'Reputación se forma', sub: 'Score, badges, boticas recurrentes' },
  { label: 'Talento Senior · Master', sub: 'Prioridad alta · turnos premium' },
]

export function RegisterProfessionalPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    professional_type: 'pharmacist',
    specialties: ['Operación nocturna', 'Receta controlada'],
    zones: ['📍 Miraflores', 'San Isidro', 'Surco'],
    experience: '6+ años',
    college_number: '',
  })

  const [error, setError]         = useState('')
  const [termsOk, setTermsOk]     = useState(false)
  const [honeypot, setHoneypot]   = useState('')
  const [formStart, setFormStart] = useState(null)

  function toggleItem(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    /* ── protección anti-bot ─────────────────────────────── */
    if (honeypot) return  // bot llenó el honeypot
    if (formStart && Date.now() - formStart < 2000) {
      // demasiado rápido (menos de 2s) — pausar silenciosamente
      await new Promise((r) => setTimeout(r, 2000))
    }

    /* ── validación de términos ──────────────────────────── */
    if (!termsOk) {
      setError('Debes aceptar los Términos de Uso y la Política de Privacidad para continuar.')
      return
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        account_type: 'professional',
        professional_type: form.professional_type,
      }
      const data = await register(payload)
      navigate(getPostLoginPath(data?.user), { replace: true })
    } catch (ex) {
      setError(getApiErrorMessage(ex, 'No se pudo crear la cuenta.'))
    }
  }

  return (
    <div className="onb-shell">

      {/* Brand panel */}
      <div className="onb-brand">
        <Link to="/" className="onb-logo">FarmaTalent</Link>

        <div className="onb-brand-hero" style={{ marginTop: 24 }}>
          <h1 className="onb-brand-h1"><em>Tu carrera</em><br />se construye<br />turno a turno.</h1>
          <p className="onb-brand-p">FarmaTalent no es una bolsa de trabajo. Es donde tu reputación operacional se vuelve la moneda que abre las mejores oportunidades del Perú.</p>
        </div>

        <div className="onb-grow-box">
          <div className="onb-grow-label">Cómo crece tu perfil</div>
          <h4 className="onb-grow-title">Sin CVs, sin PDFs. Sin burocracia.</h4>
          <p className="onb-grow-desc">Empiezas con lo básico y tu perfil se desarrolla con cada turno completado, cada reseña, cada continuidad con una botica.</p>
          <div className="onb-stages">
            {STAGES.map((s, i) => (
              <div key={s.label} className={`onb-stage ${i === 0 ? 'now' : ''}`}>
                <div className={`onb-stage-dot ${i === 0 ? 'now' : ''}`}>{i + 1}</div>
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

      {/* Form panel */}
      <main className="onb-form-panel">
        <div className="onb-top-row">
          <div className="onb-step-pill">Paso <b>2</b> de 4 · <b>Datos básicos</b></div>
          <span className="onb-lang">🇵🇪 Español · Perú</span>
        </div>

        <div className="onb-progress">
          <div className="onb-pseg done" />
          <div className="onb-pseg cur" />
          <div className="onb-pseg" />
          <div className="onb-pseg" />
        </div>

        <div className="onb-step-head">
          <span className="onb-step-num"><span className="onb-step-dot" />PASO 2 · Datos básicos</span>
          <h2 className="onb-step-h2">Cuéntanos <em>quién eres</em>.</h2>
          <p className="onb-step-p">Lo justo para empezar a recibir oportunidades. Después tu perfil se construye solo con cada turno.</p>
        </div>

        {error && (
          <div className="onb-error">{error}</div>
        )}

        <form
          className="onb-form"
          onSubmit={handleSubmit}
          onFocus={() => { if (!formStart) setFormStart(Date.now()) }}
        >
          {/* ── honeypot anti-bot (invisible) ────────────── */}
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

          {/* Nombre / DNI */}
          <div className="onb-row">
            <div className="onb-field">
              <label className="onb-label">Nombre completo</label>
              <input className="onb-input" type="text" placeholder="María Rodríguez Chávez" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="onb-field">
              <label className="onb-label">
                Email
              </label>
              <input className="onb-input" type="email" placeholder="maria@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="onb-row">
            <div className="onb-field">
              <label className="onb-label">Contraseña</label>
              <input className="onb-input" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="onb-field">
              <label className="onb-label">Confirmar contraseña</label>
              <input className="onb-input" type="password" placeholder="Repite la contraseña" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
            </div>
          </div>

          {/* Tipo de profesional */}
          <div className="onb-field" style={{ marginBottom: 16 }}>
            <label className="onb-label">¿Qué tipo de profesional eres?</label>
            <div className="onb-role-grid">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`onb-role${form.professional_type === role.id ? ' on' : ''}`}
                  onClick={() => setForm({ ...form, professional_type: role.id })}
                >
                  <div className="onb-role-ico">{role.icon}</div>
                  <b>{role.label}</b>
                  <span>{role.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Especialidades */}
          <div className="onb-field" style={{ marginBottom: 18 }}>
            <label className="onb-label">
              Especialidades <span className="onb-opt">elige las que aplican</span>
            </label>
            <div className="onb-chips">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`onb-chip${form.specialties.includes(s) ? ' on' : ''}`}
                  onClick={() => toggleItem('specialties', s)}
                >
                  {form.specialties.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Zonas */}
          <div className="onb-field" style={{ marginBottom: 18 }}>
            <label className="onb-label">¿En qué zonas de Lima estás disponible?</label>
            <div className="onb-chips">
              {ZONES.map((z) => (
                <button
                  key={z}
                  type="button"
                  className={`onb-chip${form.zones.includes(z) ? ' on' : ''}`}
                  onClick={() => toggleItem('zones', z)}
                >
                  {form.zones.includes(z) ? '✓ ' : ''}{z}
                </button>
              ))}
            </div>
            <span className="onb-hint">Tu ubicación exacta solo se comparte después de cada match confirmado.</span>
          </div>

          {/* Experiencia / Colegiatura */}
          <div className="onb-row">
            <div className="onb-field">
              <label className="onb-label">Años de experiencia</label>
              <select className="onb-input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                <option>Sin experiencia previa</option>
                <option>1–2 años</option>
                <option>3–5 años</option>
                <option>6+ años</option>
              </select>
            </div>
            <div className="onb-field">
              <label className="onb-label">
                Colegiatura QF <span className="onb-opt">opcional ahora</span>
              </label>
              <input className="onb-input" type="text" placeholder="CQFP 18234" value={form.college_number} onChange={(e) => setForm({ ...form, college_number: e.target.value })} />
            </div>
          </div>

          {/* ── Aceptación de términos (requerida) ─────────── */}
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

          <div className="onb-footer-actions">
            <Link className="onb-back" to="/registro">← Volver al paso 1</Link>
            <button className="onb-next" type="submit" disabled={loading || !termsOk}>
              {loading ? 'Creando cuenta…' : 'Continuar a disponibilidad →'}
            </button>
          </div>

          <div className="onb-privacy">
            🔒 <b>Privacidad operacional.</b> Nadie ve tu nombre, DNI ni teléfono hasta que confirmas un match. Tu perfil público solo muestra rol, score y zona.
          </div>
        </form>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/client'
import { updateProfile } from '../api/profileApi'
import { isCompanyAccount } from '../auth/authRouting'
import { trackEvent } from '../utils/analytics'

const ROLES = [
  { id: 'pharmacist', label: 'Q.F. responsable', sub: 'Colegiatura activa' },
  { id: 'pharmacy_technician', label: 'Técnico farmacia', sub: 'Título técnico' },
  { id: 'assistant', label: 'Auxiliar / apoyo', sub: 'Operación y atención' },
  { id: 'doctor', label: 'Médico', sub: 'Soporte clínico' },
]

export function ActivateProfessionalPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    professional_type: user?.professional_type ?? 'pharmacist',
    specialty: '',
  })

  const nextPath = searchParams.get('next')

  useEffect(() => {
    trackEvent('professional_activation_viewed', { next: nextPath || '/app/turnos' })
  }, [nextPath])

  if (isCompanyAccount(user)) {
    return <Navigate to="/app/farmacia" replace />
  }

  if (user?.professional_type) {
    return <Navigate to={nextPath || '/app/turnos'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      trackEvent('professional_activation_submitted', { professional_type: form.professional_type })
      await updateProfile({
        professional_type: form.professional_type,
        professional_profile: {
          specialty: form.specialty.trim() || undefined,
        },
      })
      await refreshUser()
      trackEvent('professional_activation_completed', { destination: nextPath || '/app/turnos' })
      navigate(nextPath || '/app/turnos', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo activar tu perfil profesional.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div className="auth-header">
          <Link to="/app" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Activa tu perfil profesional</h1>
          <p className="auth-sub">Solo lo básico para poder postular. El resto de tu perfil lo completas después, ya dentro.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="onb-field">
            <label className="onb-label">¿Cuál es tu rol principal?</label>
            <div className="onb-role-grid">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`onb-role${form.professional_type === role.id ? ' on' : ''}`}
                  onClick={() => setForm({ ...form, professional_type: role.id })}
                >
                  <b>{role.label}</b>
                  <span>{role.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="onb-field">
            <label className="onb-label">
              Especialidad principal <span className="onb-opt">opcional por ahora</span>
            </label>
            <input
              className="onb-input"
              type="text"
              placeholder="Ej.: Operación nocturna, atención al cliente, hospitalario"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Activando…' : 'Guardar y continuar →'}
          </button>
        </form>
      </div>
    </div>
  )
}

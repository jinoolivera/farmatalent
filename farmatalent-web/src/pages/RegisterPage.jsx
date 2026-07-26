import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/client'
import { getPostLoginPath } from '../auth/authRouting'
import { trackEvent } from '../utils/analytics'

export function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [termsOk, setTermsOk] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    trackEvent('register_viewed')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!termsOk) {
      setError('Debes aceptar los Términos de Uso y la Política de Privacidad para continuar.')
      return
    }

    try {
      trackEvent('register_submitted')
      const data = await register(form)
      trackEvent('register_completed', { destination: getPostLoginPath(data?.user) })
      navigate(getPostLoginPath(data?.user), { replace: true })
    } catch (ex) {
      setError(getApiErrorMessage(ex, 'No se pudo crear la cuenta.'))
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-header">
          <Link to="/" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Crea tu cuenta</h1>
          <p className="auth-sub">Un solo acceso. Entras rápido y completas tu perfil cuando realmente lo necesites.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="onb-field">
            <label className="onb-label" htmlFor="name">Nombre completo</label>
            <input
              className="onb-input"
              id="name"
              type="text"
              placeholder="María Rodríguez Chávez"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              required
            />
          </div>

          <div className="onb-field">
            <label className="onb-label" htmlFor="email">Email</label>
            <input
              className="onb-input"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>

          <div className="onb-row">
            <div className="onb-field">
              <label className="onb-label" htmlFor="password">Contraseña</label>
              <input
                className="onb-input"
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="onb-field">
              <label className="onb-label" htmlFor="password_confirmation">Confirmar contraseña</label>
              <input
                className="onb-input"
                id="password_confirmation"
                type="password"
                placeholder="Repite la contraseña"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

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
              <Link to="/privacidad" target="_blank" className="onb-terms-link">Política de Privacidad</Link>.
            </span>
          </label>

          <button className="auth-submit" type="submit" disabled={loading || !termsOk}>
            {loading ? 'Creando cuenta…' : 'Entrar a FarmaTalent →'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--ft-blue-700)', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </div>

        <div className="auth-trust">
          <span>Una sola cuenta</span>
          <span>· Perfil gradual</span>
          <span>· Datos protegidos</span>
        </div>
      </div>
    </div>
  )
}

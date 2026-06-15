import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../api/client'
import { getPostLoginPath } from '../auth/authRouting'

export function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  // Support both router state (RequireAuth) and ?redirect= query param (landing search)
  const stateNext = location.state?.from?.pathname
  const queryRedirect = searchParams.get('redirect')
  const safeNextPath = (() => {
    const candidate = queryRedirect || stateNext || null
    return typeof candidate === 'string' && candidate.startsWith('/app') ? candidate : null
  })()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await login(form)
      navigate(safeNextPath || getPostLoginPath(data?.user), { replace: true })
    } catch (ex) {
      setError(getApiErrorMessage(ex, 'No se pudo iniciar sesión.'))
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        <div className="auth-header">
          <Link to="/" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-sub">Ingresá para ver tus turnos y oportunidades.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="onb-field" style={{ marginBottom: 8 }}>
            <label className="onb-label" htmlFor="password">
              Contraseña
              <a href="#" style={{ float: 'right', color: 'var(--ft-blue-700)', fontWeight: 600, fontSize: 11 }}>¿Olvidaste?</a>
            </label>
            <input
              className="onb-input"
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión →'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Sin cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--ft-blue-700)', fontWeight: 600 }}>
            Crear cuenta gratis
          </Link>
        </div>

        <div className="auth-trust">
          <span>🔒 Conexión segura</span>
          <span>· Datos protegidos</span>
          <span>· Hecho en Perú 🇵🇪</span>
        </div>
      </div>
    </div>
  )
}

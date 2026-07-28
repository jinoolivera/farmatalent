import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/authApi'
import { getApiErrorMessage } from '../api/client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const data = await requestPasswordReset({ email })
      setMessage(data.message)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo procesar tu solicitud.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Recupera tu acceso</h1>
          <p className="auth-sub">Te enviaremos un enlace seguro para crear una nueva contraseña.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-ok">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="onb-field">
            <label className="onb-label" htmlFor="email">Email</label>
            <input
              className="onb-input"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace de recuperación →'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Recordaste tu clave?{' '}
          <Link to="/login" style={{ color: 'var(--ft-blue-700)', fontWeight: 600 }}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { getApiErrorMessage } from '../api/client'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    token: params.get('token') ?? '',
    password: '',
    password_confirmation: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const data = await resetPassword(form)
      setMessage(data.message)
      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo restablecer la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Crea una nueva contraseña</h1>
          <p className="auth-sub">Usa una clave segura de al menos 8 caracteres.</p>
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
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
              required
            />
          </div>

          <div className="onb-field">
            <label className="onb-label" htmlFor="password">Nueva contraseña</label>
            <input
              className="onb-input"
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
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
              value={form.password_confirmation}
              onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
              autoComplete="new-password"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading || !form.token}>
            {loading ? 'Actualizando…' : 'Guardar nueva contraseña →'}
          </button>
        </form>

        {!form.token && (
          <div className="auth-error">
            El enlace de recuperación es inválido. Solicita uno nuevo desde “¿Olvidaste tu contraseña?”.
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { createCompany } from '../api/companiesApi'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'
import { trackEvent } from '../utils/analytics'

const TYPES = [
  { value: 'pharmacy', label: 'Botica / farmacia' },
  { value: 'clinic', label: 'Clínica / hospital' },
  { value: 'health_company', label: 'Empresa de salud' },
]

export function ActivateCompanyPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: 'pharmacy',
    district: '',
    address: '',
    contact_phone: '',
  })

  const nextPath = searchParams.get('next')

  useEffect(() => {
    trackEvent('company_activation_viewed', { next: nextPath || '/app/farmacia' })
  }, [nextPath])

  if (isCompanyAccount(user)) {
    return <Navigate to="/app/farmacia" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      trackEvent('company_activation_submitted', { type: form.type })
      await createCompany({
        name: form.name.trim(),
        type: form.type,
        address: [form.address.trim(), form.district.trim()].filter(Boolean).join(', ') || undefined,
        contact_phone: form.contact_phone.trim() || undefined,
      })
      await refreshUser()
      trackEvent('company_activation_completed', { destination: nextPath || '/app/farmacia' })
      navigate(nextPath || '/app/farmacia', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo activar tu empresa.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div className="auth-header">
          <Link to="/app/empezar" className="lp-logo" style={{ fontSize: 17, display: 'block', marginBottom: 24 }}>FarmaTalent</Link>
          <h1 className="auth-title">Activa tu empresa</h1>
          <p className="auth-sub">Solo pedimos los datos básicos para que puedas entrar y publicar tu primera vacante.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="onb-field">
            <label className="onb-label">Tipo de establecimiento</label>
            <select
              className="onb-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="onb-field">
            <label className="onb-label">Nombre de la empresa o local</label>
            <input
              className="onb-input"
              type="text"
              placeholder="Ej.: Botica Central Miraflores"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="onb-row">
            <div className="onb-field">
              <label className="onb-label">Distrito</label>
              <input
                className="onb-input"
                type="text"
                placeholder="Miraflores"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>
            <div className="onb-field">
              <label className="onb-label">
                Teléfono <span className="onb-opt">opcional</span>
              </label>
              <input
                className="onb-input"
                type="tel"
                placeholder="+51 999 999 999"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="onb-field">
            <label className="onb-label">
              Dirección <span className="onb-opt">opcional por ahora</span>
            </label>
            <input
              className="onb-input"
              type="text"
              placeholder="Av. Larco 345"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Activando…' : 'Entrar y publicar →'}
          </button>
        </form>
      </div>
    </div>
  )
}

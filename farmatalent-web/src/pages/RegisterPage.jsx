import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProfessionalsCount } from '../api/profileApi'
import { fetchShifts } from '../api/shiftsApi'

const FEATURES_PRO = [
  'Construye reputación operacional con cada turno',
  'Sube de nivel: Junior → Senior → Master',
  'Boticas recurrentes te invitan directamente',
  'Pago seguro · a 24h del cierre del turno',
]

const FEATURES_BO = [
  'Cobertura en horas, no días — calidad garantizada',
  'Acceso a los mejores perfiles validados de Perú',
  'Construye tu red de profesionales frecuentes',
  'Tu botica también construye reputación visible',
]

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function RegisterPage() {
  const [proCount, setProCount]       = useState(null)
  const [shiftsCount, setShiftsCount] = useState(null)

  useEffect(() => {
    fetchProfessionalsCount()
      .then((n) => { if (n != null) setProCount(Math.max(50, n)) })
      .catch(() => {})
    fetchShifts({ status: 'open', per_page: 1 })
      .then((res) => {
        const t = res.meta?.total ?? res.total ?? null
        if (t != null) setShiftsCount(t)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="reg-wrap">

      {/* Nav */}
      <nav className="reg-nav">
        <div className="reg-nav-in">
          <Link to="/" className="lp-logo" style={{ fontSize: 17 }}>FarmaTalent</Link>
          <Link className="reg-nav-link" to="/login">¿Ya tienes cuenta? <b>Inicia sesión</b></Link>
        </div>
      </nav>

      <div className="reg-body">
        <span className="lp-pill" style={{ marginBottom: 0 }}>
          <span className="lp-dot" />{shiftsCount != null ? `${shiftsCount} turnos activos` : 'Turnos activos'} en Perú · ahora mismo
        </span>
        <h1 className="reg-h1">¿Cómo quieres usar <em>FarmaTalent</em>?</h1>
        <p className="reg-lead">Una sola plataforma. Dos formas de entrar. Elige la que se ajusta a ti y empezamos en menos de 2 minutos.</p>

        <div className="reg-cards">

          {/* Profesional */}
          <Link className="reg-card reg-card-pro" to="/registro/profesional">
            <div className="reg-card-bg" />
            <div className="reg-card-head">
              <div className="reg-card-ico reg-card-ico-pro">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
              </div>
              <span className="reg-recommended">★ Recomendado</span>
            </div>
            <h2 className="reg-card-title">Soy <em>profesional</em><br />de farmacia</h2>
            <p className="reg-card-desc">Químico farmacéutico, técnico, auxiliar, enfermero, practicante o personal de apoyo en farmacia.</p>
            <ul className="reg-features">
              {FEATURES_PRO.map((f) => (
                <li key={f}><CheckIcon />{f}</li>
              ))}
            </ul>
            <div className="reg-stats">
              <div className="reg-stat"><div className="reg-stat-v"><em>{proCount != null ? `${proCount.toLocaleString('es-PE')}+` : '50+'}</em></div><div className="reg-stat-l">pros activos</div></div>
              <div className="reg-stat"><div className="reg-stat-v">2.1h</div><div className="reg-stat-l">match medio</div></div>
              <div className="reg-stat"><div className="reg-stat-v">94%</div><div className="reg-stat-l">satisfacción</div></div>
            </div>
            <div className="reg-card-cta">
              <span className="reg-price-note">Crear cuenta <b>gratis</b> · 90 segundos</span>
              <span className="reg-btn-go reg-btn-go-pro">Continuar →</span>
            </div>
          </Link>

          {/* Botica */}
          <Link className="reg-card reg-card-bo" to="/registro/farmacia">
            <div className="reg-card-bg" />
            <div className="reg-card-head">
              <div className="reg-card-ico reg-card-ico-bo">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21V8l9-6 9 6v13"/><path d="M9 21v-8h6v8"/></svg>
              </div>
            </div>
            <h2 className="reg-card-title">Soy <em>botica,</em><br />clínica o cadena</h2>
            <p className="reg-card-desc">Independientes, cadenas farmacéuticas (Inkafarma, Mifarma…), boticas, clínicas y establecimientos de salud.</p>
            <ul className="reg-features">
              {FEATURES_BO.map((f) => (
                <li key={f}><CheckIcon />{f}</li>
              ))}
            </ul>
            <div className="reg-stats">
              <div className="reg-stat"><div className="reg-stat-v"><em>2,400</em></div><div className="reg-stat-l">sucursales</div></div>
              <div className="reg-stat"><div className="reg-stat-v">38 min</div><div className="reg-stat-l">cobertura</div></div>
              <div className="reg-stat"><div className="reg-stat-v">87%</div><div className="reg-stat-l">match alto</div></div>
            </div>
            <div className="reg-card-cta">
              <span className="reg-price-note">Plan Cobertura · <b>1er mes gratis</b></span>
              <span className="reg-btn-go reg-btn-go-bo">Continuar →</span>
            </div>
          </Link>

        </div>

        <div className="reg-login-row">
          ¿No estás seguro cuál te corresponde? <a href="#">Habla con ventas →</a>
        </div>

        <div className="reg-trust">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0"/></svg>
            Cuenta privada · datos protegidos
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Verificación operacional · no documentos al inicio
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Listo en 90 segundos
          </span>
        </div>
      </div>
    </div>
  )
}

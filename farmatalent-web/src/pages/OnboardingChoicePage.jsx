import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getPostLoginPath, isCompanyAccount } from '../auth/authRouting'
import { trackEvent } from '../utils/analytics'

export function OnboardingChoicePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    trackEvent('onboarding_choice_viewed')
  }, [])

  if (isCompanyAccount(user) || user?.professional_type) {
    return <Navigate to={getPostLoginPath(user)} replace />
  }

  return (
    <div className="reg-wrap">
      <nav className="reg-nav">
        <div className="reg-nav-in">
          <span className="lp-logo" style={{ fontSize: 17 }}>FarmaTalent</span>
        </div>
      </nav>

      <div className="reg-body">
        <span className="lp-pill" style={{ marginBottom: 0 }}>
          <span className="lp-dot" />Tu cuenta ya está lista
        </span>
        <h1 className="reg-h1">¿Qué quieres hacer primero?</h1>
        <p className="reg-lead">No vamos a pedirte todo de golpe. Elige tu primer objetivo y completamos solo lo mínimo cuando haga falta.</p>

        <div className="reg-cards">
          <button className="reg-card reg-card-pro" type="button" onClick={() => { trackEvent('onboarding_choice_selected', { intent: 'professional' }); navigate('/app') }}>
            <div className="reg-card-bg" />
            <div className="reg-card-head">
              <div className="reg-card-ico reg-card-ico-pro">👤</div>
            </div>
            <h2 className="reg-card-title">Quiero <em>buscar turnos</em></h2>
            <p className="reg-card-desc">Explora oportunidades ahora. Cuando vayas a postular por primera vez, te pediremos solo tu rol profesional.</p>
            <div className="reg-card-cta">
              <span className="reg-price-note">Acceso inmediato</span>
              <span className="reg-btn-go reg-btn-go-pro">Ver turnos →</span>
            </div>
          </button>

          <button className="reg-card reg-card-bo" type="button" onClick={() => { trackEvent('onboarding_choice_selected', { intent: 'company' }); navigate('/app/activar-empresa') }}>
            <div className="reg-card-bg" />
            <div className="reg-card-head">
              <div className="reg-card-ico reg-card-ico-bo">🏪</div>
            </div>
            <h2 className="reg-card-title">Quiero <em>publicar una vacante</em></h2>
            <p className="reg-card-desc">Activa tu botica o clínica con datos básicos y luego publica tu primer turno dentro de la plataforma.</p>
            <div className="reg-card-cta">
              <span className="reg-price-note">Activación corta</span>
              <span className="reg-btn-go reg-btn-go-bo">Activar empresa →</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

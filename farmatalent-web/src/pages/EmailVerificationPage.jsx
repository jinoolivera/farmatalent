import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const IconCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconMail = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

/**
 * Página de resultado de verificación de email.
 * El usuario llega aquí después de hacer clic en el enlace del correo.
 * Query params: ?verified=1 | ?already=1 | ?error=invalid
 */
export function EmailVerificationPage() {
  const [params]            = useSearchParams()
  const { refreshUser }     = useAuth()
  const [refreshed, setRefreshed] = useState(false)

  const verified = params.get('verified') === '1'
  const already  = params.get('already')  === '1'
  const error    = params.get('error')

  /* Refrescar el usuario autenticado para que email_verified se actualice */
  useEffect(() => {
    if ((verified || already) && !refreshed) {
      setRefreshed(true)
      refreshUser().catch(() => {})
    }
  }, [verified, already, refreshed, refreshUser])

  /* ── pantalla de éxito ─────────────────────────────────── */
  if (verified || already) {
    return (
      <div className="ev-wrap">
        <div className="ev-card">
          <div className="ev-icon ev-icon-ok">
            <IconCheck />
          </div>
          <h1 className="ev-h1">
            {already ? '¡Ya verificado!' : '¡Correo verificado!'}
          </h1>
          <p className="ev-p">
            {already
              ? 'Tu dirección de correo ya estaba verificada. Puedes seguir usando FarmaTalent con normalidad.'
              : 'Tu cuenta en FarmaTalent está activa y verificada. Ya puedes acceder a todas las funciones de la plataforma.'}
          </p>
          <div className="ev-actions">
            <Link className="ft-btn ft-btn-brand" to="/app">
              Ir al dashboard →
            </Link>
          </div>
          <div className="ev-note">
            🔒 Tu identidad y datos personales están protegidos conforme a la Ley N° 29733.
          </div>
        </div>
      </div>
    )
  }

  /* ── pantalla de error ─────────────────────────────────── */
  if (error) {
    return (
      <div className="ev-wrap">
        <div className="ev-card">
          <div className="ev-icon ev-icon-err">
            <IconX />
          </div>
          <h1 className="ev-h1">Enlace no válido</h1>
          <p className="ev-p">
            El enlace de verificación ha expirado o no es válido.
            Los enlaces tienen una validez de 60 minutos.
          </p>
          <div className="ev-actions">
            <Link className="ft-btn ft-btn-brand" to="/app">
              Ir al dashboard
            </Link>
            <Link className="ft-btn ft-btn-outline" to="/">
              Volver al inicio
            </Link>
          </div>
          <p className="ev-note">
            Desde el dashboard puedes solicitar un nuevo correo de verificación.
          </p>
        </div>
      </div>
    )
  }

  /* ── estado por defecto (sin parámetros) ───────────────── */
  return (
    <div className="ev-wrap">
      <div className="ev-card">
        <div className="ev-icon ev-icon-pending">
          <IconMail />
        </div>
        <h1 className="ev-h1">Revisa tu correo</h1>
        <p className="ev-p">
          Enviamos un enlace de verificación a tu dirección de email.
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <div className="ev-actions">
          <Link className="ft-btn ft-btn-brand" to="/app">
            Ir al dashboard
          </Link>
        </div>
        <p className="ev-note">
          ¿No lo encuentras? Revisa tu carpeta de spam o solicita un reenvío desde el dashboard.
        </p>
      </div>
    </div>
  )
}

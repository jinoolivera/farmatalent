import { useState } from 'react'
import { resendVerificationEmail } from '../api/authApi'
import { getApiErrorMessage } from '../api/client'

/**
 * EmailVerificationBanner — aviso no-bloqueante visible en el layout privado
 * cuando el usuario no ha verificado su correo electrónico.
 *
 * Props: ninguna (usa `user` del contexto a través del parent)
 */
export function EmailVerificationBanner({ userEmail }) {
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error
  const [error, setError]     = useState('')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleResend() {
    setStatus('sending')
    setError('')
    try {
      await resendVerificationEmail()
      setStatus('sent')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo enviar el correo. Intenta más tarde.'))
      setStatus('error')
    }
  }

  return (
    <div className="evb-bar" role="alert">
      <div className="evb-inner">
        <span className="evb-ico">✉️</span>
        <div className="evb-text">
          {status === 'sent' ? (
            <>
              <strong>Correo enviado.</strong> Revisa tu bandeja de entrada en{' '}
              <em>{userEmail}</em> y haz clic en el enlace de verificación.
            </>
          ) : (
            <>
              <strong>Verifica tu correo.</strong> Enviamos un enlace a{' '}
              <em>{userEmail}</em>.{' '}
              {status === 'error' && (
                <span className="evb-err">{error} </span>
              )}
            </>
          )}
        </div>
        <div className="evb-actions">
          {status !== 'sent' && (
            <button
              className="evb-btn"
              onClick={handleResend}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando…' : 'Reenviar correo'}
            </button>
          )}
          <button
            className="evb-dismiss"
            onClick={() => setDismissed(true)}
            aria-label="Cerrar aviso"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'ft_cookie_consent'

/* ── íconos ─────────────────────────────────────────────── */
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCookie = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
    <circle cx="14" cy="8" r="1" fill="currentColor"/>
    <circle cx="15" cy="14" r="1" fill="currentColor"/>
    <circle cx="9" cy="15" r="1" fill="currentColor"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ── componente ─────────────────────────────────────────── */
/**
 * CookieConsent — banner no-intrusivo en la parte inferior.
 * Guarda la preferencia en localStorage bajo ft_cookie_consent:
 *   { analytics: true|false, timestamp: number }
 * Las cookies esenciales siempre están activas y no se solicita
 * consentimiento para ellas.
 */
export function CookieConsent() {
  const [visible, setVisible]     = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [analytics, setAnalytics] = useState(false)

  /* comprobar si ya existe preferencia guardada */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        // no hay preferencia → mostrar el banner tras 800ms
        const t = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(t)
      }
      const parsed = JSON.parse(saved)
      setAnalytics(parsed.analytics ?? false)
    } catch {
      setVisible(true)
    }
  }, [])

  function save(acceptAnalytics) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ analytics: acceptAnalytics, timestamp: Date.now() })
      )
    } catch { /* silent */ }
    setAnalytics(acceptAnalytics)
    setVisible(false)
  }

  function acceptAll()      { save(true)  }
  function acceptEssential(){ save(false) }

  if (!visible) return null

  return (
    <div className="cc-backdrop" role="dialog" aria-modal="true" aria-label="Preferencias de cookies">
      <div className="cc-banner">

        {/* Cabecera */}
        <div className="cc-head">
          <div className="cc-ico"><IconCookie /></div>
          <div className="cc-title-wrap">
            <h3 className="cc-title">Usamos cookies 🍪</h3>
            <p className="cc-sub">
              Para mejorar tu experiencia y garantizar la seguridad de la Plataforma.{' '}
              <Link to="/cookies" className="cc-link" onClick={() => setVisible(false)}>
                Ver política completa →
              </Link>
            </p>
          </div>
          <button
            className="cc-dismiss"
            onClick={acceptEssential}
            aria-label="Cerrar y aceptar solo esenciales"
            title="Cerrar (solo esenciales)"
          >
            <IconX />
          </button>
        </div>

        {/* Panel de configuración (expandible) */}
        {expanded && (
          <div className="cc-config">
            <div className="cc-opt cc-opt-on">
              <div className="cc-opt-info">
                <div className="cc-opt-name">🔒 Cookies esenciales</div>
                <div className="cc-opt-desc">
                  Sesión, autenticación y seguridad CSRF. Requeridas para el funcionamiento.
                </div>
              </div>
              <div className="cc-toggle cc-toggle-on">
                <IconCheck /> Siempre activas
              </div>
            </div>

            <div className="cc-opt">
              <div className="cc-opt-info">
                <div className="cc-opt-name">📊 Cookies analíticas</div>
                <div className="cc-opt-desc">
                  Estadísticas de uso anonimizadas para mejorar la Plataforma.
                </div>
              </div>
              <button
                className={`cc-toggle-btn${analytics ? ' on' : ''}`}
                onClick={() => setAnalytics((v) => !v)}
                role="switch"
                aria-checked={analytics}
              >
                <span className="cc-toggle-knob" />
              </button>
            </div>

            <div className="cc-opt cc-opt-disabled">
              <div className="cc-opt-info">
                <div className="cc-opt-name">🎯 Cookies de marketing</div>
                <div className="cc-opt-desc">
                  No usadas actualmente.
                </div>
              </div>
              <div className="cc-toggle cc-toggle-off">No aplicable</div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="cc-actions">
          <button
            className="cc-btn cc-btn-ghost"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Cerrar ↑' : 'Configurar ↓'}
          </button>
          <button
            className="cc-btn cc-btn-outline"
            onClick={acceptEssential}
          >
            Solo esenciales
          </button>
          <button
            className="cc-btn cc-btn-brand"
            onClick={acceptAll}
          >
            Aceptar todo ✓
          </button>
        </div>
      </div>
    </div>
  )
}

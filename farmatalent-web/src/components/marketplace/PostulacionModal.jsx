import { useEffect, useRef, useState } from 'react'
import { applyToShift } from '../../api/applicationsApi'
import { getApiErrorMessage } from '../../api/client'

/* ── icons ─────────────────────────────────────────────── */
const IconX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck  = () => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconLock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0"/></svg>
const IconCoin   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>

const GRADIENTS = [
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#1E40AF,#3B82F6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#7C2D12,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
]

/* estimated sub-scores based on overall match */
function getSubScores(overall) {
  const base = overall ?? 85
  return [
    { label: '📍 Distancia y zona',           value: Math.min(100, base + 2) },
    { label: '🩺 Especialidad y rol',          value: Math.min(100, base - 1) },
    { label: '🤝 Historial con la botica',     value: Math.min(100, base + 3) },
    { label: '📅 Disponibilidad declarada',    value: Math.min(100, base - 3) },
  ]
}

/**
 * PostulacionModal — shown before confirming application.
 *
 * Props:
 *   shift       — normalized shift object (id, title, org, orgShort, matchPercent, date,
 *                 startTime, endTime, distanceKm, colorIdx, urgent, recurring)
 *   onClose     — () => void
 *   onSuccess   — (applicationId?) => void   called after successful application
 */
export function PostulacionModal({ shift, onClose, onSuccess }) {
  const [message, setMessage]   = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const backdropRef             = useRef(null)
  const MAX_CHARS               = 240

  const subScores = getSubScores(shift?.matchPercent)
  const gradient  = GRADIENTS[(shift?.colorIdx ?? 0) % GRADIENTS.length]
  const orgShort  = shift?.orgShort ?? 'FT'

  /* close on backdrop click */
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose()
  }

  /* close on Escape */
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleApply() {
    setBusy(true)
    setError('')
    try {
      const res = await applyToShift(shift.id, { message: message.trim() || undefined })
      onSuccess(res?.data?.id ?? res?.id)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo registrar la postulación.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pm-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="pm-modal" role="dialog" aria-modal="true">
        <button className="pm-close" onClick={onClose} aria-label="Cerrar"><IconX /></button>

        {/* Cover */}
        <div className="pm-cover" style={{ background: gradient }}>
          <div className="pm-cover-deco" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="pm-cv-lbl">
              <span className="pm-dot" />
              Postulación a un turno{shift?.date ? ` · ${shift.date}` : ''}
            </span>
            <div className="pm-cv-match">
              <div className="pm-org">{orgShort}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="pm-cv-title">{shift?.org ?? 'Farmacia'}</h2>
                <div className="pm-cv-sub">
                  <span className="pm-vchk"><IconCheck /></span>
                  Botica verificada
                  {shift?.distanceKm ? ` · ${shift.distanceKm}` : ''}
                </div>
              </div>
              {shift?.matchPercent != null && (
                <span className="pm-score-pill">★ {shift.matchPercent}% match</span>
              )}
            </div>
            <div className="pm-shift-info">
              {shift?.title     && <span className="pm-si-pill">🩺 {shift.title}</span>}
              {shift?.startTime && <span className="pm-si-pill">🌙 {shift.startTime}{shift.endTime ? `–${shift.endTime}` : ''}</span>}
              {shift?.distanceKm && <span className="pm-si-pill">📍 {shift.distanceKm}</span>}
              {shift?.urgent    && <span className="pm-si-pill">⚡ Urgente</span>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pm-body">
          {/* Compatibility */}
          <div className="pm-qhead">
            <h3>Tu compatibilidad con este turno</h3>
            {shift?.matchPercent >= 90 && <span className="pm-qbadge">★ MATCH ALTO</span>}
          </div>
          <div className="pm-compat">
            <div className="pm-compat-top">
              <div className="pm-compat-l">Compatibilidad general</div>
              <div className="pm-compat-v">
                {shift?.matchPercent ?? '—'}
                <em>%</em>
              </div>
            </div>
            <div className="pm-bars">
              {subScores.map((s) => (
                <div key={s.label} className="pm-cb-row">
                  <div className="pm-cb-lab">{s.label}</div>
                  <div className="pm-cb-bar"><div className="pm-cb-fill" style={{ width: `${s.value}%` }} /></div>
                  <div className="pm-cb-val">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarifa */}
          <div className="pm-qhead">
            <h3>Tarifa propuesta por la botica</h3>
            <span className="pm-qbadge" style={{ background: '#FEF3C7', color: '#92400E' }}>PROPUESTA · NEGOCIABLE</span>
          </div>
          <div className="pm-tarifa">
            <div className="pm-ti"><IconCoin /></div>
            <div className="pm-tx">
              <b>Tarifa establecida por la botica</b>
              <span>Acepta, negocia o rechaza antes de confirmar · pago a 24h del cierre</span>
            </div>
            <div className="pm-tarifa-val"><sup>S/</sup>—</div>
          </div>

          {/* Message */}
          <div className="pm-msg-box">
            <label>
              Mensaje a la botica
              <span>opcional · {MAX_CHARS} chars</span>
            </label>
            <textarea
              placeholder="Ej.: Disponible desde las 21:30. Confirmo asistencia al primer turno."
              value={message}
              maxLength={MAX_CHARS}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="pm-msg-hint">
              <span>El mensaje se envía recién si la botica confirma el match.</span>
              <span>{message.length} / {MAX_CHARS}</span>
            </div>
          </div>

          {/* Privacy */}
          <div className="pm-privacy">
            <IconLock />
            <div>
              <b>Privacidad operacional.</b> Tu DNI, teléfono y dirección exacta se desbloquean para la botica únicamente al confirmar el match. Hasta entonces, solo ven tu rol, score y zonas.
            </div>
          </div>

          {error && <div className="onb-error" style={{ marginBottom: 12 }}>{error}</div>}
        </div>

        {/* CTAs */}
        <div className="pm-cta-stack">
          <button className="pm-btn pm-btn-primary" disabled={busy} onClick={handleApply}>
            {busy ? 'Postulando…' : 'Aceptar tarifa y postular'}
            {!busy && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
          <button className="pm-btn pm-btn-secondary" disabled={busy} onClick={onClose}>
            Revisar antes · volver al turno
          </button>
          <button className="pm-btn pm-btn-tertiary" disabled={busy} onClick={onClose}>
            No me interesa, cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

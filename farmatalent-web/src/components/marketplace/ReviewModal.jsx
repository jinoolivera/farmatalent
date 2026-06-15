import { useState } from 'react'
import { submitReview } from '../../api/reviewsApi'
import { getApiErrorMessage } from '../../api/client'

/* ── icons ─────────────────────────────────────────────── */
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ── dimensiones de evaluación ──────────────────────────── */
const DIMS = [
  { key: 'punctuality', label: 'Puntualidad',   desc: '¿Llegó a tiempo y cumplió el horario?',           emoji: '⏱' },
  { key: 'operation',   label: 'Operación',      desc: '¿Manejó correctamente los procesos de la botica?', emoji: '⚙️' },
  { key: 'attention',   label: 'Atención',       desc: '¿Cómo fue el trato al cliente y al equipo?',      emoji: '🤝' },
  { key: 'reliability', label: 'Confiabilidad',  desc: '¿Puedes contar con este profesional en el futuro?', emoji: '🔒' },
  { key: 'sales',       label: 'Ventas',         desc: '¿Aportó valor en el punto de venta?',             emoji: '📊' },
]

const STAR_LABELS = ['', 'Muy bajo', 'Bajo', 'Regular', 'Bueno', 'Excelente']
const STAR_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A']

/* ── fila de estrellas ──────────────────────────────────── */
function StarRow({ value, onChange, highlight }) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="rev-stars-wrap">
      <div className="rev-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rev-star${active >= n ? ' on' : ''}${highlight ? ' missing' : ''}`}
            style={active >= n ? { color: STAR_COLORS[active] } : {}}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            aria-label={`${n} estrellas`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24"
              fill={active >= n ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/>
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="rev-star-lbl" style={{ color: STAR_COLORS[active] }}>
          {STAR_LABELS[active]}
        </span>
      )}
    </div>
  )
}

/* ── componente principal ───────────────────────────────── */
/**
 * ReviewModal — calificación bilateral post-turno.
 * Props:
 *   applicationId — string | number
 *   targetName    — nombre de quien se califica
 *   targetRole    — 'profesional' | 'botica' (para contextualizar)
 *   onClose       — () => void
 *   onSuccess     — () => void
 */
export function ReviewModal({ applicationId, targetName, targetRole = 'profesional', onClose, onSuccess }) {
  const [scores, setScores]   = useState({ punctuality: 0, operation: 0, attention: 0, reliability: 0, sales: 0 })
  const [comment, setComment] = useState('')
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)
  const [attempted, setAttempted] = useState(false)   // para mostrar dimensiones faltantes

  const filledCount = Object.values(scores).filter((v) => v > 0).length
  const allFilled   = filledCount === DIMS.length

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allFilled) {
      setAttempted(true)
      setError(`Faltan ${DIMS.length - filledCount} dimensión${DIMS.length - filledCount > 1 ? 'es' : ''} por calificar.`)
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitReview(applicationId, { scores, comment: comment.trim() || undefined })
      setDone(true)
      setTimeout(onSuccess, 2000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo enviar la calificación. Intenta nuevamente.'))
    } finally {
      setBusy(false)
    }
  }

  /* ── pantalla de éxito ──────────────────────────────────── */
  if (done) {
    return (
      <div className="pm-backdrop" >
        <div className="pm-modal rev-modal" role="dialog" aria-modal="true">
          <div className="rev-success">
            <div className="rev-success-ring">
              <IconCheck />
            </div>
            <h2 className="rev-success-h2">¡Calificación enviada!</h2>
            <p className="rev-success-p">
              Tu evaluación es anónima hasta que ambas partes califiquen.
              Cada calificación fortalece la reputación del ecosistema FarmaTalent.
            </p>
            <div className="rev-success-score">
              {DIMS.map((d) => (
                <div key={d.key} className="rev-success-dim">
                  <span>{d.emoji}</span>
                  <span style={{ color: STAR_COLORS[scores[d.key]] }}>{'★'.repeat(scores[d.key])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── modal principal ────────────────────────────────────── */
  return (
    <div className="pm-backdrop"  onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal rev-modal" role="dialog" aria-modal="true">
        <button className="pm-close" onClick={onClose} aria-label="Cerrar"><IconX /></button>

        {/* Cabecera verde */}
        <div className="rev-head">
          <div className="rev-head-deco" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="pm-cv-lbl">
              <span className="pm-dot" />Calificación post-turno · bilateral
            </span>
            <h2 className="rev-h2">
              Calificar a <em>{targetName ?? `este ${targetRole}`}</em>
            </h2>
            <p className="rev-sub">
              Anónima hasta que ambas partes califiquen · ayuda a construir una red de confianza
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="rev-progress-bar">
          <div className="rev-progress-track">
            <div
              className="rev-progress-fill"
              style={{ width: `${(filledCount / DIMS.length) * 100}%` }}
            />
          </div>
          <span className="rev-progress-label">
            {filledCount === DIMS.length
              ? '✓ Todas las dimensiones calificadas'
              : `${filledCount} de ${DIMS.length} calificadas`}
          </span>
        </div>

        <form className="rev-body" onSubmit={handleSubmit}>

          {/* Dimensiones */}
          {DIMS.map((dim) => {
            const val      = scores[dim.key]
            const isFilled = val > 0
            const isMissing = attempted && !isFilled

            return (
              <div
                key={dim.key}
                className={`rev-dim${isFilled ? ' filled' : ''}${isMissing ? ' missing' : ''}`}
              >
                <div className="rev-dim-left">
                  <div className="rev-dim-emoji">{dim.emoji}</div>
                  <div className="rev-dim-info">
                    <div className="rev-dim-label">
                      {dim.label}
                      {isFilled && (
                        <span className="rev-dim-check"><IconCheck /></span>
                      )}
                      {isMissing && (
                        <span className="rev-dim-req">requerido</span>
                      )}
                    </div>
                    <div className="rev-dim-desc">{dim.desc}</div>
                  </div>
                </div>
                <StarRow
                  value={val}
                  onChange={(v) => {
                    setScores((s) => ({ ...s, [dim.key]: v }))
                    if (attempted && error) setError('')
                  }}
                  highlight={isMissing}
                />
              </div>
            )
          })}

          {/* Comentario */}
          <div className="rev-comment-wrap">
            <label className="rev-comment-label">
              Comentario
              <span className="rev-comment-opt">opcional · visible al concluir</span>
            </label>
            <textarea
              className="rev-comment"
              placeholder={`Ej.: Muy puntual y con buen manejo de receta magistral. Lo volvería a contratar.`}
              value={comment}
              maxLength={400}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            {comment.length > 300 && (
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 3 }}>
                {400 - comment.length} caracteres restantes
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rev-error">
              ⚠ {error}
            </div>
          )}

          {/* Botones */}
          <div className="rev-actions">
            <button
              type="button"
              className="ft-btn ft-btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={busy}
            >
              Ahora no
            </button>
            <button
              type="submit"
              className={`ft-btn ft-btn-brand${!allFilled ? ' rev-btn-partial' : ''}`}
              style={{ flex: 2 }}
              disabled={busy}
            >
              {busy
                ? 'Enviando…'
                : allFilled
                  ? 'Enviar calificación →'
                  : `Califica ${DIMS.length - filledCount} más →`}
            </button>
          </div>

          <div className="rev-footnote">
            🔒 Tu identidad se mantiene oculta hasta que ambas partes califiquen.
            El score se actualiza automáticamente en tu perfil.
          </div>
        </form>
      </div>
    </div>
  )
}

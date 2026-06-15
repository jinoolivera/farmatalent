import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'

const DIMS = [
  { key: 'punctuality_score',  label: 'Puntualidad',    color: '#16A34A', track: '#DCFCE7', desc: 'Llegada a tiempo a cada turno' },
  { key: 'operation_score',    label: 'Operación',       color: '#1D4ED8', track: '#DBEAFE', desc: 'Manejo del área y procesos' },
  { key: 'care_score',         label: 'Atención',        color: '#7C3AED', track: '#EDE9FE', desc: 'Calidad de atención al paciente' },
  { key: 'reliability_score',  label: 'Confiabilidad',   color: '#D97706', track: '#FEF3C7', desc: 'Cumplimiento y responsabilidad' },
  { key: 'sales_score',        label: 'Ventas',          color: '#0F766E', track: '#CCFBF1', desc: 'Rendimiento en ventas y cross-sell' },
]

const BADGES_CFG = [
  { id: 'punctual',  label: '⚡ Siempre a tiempo',  cond: (m) => (m?.punctuality_score  ?? 0) >= 90 },
  { id: 'reliable',  label: '🔒 Alta confiabilidad', cond: (m) => (m?.reliability_score  ?? 0) >= 88 },
  { id: 'top_sales', label: '📈 Top ventas',         cond: (m) => (m?.sales_score        ?? 0) >= 88 },
  { id: 'elite',     label: '✨ Elite',              cond: (m) => (m?.reputation_score   ?? 0) >= 93 },
]

function getTier(score) {
  if (score >= 93) return { label: 'Elite',  color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' }
  if (score >= 85) return { label: 'Oro',    color: '#D97706', bg: '#FEF9EE', border: '#FDE68A' }
  if (score >= 70) return { label: 'Plata',  color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' }
  return               { label: 'Bronce', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' }
}

function ScoreRing({ value = 0, color = '#16A34A', track = '#E5E7EB', size = 88 }) {
  const r    = (size / 2) - 8
  const cx   = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth="8" />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      <text x={cx} y={cx + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: size * 0.20, fontWeight: 700, fill: '#111827', fontFamily: 'inherit' }}>
        {value ?? '—'}
      </text>
    </svg>
  )
}

function DimBar({ label, value, color, track, desc }) {
  const pct = Math.min(value ?? 0, 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'var(--ft-fg-muted)', marginLeft: 6 }}>{desc}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color }}>{value ?? '—'}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: track, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: color, transition: 'width .6s ease',
        }} />
      </div>
    </div>
  )
}

export function ReputacionPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [metrics, setMetrics]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get('/metrics/mine')
      .then(({ data }) => {
        setMetrics(data?.data ?? data)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar tu reputación.')
        setLoading(false)
      })
  }, [])

  const repScore = metrics?.reputation_score ?? null
  const tier = repScore != null ? getTier(repScore) : null
  const earnedBadges = BADGES_CFG.filter((b) => b.cond(metrics))

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="ft-dash-header">
        <div>
          <h1>Mi reputación</h1>
          <div className="ft-dash-sub">
            Puntuaciones calculadas por FarmaTalent en base a tus turnos completados
          </div>
        </div>
        <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => navigate('/app/perfil')}>
          Ver perfil →
        </button>
      </div>

      {error && (
        <div className="onb-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
          Cargando métricas…
        </div>
      ) : metrics == null && !error ? (
        <div className="ft-pane" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Sin métricas aún</div>
          <div style={{ fontSize: 13, color: 'var(--ft-fg-muted)' }}>
            Tus scores se calculan a partir de los turnos que completas.
            Postúlate y completa tus primeros turnos para ver tus resultados aquí.
          </div>
        </div>
      ) : (
        <>
          {/* Score global + tier */}
          {repScore != null && (
            <div className="ft-pane" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 28px', marginBottom: 16 }}>
              <ScoreRing value={repScore} color={tier?.color ?? '#16A34A'} track={tier?.bg ?? '#DCFCE7'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginBottom: 4 }}>Score global de reputación</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#111827', marginBottom: 8 }}>
                  {repScore}<span style={{ fontSize: 14, color: 'var(--ft-fg-muted)', fontWeight: 500 }}>/100</span>
                </div>
                {tier && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 99,
                    background: tier.bg, border: `1px solid ${tier.border}`,
                    color: tier.color, fontWeight: 700, fontSize: 13,
                  }}>
                    Nivel {tier.label}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dimension scores */}
          <div className="ft-pane" style={{ padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#111827' }}>
              Puntuación por dimensión
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {DIMS.map((d) => (
                <DimBar
                  key={d.key}
                  label={d.label}
                  value={metrics?.[d.key] ?? null}
                  color={d.color}
                  track={d.track}
                  desc={d.desc}
                />
              ))}
            </div>
          </div>

          {/* Badges earned */}
          {earnedBadges.length > 0 && (
            <div className="ft-pane" style={{ padding: '20px 28px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#111827' }}>
                Insignias ganadas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {earnedBadges.map((b) => (
                  <span key={b.id} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0',
                  }}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How scores are calculated */}
          <div style={{ padding: '14px 18px', background: '#F8FAF8', borderRadius: 12, fontSize: 12, color: 'var(--ft-fg-muted)' }}>
            <b>¿Cómo se calculan?</b> FarmaTalent recibe feedback de las boticas al finalizar cada turno.
            Los scores se actualizan automáticamente. Completá más turnos para mejorar tus dimensiones.
          </div>
        </>
      )}
    </div>
  )
}

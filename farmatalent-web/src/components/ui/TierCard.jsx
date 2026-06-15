const TIERS = ['Bronce', 'Plata', 'Oro', 'Elite']

const TIER_ORDER = { Bronce: 0, Plata: 1, Oro: 2, Elite: 3 }

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="6" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
    </svg>
  )
}

export function TierCard({ tier = 'Oro', progress = 74, turnosParaSiguiente = 26, topPercent = 12 }) {
  const currentIdx = TIER_ORDER[tier] ?? 2

  return (
    <div className="ft-tier-card">
      <div className="ft-tier-left">
        <div className="ft-tier-eyebrow">Tu carrera en FarmaTalent</div>
        <h2 className="ft-tier-title">
          <span className="ft-tier-title-sans">Nivel</span>{' '}
          <em>{tier}</em>
        </h2>
        <p className="ft-tier-desc">
          Sos parte del Top {topPercent}% de profesionales del Perú. Tu reputación operacional
          te abre las puertas de boticas premium y turnos exclusivos.
        </p>

        <div className="ft-tier-track">
          {TIERS.map((t, i) => {
            const done = i < currentIdx
            const now  = i === currentIdx
            const isElite = t === 'Elite'

            let dotContent = isElite ? <StarIcon /> : done ? <CheckIcon /> : <DotIcon />
            let stepClass = 'ft-tier-step'
            if (done) stepClass += ' done'
            if (now)  stepClass += ' now'
            if (isElite) stepClass += ' elite'

            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div className={stepClass}>
                  <div className={`ft-tier-dot ${done ? 'done' : now ? 'now' : ''} ${isElite ? 'elite' : ''}`}>
                    {dotContent}
                  </div>
                  <span>{t}</span>
                </div>
                {i < TIERS.length - 1 && (
                  <div className={`ft-tier-line ${done ? 'done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="ft-tier-right">
        <div className="ft-tier-bar-header">
          <span>{tier} · Top {topPercent}%</span>
          <b>{turnosParaSiguiente} turnos para Elite</b>
        </div>
        <div className="ft-tier-bar">
          <div className="ft-tier-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ft-tier-tip">
          <b>Elite FarmaTalent</b> desbloquea matching prioritario absoluto + turnos exclusivos en cadenas premium
        </div>
      </div>
    </div>
  )
}

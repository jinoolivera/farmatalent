function scoreColor(value) {
  if (value >= 90) return 'var(--ft-score-excellent)'
  if (value >= 75) return 'var(--ft-score-good)'
  if (value >= 60) return 'var(--ft-score-ok)'
  return 'var(--ft-score-low)'
}

export function ScoreRing({ value = 0, label, sublabel, size = 64 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = scoreColor(value)

  return (
    <div className="ft-score-tile">
      <div className="ft-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--ft-gray-200)"
            strokeWidth={5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: `stroke-dashoffset 0.6s var(--ft-ease-out)` }}
          />
        </svg>
        <div className="ft-ring-num">
          <b style={{ color }}>{value}</b>
          <span>/100</span>
        </div>
      </div>
      {label && <div className="ft-score-label">{label}</div>}
      {sublabel && <div className="ft-score-sub">{sublabel}</div>}
    </div>
  )
}

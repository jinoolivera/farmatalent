function scoreColor(value) {
  if (value >= 90) return 'var(--ft-score-excellent)'
  if (value >= 75) return 'var(--ft-score-good)'
  if (value >= 60) return 'var(--ft-score-ok)'
  return 'var(--ft-score-low)'
}

export function ScoreBar({ label, value = 0 }) {
  const color = scoreColor(value)

  return (
    <div className="ft-perf-cell">
      <div className="ft-perf-label">{label}</div>
      <div className="ft-perf-value" style={{ color }}>{value}</div>
      <div className="ft-perf-bar">
        <div
          className="ft-perf-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

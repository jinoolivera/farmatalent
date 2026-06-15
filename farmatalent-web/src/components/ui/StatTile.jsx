export function StatTile({ label, value, delta, deltaType = 'up', valueDisplay }) {
  const deltaClass = deltaType === 'up' ? 'ft-delta-up' : 'ft-delta-flat'

  return (
    <div className="ft-stat-tile">
      <div className="ft-stat-label">{label}</div>
      <div className="ft-stat-value">
        {valueDisplay ?? value}
      </div>
      {delta && (
        <span className={`ft-delta ${deltaClass}`}>{delta}</span>
      )}
    </div>
  )
}

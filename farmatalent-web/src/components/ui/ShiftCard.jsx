import { Badge } from './Badge'
import { Button } from './Button'

const LOGO_COLORS = ['b1', 'b2', 'b3', 'b4', 'b5']

function logoColor(index) {
  return LOGO_COLORS[index % LOGO_COLORS.length]
}

function OrgLogo({ initials, colorIndex = 0 }) {
  return (
    <div className={`ft-org-logo ft-org-logo-${logoColor(colorIndex)}`}>
      {initials}
    </div>
  )
}

export function ShiftCard({
  shift,
  colorIndex = 0,
  selected = false,
  onApply,
  onDetail,
}) {
  const {
    title,
    org,
    orgShort,
    location,
    matchPercent,
    date,
    time,
    distance,
    badges = [],
    urgent,
    recurring,
    urgentLabel,
  } = shift

  return (
    <div className={`ft-shift-card ${selected ? 'selected' : ''} ${recurring ? 'recurring' : ''}`}>
      <div className="ft-shift-head">
        <OrgLogo initials={orgShort} colorIndex={colorIndex} />

        <div className="ft-shift-info">
          <div className="ft-shift-title-row">
            <div>
              <h4 className="ft-shift-title">{title}</h4>
              <div className="ft-shift-org">{org}{location ? ` · ${location}` : ''}</div>
            </div>
            {urgent && <Badge variant="urgent">● Urgente</Badge>}
            {recurring && !urgent && <Badge variant="gold">★ Recurrente</Badge>}
            {urgentLabel && !urgent && !recurring && <Badge variant="warning">{urgentLabel}</Badge>}
          </div>

          <div className="ft-shift-badges">
            {matchPercent != null && (
              <Badge variant="success">{matchPercent}% match</Badge>
            )}
            {badges.map((b, i) => (
              <Badge key={i} variant={b.variant ?? 'neutral'}>{b.label}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="ft-shift-meta">
        {date && <span>🗓 {date}</span>}
        {time && <span>🕐 {time}</span>}
        {distance && <span>📍 {distance}</span>}
      </div>

      <div className="ft-shift-foot">
        <div className={`ft-pay-est ${recurring ? 'gold' : ''}`}>
          <div className={`ft-pay-ico ${recurring ? 'gold' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className="ft-pay-text">
            <b>{recurring ? 'Relación operativa duradera' : 'Tarifa propuesta por la botica'}</b>
            <span>
              {matchPercent != null ? `Compatible ${matchPercent}%` : ''}
              {badges[0]?.label ? ` · ${badges[0].label}` : ''}
            </span>
          </div>
        </div>

        <div className="ft-shift-actions">
          {selected && (
            <Button variant="outline" onClick={onDetail}>Ver detalle</Button>
          )}
          <Button variant="primary" onClick={onApply}>
            {recurring ? 'Postular →' : 'Aplicar →'}
          </Button>
        </div>
      </div>
    </div>
  )
}

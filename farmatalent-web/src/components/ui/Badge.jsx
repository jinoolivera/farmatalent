export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'ft-badge-success',
    info:    'ft-badge-info',
    warning: 'ft-badge-warning',
    danger:  'ft-badge-danger',
    coral:   'ft-badge-coral',
    neutral: 'ft-badge-neutral',
    brand:   'ft-badge-brand',
    urgent:  'ft-badge-urgent',
    gold:    'ft-badge-gold',
  }

  return (
    <span className={['ft-badge', variants[variant] ?? variants.neutral, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

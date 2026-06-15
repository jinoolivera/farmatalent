export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'ft-btn'
  const variants = {
    primary: 'ft-btn-primary',
    secondary: 'ft-btn-secondary',
    outline: 'ft-btn-outline',
    ghost: 'ft-btn-ghost',
    brand: 'ft-btn-brand',
    danger: 'ft-btn-danger',
  }
  const sizes = {
    sm: 'ft-btn-sm',
    md: '',
    lg: 'ft-btn-lg',
  }

  return (
    <button
      className={[base, variants[variant], sizes[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

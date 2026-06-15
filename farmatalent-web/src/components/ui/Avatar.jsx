function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { xs: 'ft-ava-xs', sm: 'ft-ava-sm', md: '', lg: 'ft-ava-lg', xl: 'ft-ava-xl' }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={['ft-ava', sizes[size], className].filter(Boolean).join(' ')}
      />
    )
  }

  return (
    <div className={['ft-ava', sizes[size], className].filter(Boolean).join(' ')}>
      {initials(name)}
    </div>
  )
}

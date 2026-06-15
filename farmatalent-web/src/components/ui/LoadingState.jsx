export function LoadingState({ title = 'Cargando…' }) {
  return (
    <div className="ft-loading">
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '2px solid var(--ft-gray-200)',
        borderTopColor: 'var(--ft-blue-600)',
        animation: 'ft-spin 0.7s linear infinite',
        marginRight: 10,
      }} />
      {title}
      <style>{`@keyframes ft-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

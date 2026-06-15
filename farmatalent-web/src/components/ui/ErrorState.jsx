export function ErrorState({ title = 'No se pudo cargar la información', description = 'Intente nuevamente en unos segundos.', onRetry, retryLabel = 'Reintentar' }) {
  return (
    <div className="ft-empty">
      <div style={{
        display: 'inline-block',
        padding: '8px 14px',
        borderRadius: 'var(--ft-radius-lg)',
        background: 'var(--ft-danger-100)',
        color: 'var(--ft-danger-700)',
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 12,
      }}>
        {title}
      </div>
      <p>{description}</p>
      {onRetry && (
        <button className="ft-btn ft-btn-outline" style={{ marginTop: 12 }} onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}

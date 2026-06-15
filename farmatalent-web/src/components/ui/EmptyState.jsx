export function EmptyState({ title = 'Sin resultados', description = 'No encontramos información para mostrar.', action }) {
  return (
    <div className="ft-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

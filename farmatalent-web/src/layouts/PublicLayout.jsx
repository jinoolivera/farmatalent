import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="ft-public-shell">
      <nav style={{
        background: 'var(--ft-white)',
        borderBottom: '1px solid var(--ft-border)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ft-gray-900)' }}>
            FarmaTalent
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="ft-btn ft-btn-ghost ft-btn-sm">Iniciar sesión</Link>
            <Link to="/registro" className="ft-btn ft-btn-primary ft-btn-sm">Registrarse</Link>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}

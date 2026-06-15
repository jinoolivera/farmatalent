import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'
import { Avatar } from '../components/ui/Avatar'
import { NotificationsDropdown } from '../components/ui/NotificationsDropdown'
import { EmailVerificationBanner } from '../components/EmailVerificationBanner'

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
    <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
  </svg>
)
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
)
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IconToggle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="1" y="9" width="22" height="6" rx="3"/>
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
  </svg>
)
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export function PrivateLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const companyAccount = isCompanyAccount(user)
  const [showNotif, setShowNotif] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const tierLabel = user?.tier ?? 'Q.F.'
  const [searchText, setSearchText] = useState('')
  const searchRef = useRef(null)

  function handleSearch(e) {
    e.preventDefault()
    const q = searchText.trim()
    if (!q) { navigate('/app/turnos'); return }
    // Heuristic: if it looks like a professional type keyword, use that param
    const proKeywords = { 'qf': 'pharmacist', 'quimico': 'pharmacist', 'farmacéutico': 'pharmacist', 'técnico': 'pharmacy_technician', 'auxiliar': 'assistant', 'enfermero': 'nurse', 'practicante': 'intern' }
    const qLow = q.toLowerCase()
    const proMatch = Object.entries(proKeywords).find(([k]) => qLow.includes(k))
    if (proMatch) {
      navigate(`/app/turnos?professional_type=${proMatch[1]}`)
    } else {
      navigate(`/app/turnos?district=${encodeURIComponent(q)}`)
    }
    setSearchText('')
    searchRef.current?.blur()
  }

  return (
    <div className="ft-shell">
      <aside className="ft-sidebar">
        <div className="ft-sidebar-brand">
          <img src="/farmatalent-logo.svg" alt="FarmaTalent" style={{ height: 28, width: 'auto' }} />
        </div>

        <div className="ft-sidebar-section">Operación</div>

        {!companyAccount && (
          <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/turnos">
            <IconSearch /> Buscar turnos
          </NavLink>
        )}

        <NavLink
          end
          className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`}
          to={companyAccount ? '/app/farmacia' : '/app'}
        >
          <IconDashboard /> Dashboard
        </NavLink>

        <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/turnos">
          <IconCalendar /> {companyAccount ? 'Turnos publicados' : 'Mis turnos'}
        </NavLink>

        <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/postulaciones">
          <IconCheck />
          {companyAccount ? 'Postulaciones recibidas' : 'Postulaciones'}
        </NavLink>

        <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/mensajes">
          <IconChat /> Mensajes
        </NavLink>

        <div className="ft-sidebar-section">Perfil</div>

        <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/perfil">
          <IconUser /> {companyAccount ? 'Perfil de cuenta' : 'Mi perfil'}
        </NavLink>

        {!companyAccount && (
          <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/disponibilidad">
            <IconToggle /> Disponibilidad
          </NavLink>
        )}

        <NavLink className={({ isActive }) => `ft-nav-link${isActive ? ' active' : ''}`} to="/app/reputacion">
          <IconChart /> Reputación
        </NavLink>

        <div className="ft-sidebar-foot">
          <Avatar name={user?.name} size="sm" />
          <div>
            <div className="ft-sidebar-foot-name">{user?.name}</div>
            <div className="ft-sidebar-foot-role">{tierLabel}</div>
          </div>
          <button
            onClick={handleLogout}
            className="ft-btn ft-btn-ghost ft-btn-sm"
            style={{ marginLeft: 'auto', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}
            title="Cerrar sesión"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>
      </aside>

      <main className="ft-main">
        {/* Banner de verificación de email — visible hasta que el usuario verifique */}
        {user && user.email_verified === false && (
          <EmailVerificationBanner userEmail={user.email} />
        )}

        <header className="ft-topbar">
          <form className="ft-search" onSubmit={handleSearch}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ft-gray-400)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              placeholder="Buscar por distrito, tipo de turno…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </form>
          <div className="ft-topbar-actions">
            <div style={{ position: 'relative' }}>
              <button className="ft-icon-btn" title="Notificaciones" onClick={() => setShowNotif((v) => !v)}>
                <IconBell />
                <span className="ft-dot" />
              </button>
              {showNotif && <NotificationsDropdown onClose={() => setShowNotif(false)} />}
            </div>
            <Avatar name={user?.name} size="sm" />
          </div>
        </header>

        <section className="ft-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

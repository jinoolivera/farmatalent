import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { PrivateLayout } from './layouts/PrivateLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { RegisterProfessionalPage } from './pages/RegisterProfessionalPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { ShiftResultsPage } from './pages/ShiftResultsPage'
import { ShiftDetailPage } from './pages/ShiftDetailPage'
import { MatchPage } from './pages/MatchPage'
import { ChatPage } from './pages/ChatPage'
import { PharmacyDashboardPage } from './pages/PharmacyDashboardPage'
import { AvailabilityPage } from './pages/AvailabilityPage'
import { RegisterFarmaciaPage } from './pages/RegisterFarmaciaPage'
import { PostulacionesPage } from './pages/PostulacionesPage'
import { MensajesPage } from './pages/MensajesPage'
import { ReputacionPage } from './pages/ReputacionPage'
import { TerminosPage } from './pages/TerminosPage'
import { PrivacidadPage } from './pages/PrivacidadPage'
import { CookiesPage } from './pages/CookiesPage'
import { EmailVerificationPage } from './pages/EmailVerificationPage'
import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'
import { CookieConsent } from './components/CookieConsent'

export default function App() {
  return (
    <>
    <CookieConsent />
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Rutas públicas de auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/registro/profesional" element={<RegisterProfessionalPage />} />
      <Route path="/registro/farmacia" element={<RegisterFarmaciaPage />} />

      {/* Páginas legales */}
      <Route path="/terminos" element={<TerminosPage />} />
      <Route path="/privacidad" element={<PrivacidadPage />} />
      <Route path="/cookies" element={<CookiesPage />} />

      {/* Verificación de email — callback desde el enlace del correo */}
      <Route path="/email-verificado" element={<EmailVerificationPage />} />

      {/* Legacy public layout */}
      <Route element={<PublicLayout />}>
        {/* reservado para futuras páginas públicas */}
      </Route>

      {/* Búsqueda pública — standalone, sin sidebar, sin login requerido */}
      <Route path="/app/turnos" element={<ShiftResultsPage />} />
      <Route path="/app/turnos/:shiftId" element={<ShiftDetailPage />} />

      {/* App privada — sidebar + autenticación obligatoria */}
      <Route element={<RequireAuth />}>
        {/* Mensajes — standalone top-nav layout (sin sidebar) */}
        <Route path="/app/mensajes" element={<MensajesPage />} />

        <Route path="/app" element={<PrivateLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RequireRole roles={['company-owner', 'company-admin', 'company-operator', 'super-admin']} />}>
            <Route path="farmacia" element={<PharmacyDashboardPage />} />
          </Route>
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="postulaciones" element={<PostulacionesPage />} />
          <Route path="match/:applicationId" element={<MatchPage />} />
          <Route path="chat/:applicationId" element={<ChatPage />} />
          <Route path="reputacion" element={<ReputacionPage />} />
          <Route path="disponibilidad" element={<AvailabilityPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

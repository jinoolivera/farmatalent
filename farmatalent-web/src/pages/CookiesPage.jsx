import { Link } from 'react-router-dom'

export function CookiesPage() {
  return (
    <div className="legal-wrap">
      <nav className="legal-nav">
        <Link to="/" className="lp-logo" style={{ fontSize: 17 }}>FarmaTalent</Link>
      </nav>

      <div className="legal-body">
        <div className="legal-header">
          <span className="lp-eyebrow">DOCUMENTO LEGAL</span>
          <h1 className="legal-h1">Política de Cookies</h1>
          <p className="legal-meta">
            Última actualización: junio de 2026 · Versión 1.0 ·{' '}
            <Link to="/privacidad">Ver Política de Privacidad →</Link>
          </p>
        </div>

        <div className="legal-content">

          <section className="legal-section">
            <h2>1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
              dispositivo cuando los visitas. Permiten que la Plataforma recuerde tus
              preferencias, mantenga tu sesión activa y mejore tu experiencia de uso.
            </p>
            <p>
              FarmaTalent utiliza cookies propias (gestionadas directamente por nosotros) y
              puede utilizar cookies de terceros (gestionadas por proveedores externos) con
              finalidades analíticas.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Tipos de cookies que usamos</h2>
            <div className="legal-cookie-grid">
              <div className="legal-cookie-card legal-cookie-required">
                <div className="legal-cookie-head">
                  <span className="legal-cookie-badge legal-badge-green">Siempre activas</span>
                  <h3>🔒 Cookies esenciales</h3>
                </div>
                <p>
                  Imprescindibles para el funcionamiento de la Plataforma. Sin ellas, servicios
                  básicos como el inicio de sesión y la seguridad no estarían disponibles.
                </p>
                <table className="legal-table">
                  <thead>
                    <tr><th>Cookie</th><th>Finalidad</th><th>Duración</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>ft_session</code></td>
                      <td>Mantiene tu sesión autenticada (token Sanctum)</td>
                      <td>Sesión</td>
                    </tr>
                    <tr>
                      <td><code>XSRF-TOKEN</code></td>
                      <td>Protección contra ataques CSRF</td>
                      <td>Sesión</td>
                    </tr>
                    <tr>
                      <td><code>ft_cookie_consent</code></td>
                      <td>Almacena tus preferencias de cookies</td>
                      <td>365 días</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="legal-cookie-card">
                <div className="legal-cookie-head">
                  <span className="legal-cookie-badge legal-badge-blue">Opcionales</span>
                  <h3>📊 Cookies analíticas</h3>
                </div>
                <p>
                  Nos ayudan a entender cómo los usuarios interactúan con la Plataforma para
                  mejorar su funcionamiento. Los datos se recopilan de forma agregada y anónima.
                </p>
                <table className="legal-table">
                  <thead>
                    <tr><th>Cookie</th><th>Finalidad</th><th>Duración</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>_ft_analytics</code></td>
                      <td>Estadísticas de uso de la Plataforma (datos anonimizados)</td>
                      <td>90 días</td>
                    </tr>
                    <tr>
                      <td><code>_ft_perf</code></td>
                      <td>Métricas de rendimiento y tiempo de carga</td>
                      <td>30 días</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="legal-cookie-card">
                <div className="legal-cookie-head">
                  <span className="legal-cookie-badge legal-badge-gray">No utilizadas actualmente</span>
                  <h3>🎯 Cookies de marketing</h3>
                </div>
                <p>
                  FarmaTalent <strong>no utiliza actualmente</strong> cookies de marketing ni
                  de rastreo publicitario. En caso de incorporarlas en el futuro, serán de
                  aceptación opcional y te notificaremos con antelación.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. Gestión de preferencias</h2>
            <p>
              Puedes gestionar tus preferencias de cookies en cualquier momento:
            </p>
            <ul>
              <li>
                <strong>Desde el banner de cookies:</strong> al acceder por primera vez a la
                Plataforma, se muestra un banner que te permite aceptar todas las cookies,
                aceptar solo las esenciales o configurar tus preferencias.
              </li>
              <li>
                <strong>Desde la configuración de tu navegador:</strong> puedes bloquear o
                eliminar cookies directamente desde las preferencias de tu navegador. Ten en
                cuenta que bloquear las cookies esenciales puede afectar el funcionamiento
                de la Plataforma.
              </li>
              <li>
                <strong>Eliminando los datos almacenados:</strong> elimina la clave
                <code> ft_cookie_consent</code> de tu <code>localStorage</code> para
                restablecer tus preferencias.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Cookies de terceros</h2>
            <p>
              Actualmente FarmaTalent no integra servicios de terceros que establezcan cookies
              propias en tu dispositivo. En caso de hacerlo (por ejemplo, al integrar mapas,
              análisis externos o servicios de pago), esta política será actualizada indicando
              el proveedor y su política de privacidad correspondiente.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Base legal</h2>
            <p>
              El uso de cookies esenciales se fundamenta en el <strong>interés legítimo</strong>{' '}
              de FarmaTalent para garantizar el funcionamiento y la seguridad de la Plataforma.
              El uso de cookies analíticas se basa en tu <strong>consentimiento expreso</strong>,
              que puedes revocar en cualquier momento.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Actualizaciones de esta política</h2>
            <p>
              Esta Política de Cookies puede ser actualizada para reflejar cambios en los
              servicios utilizados o en la normativa aplicable. La fecha de "última actualización"
              indica cuándo fue revisada por última vez.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contacto</h2>
            <p>
              Para consultas sobre el uso de cookies, escribe a:{' '}
              <a href="mailto:privacidad@farmatalent.pe">privacidad@farmatalent.pe</a>
            </p>
          </section>

        </div>

        <div className="legal-footer-row">
          <Link to="/terminos" className="legal-related-link">
            📋 Términos de Uso →
          </Link>
          <Link to="/privacidad" className="legal-related-link">
            🔒 Política de Privacidad →
          </Link>
          <Link to="/" className="legal-related-link">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

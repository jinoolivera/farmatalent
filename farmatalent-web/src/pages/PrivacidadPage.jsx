import { Link } from 'react-router-dom'

export function PrivacidadPage() {
  return (
    <div className="legal-wrap">
      <nav className="legal-nav">
        <Link to="/" className="lp-logo" style={{ fontSize: 17 }}>FarmaTalent</Link>
      </nav>

      <div className="legal-body">
        <div className="legal-header">
          <span className="lp-eyebrow">DOCUMENTO LEGAL</span>
          <h1 className="legal-h1">Política de Privacidad y Protección de Datos Personales</h1>
          <p className="legal-meta">
            Última actualización: junio de 2026 · Versión 1.0 ·{' '}
            <Link to="/terminos">Ver Términos de Uso →</Link>
          </p>
        </div>

        <div className="legal-highlight">
          <strong>Ley aplicable:</strong> Esta Política cumple con la{' '}
          <strong>Ley N° 29733</strong> — Ley de Protección de Datos Personales del Perú —
          y su Reglamento aprobado mediante <strong>D.S. 003-2013-JUS</strong>.
          Tus datos son tratados con respeto, transparencia y con los más altos estándares
          de seguridad.
        </div>

        <div className="legal-content">

          <section className="legal-section">
            <h2>1. Responsable del tratamiento</h2>
            <p>
              El responsable del banco de datos personales es{' '}
              <strong>FarmaTalent S.A.C.</strong>, con domicilio en Lima, Perú (en adelante,
              <strong> "FarmaTalent"</strong>).
            </p>
            <table className="legal-table">
              <tbody>
                <tr><td>Responsable</td><td>FarmaTalent S.A.C.</td></tr>
                <tr><td>País</td><td>Perú</td></tr>
                <tr><td>Correo de privacidad</td><td><a href="mailto:privacidad@farmatalent.pe">privacidad@farmatalent.pe</a></td></tr>
                <tr><td>Base legal</td><td>Ley N° 29733 · D.S. 003-2013-JUS</td></tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>2. Datos personales que recopilamos</h2>
            <h3>2.1 Datos que tú proporcionas</h3>
            <ul>
              <li><strong>Datos de identidad:</strong> nombre completo, número de DNI (opcional), número de colegiatura.</li>
              <li><strong>Datos de contacto:</strong> dirección de correo electrónico, número de teléfono.</li>
              <li><strong>Datos profesionales:</strong> tipo de profesional, especialidades, experiencia, zonas de trabajo.</li>
              <li><strong>Datos de empresa</strong> (boticas/clínicas): nombre del establecimiento, RUC, dirección, teléfono de contacto.</li>
              <li><strong>Credenciales de acceso:</strong> contraseña (almacenada en formato hasheado bcrypt, nunca en texto plano).</li>
            </ul>
            <h3>2.2 Datos generados por el uso de la plataforma</h3>
            <ul>
              <li>Historial de turnos publicados, aplicados y completados.</li>
              <li>Calificaciones y reseñas del sistema bilateral de reputación.</li>
              <li>Mensajes intercambiados a través del chat interno.</li>
              <li>Disponibilidad horaria registrada.</li>
              <li>Score de reputación y nivel (Bronce / Plata / Oro / Elite).</li>
            </ul>
            <h3>2.3 Datos técnicos (cookies y navegación)</h3>
            <ul>
              <li>Dirección IP, tipo de navegador, sistema operativo.</li>
              <li>Páginas visitadas y tiempo de sesión.</li>
              <li>Token de sesión Sanctum (almacenado de forma segura).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Finalidades del tratamiento</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Finalidad</th>
                  <th>Base legal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Crear y gestionar tu cuenta</td>
                  <td>Ejecución del contrato (Art. 13 Ley 29733)</td>
                </tr>
                <tr>
                  <td>Mostrar tu perfil a establecimientos para matching</td>
                  <td>Consentimiento del titular</td>
                </tr>
                <tr>
                  <td>Enviar notificaciones de turnos y matches</td>
                  <td>Ejecución del contrato</td>
                </tr>
                <tr>
                  <td>Calcular y publicar el score de reputación</td>
                  <td>Consentimiento del titular</td>
                </tr>
                <tr>
                  <td>Prevenir fraude y uso abusivo de la Plataforma</td>
                  <td>Interés legítimo</td>
                </tr>
                <tr>
                  <td>Cumplir obligaciones legales y fiscales</td>
                  <td>Obligación legal</td>
                </tr>
                <tr>
                  <td>Mejora del servicio y análisis estadístico</td>
                  <td>Interés legítimo (datos anonimizados)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>4. Anonimato en el sistema de matching</h2>
            <p>
              Por diseño, FarmaTalent protege tu identidad durante el proceso de matching:
            </p>
            <ul>
              <li>Los establecimientos <strong>no ven tu nombre ni DNI</strong> hasta que confirman un match.</li>
              <li>Los profesionales <strong>no ven datos de contacto</strong> del establecimiento hasta el match confirmado.</li>
              <li>Las calificaciones post-turno son <strong>anónimas</strong> hasta que ambas partes califican.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Destinatarios de los datos</h2>
            <p>Tus datos personales pueden ser compartidos con:</p>
            <ul>
              <li>
                <strong>Otras partes de la Plataforma</strong> (establecimientos o profesionales),
                únicamente después de un match confirmado y en la medida necesaria para la
                coordinación del turno.
              </li>
              <li>
                <strong>Proveedores de servicios técnicos</strong> (hosting, correo electrónico,
                analítica) bajo acuerdos de confidencialidad y con garantías de seguridad.
              </li>
              <li>
                <strong>Autoridades competentes</strong> cuando exista obligación legal o
                requerimiento judicial.
              </li>
            </ul>
            <p>
              FarmaTalent <strong>no vende, alquila ni cede</strong> datos personales a terceros
              con fines comerciales.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Tus derechos (Derechos ARCO)</h2>
            <p>
              En virtud de la Ley N° 29733, tienes los siguientes derechos respecto a tus
              datos personales:
            </p>
            <div className="legal-arco-grid">
              <div className="legal-arco-card">
                <div className="legal-arco-ico">A</div>
                <div>
                  <strong>Acceso</strong>
                  <p>Conocer qué datos tuyos tenemos almacenados.</p>
                </div>
              </div>
              <div className="legal-arco-card">
                <div className="legal-arco-ico">R</div>
                <div>
                  <strong>Rectificación</strong>
                  <p>Corregir datos inexactos o incompletos.</p>
                </div>
              </div>
              <div className="legal-arco-card">
                <div className="legal-arco-ico">C</div>
                <div>
                  <strong>Cancelación</strong>
                  <p>Solicitar la eliminación de tus datos cuando ya no sean necesarios.</p>
                </div>
              </div>
              <div className="legal-arco-card">
                <div className="legal-arco-ico">O</div>
                <div>
                  <strong>Oposición</strong>
                  <p>Oponerte al tratamiento de tus datos en determinadas circunstancias.</p>
                </div>
              </div>
            </div>
            <p>
              Para ejercer cualquiera de estos derechos, escribe a{' '}
              <a href="mailto:privacidad@farmatalent.pe">privacidad@farmatalent.pe</a> indicando
              tu nombre, número de DNI (o documento de identidad) y el derecho que deseas
              ejercer. Responderemos en un plazo máximo de <strong>20 días hábiles</strong>{' '}
              conforme al Art. 24 de la Ley N° 29733.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Seguridad de los datos</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger tus datos:</p>
            <ul>
              <li>Contraseñas almacenadas con <strong>bcrypt</strong> (nunca en texto plano).</li>
              <li>Comunicaciones cifradas mediante <strong>HTTPS / TLS 1.3</strong>.</li>
              <li>Autenticación mediante tokens Sanctum con expiración automática.</li>
              <li>Acceso a la base de datos restringido por roles y con registro de auditoría.</li>
              <li>Cabeceras HTTP de seguridad: <code>X-Frame-Options</code>, <code>Content-Security-Policy</code>, <code>X-Content-Type-Options</code>.</li>
              <li>Protección contra inyección SQL mediante ORM (Eloquent) con binding de parámetros.</li>
              <li>Protección contra inyección de código (XSS) mediante React DOM y validación de entradas.</li>
              <li>Rate limiting en endpoints de autenticación para prevenir ataques de fuerza bruta.</li>
            </ul>
            <p>
              En caso de brecha de seguridad que afecte tus datos personales, serás notificado
              conforme a lo establecido por la{' '}
              <strong>Autoridad Nacional de Protección de Datos Personales (ANPDP)</strong>.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Conservación de los datos</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Tipo de dato</th>
                  <th>Plazo de conservación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Datos de cuenta activa</td>
                  <td>Durante la vigencia de la cuenta</td>
                </tr>
                <tr>
                  <td>Historial de turnos</td>
                  <td>5 años desde la fecha del turno</td>
                </tr>
                <tr>
                  <td>Calificaciones y reseñas</td>
                  <td>5 años o hasta eliminación de cuenta</td>
                </tr>
                <tr>
                  <td>Datos fiscales (RUC, facturas)</td>
                  <td>7 años (obligación tributaria)</td>
                </tr>
                <tr>
                  <td>Logs de seguridad</td>
                  <td>2 años</td>
                </tr>
                <tr>
                  <td>Datos tras solicitud de cancelación</td>
                  <td>30 días (período de gracia), luego anonimización</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>9. Cookies</h2>
            <p>
              FarmaTalent utiliza cookies propias y de terceros para mejorar tu experiencia.
              Consulta nuestra{' '}
              <Link to="/cookies">Política de Cookies</Link> para más detalles y para gestionar
              tus preferencias.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Menores de edad</h2>
            <p>
              La Plataforma está dirigida a personas mayores de 18 años. No recopilamos
              conscientemente datos personales de menores. Si tienes conocimiento de que un
              menor ha proporcionado datos en la Plataforma, contáctanos en{' '}
              <a href="mailto:privacidad@farmatalent.pe">privacidad@farmatalent.pe</a> para
              proceder a su eliminación.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Transferencias internacionales de datos</h2>
            <p>
              Los servidores de FarmaTalent están ubicados en la región de Latinoamérica.
              En caso de utilizar servicios de terceros que impliquen la transferencia de datos
              a otros países, nos aseguramos de que dichos países cuenten con niveles de
              protección adecuados o de obtener tu consentimiento expreso para la transferencia.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Reclamaciones ante la ANPDP</h2>
            <p>
              Si consideras que el tratamiento de tus datos no se ajusta a la normativa vigente,
              puedes presentar una reclamación ante la{' '}
              <strong>Autoridad Nacional de Protección de Datos Personales (ANPDP)</strong>,
              adscrita al Ministerio de Justicia y Derechos Humanos del Perú.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Cambios en esta política</h2>
            <p>
              FarmaTalent puede actualizar esta Política periódicamente. Los cambios
              relevantes serán notificados por correo electrónico o mediante aviso visible
              en la Plataforma. La fecha de "última actualización" al inicio de este documento
              indica cuándo fue revisada por última vez.
            </p>
          </section>

        </div>

        <div className="legal-footer-row">
          <Link to="/terminos" className="legal-related-link">
            📋 Términos de Uso →
          </Link>
          <Link to="/cookies" className="legal-related-link">
            🍪 Política de Cookies →
          </Link>
          <Link to="/" className="legal-related-link">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

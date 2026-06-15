import { Link } from 'react-router-dom'

export function TerminosPage() {
  return (
    <div className="legal-wrap">
      <nav className="legal-nav">
        <Link to="/" className="lp-logo" style={{ fontSize: 17 }}>FarmaTalent</Link>
      </nav>

      <div className="legal-body">
        <div className="legal-header">
          <span className="lp-eyebrow">DOCUMENTO LEGAL</span>
          <h1 className="legal-h1">Términos y Condiciones de Uso</h1>
          <p className="legal-meta">
            Última actualización: junio de 2026 · Versión 1.0 ·{' '}
            <Link to="/privacidad">Ver Política de Privacidad →</Link>
          </p>
        </div>

        <div className="legal-content">

          <section className="legal-section">
            <h2>1. Identificación del titular</h2>
            <p>
              FarmaTalent S.A.C. (en adelante, <strong>"FarmaTalent"</strong>), con domicilio en
              Lima, Perú, es titular y operadora de la plataforma accesible a través de
              <strong> farmatalent.pe</strong> y sus aplicaciones asociadas (en adelante,
              la <strong>"Plataforma"</strong>).
            </p>
            <p>
              Puedes contactarnos en:{' '}
              <a href="mailto:legal@farmatalent.pe">legal@farmatalent.pe</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Objeto</h2>
            <p>
              FarmaTalent es una plataforma de intermediación laboral temporal especializada en el
              sector farmacéutico peruano. Permite a profesionales del área de farmacia (químicos
              farmacéuticos, técnicos, practicantes y personal de apoyo) conectarse con farmacias,
              boticas, clínicas y establecimientos de salud que requieren cobertura de turnos.
            </p>
            <p>
              FarmaTalent <strong>no es parte</strong> de la relación laboral entre profesionales
              y establecimientos. Actúa como intermediario tecnológico y no garantiza la
              contratación efectiva ni la disponibilidad permanente de vacantes.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Aceptación de los términos</h2>
            <p>
              El acceso y uso de la Plataforma implica la aceptación plena y sin reservas de los
              presentes Términos y Condiciones, así como de la{' '}
              <Link to="/privacidad">Política de Privacidad</Link> y la{' '}
              <Link to="/cookies">Política de Cookies</Link>. Si no estás de acuerdo con alguno
              de estos términos, debes abstenerte de utilizar la Plataforma.
            </p>
            <p>
              Para crear una cuenta debes tener como mínimo 18 años de edad y contar con la
              habilitación legal para ejercer la actividad que declaras.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Registro y cuentas de usuario</h2>
            <h3>4.1 Datos verídicos</h3>
            <p>
              Al registrarte te comprometes a proporcionar información veraz, completa y
              actualizada. FarmaTalent se reserva el derecho de verificar la información
              proporcionada y de suspender o cancelar cuentas que contengan datos falsos o
              engañosos.
            </p>
            <h3>4.2 Responsabilidad de la cuenta</h3>
            <p>
              Eres responsable de mantener la confidencialidad de tus credenciales de acceso
              (correo y contraseña). Cualquier actividad realizada desde tu cuenta es de tu
              exclusiva responsabilidad. Notifica inmediatamente a{' '}
              <a href="mailto:seguridad@farmatalent.pe">seguridad@farmatalent.pe</a> ante
              cualquier uso no autorizado.
            </p>
            <h3>4.3 Una cuenta por persona</h3>
            <p>
              Cada persona natural o establecimiento puede registrar únicamente una cuenta.
              La creación de cuentas múltiples, fraudulentas o automatizadas (bots) está
              expresamente prohibida y dará lugar a la cancelación permanente y a las acciones
              legales que correspondan.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Usos permitidos y prohibidos</h2>
            <h3>5.1 Usos permitidos</h3>
            <ul>
              <li>Publicar y postular a turnos de trabajo temporal en el sector farmacéutico.</li>
              <li>Construir y mantener un perfil profesional verificado.</li>
              <li>Comunicarse con otras partes a través de los canales habilitados en la Plataforma.</li>
              <li>Calificar turnos completados mediante el sistema bilateral de reputación.</li>
            </ul>
            <h3>5.2 Usos prohibidos</h3>
            <ul>
              <li>Realizar actividades ilegales o contrarias a la normativa farmacéutica peruana (DIGEMID).</li>
              <li>Publicar información falsa, engañosa o que induzca a error sobre qualificaciones, habilitaciones o disponibilidad.</li>
              <li>Llevar a cabo scraping, crawling o cualquier extracción masiva de datos sin autorización escrita.</li>
              <li>Usar robots, scripts o herramientas automatizadas para crear cuentas, publicar turnos o interactuar con la Plataforma.</li>
              <li>Intentar vulnerar los sistemas de seguridad, autenticación o integridad de la Plataforma.</li>
              <li>Contactar a otras partes fuera de la Plataforma para eludir las condiciones del servicio.</li>
              <li>Reproducir, redistribuir o explotar comercialmente los contenidos de la Plataforma sin autorización.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Habilitación profesional y cumplimiento DIGEMID</h2>
            <p>
              Los profesionales registrados en FarmaTalent son responsables de mantener vigentes
              sus habilitaciones profesionales (colegiatura del Colegio Químico Farmacéutico del
              Perú, títulos técnicos, etc.) conforme a la normativa del Ministerio de Salud y la
              Dirección General de Medicamentos, Insumos y Drogas (<strong>DIGEMID</strong>).
            </p>
            <p>
              Los establecimientos son responsables de verificar la idoneidad y habilitación de
              los profesionales antes de iniciar cada turno y de cumplir con las disposiciones
              del Decreto Legislativo N° 1015 y demás normas farmacéuticas aplicables.
            </p>
            <p>
              FarmaTalent facilita información de perfil pero no sustituye la verificación
              directa que corresponde al empleador o contratante.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Sistema de reputación</h2>
            <p>
              FarmaTalent opera un sistema bilateral de calificación post-turno. Las
              calificaciones son anónimas hasta que ambas partes evalúan. Te comprometes a:
            </p>
            <ul>
              <li>Emitir calificaciones honestas y basadas en la experiencia real del turno.</li>
              <li>No manipular el sistema mediante acuerdos para intercambiar calificaciones positivas.</li>
              <li>No emitir calificaciones negativas con fines de perjuicio injustificado.</li>
            </ul>
            <p>
              FarmaTalent se reserva el derecho de moderar o retirar calificaciones que
              incumplan estas condiciones.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Pagos y facturación</h2>
            <p>
              Los acuerdos económicos entre profesionales y establecimientos se realizan
              directamente entre las partes. FarmaTalent no gestiona pagos en nombre de ninguna
              de las partes salvo que se indique expresamente en el contrato de servicio suscrito
              con el establecimiento.
            </p>
            <p>
              Los planes de suscripción para establecimientos se rigen por los términos
              específicos acordados al momento de la contratación.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Propiedad intelectual</h2>
            <p>
              Todos los derechos sobre la Plataforma, su diseño, código fuente, marca, logotipos,
              algoritmos de matching y contenidos elaborados por FarmaTalent son propiedad
              exclusiva de FarmaTalent S.A.C. Queda prohibida su reproducción, modificación o
              distribución sin autorización expresa y por escrito.
            </p>
            <p>
              Los usuarios conservan la propiedad de los contenidos que publican (fotos de
              perfil, descripciones) y otorgan a FarmaTalent una licencia no exclusiva,
              royalty-free y mundial para mostrar dichos contenidos dentro de la Plataforma.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Limitación de responsabilidad</h2>
            <p>
              FarmaTalent no será responsable por: (i) la conducta de usuarios en la Plataforma
              o durante la ejecución de turnos; (ii) la exactitud de la información proporcionada
              por los usuarios; (iii) la idoneidad, habilitación o comportamiento profesional de
              ninguna parte; (iv) daños indirectos, lucro cesante o pérdida de datos derivados
              del uso de la Plataforma.
            </p>
            <p>
              En ningún caso la responsabilidad total de FarmaTalent frente a un usuario
              excederá el monto pagado por dicho usuario en los 12 meses anteriores al hecho
              generador del daño, o S/ 200.00 (doscientos soles) si no hubo pago.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Suspensión y cancelación de cuentas</h2>
            <p>
              FarmaTalent puede suspender o cancelar una cuenta en forma temporal o permanente
              cuando detecte: (i) incumplimiento de estos Términos; (ii) conducta abusiva o
              fraudulenta; (iii) uso que ponga en riesgo la seguridad de la Plataforma o de
              otros usuarios; (iv) requerimiento de autoridad competente.
            </p>
            <p>
              El usuario puede solicitar la cancelación de su cuenta en cualquier momento
              enviando un correo a <a href="mailto:soporte@farmatalent.pe">soporte@farmatalent.pe</a>.
              La cancelación no implica la eliminación inmediata de todos los datos si existe una
              obligación legal de conservarlos.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Modificaciones a los términos</h2>
            <p>
              FarmaTalent puede modificar estos Términos en cualquier momento. Los cambios
              serán notificados con al menos 15 días de anticipación mediante correo electrónico
              y/o aviso en la Plataforma. El uso continuado de la Plataforma después de la
              fecha de entrada en vigor de los cambios implica su aceptación.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Ley aplicable y resolución de conflictos</h2>
            <p>
              Los presentes Términos se rigen por las leyes de la República del Perú. Cualquier
              controversia derivada de estos Términos será sometida a la competencia de los
              Juzgados y Tribunales de Lima, Perú, renunciando las partes a cualquier otro fuero
              que pudiera corresponderles.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Contacto</h2>
            <p>
              Para consultas legales o reclamos escribe a:{' '}
              <a href="mailto:legal@farmatalent.pe">legal@farmatalent.pe</a>
              <br />
              Para soporte técnico:{' '}
              <a href="mailto:soporte@farmatalent.pe">soporte@farmatalent.pe</a>
              <br />
              Para solicitudes de datos personales:{' '}
              <a href="mailto:privacidad@farmatalent.pe">privacidad@farmatalent.pe</a>
            </p>
          </section>

        </div>

        <div className="legal-footer-row">
          <Link to="/privacidad" className="legal-related-link">
            📄 Política de Privacidad →
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

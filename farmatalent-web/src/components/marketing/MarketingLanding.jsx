import { Link, useNavigate } from 'react-router-dom'
import { audienceCards, howSteps, liveCities, tickerItems } from '../../data/marketingData'

function AudienceIcon({ type }) {
  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-7H9v7H5a1 1 0 0 1-1-1z" />
      </svg>
    )
  }
  if (type === 'medical') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function MarketingNav() {
  return (
    <nav className="mk-nav">
      <div className="mk-wrap mk-nav-in">
        <img alt="FarmaTalent" className="mk-logo" src="/FarmaTalent%20Design%20System/assets/logo.svg" />
        <div className="mk-mode">
          <button type="button">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
            </span>
            Buscar talento
          </button>
          <button className="active" type="button">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            Encontrar turnos
          </button>
        </div>
        <div className="mk-links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#market-live">Marketplace en vivo</a>
          <Link to="/login">Iniciar sesion</Link>
          <Link className="mk-btn mk-btn-brand" to="/registro">Crear cuenta</Link>
          <span className="mk-avatar">MR</span>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="mk-hero">
      <div className="mk-wrap">
        <span className="mk-pill">1,284 turnos activos en Peru · ahora mismo</span>
        <h1>El <em>talento farmaceutico</em><br />del Peru, en un toque.</h1>
        <p>Marketplace en tiempo real para farmacias, boticas y profesionales de salud.</p>
        <div className="mk-search">
          <div className="mk-search-cell"><span>Distrito o ciudad</span><b>Miraflores, Lima</b></div>
          <div className="mk-search-cell"><span>Profesional</span><b>Quimico farmaceutico</b></div>
          <div className="mk-search-cell"><span>Fecha</span><b>Sab 18 oct</b></div>
          <div className="mk-search-cell"><span>Horario</span><b>Nocturno · 22:00-06:00</b></div>
          <button className="mk-btn mk-btn-brand" onClick={() => navigate('/app/turnos')} type="button">Buscar</button>
        </div>
        <div className="mk-chips">
          {[
            '🌙 Nocturnos',
            '🗓️ Este fin de semana',
            '💵 Mejor tarifa',
            '📍 Cerca de mi',
            '⚡ Urgente',
            '⏱ Guardias 24h',
          ].map((chip) => (
            <button key={chip} type="button">{chip}</button>
          ))}
        </div>
        <div className="mk-trust">
          <div className="mk-avatars">
            <span>JC</span><span>RM</span><span>LS</span><span>+</span>
          </div>
          <p><b>Red creciente de profesionales</b> activos en Perú</p>
        </div>
      </div>
    </section>
  )
}

function LiveTicker() {
  const parseTicker = (item) => {
    const parts = item.split('·').map((p) => p.trim())
    const time = parts.shift() ?? ''
    const rest = parts.join(' · ')
    return { time, rest }
  }

  return (
    <section className="mk-ticker">
      <div className="mk-track">
        {[...tickerItems, ...tickerItems].map((item, index) => {
          const parsed = parseTicker(item)
          return (
            <span className="mk-track-item" key={`${item}-${index}`}>
              <span className="mk-track-dot" />
              <b>{parsed.time}</b>
              <span>· {parsed.rest}</span>
            </span>
          )
        })}
      </div>
    </section>
  )
}

function LiveCities() {
  return (
    <section className="mk-live" id="market-live">
      <div className="mk-wrap">
        <header className="mk-live-head">
          <div>
            <h2>Lo que esta pasando <em>ahora mismo</em> en Peru.</h2>
            <p>Turnos abiertos en tiempo real por distrito y ciudad. Toca una zona para ver el mapa con resultados completos.</p>
          </div>
          <div className="mk-live-total">
            <strong>1,284</strong>
            <span>turnos activos hoy</span>
          </div>
        </header>
        <div className="mk-cities">
          {liveCities.map((city) => (
            <article className={`mk-city ${city.featured ? 'featured' : ''} ${city.outlined ? 'outlined' : ''}`} key={city.name}>
              <span className="mk-live-badge">{city.activeLabel ?? 'En vivo'}</span>
              <h3>{city.name}</h3>
              <p>{city.area}</p>
              <div className="mk-city-metrics">
                <div className="mk-city-metric">
                  <b>{city.turns}</b>
                  <small>TURNOS</small>
                </div>
                <div className="mk-city-metric">
                  <b>{city.match}</b>
                  <small>{city.rightLabel ?? 'MATCH MEDIO'}</small>
                </div>
              </div>
              {city.shifts?.length > 0 && (
                <div className="mk-shifts">
                  {city.shifts.map((shift) => (
                    <div className={`mk-shift-item ${shift.starred ? 'stable' : ''}`} key={`${city.name}-${shift.title}`}>
                      <div className={`mk-shift-avatar ${shift.starred ? 'stable' : ''}`}>{shift.initials}</div>
                      <div className="mk-shift-text">
                        <b>{shift.title}</b>
                        <span>{shift.subtitle}</span>
                      </div>
                      <span className={`mk-shift-end ${shift.starred ? 'star' : ''}`}>{shift.starred ? '★' : '→'}</span>
                    </div>
                  ))}
                </div>
              )}
              <a href="#0">{city.cta ?? 'Ver todos'} →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Audiences() {
  return (
    <section className="mk-audience">
      <div className="mk-wrap">
        <header>
          <span className="mk-eyebrow">QUIEN USA FARMATALENT</span>
          <h2>Una red, <em>tres formas</em> de operar.</h2>
          <p>No es una bolsa de trabajo. Es continuidad operacional.</p>
        </header>
        <div className="mk-audience-grid">
          {audienceCards.map((card) => (
            <article key={card.title}>
              <span className={`mk-aud-icon ${card.icon}`}>
                <AudienceIcon type={card.icon} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="mk-metrics">
                {card.metrics.map((metric) => {
                  const [value, ...rest] = metric.split(' ')
                  return (
                    <div key={metric}>
                      <strong>{value}</strong>
                      <span>{rest.join(' ')}</span>
                    </div>
                  )
                })}
              </div>
              <a href="#0">{card.cta} →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="mk-how" id="como-funciona">
      <div className="mk-wrap">
        <span className="mk-eyebrow">COMO FUNCIONA</span>
        <h2>De vacante critica a turno cubierto, <em>en tres pasos.</em></h2>
        <div className="mk-steps">
          {howSteps.map((step) => (
            <article key={step.number}>
              <strong>{step.number}.</strong>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModesNarrative() {
  return (
    <section className="mk-modes">
      <div className="mk-wrap">
        <header>
          <span className="mk-eyebrow">DOS MODOS, UNA RED</span>
          <h2>No solo cubrimos turnos. <em>Construimos continuidad farmaceutica.</em></h2>
          <p>FarmaTalent opera en dos velocidades: cobertura inmediata y continuidad profesional.</p>
        </header>
        <div className="mk-modes-grid">
          <article className="mk-mode-card">
            <div className="mk-mode-img">
              <img alt="Cobertura inmediata" src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&q=80&auto=format&fit=crop" />
              <div className="mk-mode-overlay" />
              <span className="mk-mode-tag red">● EN VIVO · MIRAFLORES</span>
              <div className="mk-mode-mini">
                <span className="mk-mode-mini-ava">QS</span>
                <div>
                  <b>Turno nocturno cubierto</b>
                  <small>Quimica Suiza · 38 min de respuesta</small>
                </div>
              </div>
            </div>
            <div className="mk-mode-body">
              <strong>01</strong>
              <h3>Cobertura inmediata</h3>
              <p>Urgencias, reemplazos, nocturnos y fines de semana. Matching inteligente en minutos con perfiles compatibles.</p>
              <div className="mk-mode-metrics">
                <span><b>38 min</b> respuesta media</span>
                <span><b>12,400+</b> pros disponibles</span>
                <span><b>87%</b> cubre primer match</span>
              </div>
              <a href="#0">Explorar turnos abiertos →</a>
            </div>
          </article>
          <article className="mk-mode-card">
            <div className="mk-mode-img">
              <img alt="Continuidad profesional" src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80&auto=format&fit=crop" />
              <div className="mk-mode-overlay" />
              <span className="mk-mode-tag amber">★ RED ESTABLE</span>
              <div className="mk-mode-mini">
                <span className="mk-mode-mini-ava amber">MR</span>
                <div>
                  <b>Maria R · 48 turnos con QS</b>
                  <small>Profesional recurrente · Nivel Oro</small>
                </div>
              </div>
            </div>
            <div className="mk-mode-body">
              <strong>02</strong>
              <h3>Continuidad profesional</h3>
              <p>Relaciones recurrentes que se vuelven equipo. Estabilidad operativa sin contratos, con reputacion acumulativa.</p>
              <div className="mk-mode-metrics">
                <span><b>61%</b> turnos a recurrentes</span>
                <span><b>22</b> pros en red estable media</span>
                <span><b>4 niveles</b> Bronce a Elite</span>
              </div>
              <a href="#0">Ver historias de continuidad →</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

function GrowthNarrative() {
  return (
    <section className="mk-growth">
      <div className="mk-wrap mk-growth-grid">
        <div className="mk-growth-media">
          <img alt="Crecimiento profesional" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=crop" />
          <div className="mk-growth-badge">
            <div className="mk-growth-score">94<span>/100</span></div>
            <div className="mk-growth-score-label">SCORE GLOBAL</div>
            <div className="mk-growth-tier">★ Nivel Oro · Top 12%</div>
          </div>
        </div>
        <div className="mk-growth-copy">
          <span className="mk-eyebrow">PARA PROFESIONALES</span>
          <h2>No es un turnito.<br /><em>Es tu carrera farmaceutica.</em></h2>
          <p>Cada turno cumplido suma a tu reputacion operacional. Cada resena construye tu nivel. Cada botica recurrente abre la siguiente puerta. FarmaTalent te acompana de Bronce a Elite, paso a paso, merito a merito.</p>
          <div className="mk-tier-cards">
            <article className="mk-tier-card done">
              <span className="dot">✓</span>
              <strong>Bronce</strong>
              <small>Primeros turnos</small>
            </article>
            <article className="mk-tier-card done">
              <span className="dot">✓</span>
              <strong>Plata</strong>
              <small>Reputacion construida</small>
            </article>
            <article className="mk-tier-card active">
              <span className="dot">●</span>
              <strong>Oro</strong>
              <small>Top 12% Peru</small>
            </article>
            <article className="mk-tier-card elite">
              <span className="dot">★</span>
              <strong>Elite</strong>
              <small>Acceso premium</small>
            </article>
          </div>
          <Link className="mk-btn mk-btn-brand" to="/registro">Crear mi perfil profesional</Link>
        </div>
      </div>
    </section>
  )
}

function CtaAndFooter() {
  return (
    <>
      <section className="mk-cta">
        <div className="mk-wrap">
          <div className="mk-cta-box">
            <span className="mk-eyebrow mk-eyebrow-green">EMPEZA HOY · ES GRATIS</span>
            <h2>Tu proximo turno — <em>o tu proximo profesional</em> — a un toque.</h2>
            <p>Crear cuenta es gratis. Sin permanencia.</p>
            <div>
              <Link className="mk-btn mk-btn-brand" to="/registro">Crear cuenta gratis</Link>
              <button className="mk-btn mk-btn-dark" type="button">Hablar con ventas</button>
            </div>
          </div>
        </div>
      </section>
      <footer className="mk-footer">
        <div className="mk-wrap">
          <div className="mk-footer-grid">
            <div>
              <img alt="FarmaTalent" className="mk-logo" src="/FarmaTalent%20Design%20System/assets/logo.svg" />
              <p>El futuro del talento farmaceutico en el Peru.</p>
            </div>
            <div>
              <h6>Producto</h6>
              <a href="#0">Para profesionales</a>
              <a href="#0">Para boticas</a>
              <a href="#0">Para clinicas</a>
            </div>
            <div>
              <h6>Compania</h6>
              <a href="#0">Sobre nosotros</a>
              <a href="#0">Blog</a>
              <a href="#0">Contacto</a>
            </div>
            <div>
              <h6>Legal</h6>
              <a href="#0">Privacidad</a>
              <a href="#0">Terminos</a>
              <a href="#0">Seguridad</a>
            </div>
          </div>
          <div className="mk-footer-bottom">
            <span>© 2026 FarmaTalent Peru</span>
            <span>Hecho en Lima, Peru</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export function MarketingLanding() {
  return (
    <div className="mk-root">
      <MarketingNav />
      <HeroSection />
      <LiveTicker />
      <LiveCities />
      <Audiences />
      <ModesNarrative />
      <GrowthNarrative />
      <HowItWorks />
      <CtaAndFooter />
    </div>
  )
}

export const liveCities = [
  {
    name: 'Miraflores',
    area: 'Lima · Costa Verde',
    turns: 68,
    match: '94%',
    rightLabel: 'MATCH MEDIO',
    featured: true,
    activeLabel: 'En vivo',
    cta: 'Ver 68 turnos en mapa',
    shifts: [
      { initials: 'QS', title: 'Quimica Suiza · Larco', subtitle: 'Nocturno · Sab 22:00' },
      { initials: 'IF', title: 'Inkafarma · Pardo', subtitle: 'Matutino · Lun 07:00' },
      { initials: 'SF', title: 'SmartFarma Surco', subtitle: '★ Continuidad L-V · equipo estable', starred: true },
      { initials: 'BT', title: 'Boticas BTL · Diagonal', subtitle: '24h · Vie 08:00' },
    ],
  },
  {
    name: 'San Isidro',
    area: 'Lima · Distrito financiero',
    turns: 52,
    match: '92%',
    rightLabel: 'MATCH MEDIO',
    activeLabel: '52 activos',
    shifts: [
      { initials: 'CI', title: 'Clinica Internacional', subtitle: 'Guardia 24h · Vie' },
      { initials: 'IF', title: 'Inkafarma Camino Real', subtitle: '★ Posicion estable · matutino', starred: true },
    ],
  },
  {
    name: 'Santiago de Surco',
    area: 'Lima · Zona residencial',
    turns: 41,
    match: '89%',
    rightLabel: 'MATCH MEDIO',
    activeLabel: '41 activos',
    outlined: true,
    shifts: [
      { initials: 'MF', title: 'Mifarma Caminos del Inca', subtitle: 'Matutino · Sab' },
      { initials: 'BF', title: 'BotiFarma · Monterrico', subtitle: 'Nocturno · Vie' },
    ],
  },
  {
    name: 'San Borja',
    area: 'Lima · Centro residencial',
    turns: 33,
    match: '91%',
    rightLabel: 'MATCH MEDIO',
    activeLabel: '33 activos',
    shifts: [
      { initials: 'IF', title: 'Inkafarma Aviacion', subtitle: 'Vespertino · Hoy' },
      { initials: 'BT', title: 'Boticas BTL Javier Prado', subtitle: 'Nocturno · Sab' },
    ],
  },
  {
    name: 'Arequipa',
    area: 'Cercado · Yanahuara',
    turns: 27,
    match: '88%',
    rightLabel: 'MATCH MEDIO',
    activeLabel: '27 activos',
    shifts: [
      { initials: 'IF', title: 'Inkafarma Plaza Yanahuara', subtitle: 'Tecnico · Sab' },
      { initials: 'QF', title: 'Quimicafarma Cayma', subtitle: '★ Continuidad semanal · turno fijo', starred: true },
    ],
  },
  {
    name: 'Trujillo',
    area: 'Centro · Victor Larco',
    turns: 22,
    match: '86%',
    rightLabel: 'MATCH MEDIO',
    activeLabel: '22 activos',
    shifts: [
      { initials: 'MF', title: 'Mifarma Real Plaza', subtitle: 'Vespertino · Mie' },
      { initials: 'BS', title: 'Boticas y Salud · Espana', subtitle: 'Sab 24h' },
    ],
  },
  {
    name: 'Otros distritos',
    area: 'La Molina · Magdalena · Barranco · Chorrillos · Pueblo Libre',
    turns: 1041,
    match: '14',
    rightLabel: 'DISTRITOS / CIUDADES',
    activeLabel: '+1,041 activos',
    outlined: true,
    shifts: [],
  },
]

export const tickerItems = [
  'Hace 1 min · Quimica Suiza Miraflores publico un turno nocturno · match 96%',
  'Hace 3 min · Andrea Vargas acepto turno en San Isidro',
  'Hace 5 min · Inkafarma Arequipa busca tecnico para sabado',
  'Hace 7 min · Mifarma Trujillo cubrio 3 turnos en 12 min',
]

export const audienceCards = [
  {
    title: 'Profesionales',
    description: 'Quimicos farmaceuticos, tecnicos y auxiliares con perfil verificado y score operacional.',
    metrics: ['Red creciente', '94% satisfaccion', '2.1h a confirmar'],
    cta: 'Soy profesional',
    icon: 'user',
  },
  {
    title: 'Farmacias y boticas',
    description: 'Publica un turno y recibe candidatos compatibles en minutos.',
    metrics: ['2,400 sucursales', '87% cobertura', '38 min tiempo medio'],
    cta: 'Tengo una botica',
    icon: 'home',
  },
  {
    title: 'Clinicas y hospitales',
    description: 'Equipos para turnos especializados y guardias con trazabilidad completa.',
    metrics: ['420 clinicas', '24/7 cobertura', '+18% retencion'],
    cta: 'Soy clinica',
    icon: 'medical',
  },
]

export const howSteps = [
  { number: '01', title: 'Publica o busca', description: 'Configura disponibilidad y necesidad en menos de 90 segundos.' },
  { number: '02', title: 'Matching inteligente', description: 'Filtrado por reputacion, distancia, especialidad y disponibilidad.' },
  { number: '03', title: 'Confirma y opera', description: 'Aplicacion, validacion y coordinacion del turno desde la plataforma.' },
]

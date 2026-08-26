import { useEffect, useRef, useState } from 'react'
import { createShift, updateShift } from '../../api/shiftsApi'
import { getApiErrorMessage } from '../../api/client'

const IconX    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

const TIPOS = [
  { value: 'pharmacist',          label: 'Q.F. responsable' },
  { value: 'pharmacy_technician', label: 'Técnico farmacia' },
  { value: 'assistant',           label: 'Auxiliar / apoyo' },
  { value: 'nurse',               label: 'Enfermero/a' },
  { value: 'intern',              label: 'Practicante' },
  { value: 'doctor',              label: 'Médico' },
]

const HORARIOS = [
  { value: 'matutino',   label: 'Matutino (07:00 – 15:00)',  start: '07:00', end: '15:00' },
  { value: 'vespertino', label: 'Vespertino (14:00 – 22:00)', start: '14:00', end: '22:00' },
  { value: 'nocturno',   label: 'Nocturno (22:00 – 06:00)',  start: '22:00', end: '06:00' },
  { value: 'completo',   label: 'Guardia 24h',               start: '08:00', end: '08:00' },
  { value: 'custom',     label: 'Personalizado…',            start: '',      end: '' },
]

const LIMA_CENTER = [-12.0464, -77.0428]
let leafletCssLoaded = false

function ensureLeafletCss() {
  if (leafletCssLoaded) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
  leafletCssLoaded = true
}

async function geocodeAddress(query) {
  const clean = query.trim()
  if (!clean) return null

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', clean)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'pe')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('No se pudo ubicar la dirección en el mapa.')
  }

  const [first] = await response.json()
  if (!first?.lat || !first?.lon) return null

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  }
}

function detectHorario(starts, ends) {
  for (const h of HORARIOS) {
    if (h.value !== 'custom' && h.start === starts && h.end === ends) return h.value
  }
  return 'custom'
}

/**
 * PublicarTurnoModal — pharmacy shift creation/edit form.
 * Props:
 *   company   — user's company object (for pre-filled address)
 *   shiftData — existing shift object (edit mode) or null (create mode)
 *   onClose   — () => void
 *   onSuccess — (shift) => void
 */
export function PublicarTurnoModal({ company, shiftData = null, onClose, onSuccess }) {
  const backdropRef = useRef(null)
  const mapRef = useRef(null)
  const mapObjRef = useRef(null)
  const markerRef = useRef(null)
  const lastResolvedAddressRef = useRef((shiftData?.location ?? company?.address ?? '').trim())
  const autoLocatedRef = useRef(false)
  const editMode    = shiftData != null
  const [busy, setBusy]   = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [coords, setCoords] = useState(() => {
    const lat = shiftData?.metadata?.lat
    const lng = shiftData?.metadata?.lng
    return lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null
  })

  const initHorario = editMode
    ? detectHorario(shiftData.starts_at ?? '', shiftData.ends_at ?? '')
    : 'nocturno'

  const [form, setForm] = useState({
    professional_type: shiftData?.professional_type ?? 'pharmacist',
    title:             shiftData?.title             ?? '',
    shift_date:        shiftData?.shift_date        ?? '',
    horario:           initHorario,
    starts_at:         shiftData?.starts_at         ?? '22:00',
    ends_at:           shiftData?.ends_at           ?? '06:00',
    location:          shiftData?.location          ?? company?.address ?? '',
    tarifa:            shiftData?.proposed_rate != null ? String(shiftData.proposed_rate) : '',
    coordinacion_chat: shiftData?.coordinacion_chat ?? false,
    recurring:         shiftData?.recurring         ?? false,
    description:       shiftData?.description       ?? '',
  })

  // company_id is required by the backend
  const companyId = shiftData?.company_id ?? company?.id ?? null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function resolveLocationOnMap(address = form.location, { silent = false } = {}) {
    const clean = address.trim()
    if (!clean) return

    if (!silent) setError('')
    setLocating(true)
    try {
      const nextCoords = await geocodeAddress(clean)
      if (!nextCoords) {
        if (!silent) setError('No encontramos esa dirección en el mapa. Ajusta el texto o mueve el pin manualmente.')
        return
      }
      setCoords(nextCoords)
      lastResolvedAddressRef.current = clean
    } catch (err) {
      if (!silent) setError(getApiErrorMessage(err, 'No se pudo ubicar la dirección en el mapa.'))
    } finally {
      setLocating(false)
    }
  }

  function handleHorario(val) {
    const preset = HORARIOS.find((h) => h.value === val)
    set('horario', val)
    if (preset && val !== 'custom') {
      set('starts_at', preset.start)
      set('ends_at',   preset.end)
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    ensureLeafletCss()
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || mapObjRef.current || !mapRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = coords ? [coords.lat, coords.lng] : LIMA_CENTER
      const map = L.map(mapRef.current, {
        center,
        zoom: coords ? 15 : 12,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© OpenStreetMap')
        .addTo(map)

      map.on('click', (event) => {
        setCoords({
          lat: Number(event.latlng.lat.toFixed(6)),
          lng: Number(event.latlng.lng.toFixed(6)),
        })
      })

      mapObjRef.current = map
    })

    return () => {
      cancelled = true
      if (mapObjRef.current) {
        mapObjRef.current.remove()
        mapObjRef.current = null
        markerRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapObjRef.current) return

    import('leaflet').then((L) => {
      const map = mapObjRef.current
      if (!map) return

      if (!coords) {
        markerRef.current?.remove()
        markerRef.current = null
        map.setView(LIMA_CENTER, 12)
        return
      }

      const latLng = [coords.lat, coords.lng]
      if (!markerRef.current) {
        markerRef.current = L.marker(latLng, { draggable: true }).addTo(map)
        markerRef.current.on('dragend', () => {
          const point = markerRef.current.getLatLng()
          setCoords({
            lat: Number(point.lat.toFixed(6)),
            lng: Number(point.lng.toFixed(6)),
          })
        })
      } else {
        markerRef.current.setLatLng(latLng)
      }

      map.setView(latLng, Math.max(map.getZoom(), 15), { animate: true })
    })
  }, [coords])

  useEffect(() => {
    const currentAddress = form.location.trim()
    if (autoLocatedRef.current || coords || !currentAddress) return
    autoLocatedRef.current = true
    resolveLocationOnMap(currentAddress, { silent: true })
  }, [coords, form.location])

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose()
  }

  function buildTitle() {
    const tipo   = TIPOS.find((t) => t.value === form.professional_type)?.label ?? ''
    const turno  = HORARIOS.find((h) => h.value === form.horario)?.label?.split(' ')[0] ?? ''
    return `${tipo} · ${turno}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.shift_date) { setError('Seleccioná una fecha para el turno.'); return }
    if (!companyId)       { setError('No se encontró la empresa. Recargá la página.'); return }
    setBusy(true)
    try {
      const tarifaNum = form.tarifa !== '' ? parseFloat(form.tarifa) : undefined
      const payload = {
        company_id:        companyId,
        title:             form.title.trim() || buildTitle(),
        professional_type: form.professional_type,
        shift_date:        form.shift_date,
        starts_at:         form.starts_at,
        ends_at:           form.ends_at,
        location:          form.location.trim() || undefined,
        proposed_rate:     isNaN(tarifaNum) ? undefined : tarifaNum,
        coordinacion_chat: form.coordinacion_chat,
        recurring:         form.recurring,
        description:       form.description.trim() || undefined,
        metadata:          {
          ...(shiftData?.metadata ?? {}),
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        },
        status:            'open',
      }
      let res
      if (editMode) {
        res = await updateShift(shiftData.id, payload)
      } else {
        res = await createShift(payload)
      }
      onSuccess(res?.data ?? res)
    } catch (err) {
      setError(getApiErrorMessage(err, editMode ? 'No se pudo actualizar el turno.' : 'No se pudo publicar el turno.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pm-backdrop" ref={backdropRef} onClick={handleBackdrop}>
      <div className="pm-modal pt-modal" role="dialog" aria-modal="true">
        <button className="pm-close" onClick={onClose} aria-label="Cerrar"><IconX /></button>

        {/* Header */}
        <div className="pt-header">
          <div className="pt-header-deco" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="pm-cv-lbl">
              <span className="pm-dot" />
              {editMode ? 'Editar turno' : 'Nuevo turno'}
            </span>
            <h2 className="pt-h2">{editMode ? 'Editar publicación' : 'Publicar turno'}</h2>
            <p className="pt-sub">
              {editMode
                ? 'Actualizá los datos del turno. Los postulantes verán los cambios de inmediato.'
                : 'El sistema hará match con los profesionales más compatibles de tu red.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="pt-body" onSubmit={handleSubmit}>

          {/* Tipo de profesional */}
          <div className="pt-field">
            <label className="pt-label">Tipo de profesional</label>
            <div className="pt-tipo-grid">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`pt-tipo-btn${form.professional_type === t.value ? ' on' : ''}`}
                  onClick={() => set('professional_type', t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título (opcional) */}
          <div className="pt-field">
            <label className="pt-label">
              Título del turno
              <span className="pt-opt">opcional — se genera automáticamente</span>
            </label>
            <input
              className="onb-input"
              type="text"
              placeholder={buildTitle()}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Fecha + Horario */}
          <div className="pt-row">
            <div className="pt-field">
              <label className="pt-label">Fecha del turno</label>
              <input
                className="onb-input"
                type="date"
                value={form.shift_date}
                onChange={(e) => set('shift_date', e.target.value)}
                required
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Horario</label>
              <select
                className="onb-input"
                value={form.horario}
                onChange={(e) => handleHorario(e.target.value)}
              >
                {HORARIOS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hora custom */}
          {form.horario === 'custom' && (
            <div className="pt-row">
              <div className="pt-field">
                <label className="pt-label">Hora inicio</label>
                <input className="onb-input" type="time" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
              </div>
              <div className="pt-field">
                <label className="pt-label">Hora fin</label>
                <input className="onb-input" type="time" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
              </div>
            </div>
          )}

          {/* Dirección + Tarifa */}
          <div className="pt-row">
            <div className="pt-field">
              <label className="pt-label">Dirección de la botica</label>
              <input
                className="onb-input"
                type="text"
                placeholder="Av. Larco 345, Miraflores"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                onBlur={() => {
                  const clean = form.location.trim()
                  if (clean && clean !== lastResolvedAddressRef.current) {
                    resolveLocationOnMap(clean, { silent: true })
                  }
                }}
                required
              />
              <div className="pt-map-actions">
                <button
                  type="button"
                  className="pt-map-btn"
                  onClick={() => resolveLocationOnMap()}
                  disabled={locating || !form.location.trim()}
                >
                  {locating ? 'Ubicando…' : 'Usar esta dirección en el mapa'}
                </button>
                <span className="pt-map-help">También puedes mover el pin manualmente en el mapa.</span>
              </div>
            </div>
            <div className="pt-field">
              <label className="pt-label">
                Tarifa propuesta <span className="pt-opt">S/ por turno</span>
              </label>
              <input
                className="onb-input"
                type="number"
                min="0"
                step="10"
                placeholder="380"
                value={form.tarifa}
                onChange={(e) => set('tarifa', e.target.value)}
                disabled={form.coordinacion_chat}
              />
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label">Ubicación exacta en el mapa</label>
            <div className="pt-mapbox">
              <div ref={mapRef} className="pt-mapcanvas" />
            </div>
            {coords && (
              <div className="pt-map-coords">
                Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Coordinación por chat toggle */}
          <div className="pt-field">
            <label className="pt-toggle-row">
              <div>
                <div className="pt-label" style={{ marginBottom: 2 }}>Previa coordinación por chat</div>
                <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)' }}>
                  {form.coordinacion_chat
                    ? 'La tarifa se acordará directamente con el profesional vía mensajes.'
                    : 'Activá esta opción si preferís negociar la tarifa por chat en lugar de publicar un monto fijo.'}
                </div>
              </div>
              <button
                type="button"
                className={`pt-toggle${form.coordinacion_chat ? ' on' : ''}`}
                onClick={() => {
                  set('coordinacion_chat', !form.coordinacion_chat)
                  if (!form.coordinacion_chat) set('tarifa', '')
                }}
                aria-pressed={form.coordinacion_chat}
              >
                <span className="pt-toggle-thumb" />
              </button>
            </label>
          </div>

          {/* Recurrente */}
          <div className="pt-field">
            <label className="pt-toggle-row">
              <div>
                <div className="pt-label" style={{ marginBottom: 2 }}>¿Es turno recurrente?</div>
                <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)' }}>Activa continuidad — el profesional puede comprometerse por semanas o meses.</div>
              </div>
              <button
                type="button"
                className={`pt-toggle${form.recurring ? ' on' : ''}`}
                onClick={() => set('recurring', !form.recurring)}
                aria-pressed={form.recurring}
              >
                <span className="pt-toggle-thumb" />
              </button>
            </label>
          </div>

          {/* Descripción */}
          <div className="pt-field">
            <label className="pt-label">
              Descripción adicional <span className="pt-opt">opcional</span>
            </label>
            <textarea
              className="pm-msg-box"
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 12, padding: '12px 14px', fontFamily: 'inherit', fontSize: 13, resize: 'none', height: 70, outline: 0, color: '#111827', background: '#F8FAF8' }}
              placeholder="Ej.: Se requiere manejo de receta controlada y experiencia en cierre de caja."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Nota de privacidad */}
          <div className="pm-privacy" style={{ marginBottom: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>
            <div>
              <b>Matching inteligente.</b> FarmaTalent solo muestra tu turno a profesionales con compatibilidad alta. La tarifa es una propuesta — el profesional puede aceptarla, negociarla o rechazarla.
            </div>
          </div>

          {error && <div className="onb-error" style={{ marginTop: 12 }}>{error}</div>}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="pm-btn pm-btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="pm-btn pm-btn-primary" style={{ flex: 2 }} disabled={busy}>
              {busy
                ? (editMode ? 'Guardando…' : 'Publicando…')
                : editMode
                  ? <><IconEdit /> Guardar cambios</>
                  : <><IconPlus /> Publicar turno</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

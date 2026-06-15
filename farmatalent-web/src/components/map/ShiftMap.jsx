/**
 * ShiftMap — Leaflet map showing shift pins in Airbnb style.
 * Uses OpenStreetMap tiles (free, no API key).
 */
import { useEffect, useRef, useState } from 'react'

// Leaflet CSS loaded once at module level via dynamic <link>
let leafletCssLoaded = false
function ensureLeafletCss() {
  if (leafletCssLoaded) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
  leafletCssLoaded = true
}

const LIMA_ESTE_CENTER = [-12.0, -77.0]

const PROF_TYPE_COLOR = {
  pharmacist:           '#15803D',
  pharmacy_technician:  '#1E40AF',
  assistant:            '#B45309',
  doctor:               '#7C2D12',
}

const PROF_TYPE_SHORT = {
  pharmacist:          'QF',
  pharmacy_technician: 'TF',
  assistant:           'PP',
  doctor:              'DR',
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function ShiftMap({ shifts = [], activeId, onPinClick, userLocation }) {
  const mapRef     = useRef(null)
  const mapObjRef  = useRef(null)
  const markersRef = useRef({})
  const [ready, setReady] = useState(false)

  // Bootstrap Leaflet dynamically
  useEffect(() => {
    ensureLeafletCss()
    import('leaflet').then((L) => {
      if (mapObjRef.current || !mapRef.current) return

      // Fix Leaflet's default icon path issue with bundlers
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : LIMA_ESTE_CENTER

      const map = L.map(mapRef.current, {
        center,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Attribution bottom-left
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© <a href="https://openstreetmap.org">OpenStreetMap</a>')
        .addTo(map)

      mapObjRef.current = map
      setReady(true)
    })

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove()
        mapObjRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync markers when shifts or activeId change
  useEffect(() => {
    if (!ready || !mapObjRef.current) return
    import('leaflet').then((L) => {
      const map = mapObjRef.current
      const existing = new Set(Object.keys(markersRef.current).map(Number))

      // Remove stale markers
      const currentIds = new Set(shifts.map((s) => s.id))
      existing.forEach((id) => {
        if (!currentIds.has(id)) {
          markersRef.current[id]?.remove()
          delete markersRef.current[id]
        }
      })

      shifts.forEach((shift) => {
        const meta = shift.metadata ?? {}
        const lat = meta.lat ?? shift.lat
        const lng = meta.lng ?? shift.lng
        if (!lat || !lng) return

        const isActive  = shift.id === activeId
        const color     = PROF_TYPE_COLOR[shift.professional_type] ?? '#15803D'
        const typeShort = PROF_TYPE_SHORT[shift.professional_type] ?? 'FT'
        const time      = `${shift.starts_at ?? '?'}`
        const label     = time

        const iconHtml = `
          <div class="sm-pin${isActive ? ' sm-pin-active' : ''}" style="--pin-color:${color}">
            <div class="sm-pin-inner">
              <span class="sm-pin-type">${typeShort}</span>
              <span class="sm-pin-time">${label}</span>
            </div>
            <div class="sm-pin-tail"></div>
          </div>`

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [72, 40],
          iconAnchor: [36, 40],
          popupAnchor: [0, -44],
        })

        if (markersRef.current[shift.id]) {
          // Update icon (active state)
          markersRef.current[shift.id].setIcon(icon)
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .on('click', () => onPinClick?.(shift))

          // Popup with shift details
          const companyName = shift.company?.name ?? 'SmartFarma'
          const dist = userLocation
            ? ` · ${haversineKm(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)} km`
            : ''
          marker.bindPopup(
            `<div class="sm-popup">
              <div class="sm-popup-title">${shift.title}</div>
              <div class="sm-popup-sub">${companyName}${dist}</div>
              <div class="sm-popup-sub">${shift.location ?? ''}</div>
              <div class="sm-popup-time">${shift.starts_at ?? '?'} – ${shift.ends_at ?? '?'}</div>
            </div>`,
            { maxWidth: 220, closeButton: false }
          )

          markersRef.current[shift.id] = marker
        }
      })

      // If shifts have coords, fit bounds
      const coords = shifts
        .map((s) => {
          const m = s.metadata ?? {}
          return m.lat && m.lng ? [m.lat, m.lng] : null
        })
        .filter(Boolean)

      if (coords.length > 1) {
        try { map.fitBounds(coords, { padding: [40, 40], maxZoom: 14 }) } catch (_) {}
      }
    })
  }, [ready, shifts, activeId, userLocation, onPinClick])

  // Pan to active marker
  useEffect(() => {
    if (!ready || !activeId || !mapObjRef.current) return
    const marker = markersRef.current[activeId]
    if (marker) {
      mapObjRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 })
      marker.openPopup()
    }
  }, [ready, activeId])

  return (
    <div className="sr-mapwrap" style={{ position: 'relative' }}>
      {/* User location pill */}
      {userLocation && (
        <div className="sr-map-overlay" style={{ pointerEvents: 'none' }}>
          <div className="sr-map-info">
            <div className="sr-info-chip">
              <span className="sr-info-dot" />
              {shifts.length} turno{shifts.length !== 1 ? 's' : ''}
            </div>
            <div className="sr-info-chip dark">📍 Tu ubicación activa</div>
          </div>
        </div>
      )}
      {!userLocation && (
        <div className="sr-map-overlay" style={{ pointerEvents: 'none' }}>
          <div className="sr-map-info">
            <div className="sr-info-chip">
              <span className="sr-info-dot" />
              {shifts.length} turno{shifts.length !== 1 ? 's' : ''}
            </div>
            <div className="sr-info-chip dark">Lima Este</div>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

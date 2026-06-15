import { useCallback, useEffect, useState } from 'react'
import { fetchProfessionalProfile, updateAvailability, updateAvailableNow } from '../api/availabilityApi'
import { getApiErrorMessage } from '../api/client'

/* ── constants ──────────────────────────────────────────── */
const DAYS = [
  { key: 'lunes',      label: 'Lun', full: 'Lunes' },
  { key: 'martes',     label: 'Mar', full: 'Martes' },
  { key: 'miercoles',  label: 'Mié', full: 'Miércoles' },
  { key: 'jueves',     label: 'Jue', full: 'Jueves' },
  { key: 'viernes',    label: 'Vie', full: 'Viernes' },
  { key: 'sabado',     label: 'Sáb', full: 'Sábado' },
  { key: 'domingo',    label: 'Dom', full: 'Domingo' },
]

const SHIFTS = [
  { key: 'matutino',   label: 'Matutino',    hours: '07:00 – 15:00', color: '#F59E0B' },
  { key: 'vespertino', label: 'Vespertino',   hours: '14:00 – 22:00', color: '#3B82F6' },
  { key: 'nocturno',   label: 'Nocturno',     hours: '22:00 – 06:00', color: '#7C3AED' },
]

function slotKey(day, shift) { return `${day}_${shift}` }

/* Normalize whatever the API returns into a flat Set of slot keys */
function normalizeSlots(raw) {
  const result = new Set()
  if (!raw) return result

  // Format: ["lunes_matutino", ...] — flat array stored via PUT /professional/profile
  if (Array.isArray(raw)) {
    raw.forEach((s) => result.add(s))
    return result
  }

  // Format: { slots: ["lunes_matutino", ...] }
  if (Array.isArray(raw.slots)) {
    raw.slots.forEach((s) => result.add(s))
    return result
  }

  // Format: { lunes: ["matutino", "nocturno"], ... }
  const dayMap = {
    lunes: 'lunes', monday: 'lunes',
    martes: 'martes', tuesday: 'martes',
    miercoles: 'miercoles', wednesday: 'miercoles',
    jueves: 'jueves', thursday: 'jueves',
    viernes: 'viernes', friday: 'viernes',
    sabado: 'sabado', saturday: 'sabado',
    domingo: 'domingo', sunday: 'domingo',
  }
  const shiftMap = { matutino: 'matutino', morning: 'matutino', vespertino: 'vespertino', afternoon: 'vespertino', nocturno: 'nocturno', night: 'nocturno' }

  Object.entries(raw).forEach(([rawDay, shifts]) => {
    const day = dayMap[rawDay.toLowerCase()]
    if (!day || !Array.isArray(shifts)) return
    shifts.forEach((s) => {
      const shift = shiftMap[s.toLowerCase()]
      if (shift) result.add(slotKey(day, shift))
    })
  })
  return result
}

function slotsToPayload(slots) {
  return { slots: [...slots] }
}

/* ── icons ──────────────────────────────────────────────── */
const IconCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconSave   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
const IconInfo   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

/* ── component ──────────────────────────────────────────── */
export function AvailabilityPage() {
  const [slots, setSlots]           = useState(new Set())
  const [savedSlots, setSavedSlots] = useState(new Set())
  const [availNow, setAvailNow]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [nowBusy, setNowBusy]       = useState(false)
  const [error, setError]           = useState('')
  const [saved, setSaved]           = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // fetchProfessionalProfile → GET /professional/profile
      // Returns ProfessionalProfileResource: { availability: [...], is_available: boolean, ... }
      const profile = await fetchProfessionalProfile()
      const normalized = normalizeSlots(profile?.availability ?? [])
      setSlots(normalized)
      setSavedSlots(new Set(normalized))
      setAvailNow(profile?.is_available ?? false)
    } catch {
      // API not available yet or user has no profile — start with empty grid
      setSlots(new Set())
      setSavedSlots(new Set())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function toggleSlot(day, shift) {
    const key = slotKey(day, shift)
    setSlots((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
    setSaved(false)
  }

  function toggleDay(day) {
    const allActive = SHIFTS.every((s) => slots.has(slotKey(day, s.key)))
    setSlots((prev) => {
      const next = new Set(prev)
      SHIFTS.forEach((s) => {
        const key = slotKey(day, s.key)
        allActive ? next.delete(key) : next.add(key)
      })
      return next
    })
    setSaved(false)
  }

  function selectAll() {
    const full = new Set()
    DAYS.forEach((d) => SHIFTS.forEach((s) => full.add(slotKey(d.key, s.key))))
    setSlots(full)
    setSaved(false)
  }

  function clearAll() {
    setSlots(new Set())
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      // PUT /professional/profile with { availability: [...slotKeys] }
      await updateAvailability({ availability: [...slots] })
      setSavedSlots(new Set(slots))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar la disponibilidad.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleAvailNow() {
    const next = !availNow
    setAvailNow(next)
    setNowBusy(true)
    try {
      await updateAvailableNow(next)
    } catch {
      setAvailNow(!next)
    } finally {
      setNowBusy(false)
    }
  }

  const totalSlots  = slots.size
  const isDirty     = [...slots].some((k) => !savedSlots.has(k)) || [...savedSlots].some((k) => !slots.has(k))

  return (
    <div className="av-page">
      {/* Page header */}
      <div className="ft-dash-header">
        <div>
          <h1>Mi disponibilidad</h1>
          <div className="ft-dash-sub">
            Indica cuándo puedes trabajar para recibir solo los turnos que se adaptan a tu agenda.
          </div>
        </div>
        <button
          className={`ft-btn${saved ? ' ft-btn-outline' : ' ft-btn-brand'}`}
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? 'Guardando…' : saved ? '✓ Guardado' : <><IconSave /> Guardar</>}
        </button>
      </div>

      {/* Available now toggle */}
      <div className="av-now-card">
        <div className="av-now-left">
          <div className="av-now-dot" style={{ background: availNow ? '#22C55E' : '#D1D5DB' }} />
          <div>
            <div className="av-now-title">Disponible ahora mismo</div>
            <div className="av-now-sub">
              {availNow
                ? 'Aparecés en búsquedas activas. Las boticas pueden verte para turnos urgentes.'
                : 'Estás oculto en búsquedas de cobertura inmediata.'}
            </div>
          </div>
        </div>
        <button
          className={`pt-toggle${availNow ? ' on' : ''}`}
          onClick={handleAvailNow}
          disabled={nowBusy}
          aria-pressed={availNow}
        >
          <span className="pt-toggle-thumb" />
        </button>
      </div>

      {/* Info banner */}
      <div className="av-info">
        <span style={{ color: '#1D4ED8' }}><IconInfo /></span>
        <div>
          <b>¿Cómo funciona?</b> El matching usa tu grilla semanal para filtrar turnos compatibles.
          Cuantos más slots habilités, más oportunidades recibirás. Podés editar esto cuando quieras.
        </div>
      </div>

      {/* Summary + quick actions */}
      <div className="av-toolbar">
        <div className="av-summary">
          <span className="av-sum-num">{totalSlots}</span>
          <span className="av-sum-label">slots habilitados esta semana</span>
          {totalSlots > 0 && (
            <span className="av-sum-chip">
              ~{Math.round(totalSlots * 8)}h disponibles
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={selectAll}>Seleccionar todo</button>
          <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={clearAll}>Limpiar</button>
        </div>
      </div>

      {/* Weekly grid */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
          Cargando disponibilidad…
        </div>
      ) : (
        <div className="av-grid-wrap">
          {/* Day headers */}
          <div className="av-grid">
            <div className="av-shift-col" />
            {DAYS.map((day) => {
              const count = SHIFTS.filter((s) => slots.has(slotKey(day.key, s.key))).length
              const allOn = count === SHIFTS.length
              return (
                <button
                  key={day.key}
                  className={`av-day-head${allOn ? ' all-on' : count > 0 ? ' partial' : ''}`}
                  onClick={() => toggleDay(day.key)}
                  title={`Alternar ${day.full}`}
                >
                  <span className="av-day-lbl">{day.label}</span>
                  {count > 0 && <span className="av-day-ct">{count}/3</span>}
                </button>
              )
            })}

            {/* Shift rows */}
            {SHIFTS.map((shift) => (
              <>
                <div key={`label-${shift.key}`} className="av-shift-lbl">
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#374151' }}>{shift.label}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{shift.hours}</div>
                  <div className="av-shift-dot" style={{ background: shift.color }} />
                </div>
                {DAYS.map((day) => {
                  const key    = slotKey(day.key, shift.key)
                  const active = slots.has(key)
                  return (
                    <button
                      key={key}
                      className={`av-cell${active ? ' on' : ''}`}
                      style={active ? { borderColor: shift.color, background: `${shift.color}18` } : {}}
                      onClick={() => toggleSlot(day.key, shift.key)}
                      aria-pressed={active}
                      title={`${day.full} · ${shift.label}`}
                    >
                      {active && (
                        <span className="av-cell-check" style={{ color: shift.color }}>
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  )
                })}
              </>
            ))}
          </div>

          {/* Legend */}
          <div className="av-legend">
            {SHIFTS.map((s) => (
              <div key={s.key} className="av-legend-item">
                <div className="av-shift-dot" style={{ background: s.color }} />
                {s.label} · {s.hours}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="onb-error" style={{ marginTop: 12 }}>{error}</div>}

      {/* Tip card */}
      <div className="av-tip">
        <div className="av-tip-ico">💡</div>
        <div>
          <b>Tip:</b> Los turnos nocturnos del fin de semana tienen la mayor demanda en Miraflores y San Isidro.
          Habilitarlos puede triplicar tus oportunidades de match.
        </div>
      </div>
    </div>
  )
}

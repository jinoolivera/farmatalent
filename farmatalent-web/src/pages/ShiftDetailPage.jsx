import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { fetchMyApplications } from '../api/applicationsApi'
import { getApiErrorMessage } from '../api/client'
import { fetchShiftById } from '../api/shiftsApi'
import { Badge } from '../components/ui/Badge'
import { PostulacionModal } from '../components/marketplace/PostulacionModal'

const GRADIENTS = [
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#1E40AF,#3B82F6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#7C2D12,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
]

const TYPE_LABEL = {
  pharmacist:           'Químico farmacéutico',
  pharmacy_technician:  'Técnico en farmacia',
  doctor:               'Doctor',
  assistant:            'Auxiliar / apoyo',
  nurse:                'Enfermero/a',
  intern:               'Practicante',
}

const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconShield  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>
const IconClock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconMapPin  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconUsers   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>

export function ShiftDetailPage() {
  const { shiftId }  = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const isCompany    = !user?.professional_type

  const [shift, setShift]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [applied, setApplied]     = useState(false)
  const [showModal, setShowModal] = useState(false)

  const colorIdx = useMemo(() => Number(shiftId) % GRADIENTS.length, [shiftId])
  const orgShort = useMemo(() => {
    const name = shift?.company?.name ?? shift?.pharmacy_name ?? 'FT'
    return name.slice(0, 2).toUpperCase()
  }, [shift])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchShiftById(shiftId)
      const s   = res.data ?? res
      setShift(s)
      if (!isCompany) {
        const apps = await fetchMyApplications()
        setApplied((apps.data ?? []).some((a) => a.shift_request_id === Number(shiftId)))
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el turno.'))
    } finally {
      setLoading(false)
    }
  }, [isCompany, shiftId])

  useEffect(() => { load() }, [load])

  const canApply = !isCompany && shift?.status === 'open' && !applied

  function handleModalSuccess(applicationId) {
    setShowModal(false)
    setApplied(true)
    if (applicationId) navigate(`/app/match/${applicationId}`)
  }

  /* ── loading ────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
        Cargando turno…
      </div>
    )
  }

  /* ── error ──────────────────────────────────────────── */
  if (error && !shift) {
    return (
      <div>
        <button className="sd-back" onClick={() => navigate(-1)}><IconArrow /> Volver</button>
        <div className="onb-error" style={{ marginTop: 20 }}>{error}</div>
        <button className="ft-btn ft-btn-outline" style={{ marginTop: 12 }} onClick={load}>Reintentar</button>
      </div>
    )
  }

  const orgName   = shift?.company?.name ?? shift?.pharmacy_name ?? 'Farmacia'
  const location  = shift?.location ?? shift?.address ?? ''
  const shiftDate = shift?.shift_date ?? shift?.date ?? ''
  const startTime = shift?.starts_at  ?? shift?.start_time ?? ''
  const endTime   = shift?.ends_at    ?? shift?.end_time   ?? ''
  const appsCount = shift?.applications_count ?? shift?.applications?.length ?? 0

  return (
    <div className="sd-page">
      <button className="sd-back" onClick={() => navigate(-1)}><IconArrow /> Volver a turnos</button>

      <div className="sd-layout">
        {/* Main card */}
        <div className="sd-card">
          {/* Cover */}
          <div className="sd-cover" style={{ background: GRADIENTS[colorIdx] }}>
            {shift?.urgent && <span className="sd-urg-pill"><span className="sd-pud" />Urgente · necesitan cubrir hoy</span>}
            {shift?.recurring && <span className="sd-rec-pill">🔁 Continuidad</span>}
            <div className="sd-cover-logo">{orgShort}</div>
          </div>

          {/* Body */}
          <div className="sd-body">
            <div className="sd-title-row">
              <div>
                <h1 className="sd-title">{shift?.title ?? 'Turno'}</h1>
                <div className="sd-org">📍 {orgName}{location ? ` · ${location}` : ''}</div>
              </div>
              {shift?.match_percent != null && (
                <div className="sd-match-badge">
                  <div className="sd-match-num">{shift.match_percent}%</div>
                  <div className="sd-match-lbl">match</div>
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="sd-grid">
              <div className="sd-cell">
                <div className="sd-cell-l"><IconClock /> Horario</div>
                <div className="sd-cell-v">{startTime}{endTime ? ` – ${endTime}` : ''}</div>
              </div>
              <div className="sd-cell">
                <div className="sd-cell-l">🗓 Fecha</div>
                <div className="sd-cell-v">{shiftDate || '—'}</div>
              </div>
              <div className="sd-cell">
                <div className="sd-cell-l"><IconMapPin /> Dirección</div>
                <div className="sd-cell-v">{location || '—'}</div>
              </div>
              <div className="sd-cell">
                <div className="sd-cell-l"><IconUsers /> Postulaciones</div>
                <div className="sd-cell-v">{appsCount}</div>
              </div>
              <div className="sd-cell">
                <div className="sd-cell-l">👤 Perfil requerido</div>
                <div className="sd-cell-v">{TYPE_LABEL[shift?.professional_type] ?? shift?.professional_type ?? '—'}</div>
              </div>
              <div className="sd-cell">
                <div className="sd-cell-l">📊 Estado</div>
                <div className="sd-cell-v">
                  <Badge variant={shift?.status === 'open' ? 'success' : 'neutral'}>
                    {shift?.status === 'open' ? 'Disponible' : shift?.status ?? '—'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            {shift?.description && (
              <div className="sd-desc">
                <div className="sd-desc-label">Descripción</div>
                <p>{shift.description}</p>
              </div>
            )}

            {/* Tarifa block */}
            <div className="sd-tarifa">
              <div className="sd-tarifa-ico"><IconShield /></div>
              <div className="sd-tarifa-tx">
                <b>Tarifa propuesta por la botica · acepta, negocia o rechaza</b>
                <span>Tu privacidad está protegida hasta confirmar el match</span>
              </div>
            </div>

            {/* Error */}
            {error && <div className="onb-error" style={{ marginBottom: 16 }}>{error}</div>}

            {/* CTA */}
            <div className="sd-cta">
              <button className="ft-btn ft-btn-outline" onClick={() => navigate('/app/turnos')}>
                Ver todos los turnos
              </button>
              {!isCompany && (
                <button
                  className="ft-btn ft-btn-primary"
                  disabled={!canApply}
                  onClick={() => setShowModal(true)}
                  style={{ minWidth: 160 }}
                >
                  {applied ? '✓ Ya postulaste' : 'Aplicar al turno →'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: sidebar tips */}
        <div className="sd-aside">
          <div className="ft-pane">
            <div className="ft-pane-head"><h3>¿Cómo funciona?</h3></div>
            {[
              { n: '1', title: 'Aplicas',       desc: 'Tu perfil llega a la botica de forma anónima.' },
              { n: '2', title: 'Match',         desc: 'Si la botica acepta, desbloquean el contacto mutuo.' },
              { n: '3', title: 'Confirmación',  desc: 'Acuerdas los detalles y el turno queda asignado.' },
              { n: '4', title: 'Reputación',    desc: 'Completas el turno y acumulas score y badges.' },
            ].map((step) => (
              <div key={step.n} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ft-gray-100)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ft-green-50)', color: 'var(--ft-green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ft-font-display)', fontSize: 18, fontStyle: 'italic', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ft-fg-muted)', marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head"><h3>Privacidad operacional</h3></div>
            <p style={{ fontSize: 13, color: 'var(--ft-fg-muted)', lineHeight: 1.5 }}>
              Tu nombre, DNI y teléfono <b>solo se comparten después</b> de que ambas partes confirman el match. Tu perfil público solo muestra rol, score y zona.
            </p>
          </div>
        </div>
      </div>

      {showModal && shift && (
        <PostulacionModal
          shift={{
            id:          shift.id,
            title:       shift.title ?? 'Turno',
            org:         shift.company?.name ?? shift.pharmacy_name ?? 'Farmacia',
            orgShort:    orgShort,
            colorIdx:    colorIdx,
            matchPercent: shift.match_percent ?? null,
            date:        shiftDate,
            startTime,
            endTime,
            distanceKm:  shift.distance_km ? `${shift.distance_km} km` : null,
            urgent:      shift.urgent ?? false,
          }}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

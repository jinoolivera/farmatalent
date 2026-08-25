import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCompanyAccount } from '../auth/authRouting'
import { fetchMyApplications } from '../api/applicationsApi'
import { getApiErrorMessage } from '../api/client'
import { fetchShiftById, fetchShifts } from '../api/shiftsApi'
import { Badge } from '../components/ui/Badge'
import { PostulacionModal } from '../components/marketplace/PostulacionModal'
import { ShiftMap } from '../components/map/ShiftMap'

const GRADIENTS = [
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#1E40AF,#3B82F6)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#7C2D12,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#0F766E,#14B8A6)',
]

const TYPE_LABEL = {
  pharmacist: 'Químico farmacéutico',
  pharmacy_technician: 'Técnico en farmacia',
  doctor: 'Doctor',
  assistant: 'Auxiliar / apoyo',
  nurse: 'Enfermero/a',
  intern: 'Practicante',
}

const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 6v6c0 5.5 3.5 9.5 8 10 4.5-.5 8-4.5 8-10V6l-8-4z"/><polyline points="9 12 11 14 15 10"/></svg>
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconUsers = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
const IconFacebook = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'
const API_BASE = API_URL.startsWith('http') ? API_URL.replace(/\/api\/v\d+$/, '') : ''
const SHARE_BASE_URL = (import.meta.env.VITE_SHARE_BASE_URL ?? API_BASE ?? '').replace(/\/$/, '')

function shareTurnoOnFacebook(shift) {
  const baseUrl = SHARE_BASE_URL || window.location.origin
  const isLocalBase = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseUrl)

  if (isLocalBase) {
    window.alert('Configura VITE_SHARE_BASE_URL con una URL publica del backend para poder previsualizar el turno en Facebook.')
    return
  }

  const version = encodeURIComponent(String(shift?.updatedAt ?? shift?.date ?? Date.now()))
  const shareUrl = `${baseUrl}/compartir/turno/${shift.id}?v=${version}`
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  window.open(fbUrl, 'compartir-facebook', 'width=600,height=640,noopener,noreferrer')
}

function normShift(s, idx = 0) {
  const orgName = s.pharmacy_name ?? s.company?.name ?? s.company_name ?? 'Farmacia'
  const logoPath = s.company?.logo_path
  const logoUrl = logoPath ? `${API_BASE}/storage/${logoPath}` : null
  const meta = s.metadata ?? {}
  const tags = meta.tags ?? []
  const publicArea = meta.district
    ?? (() => {
      const parts = String(s.location ?? s.address ?? '').split(',').map((part) => part.trim()).filter(Boolean)
      return parts.length >= 2 ? parts.slice(-2).join(', ') : (parts[0] ?? '')
    })()

  return {
    id: s.id,
    title: s.title ?? s.role ?? 'Turno',
    org: orgName,
    orgShort: orgName.slice(0, 2).toUpperCase(),
    logoUrl,
    colorIdx: idx % GRADIENTS.length,
    matchPercent: s.match_percent ?? s.compatibility_score ?? null,
    date: s.shift_date ?? s.date ?? '',
    startTime: s.starts_at ?? s.start_time ?? '',
    endTime: s.ends_at ?? s.end_time ?? '',
    address: s.location ?? s.address ?? '',
    publicArea,
    distanceKm: s.distance_km ? `${s.distance_km} km` : null,
    urgent: s.urgent ?? s.priority === 'high',
    recurring: tags.includes('turno_estable') || s.recurring === true,
    requiresLicense: s.requires_license ?? false,
    description: s.description ?? '',
    status: s.status ?? 'open',
    metadata: meta,
    company: s.company,
    professional_type: s.professional_type,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    location: s.location,
    applications_count: s.applications_count ?? s.applications?.length ?? 0,
    proposed_rate: s.proposed_rate,
    coordinacion_chat: s.coordinacion_chat,
    updatedAt: s.updated_at ?? s.updatedAt ?? '',
  }
}

function RelatedShiftItem({ shift, active, applied, onOpen, onApply }) {
  return (
    <article className={`sd-rel-item${active ? ' active' : ''}`} onClick={() => onOpen(shift.id)}>
      <div className="sd-rel-logo" style={{ background: shift.logoUrl ? '#fff' : GRADIENTS[shift.colorIdx] }}>
        {shift.logoUrl
          ? <img src={shift.logoUrl} alt={shift.org} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', padding: 4 }} />
          : shift.orgShort}
      </div>
      <div className="sd-rel-body">
        <div className="sd-rel-top">
          <div style={{ minWidth: 0 }}>
            <div className="sd-rel-title">{shift.title}</div>
            <div className="sd-rel-sub">{shift.org}{shift.publicArea ? ` · ${shift.publicArea}` : ''}</div>
          </div>
          {shift.matchPercent != null && (
            <span className="sd-rel-match">{shift.matchPercent}% match</span>
          )}
        </div>
        <div className="sd-rel-meta">
          {shift.date && <span>🗓 {shift.date}</span>}
          {(shift.startTime || shift.endTime) && <span>🕐 {shift.startTime}{shift.endTime ? ` – ${shift.endTime}` : ''}</span>}
          {shift.distanceKm && <span>📍 {shift.distanceKm}</span>}
          {shift.professional_type && <span>👤 {TYPE_LABEL[shift.professional_type] ?? shift.professional_type}</span>}
        </div>
        {shift.description && <p className="sd-rel-desc">{shift.description}</p>}
        <div className="sd-rel-actions">
          <div className="sd-rel-tags">
            {shift.urgent && <span className="sd-rel-tag urg">Urgente</span>}
            {shift.recurring && <span className="sd-rel-tag recur">Continuidad</span>}
            {shift.requiresLicense && <span className="sd-rel-tag col">Colegiatura QF</span>}
          </div>
          <button
            className="sd-rel-apply"
            disabled={applied}
            onClick={(e) => {
              e.stopPropagation()
              onApply(shift.id)
            }}
          >
            {applied ? 'Postulado' : 'Aplicar'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ShiftDetailPage() {
  const { shiftId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, appMode } = useAuth()
  const isCompany = isCompanyAccount(user, appMode)

  const [shift, setShift] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [modalShift, setModalShift] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  const selectedId = Number(searchParams.get('selected') ?? shiftId)
  const colorIdx = useMemo(() => Number(shiftId) % GRADIENTS.length, [shiftId])
  const orgShort = useMemo(() => {
    const name = shift?.company?.name ?? shift?.pharmacy_name ?? 'FT'
    return name.slice(0, 2).toUpperCase()
  }, [shift])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  const filters = useMemo(() => ({
    status: searchParams.get('status') ?? 'open',
    professional_type: searchParams.get('professional_type') ?? '',
    district: searchParams.get('district') ?? '',
    shift_date: searchParams.get('shift_date') ?? '',
    horario: searchParams.get('horario') ?? '',
  }), [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [detailRes, listRes, appsRes] = await Promise.all([
        fetchShiftById(shiftId),
        fetchShifts({
          status: filters.status || undefined,
          professional_type: filters.professional_type || undefined,
          district: filters.district || undefined,
          shift_date: filters.shift_date || undefined,
          horario: filters.horario || undefined,
          page: 1,
        }),
        user && !isCompany ? fetchMyApplications() : Promise.resolve({ data: [] }),
      ])

      const detailShift = detailRes.data ?? detailRes
      setShift(detailShift)

      const normalizedList = (listRes.data ?? []).map((item, index) => normShift(item, index))
      const detailNorm = normShift(detailShift, normalizedList.length)
      const withoutSelected = normalizedList.filter((item) => Number(item.id) !== Number(shiftId))
      setRelatedItems([detailNorm, ...withoutSelected])

      setAppliedIds(new Set((appsRes.data ?? []).map((a) => a.shift_request_id)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el turno.'))
    } finally {
      setLoading(false)
    }
  }, [filters.district, filters.horario, filters.professional_type, filters.shift_date, filters.status, isCompany, shiftId, user])

  useEffect(() => { load() }, [load])

  const displayShifts = useMemo(() => (
    relatedItems.map((item, index) => (
      Number(item.id) === Number(shiftId)
        ? { ...item, colorIdx }
        : { ...item, colorIdx: index % GRADIENTS.length }
    ))
  ), [colorIdx, relatedItems, shiftId])

  const selectedShift = useMemo(
    () => displayShifts.find((item) => Number(item.id) === Number(shiftId)) ?? null,
    [displayShifts, shiftId]
  )

  const canApply = !isCompany && shift?.status === 'open' && !appliedIds.has(Number(shiftId))

  function handleModalSuccess(applicationId) {
    const appliedShiftId = Number(modalShift?.id ?? shiftId)
    setShowModal(false)
    setModalShift(null)
    setAppliedIds((current) => new Set(current).add(appliedShiftId))
    if (applicationId) navigate(`/app/match/${applicationId}`)
  }

  function openShift(nextShiftId) {
    const params = new URLSearchParams(searchParams)
    params.set('selected', String(nextShiftId))
    navigate(`/app/turnos/${nextShiftId}?${params.toString()}`)
  }

  function handleApply(targetShiftId) {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    if (!user?.professional_type) {
      navigate(`/app/activar-profesional?next=${encodeURIComponent(`/app/turnos/${targetShiftId}`)}`)
      return
    }
    const target = displayShifts.find((item) => Number(item.id) === Number(targetShiftId))
    if (target) {
      setModalShift(target)
      setShowModal(true)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
        Cargando turno…
      </div>
    )
  }

  if (error && !shift) {
    return (
      <div>
        <button className="sd-back" onClick={() => navigate(-1)}><IconArrow /> Volver</button>
        <div className="onb-error" style={{ marginTop: 20 }}>{error}</div>
        <button className="ft-btn ft-btn-outline" style={{ marginTop: 12 }} onClick={load}>Reintentar</button>
      </div>
    )
  }

  const orgName = shift?.company?.name ?? shift?.pharmacy_name ?? 'Farmacia'
  const locationLabel = selectedShift?.publicArea
    ?? (() => {
      const parts = String(shift?.location ?? shift?.address ?? '').split(',').map((part) => part.trim()).filter(Boolean)
      return parts.length >= 2 ? parts.slice(-2).join(', ') : (parts[0] ?? '')
    })()
  const shiftDate = shift?.shift_date ?? shift?.date ?? ''
  const startTime = shift?.starts_at ?? shift?.start_time ?? ''
  const endTime = shift?.ends_at ?? shift?.end_time ?? ''
  const appsCount = shift?.applications_count ?? shift?.applications?.length ?? 0
  const hasFixedRate = shift?.proposed_rate != null && !shift?.coordinacion_chat
  const tarifaValue = hasFixedRate ? `S/ ${shift.proposed_rate}` : 'A coordinar'

  return (
    <div className="sd-page sd-page-wide">
      <button className="sd-back" onClick={() => navigate(-1)}><IconArrow /> Volver a turnos</button>

      <div className="sd-layout sd-layout-explore">
        <div className="sd-maincol">
          <div className="sd-card sd-card-selected">
            <div className="sd-selected-label">Turno seleccionado</div>
            <div className="sd-cover" style={{ background: GRADIENTS[colorIdx] }}>
              {shift?.urgent && <span className="sd-urg-pill"><span className="sd-pud" />Urgente · necesitan cubrir hoy</span>}
              {shift?.recurring && <span className="sd-rec-pill">🔁 Continuidad</span>}
              <div className="sd-cover-logo">{orgShort}</div>
            </div>

            <div className="sd-body">
              <div className="sd-title-row">
                <div>
                  <h1 className="sd-title">{shift?.title ?? 'Turno'}</h1>
                  <div className="sd-org">📍 {orgName}{locationLabel ? ` · ${locationLabel}` : ''}</div>
                </div>
                {shift?.match_percent != null && (
                  <div className="sd-match-badge">
                    <div className="sd-match-num">{shift.match_percent}%</div>
                    <div className="sd-match-lbl">match</div>
                  </div>
                )}
              </div>

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
                  <div className="sd-cell-l"><IconMapPin /> Zona referencial</div>
                  <div className="sd-cell-v">{locationLabel || '—'}</div>
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

              {shift?.description && (
                <div className="sd-desc">
                  <div className="sd-desc-label">Descripción</div>
                  <p>{shift.description}</p>
                </div>
              )}

              <div className="sd-tarifa">
                <div className="sd-tarifa-ico"><IconShield /></div>
                <div className="sd-tarifa-tx">
                  <b>{hasFixedRate ? 'Tarifa propuesta por la botica · acepta, negocia o rechaza' : 'Sin tarifa fija · se coordina por chat tras el match'}</b>
                  <span>Tu privacidad está protegida hasta confirmar el match</span>
                </div>
                <div className={`sd-tarifa-val${hasFixedRate ? '' : ' muted'}`}>{tarifaValue}</div>
              </div>

              {error && <div className="onb-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="sd-cta">
                <button className="ft-btn ft-btn-outline" onClick={() => navigate(`/app/turnos${location.search}`)}>
                  Ver todos los turnos
                </button>
                <button
                  className="ft-btn sd-share-fb"
                  onClick={() => shareTurnoOnFacebook(shift)}
                  title="Compartir este turno en Facebook"
                >
                  <IconFacebook /> Compartir en Facebook
                </button>
                {!isCompany && (
                  <button
                    className="ft-btn ft-btn-primary"
                    disabled={!canApply}
                    onClick={() => handleApply(shift.id)}
                    style={{ minWidth: 160 }}
                  >
                    {appliedIds.has(Number(shift.id)) ? '✓ Ya postulaste' : 'Aplicar al turno →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <section className="sd-related">
            <div className="sd-related-head">
              <h2>Más turnos del mapa</h2>
              <p>El turno que elegiste aparece primero. Debajo puedes comparar opciones cercanas sin salir de la vista.</p>
            </div>
            <div className="sd-related-list">
              {displayShifts.map((item) => (
                <RelatedShiftItem
                  key={item.id}
                  shift={item}
                  active={Number(item.id) === Number(selectedId)}
                  applied={appliedIds.has(Number(item.id))}
                  onOpen={openShift}
                  onApply={handleApply}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="sd-mapcol">
          <div className="sd-map-panel">
            <ShiftMap
              shifts={displayShifts}
              activeId={selectedShift?.id}
              onPinClick={(item) => openShift(item.id)}
              userLocation={userLocation}
            />
          </div>

          <div className="ft-pane" style={{ marginTop: 14 }}>
            <div className="ft-pane-head"><h3>¿Cómo funciona?</h3></div>
            {[
              { n: '1', title: 'Aplicas', desc: 'Tu perfil llega a la botica de forma anónima.' },
              { n: '2', title: 'Match', desc: 'Si la botica acepta, desbloquean el contacto mutuo.' },
              { n: '3', title: 'Confirmación', desc: 'Acuerdas los detalles y el turno queda asignado.' },
              { n: '4', title: 'Reputación', desc: 'Completas el turno y acumulas score y badges.' },
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
        </aside>
      </div>

      {showModal && modalShift && (
        <PostulacionModal
          shift={{
            id: modalShift.id,
            title: modalShift.title,
            org: modalShift.org,
            orgShort: modalShift.orgShort,
            colorIdx: modalShift.colorIdx,
            matchPercent: modalShift.matchPercent ?? null,
            date: modalShift.date,
            startTime: modalShift.startTime,
            endTime: modalShift.endTime,
            distanceKm: modalShift.distanceKm,
            urgent: modalShift.urgent ?? false,
            hasFixedRate: modalShift.proposed_rate != null && !modalShift.coordinacion_chat,
            tarifaValue: modalShift.proposed_rate != null && !modalShift.coordinacion_chat ? `S/ ${modalShift.proposed_rate}` : 'A coordinar',
          }}
          onClose={() => {
            setShowModal(false)
            setModalShift(null)
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

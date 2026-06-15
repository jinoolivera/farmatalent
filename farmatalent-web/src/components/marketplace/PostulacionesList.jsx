import { useMemo } from 'react'
import { Link } from 'react-router-dom'

const STATUS_LABEL = {
  open: 'Abierto',
  assigned: 'Asignado',
  pending: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
}

function ApplicationCard({ item, isCompanyAccount, busyId, onWithdraw, onReview }) {
  const isContactUnlocked = item.status === 'accepted'
  const isShiftClosed = item.shift_request?.status === 'assigned' && item.status !== 'accepted'

  return (
    <article className="border rounded p-3 h-100 bg-white">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h3 className="h6 mb-1">{item.shift_request?.title ?? 'Turno'}</h3>
          <div className="small text-muted">
            {item.shift_request?.company?.name ?? 'Sin empresa'} · {item.shift_request?.shift_date ?? '--'}
          </div>
        </div>
        <span className="badge text-bg-light border">{STATUS_LABEL[item.status] ?? item.status}</span>
      </div>
      <div className="small text-muted mt-2">
        {isCompanyAccount ? `Profesional: ${item.worker?.name ?? 'N/D'}` : `Ubicacion: ${item.shift_request?.location ?? 'N/D'}`}
      </div>
      <div className="small mt-1">
        {isContactUnlocked
          ? isCompanyAccount
            ? `Contacto profesional: ${item.worker?.email ?? 'No disponible'}`
            : `Contacto empresa: ${item.shift_request?.company?.contact_email ?? 'No disponible'}`
          : 'Contacto bloqueado hasta confirmar match'}
      </div>
      {item.message && <p className="mb-0 mt-2 small">Mensaje: {item.message}</p>}
      {isShiftClosed && <p className="mb-0 mt-2 small text-danger">Turno ya asignado. Esta postulacion ya no puede ser aceptada.</p>}

      <div className="mt-3 d-flex gap-2">
        {!isCompanyAccount && item.status === 'pending' && (
          <button
            className="btn btn-outline-secondary btn-sm"
            type="button"
            disabled={busyId === `application-${item.id}`}
            onClick={() => onWithdraw(item.id)}
          >
            {busyId === `application-${item.id}` ? 'Procesando...' : 'Retirar'}
          </button>
        )}
        {isCompanyAccount && item.status === 'pending' && (
          <>
            <button
              className="btn btn-success btn-sm"
              type="button"
              disabled={busyId === `application-${item.id}` || isShiftClosed}
              onClick={() => onReview(item.id, 'accepted')}
            >
              Aceptar
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              disabled={busyId === `application-${item.id}` || isShiftClosed}
              onClick={() => onReview(item.id, 'rejected')}
            >
              Rechazar
            </button>
          </>
        )}
        {item.status === 'accepted' && (
          <>
            <Link className="btn btn-outline-secondary btn-sm" to={`/app/match/${item.id}`}>
              Ver match
            </Link>
            <Link className="btn btn-primary btn-sm" to={`/app/chat/${item.id}`}>
              Chat operativo
            </Link>
          </>
        )}
      </div>
    </article>
  )
}

export function PostulacionesList({ items, isCompanyAccount, busyId, onWithdraw, onReview, onlyPending = false }) {
  const groupedByShift = useMemo(() => {
    if (!isCompanyAccount) {
      return []
    }

    const map = new Map()

    for (const item of items) {
      const shiftId = item.shift_request_id ?? item.shift_request?.id ?? `no-shift-${item.id}`
      const entry = map.get(shiftId) ?? {
        shiftId,
        shift: item.shift_request ?? null,
        applications: [],
      }

      entry.applications.push(item)
      map.set(shiftId, entry)
    }

    return Array.from(map.values())
  }, [isCompanyAccount, items])

  const onlyPendingGroups = useMemo(() => {
    if (!isCompanyAccount) {
      return groupedByShift
    }

    return groupedByShift.map((group) => ({
      ...group,
      applications: group.applications.filter((application) => application.status === 'pending'),
    }))
  }, [groupedByShift, isCompanyAccount])

  const allPendingCount = useMemo(
    () => groupedByShift.reduce((acc, group) => acc + group.applications.filter((app) => app.status === 'pending').length, 0),
    [groupedByShift],
  )
  const allAcceptedCount = useMemo(
    () => groupedByShift.reduce((acc, group) => acc + group.applications.filter((app) => app.status === 'accepted').length, 0),
    [groupedByShift],
  )
  const allRejectedCount = useMemo(
    () => groupedByShift.reduce((acc, group) => acc + group.applications.filter((app) => app.status === 'rejected').length, 0),
    [groupedByShift],
  )

  const groupsToRender = useMemo(() => {
    if (!isCompanyAccount) {
      return groupedByShift
    }

    return onlyPending ? onlyPendingGroups : groupedByShift
  }, [groupedByShift, isCompanyAccount, onlyPending, onlyPendingGroups])

  if (!isCompanyAccount) {
    return (
      <div className="row g-3">
        {items.map((item) => (
          <div className="col-12" key={item.id}>
            <ApplicationCard item={item} isCompanyAccount={false} busyId={busyId} onWithdraw={onWithdraw} onReview={onReview} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-wrap">
        <span className="badge text-bg-warning">Pendientes: {allPendingCount}</span>
        <span className="badge text-bg-success">Aceptadas: {allAcceptedCount}</span>
        <span className="badge text-bg-danger">Rechazadas: {allRejectedCount}</span>
      </div>

      {groupsToRender.map((group) => {
        const pendingCount = group.applications.filter((app) => app.status === 'pending').length
        const acceptedCount = group.applications.filter((app) => app.status === 'accepted').length
        const rejectedCount = group.applications.filter((app) => app.status === 'rejected').length

        return (
        <section className="border rounded p-3 bg-light-subtle" key={group.shiftId}>
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h2 className="h6 mb-1">{group.shift?.title ?? 'Turno'}</h2>
              <div className="small text-muted">
                {group.shift?.company?.name ?? 'Sin empresa'} · {group.shift?.shift_date ?? '--'} · {group.shift?.location ?? 'N/D'}
              </div>
            </div>
            <div className="d-flex gap-2">
              <span className="badge text-bg-light border">Estado: {STATUS_LABEL[group.shift?.status] ?? group.shift?.status ?? 'N/D'}</span>
              <span className="badge text-bg-secondary">Postulaciones: {group.applications.length}</span>
              <span className="badge text-bg-warning">Pendientes: {pendingCount}</span>
              <span className="badge text-bg-success">Aceptadas: {acceptedCount}</span>
              <span className="badge text-bg-danger">Rechazadas: {rejectedCount}</span>
            </div>
          </div>

          <div className="row g-3">
            {group.applications.map((item) => (
              <div className="col-12 col-xl-6" key={item.id}>
                <ApplicationCard item={item} isCompanyAccount busyId={busyId} onWithdraw={onWithdraw} onReview={onReview} />
              </div>
            ))}
          </div>
        </section>
        )
      })}
    </div>
  )
}

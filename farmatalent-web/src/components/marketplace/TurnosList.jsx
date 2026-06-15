const STATUS_LABEL = {
  open: 'Abierto',
  assigned: 'Asignado',
  pending: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
}

const TYPE_LABEL = {
  pharmacist: 'Farmaceutico',
  pharmacy_technician: 'Tecnico en farmacia',
  doctor: 'Doctor',
  assistant: 'Auxiliar',
}

const PRIORITY_BADGE_CLASS = {
  high: 'text-bg-danger',
  normal: 'text-bg-info',
  low: 'text-bg-secondary',
}

const STATUS_BADGE_CLASS = {
  open: 'text-bg-success',
  assigned: 'text-bg-primary',
  pending: 'text-bg-warning',
  accepted: 'text-bg-success',
  rejected: 'text-bg-danger',
  withdrawn: 'text-bg-secondary',
}

export function TurnosList({ items, isCompanyAccount, busyId, onApply, appliedShiftIds = new Set() }) {
  return (
    <div className="row g-3">
      {items.map((item) => (
        <div className="col-12 col-lg-6" key={item.id}>
          <article className="border rounded p-3 h-100 bg-white">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h2 className="h6 mb-1">{item.title}</h2>
                <div className="small text-muted">{item.company?.name ?? 'Sin empresa'}</div>
              </div>
              <span className={`badge ${STATUS_BADGE_CLASS[item.status] ?? 'text-bg-light'} border`}>
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </div>
            <div className="small mt-2">
              {item.shift_date} · {item.starts_at}-{item.ends_at}
            </div>
            <div className="small text-muted">{item.location}</div>
            <div className="small text-muted">Perfil: {TYPE_LABEL[item.professional_type] ?? item.professional_type}</div>
            <div className="small text-muted">Postulaciones: {item.applications_count ?? 0}</div>
            <div className="mt-2">
              <span className={`badge ${PRIORITY_BADGE_CLASS[item.priority] ?? 'text-bg-secondary'}`}>
                Prioridad: {item.priority ?? 'normal'}
              </span>
            </div>
            <div className="mt-3">
              <Link className="btn btn-outline-secondary btn-sm" to={`/app/turnos/${item.id}`}>
                Ver detalle
              </Link>
            </div>
            {!isCompanyAccount && item.status === 'open' && (
              <button
                className="btn btn-primary btn-sm mt-3"
                type="button"
                disabled={busyId === `shift-${item.id}` || appliedShiftIds.has(item.id)}
                onClick={() => onApply(item.id)}
              >
                {appliedShiftIds.has(item.id) ? 'Ya postulaste' : busyId === `shift-${item.id}` ? 'Postulando...' : 'Me interesa'}
              </button>
            )}
          </article>
        </div>
      ))}
    </div>
  )
}
import { Link } from 'react-router-dom'

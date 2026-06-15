import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMyApplications } from '../../api/applicationsApi'
import { isCompanyAccount } from '../../auth/authRouting'
import { useAuth } from '../../auth/AuthContext'
import { fetchCompanyApplications } from '../../api/applicationsApi'

/* ── derive contextual notifications from real application data ─ */
function buildNotifs(apps, isCompany) {
  if (!Array.isArray(apps) || apps.length === 0) return []
  const notifs = []

  if (!isCompany) {
    // Professional view: notifications about status changes
    apps.forEach((app) => {
      const shift   = app.shift_request ?? app.shift ?? {}
      const company = shift.company?.name ?? shift.pharmacy_name ?? 'Una botica'
      const title   = shift.title ?? `Turno #${app.shift_request_id ?? app.id}`

      if (app.status === 'accepted' || app.status === 'confirmed') {
        notifs.push({
          id:         `app-${app.id}`,
          type:       'match_accepted',
          title:      'Match confirmado 🎉',
          body:       `${company} aceptó tu postulación · ${title}`,
          created_at: app.updated_at ?? app.created_at,
          read:       false,
          link:       `/app/match/${app.id}`,
        })
      } else if (app.status === 'rejected') {
        notifs.push({
          id:         `app-${app.id}`,
          type:       'shift_confirmed',
          title:      'Postulación no seleccionada',
          body:       `${company} seleccionó otro perfil para ${title}`,
          created_at: app.updated_at ?? app.created_at,
          read:       true,
          link:       '/app/postulaciones',
        })
      } else if (app.status === 'pending') {
        notifs.push({
          id:         `app-${app.id}`,
          type:       'review_pending',
          title:      'Postulación en revisión',
          body:       `${company} está revisando tu perfil · ${title}`,
          created_at: app.created_at,
          read:       true,
          link:       `/app/turnos/${app.shift_request_id ?? ''}`,
        })
      }
    })
  } else {
    // Company view: notifications about new applicants
    const pendingCount = apps.filter((a) => a.status === 'pending').length
    if (pendingCount > 0) {
      notifs.push({
        id:         'pending-count',
        type:       'new_applicant',
        title:      'Postulantes pendientes',
        body:       `${pendingCount} postulante${pendingCount !== 1 ? 's' : ''} esperando revisión`,
        created_at: apps.find((a) => a.status === 'pending')?.created_at ?? new Date().toISOString(),
        read:       false,
        link:       '/app/farmacia',
      })
    }
    apps.filter((a) => a.status === 'accepted' || a.status === 'confirmed').slice(0, 3).forEach((app) => {
      const w     = app.worker ?? app.professional ?? {}
      const shift = app.shift_request ?? app.shift ?? {}
      notifs.push({
        id:         `accepted-${app.id}`,
        type:       'shift_confirmed',
        title:      'Turno aceptado ✅',
        body:       `${w.name ?? 'Profesional'} confirmó ${shift.title ?? 'el turno'}`,
        created_at: app.updated_at ?? app.created_at,
        read:       true,
        link:       `/app/match/${app.id}`,
      })
    })
  }

  // Sort by created_at desc, cap at 6
  return notifs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)
}

const TYPE_CFG = {
  match_accepted:  { bg: '#DCFCE7', color: '#15803D', icon: '🤝' },
  new_applicant:   { bg: '#DBEAFE', color: '#1E40AF', icon: '👤' },
  shift_confirmed: { bg: '#DCFCE7', color: '#15803D', icon: '✅' },
  shift_reminder:  { bg: '#FEF3C7', color: '#92400E', icon: '⏰' },
  review_pending:  { bg: '#EDE9FE', color: '#5B21B6', icon: '⭐' },
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'Ahora'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export function NotificationsDropdown({ onClose }) {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const isCompany    = isCompanyAccount(user)
  const ref          = useRef(null)
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      // No /notifications endpoint — derive from real application data
      const res = isCompany
        ? await fetchCompanyApplications({ limit: 20 })
        : await fetchMyApplications()
      const raw  = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []
      setNotifs(buildNotifs(raw, isCompany))
    } catch {
      setNotifs([])
    } finally {
      setLoading(false)
    }
  }, [isCompany])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    function onKey(e)  { if (e.key === 'Escape') onClose() }
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [onClose])

  const unread = notifs.filter((n) => !n.read).length

  function handleRead(n) {
    setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
    if (n.link) { navigate(n.link); onClose() }
  }

  function handleReadAll() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-head">
        <div>
          <span className="notif-title">Notificaciones</span>
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </div>
        {unread > 0 && (
          <button className="notif-read-all" onClick={handleReadAll}>
            Marcar todo leído
          </button>
        )}
      </div>

      <div className="notif-list">
        {loading && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ft-fg-muted)', fontSize: 13 }}>
            Cargando…
          </div>
        )}
        {!loading && notifs.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <div style={{ fontSize: 13 }}>Sin notificaciones por ahora.</div>
          </div>
        )}
        {notifs.map((n) => {
          const cfg = TYPE_CFG[n.type] ?? { bg: '#F3F4F6', color: '#374151', icon: '•' }
          return (
            <button
              key={n.id}
              className={`notif-item${n.read ? '' : ' unread'}`}
              onClick={() => handleRead(n)}
            >
              <div className="notif-ico" style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.icon}
              </div>
              <div className="notif-body">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-body">{n.body}</div>
                <div className="notif-time">{relativeTime(n.created_at)}</div>
              </div>
              {!n.read && <div className="notif-unread-dot" />}
            </button>
          )
        })}
      </div>

      <div className="notif-foot">
        <button className="notif-foot-btn" onClick={() => { navigate('/app/notificaciones'); onClose() }}>
          Ver todas las notificaciones →
        </button>
      </div>
    </div>
  )
}

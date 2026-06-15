import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchChatMessages, sendChatMessage } from '../api/chatApi'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'

const POLLING_INTERVAL_MS = 5000

const IconArrow  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconSend   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconLock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

export function ChatPage() {
  const { applicationId } = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()

  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)

  const bottomRef = useRef(null)

  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchChatMessages(applicationId)
      setMessages(data.data ?? [])
      setError('')
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'No se pudo cargar el chat.'))
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    setLoading(true)
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    const id = setInterval(loadMessages, POLLING_INTERVAL_MS)
    return () => clearInterval(id)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const message = text.trim()
    if (!message) return
    setSending(true)
    try {
      await sendChatMessage(applicationId, { message })
      setText('')
      await loadMessages()
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'No se pudo enviar el mensaje.'))
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [messages],
  )

  return (
    <div className="ch-wrap">
      {/* Header */}
      <div className="ch-head">
        <button className="ch-back" onClick={() => navigate(`/app/match/${applicationId}`)}>
          <IconArrow /> Volver al match
        </button>
        <div className="ch-head-center">
          <div className="ch-head-title">Chat operativo</div>
          <div className="ch-head-sub">
            <IconLock /> Coordinación privada · Match #{applicationId}
          </div>
        </div>
        <div className="ch-head-status">
          <span className="ch-live-dot" />
          En vivo
        </div>
      </div>

      {/* Messages */}
      <div className="ch-msgs">
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ft-fg-muted)' }}>
            Cargando mensajes…
          </div>
        )}

        {!loading && sortedMessages.length === 0 && (
          <div className="ch-empty">
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin mensajes aún</div>
            <div style={{ fontSize: 13 }}>
              Este es un canal privado de coordinación. Solo pueden ver los mensajes tú y la otra parte del match.
            </div>
          </div>
        )}

        {sortedMessages.map((msg, i) => {
          const isMine    = msg.sender_user_id === user?.id
          const senderName = msg.sender?.name ?? (isMine ? (user?.name ?? 'Tú') : 'Otro')
          const prevMsg   = sortedMessages[i - 1]
          const showMeta  = !prevMsg || prevMsg.sender_user_id !== msg.sender_user_id

          return (
            <div key={msg.id} className={`ch-row${isMine ? ' mine' : ''}`}>
              {!isMine && showMeta && (
                <div className="ch-ava ch-ava-other">{initials(senderName)}</div>
              )}
              {!isMine && !showMeta && <div style={{ width: 32, flexShrink: 0 }} />}
              <div className="ch-bubble-col">
                {showMeta && (
                  <div className={`ch-bubble-meta${isMine ? ' mine' : ''}`}>
                    {isMine ? 'Tú' : senderName} · {formatTime(msg.created_at)}
                  </div>
                )}
                <div className={`ch-bubble${isMine ? ' mine' : ''}`}>
                  {msg.message}
                </div>
              </div>
              {isMine && showMeta && (
                <div className="ch-ava ch-ava-mine">{initials(user?.name)}</div>
              )}
              {isMine && !showMeta && <div style={{ width: 32, flexShrink: 0 }} />}
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="onb-error" style={{ margin: '0 20px 8px', flexShrink: 0 }}>{error}</div>
      )}

      {/* Input */}
      <form className="ch-form" onSubmit={handleSend}>
        <textarea
          className="ch-input"
          placeholder="Escribí tu mensaje… (Enter para enviar)"
          value={text}
          maxLength={2000}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="ch-send"
          disabled={sending || !text.trim()}
          aria-label="Enviar"
        >
          <IconSend />
        </button>
      </form>

      {/* Footer links */}
      <div className="ch-footer">
        <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => navigate(`/app/match/${applicationId}`)}>
          Ver match →
        </button>
        <button className="ft-btn ft-btn-outline ft-btn-sm" onClick={() => navigate('/app/postulaciones')}>
          Mis postulaciones
        </button>
      </div>
    </div>
  )
}

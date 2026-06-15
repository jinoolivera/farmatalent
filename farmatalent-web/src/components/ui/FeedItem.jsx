export function FeedItem({ icon, message, time, variant = 'success' }) {
  return (
    <div className="ft-feed-item">
      <div className={`ft-feed-icon ft-feed-icon-${variant}`}>{icon}</div>
      <div>
        <div className="ft-feed-text" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="ft-feed-time">{time}</div>
      </div>
    </div>
  )
}

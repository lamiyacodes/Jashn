export default function SiteHeader({ view, onEdit }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="#home" className="brand">
          Jashn
        </a>
        {view === 'plan' ? (
          <button type="button" className="top-btn" onClick={onEdit}>
            Edit details or plan another event
          </button>
        ) : (
          <span className="topbar-tag">Celebration and event planner</span>
        )}
      </div>
    </header>
  )
}

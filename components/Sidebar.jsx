'use client'

export default function Sidebar({ view, setView, username, lastSync, onSync, onLogout, syncing, theme, toggleTheme }) {
  const syncLabel = lastSync
    ? `Last synced: ${new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Last synced: Never'

  const nav = [
    {
      id: 'dashboard', label: 'Dashboard',
      icon: <><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>
    },
    {
      id: 'tracker', label: 'Revision Tracker',
      icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>
    },
    {
      id: 'profile', label: 'Profile',
      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
    },
    {
      id: 'settings', label: 'Settings',
      icon: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo" style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.4rem' }}>
          <img src="/logo.png" alt="ALGONEX" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span><span className="algo-white">ALGO</span><span className="nex-orange">NEX</span></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(item => (
          <button
            key={item.id}
            className={`nav-item${view === item.id ? ' active' : ''}`}
            onClick={() => setView(item.id)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="status-indicator online" />
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {username}
          </span>
        </div>

        <div className="sidebar-controls">
          <button
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <button
            onClick={onSync}
            className={`btn btn-outline btn-sm${syncing ? ' spinning' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            title="Sync Now"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>

          <button
            onClick={onLogout}
            className="btn btn-sm"
            style={{
              flex: 1, justifyContent: 'center',
              background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
            title="Log Out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
        <div className="sync-status">{syncLabel}</div>
      </div>
    </aside>
  )
}

'use client'
import { useState } from 'react'
import { showToast } from './Toast'

export default function Profile({ leetcodeId, algonexId, totalSolved, profileMeta, onSync, syncing, onChangePassword, onUpdateProfile }) {
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Edit states
  const [editAlgonexId, setEditAlgonexId] = useState(algonexId || '')
  const [editLeetcodeId, setEditLeetcodeId] = useState(leetcodeId || '')
  const [saving, setSaving] = useState(false)

  const handleUpdateIdentity = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onUpdateProfile(editAlgonexId, editLeetcodeId)
    setSaving(false)
  }

  const handleChangePwd = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const current = fd.get('current')
    const next = fd.get('next')
    const confirm = fd.get('confirm')
    onChangePassword(current, next, confirm)
    e.target.reset()
    setShowChangePwd(false)
  }

  const avatar = profileMeta?.userAvatar
  const realName = profileMeta?.realName
  const ranking = profileMeta?.ranking
  const reputation = profileMeta?.reputation

  return (
    <div className="view">
      <div className="welcome-header">
        <h1>My Profile</h1>
        <p>Your ALGONEX identity and LeetCode stats.</p>
      </div>

      {/* LeetCode Profile Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {/* Avatar */}
        <div style={{ marginBottom: '1rem' }}>
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar} alt="avatar"
              style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {realName || (syncing ? 'Fetching Profile…' : leetcodeId)}
        </div>
        <div style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>@{leetcodeId || algonexId}</div>

        {!syncing ? (
          <button
            className={`btn btn-sm ${profileMeta ? 'btn-outline' : 'btn-primary'}`}
            onClick={onSync}
            style={{ marginBottom: '1.5rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 11V5h5"/>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 13v6h-5"/>
            </svg>
            {profileMeta ? 'Update LeetCode Stats' : 'Fetch LeetCode Profile'}
          </button>
        ) : (
          <div style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div className="spinner-sm" /> Fetching latest data...
          </div>
        )}

        {/* Stats row */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <div className="profile-stat-value"
              style={{ color: ranking ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {ranking ? `#${ranking.toLocaleString()}` : '-'}
            </div>
            <div className="profile-stat-label">Global Rank</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-value" style={{ color: 'var(--secondary)' }}>
              {totalSolved > 0 ? totalSolved.toLocaleString() : '-'}
            </div>
            <div className="profile-stat-label">Total Solved</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-value"
              style={{ color: reputation ? 'var(--primary)' : 'var(--text-muted)' }}>
              {reputation !== undefined && reputation !== null ? reputation : '-'}
            </div>
            <div className="profile-stat-label">Reputation</div>
          </div>
        </div>
      </div>

      {/* Security & Account Section */}
      <div className="card">
        <div className="card-header">
          <h2>Security & Account</h2>
        </div>

        <form onSubmit={handleUpdateIdentity} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>ALGONEX ID (App Username)</label>
              <input 
                value={editAlgonexId} 
                onChange={(e) => setEditAlgonexId(e.target.value)}
                className="form-control"
                placeholder="Your app username"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>LeetCode ID (Connected Profile)</label>
              <input 
                value={editLeetcodeId} 
                onChange={(e) => setEditLeetcodeId(e.target.value)}
                className="form-control"
                placeholder="Linked LeetCode handle"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating...' : 'Save Changes'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          {!showChangePwd ? (
            <button className="btn btn-ghost" onClick={() => setShowChangePwd(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePwd} style={{ maxWidth: 400 }}>
              <div className="form-group row">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input name="current" type={showCurrent ? "text" : "password"} className="form-control" required />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? 'Visibility' : 'VisibilityOff'}
                  </button>
                </div>
              </div>
              <div className="form-group row">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input name="next" type={showNew ? "text" : "password"} className="form-control" required minLength={4} />
                  <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}>
                    {showNew ? 'Visibility' : 'VisibilityOff'}
                  </button>
                </div>
              </div>
              <div className="form-group row">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input name="confirm" type={showConfirm ? "text" : "password"} className="form-control" required minLength={4} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? 'Visibility' : 'VisibilityOff'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">Update Password</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowChangePwd(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

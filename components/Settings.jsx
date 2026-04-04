'use client'
import { useState } from 'react'
import HistoryImport from './HistoryImport'
import { showToast } from './Toast'

export default function Settings({
  username, intervals, dailyQuota, isRollOverEnabled,
  onSaveIntervals, onSaveQuota, onSaveRollOver, onChangeId, onImport
}) {
  const [intervalsText, setIntervalsText] = useState(intervals[0] || 1)
  const [quotaVal, setQuotaVal] = useState(dailyQuota)
  const [newId, setNewId] = useState('')

  const handleIntervals = (e) => {
    e.preventDefault()
    const val = parseInt(intervalsText)
    if (isNaN(val) || val < 1) { showToast('Please enter a valid number of days.', 'warning'); return }
    onSaveIntervals([val])
    showToast('Revision frequency updated!', 'success')
  }

  const handleQuota = (e) => {
    e.preventDefault()
    const q = parseInt(quotaVal)
    if (isNaN(q) || q < 1) { showToast('Quota must be at least 1.', 'warning'); return }
    onSaveQuota(q)
    showToast(`Daily quota set to ${q}.`, 'success')
  }

  const handleChangeId = (e) => {
    e.preventDefault()
    if (!newId.trim()) return
    onChangeId(newId.trim())
    setNewId('')
    showToast('LeetCode ID updated!', 'success')
  }

  return (
    <div className="view">
      <div className="welcome-header">
        <h1>Settings</h1>
        <p>Customize your revision schedule and account details.</p>
      </div>

      {/* Revision Frequency */}
      <div className="card">
        <div className="card-header">
          <h2>Revision Frequency</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Choose how often you want to revise each problem. For example, enter <strong>1</strong> for daily, <strong>2</strong> for every two days, and so on.
        </p>
        <form onSubmit={handleIntervals} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="number" min="1" max="365"
                className="form-control"
                style={{ width: 100 }}
                value={intervalsText}
                onChange={e => setIntervalsText(e.target.value)}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Days</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setIntervalsText(1); onSaveIntervals([1]) }}>Daily</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setIntervalsText(2); onSaveIntervals([2]) }}>Every 2 Days</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setIntervalsText(7); onSaveIntervals([7]) }}>Weekly</button>
        </div>
      </div>

      {/* Daily Quota & Roll-over */}
      <div className="card">
        <div className="card-header">
          <h2>Daily Revision Quota</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          How many problems to include each day. 
          {isRollOverEnabled ? ' Unfinished problems will roll-over to the next day.' : ' Unfinished problems are replaced each morning.'}
        </p>
        
        <form onSubmit={handleQuota} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Daily Limit</label>
            <input
              type="number" min="1" max="50"
              className="form-control" style={{ width: 120 }}
              value={quotaVal}
              onChange={e => setQuotaVal(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Set Quota</button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[3,5,10,15,20].map(n => (
                <button key={n} type="button" className="btn btn-ghost btn-sm"
                  onClick={() => setQuotaVal(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '1.5rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Roll-over Unfinished Tasks</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Stack previous unfinished revisions onto today's quota.
            </p>
          </div>
          <button 
            className={`btn ${isRollOverEnabled ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onSaveRollOver(!isRollOverEnabled)}
            style={{ minWidth: 100 }}
          >
            {isRollOverEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* LeetCode ID */}
      <div className="card">
        <div className="card-header">
          <h2>LeetCode ID</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Current: <strong style={{ color: 'var(--primary)' }}>{username}</strong>
        </p>
        <form onSubmit={handleChangeId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              className="form-control"
              placeholder="New LeetCode username"
              value={newId}
              onChange={e => setNewId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Update</button>
        </form>
      </div>

      {/* History Import */}
      <HistoryImport onImport={onImport} />
    </div>
  )
}

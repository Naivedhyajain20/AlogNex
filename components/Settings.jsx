'use client'
import { useState } from 'react'
import HistoryImport from './HistoryImport'
import { showToast } from './Toast'

export default function Settings({
  username, intervals, dailyQuota,
  onSaveIntervals, onSaveQuota, onChangeId, onImport
}) {
  const [intervalsText, setIntervalsText] = useState(intervals.join(', '))
  const [quotaVal, setQuotaVal] = useState(dailyQuota)
  const [newId, setNewId] = useState('')

  const handleIntervals = (e) => {
    e.preventDefault()
    const parsed = intervalsText.split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0)
      .sort((a, b) => a - b)
    if (parsed.length < 2) { showToast('Enter at least 2 intervals.', 'warning'); return }
    onSaveIntervals(parsed)
    showToast('Intervals updated!', 'success')
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

      {/* Spaced Repetition Intervals */}
      <div className="card">
        <div className="card-header">
          <h2>Spaced Repetition Intervals</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Comma-separated days between revisions (e.g. 1, 3, 7, 14, 30, 90, 180).
          Problems advance through these intervals each time you mark them solved.
        </p>
        <form onSubmit={handleIntervals} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              className="form-control"
              value={intervalsText}
              onChange={e => setIntervalsText(e.target.value)}
              placeholder="1, 3, 7, 14, 30, 90, 180"
            />
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {intervals.map((d, i) => (
            <span key={i} className="tag"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              {d}d
            </span>
          ))}
        </div>
      </div>

      {/* Daily Quota */}
      <div className="card">
        <div className="card-header">
          <h2>Daily Revision Quota</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          How many problems to include in each day's plan. Unsolved problems carry over.
        </p>
        <form onSubmit={handleQuota} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="number" min="1" max="50"
              className="form-control" style={{ width: 120 }}
              value={quotaVal}
              onChange={e => setQuotaVal(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Set Quota</button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[3,5,10,15,20].map(n => (
              <button key={n} type="button" className="btn btn-ghost btn-sm"
                onClick={() => setQuotaVal(n)}>
                {n}
              </button>
            ))}
          </div>
        </form>
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

'use client'
import { useState, useMemo } from 'react'
import ProblemCard from './ProblemCard'

export default function RevisionTracker({ problems, intervals, onSolve, onDelete, onAdd }) {
  const [filter, setFilter] = useState('all')   // 'all' | 'due' | 'easy' | 'medium' | 'hard'
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  const now = new Date()

  const filtered = useMemo(() => {
    return problems
      .filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        if (filter === 'due') return new Date(p.nextRevisionAt) <= now
        if (['easy','medium','hard'].includes(filter)) return p.difficulty === filter
        return true
      })
      .sort((a, b) => new Date(a.nextRevisionAt) - new Date(b.nextRevisionAt))
  }, [problems, filter, search, now])

  const handleAdd = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const title = fd.get('title').trim()
    const url = fd.get('url').trim()
    const difficulty = fd.get('difficulty')
    const intervalDays = parseInt(fd.get('interval'))
    if (!title) return
    // extract slug from URL or use title-slug
    const slug = url.includes('/problems/')
      ? url.split('/problems/')[1].replace(/\/$/, '')
      : title.toLowerCase().replace(/\s+/g, '-')
    onAdd(title, slug, new Date(), difficulty, intervalDays)
    e.target.reset()
    setShowAdd(false)
  }

  const filterBtns = [
    { key: 'all', label: 'All' },
    { key: 'due', label: '⚠ Due Now' },
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ]

  return (
    <div className="view">
      <div className="welcome-header">
        <h1>Revision Tracker</h1>
        <p>All your tracked problems with spaced-repetition scheduling.</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '350px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input 
            type="text"
            className="form-control"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '12px', height: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filterBtns.map(f => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f.key)}
              style={{ height: '38px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', height: '38px' }} onClick={() => setShowAdd(s => !s)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14"/><path d="M5 12h14"/>
          </svg>
          Add Problem
        </button>
      </div>

      {/* Add Problem Form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'var(--primary)' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '1rem' }}>Add New Problem</h2>
            <button className="btn btn-sm btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Problem Title *</label>
              <input name="title" className="form-control" placeholder="Two Sum" required />
            </div>
            <div className="form-group">
              <label>LeetCode URL</label>
              <input name="url" className="form-control" placeholder="https://leetcode.com/problems/two-sum/" />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select name="difficulty" className="form-control">
                <option value="easy">Easy</option>
                <option value="medium" defaultValue>Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>First Revision (days)</label>
              <select name="interval" className="form-control">
                {(intervals || [1,3,7,14,30]).map(d => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Add to Tracker</button>
            </div>
          </form>
        </div>
      )}

      {/* Problem List */}
      <div style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {filtered.length} of {problems.length} problems
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <p>{problems.length === 0
            ? 'No problems tracked yet. Click "Add Problem" or use Sync to import from LeetCode.'
            : 'No problems match your filter.'
          }</p>
        </div>
      ) : (
        <div className="problem-list">
          {filtered.map(p => (
            <ProblemCard
              key={p.id}
              problem={p}
              intervals={intervals}
              onSolve={onSolve}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

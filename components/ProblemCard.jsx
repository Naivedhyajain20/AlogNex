'use client'
import { formatDate } from '../hooks/useAppState'

export default function ProblemCard({ problem, onboardedAt, intervals, onSolve, onDelete, showSolve = true }) {
  const now = new Date()
  const isDue = new Date(problem.nextRevisionAt) <= now
  
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const joinDate = onboardedAt ? new Date(onboardedAt) : todayStart
  const isBacklog = new Date(problem.nextRevisionAt) < todayStart && new Date(problem.nextRevisionAt) >= joinDate

  // Calculate how long ago it was solved to show "Stack Age"
  const solvedDate = new Date(problem.solvedAt)
  const diffTime = Math.abs(now - solvedDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className={`problem-card shadow-hover ${isDue ? 'due' : ''}`}>
      <div className="problem-header" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`difficulty-badge ${problem.difficulty}`}>
          {problem.difficulty}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isBacklog && (
            <span className="tag" style={{ 
              background: 'rgba(255,161,22,0.1)', 
              color: 'var(--primary)', 
              fontSize: '0.7rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontWeight: '600',
              border: '1px solid rgba(255,161,22,0.2)'
            }}>
              Backlog
            </span>
          )}
          <span className="tag" style={{ 
            background: 'rgba(99,102,241,0.12)', 
            color: '#818cf8', 
            fontSize: '0.7rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontWeight: '600',
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            {problem.topic || 'General'}
          </span>
          {onDelete && (
            <button className="btn btn-sm btn-ghost" onClick={() => onDelete(problem.id)}
              style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
              title="Remove from tracker"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="problem-title" 
        style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
        {problem.title}
      </a>

      <div className="revision-stats" style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div className="stat-item" style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>First Solved:</span>
          <span style={{ fontWeight: 500 }}>{formatDate(problem.firstSolvedAt || problem.solvedAt)}</span>
        </div>
        <div className="stat-item" style={{ fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Last Revised:</span>
          <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{formatDate(problem.solvedAt)}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({diffDays}d ago)</span>
        </div>
      </div>

      <div className="problem-footer">
        <span className={`due-date ${isDue ? 'urgent' : 'safe'}`} style={{ fontSize: '0.85rem' }}>
          {isDue ? '⚠ Ready for Revision' : `Next: ${formatDate(problem.nextRevisionAt)}`}
        </span>
        {showSolve && onSolve && (
          <button className="btn btn-sm btn-primary" onClick={() => onSolve(problem.id)}
            style={{ padding: '0.4rem 1rem', borderRadius: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.4rem' }}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Complete
          </button>
        )}
      </div>
    </div>
  )
}

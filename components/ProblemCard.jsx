'use client'
import { formatDate } from '../hooks/useAppState'

export default function ProblemCard({ problem, intervals, onSolve, onDelete, showSolve = true }) {
  const now = new Date()
  const isDue = new Date(problem.nextRevisionAt) <= now
  const intervalDays = intervals?.[problem.intervalIndex] ?? '?'

  return (
    <div className={`problem-card${isDue ? ' due' : ''}`}>
      <div className="problem-header">
        <span className={`difficulty-badge ${problem.difficulty}`}>
          {problem.difficulty}
        </span>
        {onDelete && (
          <button className="btn btn-sm btn-ghost" onClick={() => onDelete(problem.id)}
            style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        )}
      </div>

      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="problem-title">
        {problem.title}
      </a>

      <div className="revision-stats">
        <div className="stat-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Solved: {formatDate(problem.solvedAt)}</span>
        </div>
        <div className="stat-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span>Interval: {intervalDays}d</span>
        </div>
      </div>

      <div className="problem-footer">
        <span className={`due-date ${isDue ? 'urgent' : 'safe'}`}>
          {isDue ? '⚠ Revision Due Now' : `Due: ${formatDate(problem.nextRevisionAt)}`}
        </span>
        {showSolve && onSolve && (
          <button className="btn btn-sm btn-primary" onClick={() => onSolve(problem.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Solve
          </button>
        )}
      </div>
    </div>
  )
}

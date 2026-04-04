'use client'
import { useState, useMemo } from 'react'
import ProblemCard from './ProblemCard'
import { DifficultyChart, ProductivityChart } from './Charts'
import HistoryImport from './HistoryImport'

function StatCard({ label, value, sub, iconColor, icon, valueStyle }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon ${iconColor}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
      </div>
      <div className="stat-value" style={valueStyle}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

export default function Dashboard({
  problems, activities, intervals, dailyPool,
  dailyQuota, onboardedAt, totalSolved, onSolve, onDelete, calculateDailyPlan, onImport,
  isLinked, onStartLink
}) {
  const [viewTopic, setViewTopic] = useState('All')
  const now = useMemo(() => new Date(), [])

  const uniqueTopics = useMemo(() => {
    const ts = new Set()
    problems.forEach(p => { if (p.topic) ts.add(p.topic) })
    return Array.from(ts).sort()
  }, [problems])

  const stats = useMemo(() => {
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    return {
      due: problems.filter(p => new Date(p.nextRevisionAt) <= now).length,
      upcoming: problems.filter(p => {
        const d = new Date(p.nextRevisionAt)
        return d > now && d <= tomorrow
      }).length,
    }
  }, [problems, now])

  const todayProblems = useMemo(() =>
    problems
      .filter(p => dailyPool.includes(p.id))
      .slice(0, dailyQuota), // 🏗️ SLIDING WINDOW: only show N at a time
    [problems, dailyPool, dailyQuota]
  )

  const backlogCount = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    // Smart Total Backlog: Count ALL missed since join date
    const joinDate = onboardedAt ? new Date(onboardedAt) : todayStart

    return problems.filter(p => 
      new Date(p.nextRevisionAt) < todayStart &&
      new Date(p.nextRevisionAt) >= joinDate
    ).length
  }, [problems, onboardedAt])

  const completedToday = useMemo(() => {
    const today = new Date().toDateString()
    return activities.filter(a => 
      a.action === 'Revision Done' && 
      new Date(a.timestamp).toDateString() === today
    ).length
  }, [activities])

  return (
    <div className="view">
      <div className="welcome-header">
        <h1>Dashboard</h1>
        <p>Track your progress and stay on top of your revision schedule.</p>
      </div>

      {/* Premium Link to LeetCode Hero Section */}
      {!isLinked && (
        <div className="link-hero-card">
          {/* Subtle Glow Effect */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'radial-gradient(circle, rgba(255,161,22,0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1.2rem', background: 'rgba(255,161,22,0.1)', 
              borderRadius: '50px', border: '1px solid rgba(255,161,22,0.3)',
              color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 2v20"/><path d="m5 15 7 7 7-7"/>
              </svg>
              Get Started
            </div>

            <h2>Your Coding Journey, Multiplied.</h2>
            
            <p>
              Connect your LeetCode profile to unlock AI-powered insights, automated revision scheduling, 
              and a personalized dashboard that grows with your skills.
            </p>

            <button 
              className="btn btn-primary" 
              onClick={onStartLink}
              id="link-leetcode-btn"
            >
              Link to LeetCode
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.75rem' }}>
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                Auto-Sync
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                Spaced Repetition
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                Data Privacy
              </span>
            </div>
          </div>
        </div>
      )}


      {/* History Import - Show only if no problems are tracked */}
      {problems.length === 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <HistoryImport onImport={onImport} />
        </div>
      )}

      {/* Stats Row */}
      <div className="stats-grid">
        <StatCard
          label="LeetCode Total" iconColor="purple"
          value={totalSolved > 0 ? totalSolved : '-'}
          sub="All-time on LeetCode"
          icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></>}
        />
        <StatCard
          label="In ALGONEX" iconColor="green"
          value={problems.length}
          sub="Tracked for revision"
          valueStyle={{ color: 'var(--secondary)' }}
          icon={<><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}
        />
        <StatCard
          label="Due for Revision" iconColor="amber"
          value={stats.due}
          sub="Needs your attention"
          icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
        />
        <StatCard
          label="Next 24h" iconColor="blue"
          value={stats.upcoming}
          sub="Upcoming revisions"
          icon={<>
            <path d="M5 22h14"/><path d="M5 2h14"/>
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
          </>}
        />
      </div>

      {/* Today's Plan */}
      <div className="card" style={{ 
        borderColor: 'var(--primary)', 
        boxShadow: '0 10px 25px -5px rgba(255,161,22,0.1), 0 8px 10px -6px rgba(255,161,22,0.1)' 
      }}>
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>Today's Plan</h2>
              <span className="tag" 
                title={backlogCount > 0 ? "Total missed revisions across all time" : "All caught up!"}
                style={{ 
                  border: 'none', 
                  background: backlogCount > 0 ? 'rgba(255,161,22,0.1)' : 'rgba(0,0,0,0.05)', 
                  color: backlogCount > 0 ? 'var(--primary)' : 'var(--text-muted)', 
                  fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                {backlogCount > 0 ? `📦 Backlog: ${backlogCount}` : `✅ Backlog: 0`}
              </span>
              {viewTopic !== 'All' && (
                <span className="tag" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                  🎯 Focusing: {viewTopic}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {dailyPool.length > dailyQuota && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                  Next up: {dailyPool.length - todayProblems.length} more
                </span>
              )}
              <span className="tag" style={{ background: 'rgba(255,161,22,0.1)', color: 'var(--primary)' }}>
                {completedToday}/{dailyQuota} Completed Today
              </span>
            </div>
          </div>

          {/* Topic Focus Selector */}
          <div className="topic-focus-bar" style={{ 
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap', 
            paddingTop: '0.25rem', paddingBottom: '0.25rem',
            width: '100%', alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '0 0 auto', marginRight: '0.5rem' }}>
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} 
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text"
                className="form-control"
                placeholder="Type topic to focus..."
                value={viewTopic === 'All' ? '' : viewTopic}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) setViewTopic('All')
                  else setViewTopic(val)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') calculateDailyPlan(true, viewTopic === 'All' ? null : viewTopic)
                }}
                onBlur={() => calculateDailyPlan(true, viewTopic === 'All' ? null : viewTopic)}
                style={{ 
                  paddingLeft: '32px', paddingRight: viewTopic !== 'All' ? '30px' : '10px',
                  borderRadius: '8px', height: '32px', 
                  fontSize: '0.8rem', width: '220px', background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border)', transition: 'all 0.2s'
                }}
              />
              {viewTopic !== 'All' && (
                <button 
                  onClick={() => { setViewTopic('All'); calculateDailyPlan(true, null) }}
                  style={{ 
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              )}
            </div>

            <button 
              className={`btn btn-xs ${viewTopic === 'All' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setViewTopic('All'); calculateDailyPlan(true, null) }}
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', height: '32px', borderRadius: '8px' }}
            >
              All Topics
            </button>
            
            <div style={{ display: 'flex', gap: '0.4rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem', overflowX: 'auto', paddingBottom: '2px' }}>
              {uniqueTopics.map(topic => (
                <button 
                  key={topic}
                  className={`btn btn-xs ${viewTopic === topic ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setViewTopic(topic); calculateDailyPlan(true, topic) }}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', height: '28px', whiteSpace: 'nowrap', borderRadius: '6px' }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {todayProblems.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>🎉 {viewTopic === 'All' ? "You're all caught up for now!" : `No more ${viewTopic} revisions right now.`}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {viewTopic !== 'All' ? 'Switch back to "All Topics" to see other due problems.' : 'You have completed your daily set. Take a break or keep going below!'}
            </p>
            
            {/* Manual Top-up Button */}
            {viewTopic === 'All' && problems.some(p => new Date(p.nextRevisionAt) <= new Date() && !dailyPool.includes(p.id)) && (
              <button 
                onClick={() => calculateDailyPlan(true, null, true)}
                className="btn btn-primary"
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(255,161,22,0.2)'
                }}
              >
                <span>🔥 Feeling productive? Get 5 more</span>
              </button>
            )}
          </div>
        ) : (
          <div className="problem-list">
            {todayProblems.map(p => (
              <ProblemCard
                key={p.id} problem={p} onboardedAt={onboardedAt} intervals={intervals}
                onSolve={onSolve} onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="dashboard-content">
        <div className="card chart-card">
          <div className="card-header">
            <h2>Productivity Volume</h2>
            <span className="tag">Last 14 Days</span>
          </div>
          <div className="chart-wrapper">
            <ProductivityChart problems={problems} activities={activities} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="card-header">
            <h2>Difficulty Distribution</h2>
            <span className="tag">{problems.length} Problems</span>
          </div>
          <div className="chart-wrapper">
            <DifficultyChart problems={problems} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Activity</h2>
        </div>
        {activities.length === 0 ? (
          <div className="empty-state"><p>No activity yet. Start solving!</p></div>
        ) : (
          <div className="activity-list">
            {activities.slice(0, 8).map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-icon"
                  style={{ background: a.type === 'secondary' ? 'rgba(44,187,93,0.15)' : 'rgba(99,102,241,0.15)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={a.type === 'secondary' ? 'var(--secondary)' : '#818cf8'} strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
                  </svg>
                </div>
                <div className="activity-info">
                  <h4>{a.action}</h4>
                  <p>{a.details} · {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

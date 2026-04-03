'use client'
import { useState, useEffect, useCallback } from 'react'
import Login from './Login'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import RevisionTracker from './RevisionTracker'
import Profile from './Profile'
import Settings from './Settings'
import ToastContainer, { useToast, showToast } from './Toast'
import { useAppState, makeProblem, advanceRevision, migrateData } from '../hooks/useAppState'
import SplashScreen from './SplashScreen'
import LinkingWizard from './LinkingWizard'
import { supabase } from '../lib/supabaseClient'

// localStorage helpers (raw strings, no JSON parse needed)
const ls = {
  get: (k, fb = '') => (typeof window !== 'undefined' ? localStorage.getItem(k) ?? fb : fb),
  set: (k, v) => { if (typeof window !== 'undefined') localStorage.setItem(k, v) },
}

export default function App() {
  const { toasts, add: addToast } = useToast()

  // ── Auth state ──
  const [authed, setAuthed]       = useState(false)
  const [username, setUsername]   = useState('')
  const [userId, setUserId]       = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [showLinkWizard, setShowLinkWizard] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  // Theme effect
  useEffect(() => {
    const savedTheme = ls.get('algonex_theme', 'dark')
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    ls.set('algonex_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }, [theme])

  // hydrate auth from Supabase on mount
  useEffect(() => {
    migrateData()
    const checkSession = async () => {
      if (!supabase) {
        setAuthReady(true)
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('algonex_id').eq('id', session.user.id).single()
        if (profile) {
          setUsername(profile.algonex_id)
          setUserId(session.user.id)
          setAuthed(true)
          if (!ls.get('algonex_current_view')) {
            setShowSplash(true)
          }
        }
      }
      const savedView = ls.get('algonex_current_view', 'dashboard')
      setView(savedView)
      setAuthReady(true)
    }
    checkSession()
  }, [])

  const handleSetView = useCallback((v) => {
    setView(v)
    ls.set('algonex_current_view', v)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
  }, [])

  const handleLogin = useCallback(async (user, email, pass, isSignUp) => {
    if (!supabase) {
      addToast('Deployment Error: Supabase URL/Key is missing in Vercel. Please check README.', 'error')
      return
    }

    if (isSignUp) {
      // 1. Sign Up (including metadata for our database trigger)
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
          data: { username: user }
        }
      })
      
      if (error) {
        addToast(error.message, 'error')
        return
      }

      // If session is null, it means email confirmation is ON
      if (!data.session) {
        addToast('Verification email sent! Please check your inbox and verify before logging in.', 'info')
        return
      }

      // If session is present, they were auto-logged in (email confirmation OFF)
      if (data.user) {
        setUsername(user)
        setUserId(data.user.id)
        setAuthed(true)
        addToast('Welcome to ALGONEX!', 'success')
      }
    } else {
      // 1. Resolve Identifier (Email or username)
      let loginEmail = email.trim()
      if (!loginEmail.includes('@')) {
        const { data: resolvedEmail, error: rpcErr } = await supabase
          .rpc('resolve_username_to_email', { target_id: loginEmail })
        
        if (rpcErr) {
          addToast(`Connection error: ${rpcErr.message}`, 'error')
          return
        }
        
        if (!resolvedEmail) {
          addToast(`Could not find account with ID: ${loginEmail}`, 'error')
          return
        }

        loginEmail = resolvedEmail
      }

      // 2. Sign In
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: pass })
      if (error) {
        addToast(error.message, 'error')
        return
      }
      
      // 3. Fetch Profile (with Auto-Repair)
      if (data.user) {
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('algonex_id, email')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profile) {
          // SILENT REPAIR: If email is missing in profile, link it now
          if (!profile.email) {
            await supabase.from('profiles').update({ email: data.user.email }).eq('id', data.user.id)
          }
          setUsername(profile.algonex_id)
          setUserId(data.user.id)
          setAuthed(true)
          addToast('Welcome back!', 'success')
        } else {
          // AUTO-REPAIR: If profile is missing, try to create it from metadata
          const metaUsername = data.user.user_metadata?.username
          if (metaUsername) {
            const { error: repairError } = await supabase.from('profiles').insert([
              { id: data.user.id, algonex_id: metaUsername, email: data.user.email }
            ])
            if (!repairError) {
              setUsername(metaUsername)
              setUserId(data.user.id)
              setAuthed(true)
              addToast('Profile repaired! Welcome back.', 'success')
              return
            }
          }
          addToast('Could not find associated ALGONEX profile. Please contact support.', 'error')
        }
      }
    }
  }, [addToast])

  const handleLogout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setAuthed(false)
    setUsername('')
    setUserId(null)
  }, [])

  const handleChangePassword = useCallback(async (current, next, confirm) => {
    if (next !== confirm) { addToast('Passwords do not match.', 'error'); return }
    if (!supabase) { addToast('Supabase Client not initialized.', 'error'); return }

    const { error } = await supabase.auth.updateUser({ password: next })
    
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Password updated!', 'success')
    }
  }, [addToast])

  // ── App state (problems, activities, etc.) ──
  const {
    ready, problems, activities,
    intervals, setIntervals,
    dailyQuota, setDailyQuota,
    dailyPool, calculateDailyPlan,
    totalSolved, setTotalSolved,
    profileMeta, setProfileMeta,
    lastSync, setLastSync,
    leetcodeUsername, setLeetcodeUsername,
    isLinked, setIsLinked,
    addProblem, solveRevision, deleteProblem,
    importProblems,
  } = useAppState(username, userId)

  // Trigger splash when authed changes to true
  useEffect(() => {
    if (ready && authed) {
      setShowSplash(true)
    }
  }, [authed, ready])

  // ── View routing ──
  const [view, setView] = useState('dashboard')

  // recalculate daily plan whenever problems change or view switches to dashboard
  useEffect(() => {
    if (ready && authed) calculateDailyPlan()
  }, [ready, authed, problems.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync ──
  const [syncing, setSyncing] = useState(false)

  const handleSync = useCallback(async () => {
    if (!isLinked || !leetcodeUsername) {
      addToast('Please link your LeetCode profile first.', 'warning'); return
    }
    setSyncing(true)
    addToast('Syncing with LeetCode…', 'info')
    try {
      const [profileRes, subRes] = await Promise.all([
        fetch(`/api/profile/${leetcodeUsername}`),
        fetch(`/api/submissions/${leetcodeUsername}`),
      ])

      // Profile
      const profileData = await profileRes.json()
      if (profileData.status === 'success') {
        if (profileData.totalSolved) {
          setTotalSolved(profileData.totalSolved)
        }
        if (profileData.profileMeta) setProfileMeta(profileData.profileMeta)
      }

      // Submissions — batch-collect, then apply in one state update
      const subData = await subRes.json()
      if (subData.status === 'success' && Array.isArray(subData.submission)) {
        let added = 0, revised = 0

        setProblems(currentProblems => {
          const updated = [...currentProblems]

          subData.submission.forEach(sub => {
            const subDate = new Date(parseInt(sub.timestamp) * 1000)
            const existingIdx = updated.findIndex(p => p.titleSlug === sub.titleSlug)

            if (existingIdx === -1) {
              // New problem — add it
              updated.push(makeProblem(sub.title, sub.titleSlug, subDate, 'medium', intervals))
              added++
            } else {
              // Existing problem — check if this is a new revision
              const existing = updated[existingIdx]
              const lastMs = new Date(existing.solvedAt).getTime()
              if (subDate.getTime() > lastMs + 3600000) {
                updated[existingIdx] = advanceRevision(existing, subDate, intervals)
                revised++
              }
            }
          })

          return updated
        })

        addToast(`Sync done: +${added} new, ${revised} revised.`, 'success')
      } else {
        addToast('Could not fetch submissions.', 'warning')
      }

      const now = new Date().toISOString()
      setLastSync(now)
      calculateDailyPlan(true)
    } catch (e) {
      console.error(e)
      addToast('Network error during sync.', 'error')
    } finally {
      setSyncing(false)
    }
  }, [leetcodeUsername, isLinked, intervals, setProblems, setTotalSolved, setProfileMeta,
      setLastSync, calculateDailyPlan, addToast])

  const handleAddProblem = useCallback((title, slug, date, difficulty) => {
    addProblem(title, slug, date, difficulty)
    addToast(`Added "${title}" to tracker.`, 'success')
  }, [addProblem, addToast])

  const handleSolveRevision = useCallback((id) => {
    solveRevision(id)
    addToast('Revision marked complete!', 'success')
    calculateDailyPlan()
  }, [solveRevision, calculateDailyPlan, addToast])

  const handleDeleteProblem = useCallback((id) => {
    deleteProblem(id)
    addToast('Problem removed from tracker.', 'info')
  }, [deleteProblem, addToast])

  const handleImport = useCallback((items) => {
    return importProblems(items)
  }, [importProblems])

  const handleChangeId = useCallback((newId) => {
    ls.set('algonex_id', newId)
    setUsername(newId)
  }, [])

  const handleSaveIntervals = useCallback((parsed) => {
    setIntervals(parsed)
  }, [setIntervals])

  const handleSaveQuota = useCallback((q) => {
    setDailyQuota(q)
  }, [setDailyQuota])

  const handleUpdateProfile = useCallback(async (newAlgonexId, newLeetcodeId) => {
    if (!supabase) { addToast('Supabase Client not initialized.', 'error'); return }
    const { error } = await supabase
      .from('profiles')
      .update({ algonex_id: newAlgonexId, leetcode_id: newLeetcodeId })
      .eq('id', userId)
    
    if (error) {
      addToast(error.message, 'error')
    } else {
      setUsername(newAlgonexId)
      setLeetcodeUsername(newLeetcodeId)
      setIsLinked(!!newLeetcodeId)
      addToast('Profile updated!', 'success')
    }
  }, [userId, addToast, setLeetcodeUsername, setIsLinked])

  // ── Render ──
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (!authReady) return null   // prevent flicker
  if (!authed) {
    return (
      <>
        <Login
          hasAccount={true}
          username={username}
          onLogin={handleLogin}
        />
        <ToastContainer toasts={toasts} />
      </>
    )
  }

  // Linking Wizard view
  if (showLinkWizard) {
    return (
      <>
        <LinkingWizard 
          onLink={async (id) => {
            const { error } = await supabase
              .from('profiles')
              .update({ leetcode_id: id })
              .eq('id', userId)
            
            if (error) {
              addToast(error.message, 'error')
            } else {
              setLeetcodeUsername(id);
              setIsLinked(true);
              setShowLinkWizard(false);
              setShowSplash(true);
            }
          }} 
        />
        <ToastContainer toasts={toasts} />
      </>
    )
  }

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.4)' }} 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <Sidebar
        view={view}
        setView={handleSetView}
        username={leetcodeUsername || username}
        lastSync={lastSync}
        onSync={handleSync}
        onLogout={handleLogout}
        syncing={syncing}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="content">
        {/* Top bar */}
        <header className="top-bar">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="actions">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {lastSync
                ? `Last synced: ${new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Last synced: Never'}
            </span>
            <button
              className={`btn btn-primary${syncing ? ' spinning' : ''}`}
              onClick={handleSync}
              id="sync-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
          </div>
        </header>

        {/* Views */}
        {view === 'dashboard' && (
          <Dashboard
            problems={problems}
            activities={activities}
            intervals={intervals}
            dailyPool={dailyPool}
            dailyQuota={dailyQuota}
            totalSolved={totalSolved}
            onSolve={handleSolveRevision}
            onDelete={handleDeleteProblem}
            calculateDailyPlan={calculateDailyPlan}
            onImport={handleImport}
            isLinked={isLinked}
            onStartLink={() => setShowLinkWizard(true)}
          />
        )}
        {view === 'tracker' && (
          <RevisionTracker
            problems={problems}
            intervals={intervals}
            onSolve={handleSolveRevision}
            onDelete={handleDeleteProblem}
            onAdd={handleAddProblem}
          />
        )}
        {view === 'profile' && (
          <Profile
            leetcodeId={leetcodeUsername}
            algonexId={username}
            totalSolved={totalSolved}
            profileMeta={profileMeta}
            onSync={handleSync}
            syncing={syncing}
            onChangePassword={handleChangePassword}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {view === 'settings' && (
          <Settings
            username={leetcodeUsername}
            intervals={intervals}
            dailyQuota={dailyQuota}
            onSaveIntervals={handleSaveIntervals}
            onSaveQuota={handleSaveQuota}
            onChangeId={(newId) => setLeetcodeUsername(newId)}
            onImport={handleImport}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

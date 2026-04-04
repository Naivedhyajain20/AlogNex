import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

// ──────────── localStorage helpers ────────────
const LS = {
  get: (key, fallback = null) => {
    if (typeof window === 'undefined') return fallback
    try {
      const v = localStorage.getItem(key)
      return v !== null ? JSON.parse(v) : fallback
    } catch { return fallback }
  },
  set: (key, val) => {
    if (typeof window !== 'undefined')
      localStorage.setItem(key, JSON.stringify(val))
  },
  getRaw: (key, fallback = '') => {
    if (typeof window === 'undefined') return fallback
    return localStorage.getItem(key) ?? fallback
  },
  setRaw: (key, val) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, val)
  },
}

const OLD_PREFIX = 'leetrack_'
const NEW_PREFIX = 'algonex_'

export function migrateData() {
  if (typeof window === 'undefined') return
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(OLD_PREFIX)) {
      const newKey = key.replace(OLD_PREFIX, NEW_PREFIX)
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, localStorage.getItem(key))
        // We keep the old keys for now just in case, but mark them as migrated
        localStorage.setItem(key + '_migrated', 'true')
      }
    }
  })

  // Migrate to multi-user format if algonex_id exists but algonex_users doesn't
  const legacyId = localStorage.getItem('algonex_id')
  const legacyPwd = localStorage.getItem('algonex_pwd')
  if (legacyId && !localStorage.getItem('algonex_users')) {
    localStorage.setItem('algonex_users', JSON.stringify({ [legacyId]: legacyPwd || '123' }))
    localStorage.setItem('algonex_active_user', legacyId)
    
    // Migrate all un-suffixed algonex_* data keys to be suffixed with _[legacyId]
    const dataKeys = ['algonex_problems', 'algonex_activities', 'algonex_custom_intervals', 
                      'algonex_daily_quota', 'algonex_daily_pool', 'algonex_daily_date', 
                      'algonex_manual_solved', 'algonex_profile_meta', 'algonex_last_sync', 
                      'algonex_leetcode_id', 'algonex_is_linked']
    dataKeys.forEach(k => {
      const val = localStorage.getItem(k)
      if (val !== null) {
        localStorage.setItem(`${k}_${legacyId}`, val)
        localStorage.removeItem(k) // Clean up old keys
      }
    })
  }
}

// ──────────── Problem Utilities ────────────
export function makeProblem(title, titleSlug, solvedDate, difficulty = 'medium', intervals = [1]) {
  const intervalDays = intervals[0] || 1
  const isoDate = solvedDate instanceof Date ? solvedDate.toISOString() : solvedDate
  const nextRevision = new Date(solvedDate)
  nextRevision.setDate(nextRevision.getDate() + intervalDays)
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    title,
    titleSlug,
    url: `https://leetcode.com/problems/${titleSlug}/`,
    difficulty: difficulty || 'medium',
    topic: 'General',
    firstSolvedAt: isoDate,
    solvedAt: isoDate,
    nextRevisionAt: nextRevision.toISOString(),
    intervalIndex: 0,
    status: 'upcoming',
  }
}

export function advanceRevision(problem, solvedDate = new Date(), intervals = [1]) {
  const nextDays = intervals[0] || 1
  const isoDate = solvedDate instanceof Date ? solvedDate.toISOString() : solvedDate
  const nextRevision = new Date(solvedDate)
  nextRevision.setDate(nextRevision.getDate() + nextDays)
  return {
    ...problem,
    intervalIndex: 0,
    solvedAt: isoDate,
    nextRevisionAt: nextRevision.toISOString(),
  }
}

export function formatDate(iso) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

// ──────────── Main App Hook ────────────
export function useAppState(activeUser, userId) {
  const [ready, setReady] = useState(false)
  const [problems, setProblems]     = useState([])
  const [activities, setActivities] = useState([])
  const [intervals, setIntervals]   = useState([1])
  const [dailyQuota, setDailyQuota] = useState(5)
  const [isRollOverEnabled, setIsRollOverEnabled] = useState(true)
  const [dailyPool, setDailyPool]   = useState([])
  const [dailyDate, setDailyDate]   = useState(null)
  const [totalSolved, setTotalSolved]   = useState(0)
  const [profileMeta, setProfileMeta]   = useState(null)
  const [lastSync, setLastSync]         = useState(null)
  const [leetcodeUsername, setLeetcodeUsername] = useState('')
  const [isLinked, setIsLinked] = useState(false)
  const [onboardedAt, setOnboardedAt] = useState(null)

  const saveTimeout = useRef(null)

  // hydrate from Supabase or localStorage on mount
  useEffect(() => {
    if (!activeUser || !userId) {
      setReady(false)
      return
    }

    const loadData = async () => {
      // 1. Try to get local cache first for speed
      const s = `_${activeUser}`
      const localState = {
        problems: LS.get(`algonex_problems${s}`, []),
        activities: LS.get(`algonex_activities${s}`, []),
        intervals: LS.get(`algonex_custom_intervals${s}`, [1]),
        dailyQuota: Number(LS.getRaw(`algonex_daily_quota${s}`, '5')),
        dailyPool: LS.get(`algonex_daily_pool${s}`, []),
        dailyDate: LS.getRaw(`algonex_daily_date${s}`, null),
        totalSolved: Number(LS.getRaw(`algonex_manual_solved${s}`, '0')),
        profileMeta: LS.get(`algonex_profile_meta${s}`, null),
        lastSync: LS.getRaw(`algonex_last_sync${s}`, null),
        leetcodeUsername: LS.getRaw(`algonex_leetcode_id${s}`, ''),
        isLinked: LS.getRaw(`algonex_is_linked${s}`, 'false') === 'true',
        isRollOverEnabled: LS.get(`algonex_rollover${s}`, true),
        onboardedAt: LS.getRaw(`algonex_onboarded_at${s}`, null)
      }

      // 2. Fetch from Supabase
      if (!supabase) {
        setReady(true)
        return
      }

      const { data, error } = await supabase
        .from('app_data')
        .select('app_state')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Supabase state:', error)
      }

      const cloudState = data?.app_state

      // 3. Merge or Prefer Cloud
      const final = cloudState || localState

      setProblems(final.problems || [])
      setActivities(final.activities || [])
      setIntervals(final.intervals || [1])
      setDailyQuota(final.dailyQuota || 5)
      setDailyPool(final.dailyPool || [])
      setDailyDate(final.dailyDate)
      setTotalSolved(final.totalSolved || 0)
      setProfileMeta(final.profileMeta)
      setLastSync(final.lastSync)
      setLeetcodeUsername(final.leetcodeUsername || '')
      setIsLinked(final.isLinked || false)
      setIsRollOverEnabled(final.isRollOverEnabled ?? true)

      if (final.onboardedAt) {
        setOnboardedAt(final.onboardedAt)
      } else {
        const joined = new Date().toISOString()
        setOnboardedAt(joined)
        LS.setRaw(`algonex_onboarded_at${s}`, joined)
      }

      setReady(true)

      // 4. Update local cache with what we got from cloud
      if (cloudState) {
        LS.set(`algonex_problems${s}`, cloudState.problems)
        // ... etc (could update others too)
      }
    }

    loadData()
  }, [activeUser, userId])

  // Persist roll-over setting to local storage immediately
  useEffect(() => {
    if (ready && activeUser) {
      LS.set(`algonex_rollover_${activeUser}`, isRollOverEnabled)
    }
  }, [isRollOverEnabled, ready, activeUser])

  // persist to Supabase (debounced)
  useEffect(() => {
    if (!ready || !userId) return

    if (saveTimeout.current) clearTimeout(saveTimeout.current)

    saveTimeout.current = setTimeout(async () => {
      const stateToSave = {
        problems, activities, intervals, dailyQuota,
        dailyPool, dailyDate, totalSolved, profileMeta,
        lastSync, leetcodeUsername, isLinked,
        isRollOverEnabled, onboardedAt
      }

      // Update local storage for offline availability
      const s = `_${activeUser}`
      LS.set(`algonex_problems${s}`, problems)
      LS.set(`algonex_activities${s}`, activities)
      LS.set(`algonex_custom_intervals${s}`, intervals)
      LS.setRaw(`algonex_daily_quota${s}`, String(dailyQuota))
      LS.set(`algonex_daily_pool${s}`, dailyPool)
      LS.setRaw(`algonex_daily_date${s}`, dailyDate || '')
      LS.setRaw(`algonex_manual_solved${s}`, String(totalSolved))
      LS.set(`algonex_profile_meta${s}`, profileMeta)
      LS.setRaw(`algonex_last_sync${s}`, lastSync || '')
      LS.setRaw(`algonex_leetcode_id${s}`, leetcodeUsername)
      LS.setRaw(`algonex_is_linked${s}`, String(isLinked))
      LS.set(`algonex_rollover${s}`, isRollOverEnabled)
      LS.setRaw(`algonex_onboarded_at${s}`, onboardedAt || '')

      // Upload to cloud
      if (!supabase) return

      const { error } = await supabase
        .from('app_data')
        .upsert({ 
          user_id: userId, 
          app_state: stateToSave, 
          updated_at: new Date().toISOString() 
        })
      
      if (error) console.error("Cloud save failed:", error)
    }, 2000)

    return () => clearTimeout(saveTimeout.current)
  }, [problems, activities, intervals, profileMeta, leetcodeUsername, isLinked, 
      dailyQuota, dailyPool, dailyDate, totalSolved, lastSync, isRollOverEnabled,
      ready, userId, activeUser])

  const logActivity = useCallback((action, details, type = 'info', timestamp = new Date().toISOString()) => {
    const entry = { id: Date.now() + Math.random(), action, details, type, timestamp }
    setActivities(prev => [entry, ...prev].slice(0, 200))
  }, [])

  const addProblem = useCallback((title, titleSlug, solvedDate, difficulty, topic = 'General') => {
    const p = makeProblem(title, titleSlug, solvedDate, difficulty, intervals)
    p.topic = topic
    setProblems(prev => [...prev, p])
    const isoDate = solvedDate instanceof Date ? solvedDate.toISOString() : solvedDate
    logActivity('Added Problem', `Started tracking "${title}"`, 'purple', isoDate)
    return p
  }, [intervals, logActivity])

  const solveRevision = useCallback((id, solvedDate = new Date()) => {
    setProblems(prev => prev.map(p =>
      p.id === id ? advanceRevision(p, solvedDate, intervals) : p
    ))
    // Immediately remove from the daily pool so the UI updates instantly
    setDailyPool(prev => prev.filter(pId => pId !== id))
    
    setActivities(prev => {
      const prob = problems.find(p => p.id === id)
      const entry = { id: Date.now() + Math.random(), action: 'Revision Done', details: `Re-attempted "${prob?.title}"`, type: 'secondary', timestamp: solvedDate.toISOString() }
      return [entry, ...prev].slice(0, 200)
    })
  }, [intervals, problems])

  const deleteProblem = useCallback((id) => {
    setProblems(prev => prev.filter(p => p.id !== id))
  }, [])

  const saveSettings = useCallback(({ newIntervals, newQuota, newId, onIdChange }) => {
    if (newIntervals) {
      setIntervals(newIntervals)
      LS.set(`algonex_custom_intervals_${activeUser}`, newIntervals)
    }
    if (newQuota) {
      setDailyQuota(newQuota)
      LS.setRaw(`algonex_daily_quota_${activeUser}`, String(newQuota))
    }
    if (newId && onIdChange) onIdChange(newId)
  }, [activeUser])

  const calculateDailyPlan = useCallback((forceTopUp = false, focusTopic = null, isManual = false) => {
    const todayStr = new Date().toDateString()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    // 💡 Synchronous check for "New Day" to avoid React state latency
    const lastDate = LS.getRaw(`algonex_daily_date_${activeUser}`, '')
    const isActuallyNewDay = lastDate !== todayStr
    
    // 1. Filtration — Remove problems no longer due
    let pool = dailyPool.filter(id => {
      const p = problems.find(pr => pr.id === id)
      if (!p) return false
      const isDue = new Date(p.nextRevisionAt) <= new Date()
      if (focusTopic) return p.topic === focusTopic && isDue
      return isDue
    })

    // Safety Cleanup: Ensure roll-over cap or daily quota cap
    const MAX_POOL_CAP = 2000 
    if (!isRollOverEnabled || pool.length > MAX_POOL_CAP) {
      pool = pool.slice(0, isRollOverEnabled ? MAX_POOL_CAP : dailyQuota)
    }

    // 2. Refilling Logic — Smart Refill based on backlog vs today
    if (isActuallyNewDay || forceTopUp || isManual) {
      // Find ALL overdue problems not currently in pool
      let allDue = problems
        .filter(p => !pool.includes(p.id))
        .filter(p => new Date(p.nextRevisionAt) <= new Date())
      
      if (focusTopic) allDue = allDue.filter(p => p.topic === focusTopic)

      // Sort by solvedAt (Oldest First)
      allDue.sort((a, b) => new Date(a.solvedAt) - new Date(b.solvedAt))

      // Categorize: Backlog (missed before today) vs Fresh (due today)
      // Note: We use onboardedAt to avoid counting historical imports as backlog
      const joinDate = onboardedAt ? new Date(onboardedAt) : todayStart
      const backlogItems = allDue.filter(p => new Date(p.nextRevisionAt) < todayStart && new Date(p.nextRevisionAt) >= joinDate)
      const freshItems = allDue.filter(p => new Date(p.nextRevisionAt) >= todayStart || new Date(p.nextRevisionAt) < joinDate)

      // 🔄 Refill Strategy: 
      // 1. Always refill from BACKLOG (Sliding Window catch-up)
      // 2. Only refill from FRESH if it's a NEW DAY or a MANUAL REQUEST
      while (pool.length < dailyQuota) {
        if (backlogItems.length > 0) {
          pool.push(backlogItems.shift().id)
        } else if ((isActuallyNewDay || isManual) && freshItems.length > 0) {
          pool.push(freshItems.shift().id)
        } else {
          break; // Stop here if no backlog and already filled today's set
        }
      }

      // If it's a New Day additive roll-over (and NOT a manual refill)
      if (isActuallyNewDay && isRollOverEnabled && !forceTopUp && !isManual) {
        // Just ensure we added our daily quota's worth of *new* items if possible
        // (Handled by the while loop above)
      }
      
      // Update the "Last Refilled" date
      if (!focusTopic && (isActuallyNewDay || isManual)) {
        setDailyDate(todayStr)
        LS.setRaw(`algonex_daily_date_${activeUser}`, todayStr)
      }
    }

    if (pool.length > MAX_POOL_CAP) pool = pool.slice(0, MAX_POOL_CAP)

    setDailyPool(pool)
    LS.set(`algonex_daily_pool_${activeUser}`, pool)
    return pool
  }, [problems, dailyPool, dailyQuota, isRollOverEnabled, onboardedAt, activeUser])

  const importProblems = useCallback((items) => {
    const now = new Date()
    let added = 0
    setProblems(prev => {
      const next = [...prev]
      items.forEach(sub => {
        const exists = next.find(p => p.titleSlug === sub.titleSlug)
        if (!exists) {
          const offset = 1 + Math.floor(Math.random() * 14)
          const fakeDate = new Date(now.getTime() - offset * 86400000)
          next.push(makeProblem(sub.title, sub.titleSlug, fakeDate, sub.difficulty, intervals))
          logActivity('Historical Solve', `Imported "${sub.title}"`, 'purple', fakeDate.toISOString())
          added++
        }
      })
      return next
    })
    logActivity('Import', `Imported ${added} historical problems`, 'purple')
    return added
  }, [intervals, logActivity])

  return {
    ready,
    problems, setProblems,
    activities,
    intervals, setIntervals,
    dailyQuota, setDailyQuota,
    dailyPool, dailyDate,
    totalSolved, setTotalSolved,
    profileMeta, setProfileMeta,
    lastSync, setLastSync,
    leetcodeUsername, setLeetcodeUsername,
    isLinked, setIsLinked,
    logActivity,
    addProblem,
    solveRevision,
    deleteProblem,
    saveSettings,
    isRollOverEnabled, setIsRollOverEnabled,
    onboardedAt,
    calculateDailyPlan,
    importProblems,
  }
}

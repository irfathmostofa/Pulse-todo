import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { toISODate } from '../lib/dateUtils'
import {
  POMODORO_PRESETS,
  POMODORO_LABELS,
  SESSIONS_BEFORE_LONG_BREAK
} from '../lib/constants'

const STORAGE_KEY = 'pulse_pomodoro_durations'

function loadDurations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...POMODORO_PRESETS }
    return { ...POMODORO_PRESETS, ...JSON.parse(raw) }
  } catch {
    return { ...POMODORO_PRESETS }
  }
}

export function usePomodoro({ notify } = {}) {
  const [durations, setDurations] = useState(loadDurations)
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(durations.focus * 60)
  const [running, setRunning] = useState(false)
  const [sessionIndex, setSessionIndex] = useState(1)
  const [todaySessions, setTodaySessions] = useState(0)
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0)
  const [monthSessions, setMonthSessions] = useState(0)

  const intervalRef = useRef(null)

  const fetchStats = useCallback(async () => {
    const todayISO = toISODate(new Date())
    const monthStartISO = toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

    const { data: todayRows } = await supabase
      .from('pomodoro_sessions')
      .select('type, duration_minutes')
      .eq('date', todayISO)

    if (todayRows) {
      const focusRows = todayRows.filter((r) => r.type === 'focus')
      setTodaySessions(focusRows.length)
      setTodayFocusSeconds(focusRows.reduce((sum, r) => sum + r.duration_minutes * 60, 0))
    }

    const { count } = await supabase
      .from('pomodoro_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'focus')
      .gte('date', monthStartISO)

    setMonthSessions(count || 0)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(durations))
  }, [durations])

  // Reset the clock whenever mode or its configured duration changes, unless mid-run
  useEffect(() => {
    if (!running) {
      setSecondsLeft(durations[mode] * 60)
    }
  }, [mode, durations, running])

  const logSession = useCallback(
    async (finishedMode) => {
      const todayISO = toISODate(new Date())
      await supabase.from('pomodoro_sessions').insert({
        date: todayISO,
        type: finishedMode,
        duration_minutes: durations[finishedMode],
        completed: true
      })
      fetchStats()
    },
    [durations, fetchStats]
  )

  const advanceMode = useCallback(
    (finishedMode) => {
      if (finishedMode === 'focus') {
        const nextIsLong = sessionIndex % SESSIONS_BEFORE_LONG_BREAK === 0
        const nextMode = nextIsLong ? 'long_break' : 'short_break'
        notify?.(`${POMODORO_LABELS.focus} complete`, {
          body: `Nice work. Next up: ${POMODORO_LABELS[nextMode]}.`
        })
        setMode(nextMode)
      } else {
        notify?.(`${POMODORO_LABELS[finishedMode]} over`, {
          body: 'Back to focus when you\u2019re ready.'
        })
        setSessionIndex((i) => (finishedMode === 'long_break' ? 1 : i + 1))
        setMode('focus')
      }
    },
    [sessionIndex, notify]
  )

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          const finishedMode = mode
          logSession(finishedMode)
          advanceMode(finishedMode)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    setSecondsLeft(durations[mode] * 60)
  }, [durations, mode])

  const switchMode = useCallback((nextMode) => {
    setRunning(false)
    setMode(nextMode)
  }, [])

  const setCustomDuration = useCallback((targetMode, minutes) => {
    setDurations((prev) => ({ ...prev, [targetMode]: minutes }))
  }, [])

  return {
    mode,
    durations,
    secondsLeft,
    running,
    sessionIndex,
    todaySessions,
    todayFocusSeconds,
    monthSessions,
    start,
    pause,
    reset,
    switchMode,
    setCustomDuration
  }
}

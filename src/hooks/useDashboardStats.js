import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { toISODate, getMonthDays } from '../lib/dateUtils'
import { MOODS } from '../lib/constants'

function nearestMoodEmoji(avgScore) {
  if (!avgScore) return '—'
  let closest = MOODS[0]
  let closestDiff = Infinity
  for (const m of MOODS) {
    const diff = Math.abs(m.score - avgScore)
    if (diff < closestDiff) {
      closest = m
      closestDiff = diff
    }
  }
  return closest.emoji
}

export function useDashboardStats(monthDate) {
  const [loading, setLoading] = useState(true)
  const [dailyActivity, setDailyActivity] = useState({}) // iso -> { completed, pending, pomodoro, total }
  const [monthTasks, setMonthTasks] = useState([])
  const [summary, setSummary] = useState({
    tasksCompleted: 0,
    tasksPending: 0,
    pomodoroSessions: 0,
    avgMoodEmoji: '—',
    completionRate: 0,
    activeDays: 0
  })

  const load = useCallback(async () => {
    setLoading(true)
    const monthDays = getMonthDays(monthDate)
    const monthStartISO = toISODate(monthDays[0])
    const monthEndISO = toISODate(monthDays[monthDays.length - 1])

    const [{ data: tasks }, { data: sessions }, { data: moods }] = await Promise.all([
      supabase
        .from('tasks')
        .select('date, status, title, type')
        .gte('date', monthStartISO)
        .lte('date', monthEndISO)
        .order('date', { ascending: false }),
      supabase
        .from('pomodoro_sessions')
        .select('date, type')
        .eq('type', 'focus')
        .gte('date', monthStartISO)
        .lte('date', monthEndISO),
      supabase.from('mood_entries').select('date, mood').gte('date', monthStartISO).lte('date', monthEndISO)
    ])

    const activity = {}
    for (const day of monthDays) {
      activity[toISODate(day)] = { completed: 0, pending: 0, pomodoro: 0, total: 0 }
    }

    let tasksCompleted = 0
    let tasksPending = 0
    ;(tasks || []).forEach((t) => {
      if (!activity[t.date]) activity[t.date] = { completed: 0, pending: 0, pomodoro: 0, total: 0 }
      if (t.status === 'done') {
        activity[t.date].completed += 1
        tasksCompleted += 1
      } else {
        activity[t.date].pending += 1
        tasksPending += 1
      }
    })

    let pomodoroSessions = 0
    ;(sessions || []).forEach((s) => {
      if (!activity[s.date]) activity[s.date] = { completed: 0, pending: 0, pomodoro: 0, total: 0 }
      activity[s.date].pomodoro += 1
      pomodoroSessions += 1
    })

    Object.values(activity).forEach((day) => {
      day.total = day.completed + day.pomodoro
    })

    const moodScoreMap = Object.fromEntries(MOODS.map((m) => [m.value, m.score]))
    const moodScores = (moods || []).map((m) => moodScoreMap[m.mood]).filter(Boolean)
    const avgMoodScore = moodScores.length
      ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
      : 0

    const activeDays = Object.values(activity).filter((d) => d.total > 0).length
    const totalTasks = tasksCompleted + tasksPending
    const completionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

    setDailyActivity(activity)
    setMonthTasks(tasks || [])
    setSummary({
      tasksCompleted,
      tasksPending,
      pomodoroSessions,
      avgMoodEmoji: nearestMoodEmoji(avgMoodScore),
      completionRate,
      activeDays
    })
    setLoading(false)
  }, [monthDate])

  useEffect(() => {
    load()
  }, [load])

  return { dailyActivity, monthTasks, summary, loading, refetch: load }
}

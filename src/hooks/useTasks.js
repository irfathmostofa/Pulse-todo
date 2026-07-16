import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { TASK_TYPES } from '../lib/constants'

export function useTasks(dateISO) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    // 1. Make sure every still-active recurring template has an instance for this date.
    // Templates flip to inactive once completed, so they stop generating new days.
    const { data: templates, error: templatesErr } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('active', true)

    if (templatesErr) {
      setError(templatesErr.message)
      setLoading(false)
      return
    }

    const { data: existing, error: existingErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', dateISO)
      .order('priority', { ascending: true })

    if (existingErr) {
      setError(existingErr.message)
      setLoading(false)
      return
    }

    const existingRecurringIds = new Set(
      existing.filter((t) => t.recurring_id).map((t) => t.recurring_id)
    )
    const missing = (templates || []).filter((t) => !existingRecurringIds.has(t.id))

    let merged = existing
    if (missing.length > 0) {
      const startPriority = existing.length
      const inserts = missing.map((tpl, idx) => ({
        date: dateISO,
        title: tpl.title,
        type: TASK_TYPES.RECURRING,
        recurring_id: tpl.id,
        status: 'pending',
        priority: startPriority + idx
      }))
      const { data: inserted, error: insertErr } = await supabase
        .from('tasks')
        .insert(inserts)
        .select()

      if (insertErr) {
        setError(insertErr.message)
      } else {
        merged = [...existing, ...inserted]
      }
    }

    merged.sort((a, b) => a.priority - b.priority)
    setTasks(merged)
    setLoading(false)
  }, [dateISO])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = useCallback(
    async (title, type = TASK_TYPES.NEW) => {
      const trimmed = title.trim()
      if (!trimmed) return

      const nextPriority = tasks.length

      if (type === TASK_TYPES.RECURRING) {
        const { data: template, error: tplErr } = await supabase
          .from('recurring_tasks')
          .insert({ title: trimmed, active: true })
          .select()
          .single()

        if (tplErr) {
          setError(tplErr.message)
          return
        }

        const { data: instance, error: instErr } = await supabase
          .from('tasks')
          .insert({
            date: dateISO,
            title: trimmed,
            type: TASK_TYPES.RECURRING,
            recurring_id: template.id,
            status: 'pending',
            priority: nextPriority
          })
          .select()
          .single()

        if (instErr) {
          setError(instErr.message)
          return
        }
        setTasks((prev) => [...prev, instance])
        return
      }

      const { data, error: insErr } = await supabase
        .from('tasks')
        .insert({
          date: dateISO,
          title: trimmed,
          type: TASK_TYPES.NEW,
          status: 'pending',
          priority: nextPriority
        })
        .select()
        .single()

      if (insErr) {
        setError(insErr.message)
        return
      }
      setTasks((prev) => [...prev, data])
    },
    [dateISO, tasks.length]
  )

  // Recurring tasks share ONE completion state across every day they appear on:
  // finishing it anywhere marks it done everywhere (past and future instances)
  // and stops it from recurring tomorrow. Un-completing it brings it back.
  const toggleComplete = useCallback(async (task) => {
    const nextStatus = task.status === 'done' ? 'pending' : 'done'
    const completedAt = nextStatus === 'done' ? new Date().toISOString() : null

    if (task.type === TASK_TYPES.RECURRING && task.recurring_id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.recurring_id === task.recurring_id
            ? { ...t, status: nextStatus, completed_at: completedAt }
            : t
        )
      )

      const [{ error: updErr }, { error: activeErr }] = await Promise.all([
        supabase
          .from('tasks')
          .update({ status: nextStatus, completed_at: completedAt })
          .eq('recurring_id', task.recurring_id),
        supabase
          .from('recurring_tasks')
          .update({ active: nextStatus !== 'done' })
          .eq('id', task.recurring_id)
      ])

      if (updErr) setError(updErr.message)
      if (activeErr) setError(activeErr.message)
      return
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, completed_at: completedAt } : t))
    )

    const { error: updErr } = await supabase
      .from('tasks')
      .update({ status: nextStatus, completed_at: completedAt })
      .eq('id', task.id)

    if (updErr) setError(updErr.message)
  }, [])

  // Turns an existing one-time task into a recurring one: creates the
  // template from its title, then re-tags this row to point at it. Future
  // days will pick it up automatically via loadTasks.
  const convertToRecurring = useCallback(async (task) => {
    if (task.type === TASK_TYPES.RECURRING) return

    const { data: template, error: tplErr } = await supabase
      .from('recurring_tasks')
      .insert({ title: task.title, active: true })
      .select()
      .single()

    if (tplErr) {
      setError(tplErr.message)
      return
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, type: TASK_TYPES.RECURRING, recurring_id: template.id } : t
      )
    )

    const { error: updErr } = await supabase
      .from('tasks')
      .update({ type: TASK_TYPES.RECURRING, recurring_id: template.id })
      .eq('id', task.id)

    if (updErr) setError(updErr.message)
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    const { error: delErr } = await supabase.from('tasks').delete().eq('id', taskId)
    if (delErr) setError(delErr.message)
  }, [])

  // Deletes the recurring template, which cascades and removes every day's
  // instance of it (past and future) via the FK "on delete cascade".
  const deleteRecurring = useCallback(async (recurringId) => {
    setTasks((prev) => prev.filter((t) => t.recurring_id !== recurringId))
    const { error: delErr } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', recurringId)
    if (delErr) setError(delErr.message)
  }, [])

  const reorder = useCallback(async (orderedIds) => {
    setTasks((prev) => {
      const byId = Object.fromEntries(prev.map((t) => [t.id, t]))
      return orderedIds.map((id, idx) => ({ ...byId[id], priority: idx }))
    })

    const updates = orderedIds.map((id, idx) =>
      supabase.from('tasks').update({ priority: idx }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed) setError(failed.error.message)
  }, [])

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleComplete,
    deleteTask,
    deleteRecurring,
    convertToRecurring,
    reorder,
    refetch: loadTasks
  }
}

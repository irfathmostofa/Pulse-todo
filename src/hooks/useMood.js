import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useMood(dateISO) {
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchMood = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('date', dateISO)
      .maybeSingle()

    if (fetchErr) {
      console.error('Failed to load mood:', fetchErr.message)
      setError(fetchErr.message)
    }
    setMood(data ?? null)
    setLoading(false)
  }, [dateISO])

  useEffect(() => {
    fetchMood()
  }, [fetchMood])

  const setTodayMood = useCallback(
    async (value) => {
      setSubmitting(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const message = 'Not signed in — mood was not saved.'
        console.error(message)
        setError(message)
        setSubmitting(false)
        return
      }

      const { data, error: upsertErr } = await supabase
        .from('mood_entries')
        .upsert(
          { date: dateISO, mood: value, user_id: user.id },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single()

      setSubmitting(false)

      if (upsertErr) {
        console.error('Failed to save mood:', upsertErr.message)
        setError(upsertErr.message)
        return
      }
      setMood(data)
    },
    [dateISO]
  )

  return { mood, loading, submitting, error, setTodayMood, refetch: fetchMood }
}

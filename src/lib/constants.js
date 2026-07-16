export const MOODS = [
  { value: 'energetic', emoji: '⚡', label: 'Energetic', score: 5 },
  { value: 'happy', emoji: '😊', label: 'Happy', score: 4 },
  { value: 'neutral', emoji: '😐', label: 'Neutral', score: 3 },
  { value: 'tired', emoji: '😴', label: 'Tired', score: 2 },
  { value: 'stressed', emoji: '😩', label: 'Stressed', score: 1 }
]

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]))

export const TASK_TYPES = {
  NEW: 'new',
  RECURRING: 'recurring'
}

export const POMODORO_PRESETS = {
  focus: 25,
  short_break: 5,
  long_break: 15
}

export const POMODORO_LABELS = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break'
}

export const SESSIONS_BEFORE_LONG_BREAK = 4

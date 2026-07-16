import { useState } from 'react'
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react'
import { usePomodoro } from '../hooks/usePomodoro'
import { useNotifications } from '../hooks/useNotifications'
import { POMODORO_LABELS, SESSIONS_BEFORE_LONG_BREAK } from '../lib/constants'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatHoursMinutes(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h}h ${m}m`
}

function ProgressRing({ mode, secondsLeft, totalSeconds, running }) {
  const size = 208
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const fractionRemaining = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const dashOffset = circumference * (1 - fractionRemaining)

  const accent =
    mode === 'focus' ? '#FF5D73' : mode === 'short_break' ? '#20B387' : '#C98A00'

  return (
    <div className={`relative h-52 w-52 shrink-0 ${running ? 'animate-pulseRing' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: 'rgb(var(--color-ink-line))' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            stroke: accent,
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
            transition: 'stroke-dashoffset 1s linear'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-5xl font-700 text-ghost tabular-nums">
          {formatTime(secondsLeft)}
        </span>
        <span className="text-xs text-ghost-muted mt-1">{POMODORO_LABELS[mode]}</span>
      </div>
    </div>
  )
}

const MODES = ['focus', 'short_break', 'long_break']

export default function Pomodoro() {
  const { notify, permission, requestPermission } = useNotifications()
  const {
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
  } = usePomodoro({ notify })

  const [showCustom, setShowCustom] = useState(false)

  const nextMode =
    mode === 'focus'
      ? sessionIndex % SESSIONS_BEFORE_LONG_BREAK === 0
        ? 'long_break'
        : 'short_break'
      : 'focus'

  return (
    <div className="rounded-2xl bg-ink-surface border border-ink-line p-6 flex flex-col items-center gap-6">
      {permission !== 'granted' && permission !== 'unsupported' && (
        <button
          onClick={requestPermission}
          className="text-[11px] text-volt bg-volt/10 rounded-full px-3 py-1 hover:bg-volt/20 transition-colors"
        >
          Enable browser notifications for session alerts
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors
              ${mode === m ? 'bg-pulse text-white' : 'bg-ink text-ghost-muted border border-ink-line hover:text-ghost'}
            `}
          >
            {POMODORO_LABELS[m]} {durations[m]} min
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="rounded-xl px-2.5 py-1.5 text-xs text-ghost-muted border border-ink-line hover:text-ghost transition-colors"
          aria-label="Custom timer settings"
        >
          <Settings2 size={14} />
        </button>
      </div>

      {showCustom && (
        <div className="flex flex-wrap justify-center gap-3 -mt-2">
          {MODES.map((m) => (
            <label key={m} className="flex flex-col items-center gap-1 text-[10px] text-ghost-faint">
              {POMODORO_LABELS[m]}
              <input
                type="number"
                min={1}
                max={120}
                value={durations[m]}
                onChange={(e) => setCustomDuration(m, Math.max(1, Number(e.target.value) || 1))}
                className="w-14 rounded-lg bg-ink border border-ink-line text-center text-xs text-ghost py-1 focus:outline-none focus:border-pulse"
              />
            </label>
          ))}
        </div>
      )}

      <ProgressRing mode={mode} secondsLeft={secondsLeft} totalSeconds={durations[mode] * 60} running={running} />

      <div className="flex gap-3">
        <button
          onClick={running ? pause : start}
          className="flex items-center gap-2 rounded-xl bg-pulse px-6 py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-ink border border-ink-line px-4 py-2.5 text-sm font-medium text-ghost-muted hover:text-ghost transition-colors"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <p className="text-xs text-ghost-faint font-mono">
        Session {sessionIndex} of {SESSIONS_BEFORE_LONG_BREAK} · Next: {POMODORO_LABELS[nextMode]}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full pt-2 border-t border-ink-line">
        <div className="flex flex-col items-center py-2">
          <span className="font-display text-lg font-700 text-ghost">{todaySessions}</span>
          <span className="text-[10px] text-ghost-muted mt-0.5">Sessions today</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="font-display text-lg font-700 text-ghost">{formatHoursMinutes(todayFocusSeconds)}</span>
          <span className="text-[10px] text-ghost-muted mt-0.5">Focus time today</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="font-display text-lg font-700 text-ghost">{monthSessions}</span>
          <span className="text-[10px] text-ghost-muted mt-0.5">Sessions this month</span>
        </div>
      </div>
    </div>
  )
}

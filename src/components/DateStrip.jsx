import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays } from 'date-fns'
import { getDateStrip, dayLabel, isToday, isSameDate } from '../lib/dateUtils'

export default function DateStrip({ selectedDate, onSelect }) {
  const days = getDateStrip(selectedDate, 3, 6)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSelect(addDays(selectedDate, -1))}
        className="shrink-0 rounded-full p-2 text-ghost-muted hover:bg-ink-surface hover:text-ghost transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5">
        {days.map((d) => {
          const { dow, day } = dayLabel(d)
          const selected = isSameDate(d, selectedDate)
          const today = isToday(d)
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(d)}
              className={`flex shrink-0 flex-col items-center justify-center rounded-2xl w-14 h-16 transition-all
                ${
                  selected
                    ? 'bg-pulse text-white shadow-glow'
                    : 'bg-ink-surface text-ghost-muted hover:bg-ink-line hover:text-ghost'
                }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">{dow}</span>
              <span className="text-lg font-display font-700 leading-none mt-1">{day}</span>
              {today && !selected && (
                <span className="mt-1 h-1 w-1 rounded-full bg-volt" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onSelect(addDays(selectedDate, 1))}
        className="shrink-0 rounded-full p-2 text-ghost-muted hover:bg-ink-surface hover:text-ghost transition-colors"
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

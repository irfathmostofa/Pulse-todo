import { getMonthHeatmapWeeks, heatLevel, monthLabel } from '../lib/dateUtils'

const LEVEL_CLASSES = [
  'bg-ink-line',
  'bg-mint/25',
  'bg-mint/50',
  'bg-mint/75',
  'bg-mint'
]

export default function Heatmap({ monthDate, dailyActivity }) {
  const weeks = getMonthHeatmapWeeks(monthDate)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-600 text-ghost">{monthLabel(monthDate)} — activity</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-ghost-faint">
          <span>Less</span>
          {LEVEL_CLASSES.map((cls, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => {
              const activity = dailyActivity[cell.iso]
              const level = heatLevel(activity?.total)
              return (
                <div
                  key={cell.iso}
                  title={`${cell.iso}: ${activity?.total || 0} activities`}
                  className={`h-3.5 w-3.5 rounded-sm transition-colors ${
                    cell.inMonth ? LEVEL_CLASSES[level] : 'bg-transparent'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

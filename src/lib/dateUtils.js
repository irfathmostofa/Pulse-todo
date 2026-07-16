import {
  format,
  addDays,
  isSameDay,
  isToday as isTodayFns,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay
} from 'date-fns'

export const ISO = 'yyyy-MM-dd'

export function toISODate(date) {
  return format(date, ISO)
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dayLabel(date) {
  return {
    dow: format(date, 'EEE'),
    day: format(date, 'd')
  }
}

export function isToday(date) {
  return isTodayFns(date)
}

export function isSameDate(a, b) {
  return isSameDay(a, b)
}

// Returns a window of dates centered on `centerDate` for the horizontal date strip
export function getDateStrip(centerDate, before = 3, after = 6) {
  const days = []
  for (let i = -before; i <= after; i++) {
    days.push(addDays(centerDate, i))
  }
  return days
}

// GitHub-style heatmap grid for the given month, padded to full weeks (Sun-Sat)
export function getMonthHeatmapWeeks(monthDate) {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }
  return weeks.map((week) =>
    week.map((d) => ({
      date: d,
      iso: toISODate(d),
      inMonth: d >= monthStart && d <= monthEnd
    }))
  )
}

export function getMonthDays(monthDate) {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  return eachDayOfInterval({ start: monthStart, end: monthEnd })
}

export function heatLevel(count) {
  if (!count) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

export function monthLabel(date) {
  return format(date, 'MMMM yyyy')
}

export function weekdayOf(date) {
  return getDay(date)
}

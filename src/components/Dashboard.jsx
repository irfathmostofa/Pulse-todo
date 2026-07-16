import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths } from "date-fns";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { monthLabel } from "../lib/dateUtils";
import Heatmap from "./Heatmap";

function StatCard({ value, label, accent }) {
  return (
    <div className="rounded-2xl bg-ink-surface border border-ink-line p-4 flex flex-col gap-1">
      <span
        className={`font-display text-2xl font-800 ${accent || "text-ghost"}`}
      >
        {value}
      </span>
      <span className="text-xs text-ghost-muted">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [monthDate, setMonthDate] = useState(new Date());
  const { summary, dailyActivity, loading } = useDashboardStats(monthDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ghost-faint font-mono">
            Overview
          </p>
          <h2 className="font-display text-xl font-700 text-ghost">
            {monthLabel(monthDate)}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthDate((d) => addMonths(d, -1))}
            className="rounded-full p-2 text-ghost-muted hover:bg-ink-surface hover:text-ghost transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
            className="rounded-full p-2 text-ghost-muted hover:bg-ink-surface hover:text-ghost transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="rounded-2xl bg-ink-surface border border-ink-line p-4">
        <Heatmap monthDate={monthDate} dailyActivity={dailyActivity} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          value={loading ? "—" : summary.tasksCompleted}
          label="Tasks completed"
          accent="text-mint"
        />
        <StatCard
          value={loading ? "—" : summary.tasksPending}
          label="Tasks pending"
          accent="text-pulse"
        />
        <StatCard
          value={loading ? "—" : summary.pomodoroSessions}
          label="Pomodoro sessions"
          accent="text-volt"
        />
        <StatCard
          value={loading ? "—" : summary.avgMoodEmoji}
          label="Avg mood this month"
        />
        <StatCard
          value={loading ? "—" : `${summary.completionRate}%`}
          label="Avg completion rate"
          accent="text-mint"
        />
        <StatCard
          value={loading ? "—" : summary.activeDays}
          label="Active days"
        />
      </div>
    </div>
  );
}

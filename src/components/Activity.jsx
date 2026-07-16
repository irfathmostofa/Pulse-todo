import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths } from "date-fns";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { monthLabel } from "../lib/dateUtils";
import Heatmap from "./Heatmap";
import MonthlyChart from "./MonthlyChart";

export default function Activity({ theme }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const { dailyActivity, monthTasks, loading } = useDashboardStats(monthDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ghost-faint font-mono">
            Activity
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

      {loading ? (
        <p className="text-sm text-ghost-faint">
          Loading this month's activity…
        </p>
      ) : (
        <MonthlyChart
          monthDate={monthDate}
          dailyActivity={dailyActivity}
          monthTasks={monthTasks}
          theme={theme}
        />
      )}
    </div>
  );
}

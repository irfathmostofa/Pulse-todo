import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import Tooltip from "./Tooltip";
import { fromISODate, getMonthDays, toISODate } from "../lib/dateUtils";
import { Check, Circle, Repeat } from "lucide-react";

export default function MonthlyChart({
  monthDate,
  dailyActivity,
  monthTasks,
  theme = "dark",
}) {
  const isLight = theme === "light";
  const gridStroke = isLight ? "#E2E4EC" : "#2A2E42";
  const tickFill = isLight ? "#5B5E78" : "#9A9CB5";
  const tooltipBg = isLight ? "#FFFFFF" : "#1C1F2E";
  const tooltipBorder = isLight ? "#E2E4EC" : "#2A2E42";
  const tooltipLabel = isLight ? "#14151F" : "#EDEEF5";
  const pendingFill = isLight ? "#E2E4EC" : "#2A2E42";

  const days = getMonthDays(monthDate);
  const chartData = days.map((d) => {
    const iso = toISODate(d);
    const activity = dailyActivity[iso];
    return {
      day: format(d, "d"),
      iso,
      Completed: activity?.completed || 0,
      Pending: activity?.pending || 0,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 rounded-2xl bg-ink-surface border border-ink-line p-4">
        <h3 className="font-display text-sm font-600 text-ghost mb-4">
          Day-wise activity
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: tickFill, fontSize: 10 }}
              axisLine={{ stroke: gridStroke }}
              tickLine={false}
              interval={Math.max(0, Math.floor(chartData.length / 15))}
            />
            <YAxis
              tick={{ fill: tickFill, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={24}
            />
            <RechartsTooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: tooltipLabel }}
              cursor={{
                fill: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)",
              }}
            />
            <Bar
              dataKey="Completed"
              stackId="a"
              fill="#20B387"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Pending"
              stackId="a"
              fill={pendingFill}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-2 rounded-2xl bg-ink-surface border border-ink-line p-4 flex flex-col">
        <h3 className="font-display text-sm font-600 text-ghost mb-3">
          This month's work
        </h3>
        <div className="flex-1 overflow-y-auto max-h-[240px] flex flex-col gap-2 pr-1">
          {monthTasks.length === 0 && (
            <p className="text-xs text-ghost-faint">
              No tasks logged this month yet.
            </p>
          )}
          {monthTasks.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 bg-ink border border-ink-line"
            >
              {t.status === "done" ? (
                <Check size={13} className="text-mint shrink-0" />
              ) : (
                <Circle size={13} className="text-ghost-faint shrink-0" />
              )}
              <Tooltip
                text={t.title}
                className={`flex-1 text-xs ${
                  t.status === "done"
                    ? "text-ghost-faint line-through"
                    : "text-ghost-muted"
                }`}
              />
              {t.type === "recurring" && (
                <Repeat size={11} className="text-volt shrink-0" />
              )}
              <span className="text-[10px] text-ghost-faint font-mono shrink-0">
                {format(fromISODate(t.date), "MMM d")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

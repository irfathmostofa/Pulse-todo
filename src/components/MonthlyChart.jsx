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
import { Check, Circle, Repeat, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Get current year and aggregate yearly tasks
  const currentYear = new Date().getFullYear();
  const yearlyTasks = monthTasks
    .filter((task) => {
      const taskDate = fromISODate(task.date);
      return taskDate.getFullYear() === currentYear;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  // Calculate totals
  const totalCompleted = yearlyTasks.filter((t) => t.status === "done").length;
  const totalPending = yearlyTasks.filter((t) => t.status !== "done").length;
  const totalTasks = yearlyTasks.length;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Title and subtitle in one line
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text("Yearly Report", 20, yPosition);

    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Year ${currentYear}`, pageWidth - 20, yPosition, {
      align: "right",
    });

    yPosition += 12;

    // Light separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 8;

    // Tasks header with count
    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    doc.text(`All Tasks (${yearlyTasks.length})`, 20, yPosition);

    // Prepare table data - With Serial, Task, and Status
    const tableData = yearlyTasks.map((task, index) => [
      (index + 1).toString(),
      task.title,
      task.status === "done" ? "Completed" : "Pending",
    ]);

    autoTable(doc, {
      startY: yPosition + 5,
      head: [["SL", "Task", "Status"]],
      body:
        tableData.length > 0
          ? tableData
          : [["", "No tasks found for this year", ""]],
      theme: "plain",
      headStyles: {
        fillColor: [245, 245, 247],
        textColor: [33, 37, 41],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.3,
        lineColor: [180, 180, 180],
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 37, 41],
        lineWidth: 0.3,
        lineColor: [200, 200, 200],
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" },
        1: { cellWidth: 120, halign: "left" },
        2: { cellWidth: 40, halign: "center" },
      },
      margin: { left: 20, right: 20 },
      tableLineColor: [180, 180, 180],
    });

    // Footer
    const finalY = doc.lastAutoTable?.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("pulse-to-do.netlify.app", pageWidth / 2, finalY + 15, {
      align: "center",
    });

    // Save the PDF
    doc.save(`yearly-report-${currentYear}.pdf`);
  };
  return (
    <div className="space-y-6">
      {/* Main Content */}
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

      {/* Yearly Tasks List */}
      <div className="rounded-2xl bg-ink-surface border border-ink-line p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-sm font-600 text-ghost">
            All Tasks in {currentYear}
          </h3>
          <div className="flex gap-4 text-xs">
            <span className="text-mint">Completed: {totalCompleted}</span>
            <span className="text-ghost-faint">Pending: {totalPending}</span>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2">
          {yearlyTasks.length === 0 && (
            <p className="text-xs text-ghost-faint">No tasks for this year.</p>
          )}
          {yearlyTasks.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 bg-ink border border-ink-line"
            >
              {t.status === "done" ? (
                <Check size={13} className="text-mint shrink-0" />
              ) : (
                <Circle size={13} className="text-ghost-faint shrink-0" />
              )}
              <span
                className={`flex-1 text-xs ${
                  t.status === "done"
                    ? "text-ghost-faint line-through"
                    : "text-ghost-muted"
                }`}
              >
                {t.title}
              </span>
              {t.type === "recurring" && (
                <Repeat size={11} className="text-volt shrink-0" />
              )}
              <span className="text-[10px] text-ghost-faint font-mono shrink-0">
                {format(fromISODate(t.date), "MMM d, yyyy")}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mint text-ink-dark hover:bg-mint/80 transition-colors font-medium text-sm"
        >
          <Download size={16} />
          Download PDF Report
        </button>
      </div>
    </div>
  );
}

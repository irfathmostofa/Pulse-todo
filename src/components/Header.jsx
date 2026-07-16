import { Zap, Sun, Moon } from "lucide-react";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down?";
}

export default function Header({ user, theme, onToggleTheme }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse shrink-0">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <span className="font-display text-lg font-800 text-ghost tracking-tight">
          Pulse
        </span>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <p className=" text-sm text-ghost-muted truncate max-w-[220px] text-right">
          {greeting()}
        </p>

        <button
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-line bg-ink-surface text-ghost-muted hover:text-ghost hover:border-pulse transition-colors"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </div>
  );
}

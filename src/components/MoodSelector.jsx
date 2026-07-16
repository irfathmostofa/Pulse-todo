import { MOODS } from "../lib/constants";

export default function MoodSelector({
  selectedMood,
  onSelect,
  loading,
  error,
  taskProgress,
  tasks = [],
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 rounded-full bg-ink-surface border border-ink-line">
        <div className="w-4 h-4 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin" />
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const isComplete = totalCount > 0 && doneCount === totalCount;
  const progress = Math.min(Math.round(taskProgress || 0), 100);
  const selectedMoodData = MOODS.find((m) => m.value === selectedMood);

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-surface px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-ghost-muted shrink-0">
          {selectedMoodData ? (
            <>
              Feeling{" "}
              <span className="text-ghost font-medium">
                {selectedMoodData.emoji} {selectedMoodData.label}
              </span>
            </>
          ) : (
            "How are you feeling today?"
          )}
        </span>

        <div className="flex items-center gap-0.5 shrink-0">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onSelect(m.value)}
                aria-label={m.label}
                aria-pressed={isSelected}
                title={m.label}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${
                    isSelected
                      ? "bg-pulse/20 scale-125"
                      : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110"
                  }
                `}
              >
                <span className="text-lg leading-none">{m.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-ink-line overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mint to-pulse transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-ghost-faint shrink-0">
            {isComplete ? "all done 🎉" : `${doneCount}/${totalCount}`}
          </span>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-pulse">Couldn't save mood: {error}</p>
      )}
    </div>
  );
}

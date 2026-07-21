import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, Repeat, Sparkles, ListChecks } from "lucide-react";
import TaskItem from "./TaskItem";
import { TASK_TYPES } from "../lib/constants";

export default function TaskBoard({
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onDeleteRecurring,
  onReorder,
  onConvertToRecurring,
  onEdit, // Add this prop
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(TASK_TYPES.NEW);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, type);
    setTitle("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    onReorder(reordered.map((t) => t.id));
  };

  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const doneCount = tasks.length - pendingCount;

  const getPlaceholder = () => {
    return type === TASK_TYPES.NEW
      ? "What are you doing today?"
      : "What do you want to repeat daily?";
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-ink-surface border border-ink-line px-3 focus-within:border-pulse transition-colors">
            <Plus size={18} className="text-ghost-faint shrink-0" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent py-3 text-sm text-ghost placeholder:text-ghost-faint focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-mint px-4 py-2 text-xs font-semibold text-ink hover:brightness-105 transition-all whitespace-nowrap"
          >
            Add
          </button>
        </div>

        {/* Type selector below input */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-ghost-muted font-medium">Type:</span>

          <button
            type="button"
            onClick={() => setType(TASK_TYPES.NEW)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all
              ${
                type === TASK_TYPES.NEW
                  ? "bg-pulse text-white shadow-sm"
                  : "bg-ink-surface text-ghost-muted border border-ink-line hover:border-ghost-muted"
              }
            `}
          >
            <Sparkles size={13} /> New
          </button>

          <button
            type="button"
            onClick={() => setType(TASK_TYPES.RECURRING)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all
              ${
                type === TASK_TYPES.RECURRING
                  ? "bg-volt text-ink shadow-sm"
                  : "bg-ink-surface text-ghost-muted border border-ink-line hover:border-ghost-muted"
              }
            `}
          >
            <Repeat size={13} /> Recurring
          </button>

          <span className="text-xs text-ghost-faint ml-auto">
            {type === TASK_TYPES.NEW
              ? "✓ One-time task"
              : "⟳ Repeats until done"}
          </span>
        </div>
      </form>

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-ghost-muted font-mono">
          <ListChecks size={13} />
          <span>{doneCount} done</span>
          <span className="text-ghost-faint">·</span>
          <span>{pendingCount} pending</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-line py-10 text-center">
          <p className="text-sm text-ghost-muted">
            Nothing logged yet for this day.
          </p>
          <p className="text-xs text-ghost-faint mt-1">
            Add what you're working on above to get started.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onDeleteRecurring={onDeleteRecurring}
                  onConvertToRecurring={onConvertToRecurring}
                  onEdit={onEdit} // Pass it down
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

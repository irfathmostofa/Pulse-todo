import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, X, Repeat, Sparkles, Pencil } from "lucide-react";
import Tooltip from "./Tooltip";
import BottomSheet from "./BottomSheet";
import ConfirmSheet from "./ConfirmSheet";

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onDeleteRecurring,
  onConvertToRecurring,
  onEdit, // Add this prop
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });
  const [showTitle, setShowTitle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const done = task.status === "done";
  const recurring = task.type === "recurring";

  const handleDeleteClick = () => setConfirmDelete(true);

  const confirmTheDelete = () => {
    setConfirmDelete(false);
    if (recurring) {
      onDeleteRecurring(task.recurring_id);
    } else {
      onDelete(task.id);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onEdit(task.id, editTitle);
    setShowEdit(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 bg-ink-surface transition-colors
        ${isDragging ? "opacity-60 border-pulse" : "border-ink-line hover:border-ink-line"}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-ghost-faint hover:text-ghost-muted shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <button
        onClick={() => onToggle(task)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all
          ${done ? "bg-mint border-mint" : "border-ghost-faint hover:border-mint"}
        `}
        aria-label={done ? "Mark as pending" : "Mark as done"}
      >
        {done && <Check size={14} className="text-ink" strokeWidth={3} />}
      </button>

      <button
        onClick={() => setShowTitle(true)}
        className="flex-1 min-w-0 text-left"
      >
        <Tooltip
          text={task.title}
          className={`text-sm md:text-white ${recurring ? "text-volt" : "New"} font-medium ${done ? "text-ghost-faint line-through" : "text-ghost"}`}
        />
      </button>

      <span
        className={`hidden sm:flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium
          ${recurring ? "bg-volt/15 text-volt" : "bg-pulse/15 text-pulse"}
        `}
      >
        {recurring ? <Repeat size={11} /> : <Sparkles size={11} />}
        {recurring ? "Recurring" : "New"}
      </span>

      {/* Edit button */}
      <button
        onClick={() => {
          setEditTitle(task.title);
          setShowEdit(true);
        }}
        className="shrink-0 rounded-full p-1.5 text-ghost-faint hover:bg-ink hover:text-pulse transition-all"
        aria-label="Edit task"
        title="Edit task"
      >
        <Pencil size={15} />
      </button>

      {!recurring && (
        <button
          onClick={() => onConvertToRecurring(task)}
          className="shrink-0 rounded-full p-1.5 text-ghost-faint hover:bg-ink hover:text-volt transition-all"
          aria-label="Make this task recurring"
          title="Make recurring"
        >
          <Repeat size={15} />
        </button>
      )}

      <button
        onClick={handleDeleteClick}
        className="shrink-0 rounded-full p-1.5 text-ghost-faint hover:bg-ink hover:text-pulse transition-all"
        aria-label={recurring ? "Delete recurring task" : "Delete task"}
        title={recurring ? "Delete recurring task" : "Delete task"}
      >
        <X size={15} />
      </button>

      {/* View Task BottomSheet */}
      <BottomSheet open={showTitle} onClose={() => setShowTitle(false)}>
        <div className="flex items-center gap-2 mb-3">
          {recurring ? (
            <Repeat size={14} className="text-volt shrink-0" />
          ) : (
            <Sparkles size={14} className="text-pulse shrink-0" />
          )}
          <span className="text-xs text-ghost-faint">
            {recurring ? "Recurring task" : "Task"}
          </span>
        </div>
        <p className="text-lg font-medium text-ghost break-words">
          {task.title}
        </p>
      </BottomSheet>

      {/* Edit Task BottomSheet */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)}>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-pulse shrink-0" />
            <span className="text-xs text-ghost-faint font-medium">
              Edit task
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-ink-surface border border-ink-line px-3 focus-within:border-pulse transition-colors">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Update task name..."
              className="flex-1 bg-transparent py-3 text-sm text-ghost placeholder:text-ghost-faint focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-ghost-muted hover:text-ghost transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-pulse px-4 py-2 text-xs font-semibold text-white hover:brightness-105 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Delete Confirmation Sheet */}
      <ConfirmSheet
        open={confirmDelete}
        title={recurring ? "Delete recurring task?" : "Delete this task?"}
        description={
          recurring
            ? "This removes it from every day it appears on — past and future. This can\u2019t be undone."
            : "This can\u2019t be undone."
        }
        confirmLabel="Delete"
        onConfirm={confirmTheDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

import BottomSheet from './BottomSheet'

export default function ConfirmSheet({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <BottomSheet open={open} onClose={onCancel}>
      <h3 className="font-display text-lg font-700 text-ghost mb-1.5">{title}</h3>
      {description && <p className="text-sm text-ghost-muted mb-5">{description}</p>}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-ink-line py-3 text-sm font-medium text-ghost-muted hover:text-ghost transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-pulse py-3 text-sm font-semibold text-white hover:brightness-105 transition-all"
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  )
}

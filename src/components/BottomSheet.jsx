import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-ink-surface border-t border-x border-ink-line p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-slideUp">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-line" />
        {children}
      </div>
    </div>
  )
}

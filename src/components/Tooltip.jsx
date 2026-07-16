export default function Tooltip({ text, className = '' }) {
  return (
    <span className={`relative inline-block min-w-0 group/tip ${className}`}>
      <span className="block truncate" title={text}>
        {text}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden max-w-[240px] whitespace-normal break-words rounded-lg border border-ink-line bg-ink-soft px-2.5 py-1.5 text-xs text-ghost shadow-card group-hover/tip:block"
      >
        {text}
      </span>
    </span>
  )
}

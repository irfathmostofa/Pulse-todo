import { ListChecks, LayoutGrid, BarChart3, Timer, Settings as SettingsIcon } from 'lucide-react'

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'monthly', label: 'Monthly', icon: BarChart3 },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-line bg-ink-surface/90 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 min-w-0"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={19}
                className={isActive ? 'text-pulse' : 'text-ghost-faint'}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span
                className={`text-[10px] font-medium truncate max-w-full px-0.5 ${
                  isActive ? 'text-pulse' : 'text-ghost-faint'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

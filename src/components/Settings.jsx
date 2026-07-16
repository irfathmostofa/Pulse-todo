import { useState } from 'react'
import { Sun, Moon, LogOut, KeyRound, Mail } from 'lucide-react'

export default function Settings({ theme, onToggleTheme, user, onUpdatePassword, onSignOut }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null) // { type: 'error' | 'success', message }
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)

    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: "Passwords don't match." })
      return
    }

    setSubmitting(true)
    const { error } = await onUpdatePassword(newPassword)
    setSubmitting(false)

    if (error) {
      setStatus({ type: 'error', message: error.message })
    } else {
      setStatus({ type: 'success', message: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ghost-faint font-mono">Settings</p>
        <h2 className="font-display text-xl font-700 text-ghost">Preferences & account</h2>
      </div>

      <div className="rounded-2xl bg-ink-surface border border-ink-line p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ghost">Appearance</p>
          <p className="text-xs text-ghost-muted mt-0.5">Switch between dark and light mode.</p>
        </div>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-xl bg-ink border border-ink-line px-3 py-2 text-xs font-medium text-ghost hover:border-pulse transition-colors"
        >
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      {user && (
        <div className="rounded-2xl bg-ink-surface border border-ink-line p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-line shrink-0">
            <Mail size={15} className="text-ghost-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ghost truncate">{user.email}</p>
            <p className="text-xs text-ghost-faint">Signed in</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePasswordSubmit} className="rounded-2xl bg-ink-surface border border-ink-line p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={15} className="text-ghost-muted" />
          <p className="text-sm font-medium text-ghost">Change password</p>
        </div>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className="rounded-xl bg-ink border border-ink-line px-3 py-2.5 text-sm text-ghost placeholder:text-ghost-faint focus:outline-none focus:border-pulse"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="rounded-xl bg-ink border border-ink-line px-3 py-2.5 text-sm text-ghost placeholder:text-ghost-faint focus:outline-none focus:border-pulse"
        />

        {status && (
          <p className={`text-xs ${status.type === 'error' ? 'text-pulse' : 'text-mint'}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-pulse py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <button
        onClick={onSignOut}
        className="flex items-center justify-center gap-2 rounded-2xl border border-ink-line py-3 text-sm font-medium text-ghost-muted hover:text-pulse hover:border-pulse transition-colors"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  )
}

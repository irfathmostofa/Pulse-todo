import { useState } from 'react'
import { Zap, Lock, Mail, CheckCircle2 } from 'lucide-react'

export default function Login({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSignupDone(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (mode === 'signin') {
      const { error: signInError } = await onSignIn(email, password)
      setSubmitting(false)
      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Wrong email or password.'
            : signInError.message
        )
      }
      return
    }

    if (password.length < 6) {
      setSubmitting(false)
      setError('Password must be at least 6 characters.')
      return
    }

    const { data, error: signUpError } = await onSignUp(email, password)
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data?.session) {
      // Email confirmation is off — user is already signed in, App will re-render.
      return
    }
    setSignupDone(true)
  }

  if (signupDone) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-ink-surface border border-ink-line p-6 text-center flex flex-col items-center gap-3">
          <CheckCircle2 size={32} className="text-mint" />
          <h2 className="font-display text-lg font-700 text-ghost">Check your email</h2>
          <p className="text-sm text-ghost-muted">
            We sent a confirmation link to <span className="text-ghost">{email}</span>. Confirm it, then sign in.
          </p>
          <button
            onClick={() => switchMode('signin')}
            className="mt-1 rounded-xl bg-pulse px-5 py-2 text-sm font-semibold text-white hover:brightness-105 transition-all"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pulse">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-800 text-ghost tracking-tight">Pulse</span>
        </div>

        <div className="flex gap-1 rounded-2xl bg-ink-surface border border-ink-line p-1 mb-4">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-pulse text-white' : 'text-ghost-muted'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-pulse text-white' : 'text-ghost-muted'
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-ink-surface border border-ink-line p-6 flex flex-col gap-4"
        >
          <div>
            <label className="text-xs text-ghost-muted mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 rounded-xl bg-ink border border-ink-line px-3 focus-within:border-pulse transition-colors">
              <Mail size={15} className="text-ghost-faint shrink-0" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-2.5 text-sm text-ghost focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-ghost-muted mb-1.5 block">Password</label>
            <div className="flex items-center gap-2 rounded-xl bg-ink border border-ink-line px-3 focus-within:border-pulse transition-colors">
              <Lock size={15} className="text-ghost-faint shrink-0" />
              <input
                type="password"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent py-2.5 text-sm text-ghost focus:outline-none"
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              />
            </div>
          </div>

          {error && <p className="text-xs text-pulse">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-xl bg-pulse py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all disabled:opacity-60"
          >
            {submitting
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-ghost-faint mt-5">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button onClick={() => switchMode('signup')} className="text-ghost-muted underline underline-offset-2">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have one?{' '}
              <button onClick={() => switchMode('signin')} className="text-ghost-muted underline underline-offset-2">
                Sign in instead
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

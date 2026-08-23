'use client'
import { useActionState } from 'react'
import { signIn, signUp, type AuthState } from '@/lib/actions/auth'

const field =
  'w-full border-b border-[var(--color-border-mid)] bg-transparent py-2.5 text-[15px] text-[var(--color-fg)] outline-none transition-colors placeholder:text-[var(--color-fg-secondary)] focus:border-[var(--color-fg)]'

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const action = mode === 'signin' ? signIn : signUp
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined)

  return (
    <form action={formAction} className="w-full space-y-5">
      {mode === 'signup' && (
        <>
          <input name="name" placeholder="Your name" autoComplete="name" required className={field} />
          <input name="username" placeholder="Username" autoComplete="username" required className={field} />
        </>
      )}
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={field} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        required
        className={field}
      />

      {state?.error && (
        <p role="alert" className="text-[13px] text-[var(--color-fg-error)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--color-bg-brand)] py-2.5 text-[14px] text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-bg-brand-hover)] disabled:opacity-60"
      >
        {pending ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AuthForm } from '@/components/AuthForm'

export const metadata: Metadata = { title: 'Sign up' }

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect('/')
  return (
    <>
      <h1 className="mb-10 text-center font-[family-name:var(--font-display)] text-[28px] text-[var(--color-fg)]">Join Ascend.</h1>
      <AuthForm mode="signup" />
      <p className="mt-8 text-center text-[14px] text-[var(--color-fg-secondary)]">
        Already have an account?{' '}
        <Link href="/signin" className="font-semibold text-[var(--color-fg-accent)] hover:underline">Sign in</Link>
      </p>
    </>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { MainColumn } from '@/components/PageColumns'
import { IconArrowUpRight, IconChevronRight } from '@/components/icons'
import { ProfileFields } from '@/components/ProfileFields'

export const metadata: Metadata = { title: 'Settings' }

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'publishing', label: 'Publishing' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'membership', label: 'Membership and payment' },
  { key: 'security', label: 'Security and apps' },
]

function Row({ label, desc, value, href, action }: {
  label: string; desc?: string; value?: string; href?: string; action?: React.ReactNode
}) {
  const inner = (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <p className="text-[14px] text-[var(--color-fg)]">{label}</p>
        {desc && <p className="mt-1 text-[13px] text-[var(--color-fg-secondary)]">{desc}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[14px] text-[var(--color-fg-secondary)]">
        {value}
        {action}
        {href && <IconChevronRight size={16} />}
      </div>
    </div>
  )
  return href ? <Link href={href} className="block hover:opacity-80">{inner}</Link> : inner
}

export default async function SettingsPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const me = await getCurrentUser()
  if (!me) redirect('/signin')
  const { tab = 'account' } = await searchParams

  return (
    <>
      <MainColumn width={680}>
        <PageHeader
          title="Settings"
          active={tab}
          tabs={TABS.map((t) => ({ ...t, href: t.key === 'account' ? '/me/settings' : `/me/settings?tab=${t.key}` }))}
        />

        {tab === 'account' && (
          <>
            <h2 className="mt-10 text-[16px] font-bold text-[var(--color-fg)]">Profile</h2>
            <div className="divide-y divide-[var(--color-border)]">
              <Row label="Email address" desc="The address you use to sign in." value={me.email} />
              <Row label="Username and subdomain" desc="Edit your @username." value={`@${me.username}`} />
            </div>
            <ProfileFields
              initial={{ name: me.name, bio: me.bio ?? '', about: me.about ?? '', pronouns: me.pronouns ?? '' }}
            />
            <h2 className="mt-12 text-[16px] font-bold text-[var(--color-fg)]">Stories</h2>
            <div className="divide-y divide-[var(--color-border)]">
              <Row label="Your stories" desc="Drafts, published stories, and responses." href="/me/stories/drafts" />
              <Row label="Stats" desc="Views, reads, and claps across your writing." href="/me/stats" />
            </div>
            <h2 className="mt-12 text-[16px] font-bold text-[var(--color-fg)]">Sign out</h2>
            <form action="/api/auth/signout" method="post" className="py-5">
              <button className="text-[14px] text-[var(--color-fg-error)] hover:underline">Sign out of Ascend</button>
            </form>
          </>
        )}

        {tab === 'publishing' && (
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            <Row label="Customise your story previews" desc="Choose how titles and images appear in feeds." />
            <Row label="Manage publications" desc="Publications you write for or edit." href="/ascend-lab" />
            <Row label="Import a story" desc="Bring a post over from another site." action={<IconArrowUpRight size={16} />} />
          </div>
        )}

        {tab === 'privacy' && (
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            <Row label="Who can see your profile" value="Everyone" />
            <Row label="Show reading history" desc="Let others see the stories you have read." value="Off" />
            <Row label="Muted writers" desc="Stories from muted writers stay out of your feed." href="/me/settings?tab=privacy" />
          </div>
        )}

        {tab === 'notifications' && (
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            <Row label="Email notifications" desc="Responses, follows, and claps." value="On" />
            <Row label="New stories from people you follow" value="Weekly" />
            <Row label="Product announcements" value="Off" />
          </div>
        )}

        {tab === 'membership' && (
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            <Row label="Membership" desc="You have full access to every story." value={me.isMember ? 'Active' : 'None'} />
            <Row label="Payment method" desc="Cards and billing details." value="—" />
            <Row label="Billing history" href="/me/settings?tab=membership" />
          </div>
        )}

        {tab === 'security' && (
          <div className="mt-10 divide-y divide-[var(--color-border)]">
            <Row label="Password" desc="Change the password you use to sign in." />
            <Row label="Sign-in sessions" desc="Devices currently signed in to your account." />
            <Row label="Connected apps" desc="Third-party apps with access to Ascend." value="None" />
            <Row label="Delete account" desc="Permanently remove your account and stories." />
          </div>
        )}
      </MainColumn>

      <aside
        className="sticky hidden shrink-0 self-start border-l border-[var(--color-border)] px-6 pt-14 xl:block"
        style={{ width: 'var(--width-aside)', top: 'var(--height-header)' }}
      >
        <h2 className="text-[16px] font-bold text-[var(--color-fg)]">Suggested help articles</h2>
        <ul className="mt-5 space-y-4 text-[14px] text-[var(--color-fg-secondary)]">
          {['Sign in or sign up to Ascend', 'Your profile page', 'Writing and publishing your first story', 'How the feed decides what you see', 'Getting started with lists'].map((t) => (
            <li key={t}><Link href="/help" className="hover:text-[var(--color-fg)]">{t}</Link></li>
          ))}
        </ul>
      </aside>
    </>
  )
}

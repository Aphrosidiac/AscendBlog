import Link from 'next/link'

export function PageHeader({
  title, action, tabs, active,
}: {
  title: string
  action?: React.ReactNode
  tabs?: { key: string; label: string; href: string }[]
  active?: string
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-6 pt-14">
        <h1 className="text-[42px] font-bold leading-[52px] tracking-[-0.011em] text-[var(--color-fg)]">{title}</h1>
        {action}
      </div>
      {tabs && (
        <nav className="mt-10 flex gap-8 overflow-x-auto border-b border-[var(--color-border)] no-scrollbar">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`whitespace-nowrap border-b py-4 text-[14px] transition-colors ${
                active === t.key
                  ? 'border-[var(--color-fg)] text-[var(--color-fg)]'
                  : 'border-transparent text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}

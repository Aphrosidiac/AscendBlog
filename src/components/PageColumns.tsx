/** main(flex-1, content centred at 680) + optional 368 aside. */
export function MainColumn({ children, width = 680 }: { children: React.ReactNode; width?: number }) {
  return (
    <main className="min-w-0 flex-1 px-6">
      <div className="mx-auto w-full" style={{ maxWidth: width }}>{children}</div>
    </main>
  )
}

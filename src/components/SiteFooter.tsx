// ─────────────────────────────────────────────────────────────────────────────
// SiteFooter — global footer rendered on every page via the root layout.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'

const PRODUCT_LINKS = [
  { href: '/analyze', label: 'Validate a new business' },
  { href: '/existing', label: 'Grow an existing business' },
  { href: '/explore', label: 'Explore suburbs' },
  { href: '/explore-business-ideas', label: 'Business ideas' },
]

const RESOURCE_LINKS = [
  { href: '/news', label: 'Business news' },
  { href: '/market-intelligence', label: 'Market intelligence' },
  { href: '/how-it-works', label: 'How it works' },
]

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--ink-0)', borderTop: '1px solid var(--line-2)' }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
              GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>
              Australian founder intelligence. Validate a business idea against real competitor
              data before you commit capital.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--paper-4)' }}>
              Product
            </div>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:underline" style={{ color: 'var(--paper-2)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--paper-4)' }}>
              Resources
            </div>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:underline" style={{ color: 'var(--paper-2)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 pt-6 sm:flex-row sm:items-center"
          style={{ borderTop: '1px solid var(--line)' }}>
          <p className="text-xs" style={{ color: 'var(--paper-4)' }}>
            © {new Date().getFullYear()} GlobalBiz AI · Built for Australian founders
          </p>
          <p className="text-xs" style={{ color: 'var(--paper-4)' }}>
            Data: Google Maps · ABS · Australian news sources
          </p>
        </div>
      </div>
    </footer>
  )
}

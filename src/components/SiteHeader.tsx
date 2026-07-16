// ─────────────────────────────────────────────────────────────────────────────
// SiteHeader — the one shared header used on every page.
//
// Identical layout everywhere so navigation never jumps around:
//   [• GlobalBiz AI]   [Explore suburbs · News · Market data · How it works]   [CTA]
//
// Pages needing extra controls (e.g. the report's Share/PDF buttons) pass them
// via `actions`, which replaces the default CTA but keeps position identical.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const NAV_LINKS = [
  { href: '/explore', label: 'Explore suburbs' },
  { href: '/news', label: 'News' },
  { href: '/market-intelligence', label: 'Market data' },
  { href: '/how-it-works', label: 'How it works' },
]

interface SiteHeaderProps {
  /** Highlights the active nav link. Pass the page's href, e.g. "/news". */
  active?: string
  /** Replaces the default "Generate report" CTA (position stays identical). */
  actions?: React.ReactNode
}

export function SiteHeader({ active, actions }: SiteHeaderProps) {
  return (
    <nav className="nav-blur sticky top-0 z-50">
      <div className="container-wide flex items-center justify-between py-4">
        {/* Left — logo, always links home */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="block h-2 w-2 rounded-full" style={{ background: 'var(--green)' }} />
          <span className="font-display text-lg tracking-tight" style={{ color: 'var(--paper)' }}>
            GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
          </span>
        </Link>

        {/* Centre — same links on every page */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${active === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — CTA (or page-specific actions in the same slot) */}
        {actions ?? (
          <Link href="/analyze" className="btn btn-gold text-sm">
            Generate report <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
    </nav>
  )
}

/**
 * BackLink — consistent back affordance. Always rendered at the top-left of
 * page content (never in the header), so it appears in the same place on
 * every page that needs one.
 */
export function BackLink({ href = '/', label = 'Back' }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      style={{ color: 'var(--paper-3)' }}
    >
      <span aria-hidden>←</span> {label}
    </Link>
  )
}

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--ink-0)' }}>
      <div className="max-w-md text-center anim-fade-up">
        <div className="font-display text-7xl" style={{ color: 'var(--gold)' }}>404</div>
        <h1 className="display mt-4" style={{ fontSize: 'var(--t-h1)' }}>
          That page isn&apos;t <em>here</em>.
        </h1>
        <p className="mt-4" style={{ color: 'var(--paper-2)' }}>
          Either the link is stale or the report was opened in a different browser session.
        </p>
        <div className="mt-8">
          <Link href="/" className="btn btn-gold">
            Take me home <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

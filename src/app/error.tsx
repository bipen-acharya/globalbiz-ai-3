'use client'

import Link from 'next/link'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--ink-0)' }}>
      <div className="max-w-md text-center anim-fade-up">
        <div className="eyebrow no-rule mx-auto justify-center" style={{ color: 'var(--gold)' }}>Something broke</div>
        <h1 className="display mt-4" style={{ fontSize: 'var(--t-h1)' }}>
          We hit an <em>unexpected</em> error.
        </h1>
        <p className="mt-4" style={{ color: 'var(--paper-2)' }}>
          The screen failed to load. Try refreshing — if it keeps happening, head back home and try a different flow.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-gold">
            <RefreshCw size={16} /> Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Home <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

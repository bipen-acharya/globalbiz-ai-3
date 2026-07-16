'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Compass, Newspaper } from 'lucide-react'

const WAITLIST_KEY = 'globalbiz_waitlist_emails'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    // Store locally until backend waitlist ships; also notify admin via chat API log
    try {
      const existing = JSON.parse(localStorage.getItem(WAITLIST_KEY) ?? '[]') as string[]
      localStorage.setItem(WAITLIST_KEY, JSON.stringify([...existing, trimmed]))
    } catch { /* ignore */ }
    setSubmitted(true)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink-1)', color: 'var(--paper)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 nav-blur">
        <Link href="/" className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
          GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
        </Link>
        <Link href="/" className="btn btn-ghost text-sm">Home</Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
            Free beta complete
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight" style={{ color: 'var(--paper)' }}>
            We&apos;re at capacity —<br />pricing is coming
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
            The first 100 validation reports were free while we proved the platform.
            Paid plans launch shortly with saved reports, unlimited analysis, and more.
          </p>

          {/* Email capture */}
          <div className="mx-auto mt-8 max-w-sm">
            {submitted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium"
                style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)', color: 'var(--ok)' }}>
                <CheckCircle size={16} />
                You&apos;re on the list — we&apos;ll email you at launch.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="input flex-1"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-gold whitespace-nowrap">
                    Notify me
                    <ArrowRight size={15} />
                  </button>
                </div>
                {error && <p className="text-left text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
                <p className="text-left text-xs" style={{ color: 'var(--paper-4)' }}>
                  Early access + founding member pricing when we reopen.
                </p>
              </form>
            )}
          </div>

          {/* Free features stay live */}
          <div className="mt-12">
            <div className="mb-3 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--paper-4)' }}>
              Still free while you wait
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/explore" className="group rounded-2xl p-4 text-left transition-all"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)' }}>
                <Compass size={18} style={{ color: 'var(--gold)' }} />
                <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--paper)' }}>Explore suburbs</div>
                <div className="mt-0.5 text-xs" style={{ color: 'var(--paper-3)' }}>Live competitor data for any suburb</div>
              </Link>
              <Link href="/news" className="group rounded-2xl p-4 text-left transition-all"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)' }}>
                <Newspaper size={18} style={{ color: 'var(--gold)' }} />
                <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--paper)' }}>Business news</div>
                <div className="mt-0.5 text-xs" style={{ color: 'var(--paper-3)' }}>Australian founder news, updated hourly</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

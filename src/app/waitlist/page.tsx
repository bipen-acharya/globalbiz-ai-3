'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Mail, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/components/ui/notifications'

export default function WaitlistPage() {
  const toast = useNotifications()
  const [form, setForm] = useState({ email: '', country: '', business_type: '', launch_month: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.email.includes('@')) { toast.error('Please enter a valid email'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
      else toast.error('Failed to join waitlist. Try again.')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
          <ArrowLeft size={16} /> Home
        </Link>
        <span className="font-display font-bold text-slate-900 text-sm">GlobalBiz <span className="text-brand-500">AI</span></span>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto mb-5">
                  <Clock size={28} className="text-amber-400" />
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Today's free reports are full
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Join tomorrow's waitlist</h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We limit daily reports to ensure quality AI analysis. Join the waitlist and we'll notify you when your slot opens — usually within 24 hours.
                </p>
              </div>

              <div className="ui-section space-y-4">
                <div>
                  <label className="ui-label">Email address *</label>
                  <div className="relative">
                    <Mail size={14} className="ui-input-icon left-3" />
                    <input
                      type="email"
                      className="ui-input pl-9"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="ui-label">Country</label>
                  <input className="ui-input" placeholder="e.g. Australia" value={form.country}
                    onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div>
                  <label className="ui-label">Business type</label>
                  <input className="ui-input" placeholder="e.g. Café, retail, gym..." value={form.business_type}
                    onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))} />
                </div>
                <div>
                  <label className="ui-label">Preferred launch month</label>
                  <select className="ui-input" value={form.launch_month} onChange={e => setForm(p => ({ ...p, launch_month: e.target.value }))}>
                    <option value="">Select...</option>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ui-primary-btn w-full py-3.5"
                >
                  {loading ? 'Joining...' : 'Join waitlist — it\'s free'}
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                No spam. Just a notification when your slot opens.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-brand-500" />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">You're on the list!</h1>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We'll email <span className="text-slate-900">{form.email}</span> when your free report slot opens — usually within 24 hours.
              </p>
              <div className="ui-card p-5 mb-8 text-sm text-slate-600 space-y-2">
                <div className="flex justify-between"><span>Daily free reports</span><span className="text-slate-900">10</span></div>
                <div className="flex justify-between"><span>Your position</span><span className="text-brand-500">Early queue</span></div>
                <div className="flex justify-between"><span>Estimated wait</span><span className="text-slate-900">~24 hours</span></div>
              </div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft size={14} /> Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bot, Loader2, MessageCircle, Send, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | 'intro'
  | 'category'
  | 'business_type'
  | 'state'
  | 'suburb'
  | 'website'
  | 'customers'
  | 'budget'
  | 'launch'
  | 'done'

interface Msg { role: 'ai' | 'user'; text: string }

interface ChatData {
  description:     string
  businessName:    string
  category:        string
  businessType:    'physical' | 'online'
  state:           string
  suburb:          string
  websiteUrl:      string
  targetCustomers: string
  budgetRange:     string
  launchTimeframe: string
}

const INITIAL: ChatData = {
  description: '', businessName: '', category: '',
  businessType: 'physical', state: '', suburb: '',
  websiteUrl: '', targetCustomers: '',
  budgetRange: '$5K–$20K', launchTimeframe: '3–6 months',
}

// ─── Questions ────────────────────────────────────────────────────────────────

const Q: Record<Step, string> = {
  intro:         "Hi! I'm your AI business analyst. What's your business idea? (include the name if you have one)",
  category:      'Which category best describes your business?',
  business_type: 'Is this a physical / local business or an online / digital business?',
  state:         'Which Australian state will you operate in?',
  suburb:        'What suburb or city will you be operating in?',
  website:       "What's your website URL? (type 'none' if you don't have one yet)",
  customers:     'Who are your target customers? e.g. "local families", "25–40 year old professionals"',
  budget:        'What is your approximate startup budget?',
  launch:        'When are you planning to launch?',
  done:          "Great — I have everything I need! Click below to generate your full report.",
}

// ─── Quick-reply chips per step (BUG 4) ───────────────────────────────────────

const CHIPS: Partial<Record<Step, string[]>> = {
  category: [
    'Café / Coffee shop', 'Restaurant / Takeaway', 'Retail store',
    'Online store / eCommerce', 'Beauty salon / Barber', 'Gym / Fitness',
    'Health & wellness', 'Trades / Handyman', 'IT services / Software',
    'Marketing / Agency', 'Consulting', 'Other',
  ],
  business_type: ['Physical / Local', 'Online / Digital'],
  state:  ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  budget: ['Under $5K', '$5K–$20K', '$20K–$50K', '$50K–$100K', '$100K+'],
  launch: ['Within 3 months', '3–6 months', '6–12 months', '1+ year'],
}

// ─── State full names ─────────────────────────────────────────────────────────

const STATE_FULL: Record<string, string> = {
  NSW: 'New South Wales', VIC: 'Victoria',  QLD: 'Queensland',
  WA:  'Western Australia', SA: 'South Australia', TAS: 'Tasmania',
  ACT: 'Australian Capital Territory',       NT: 'Northern Territory',
}

// ─── Step flow ────────────────────────────────────────────────────────────────

function nextStep(current: Step, data: ChatData): Step {
  switch (current) {
    case 'intro':         return 'category'
    case 'category':      return 'business_type'
    case 'business_type': return data.businessType === 'online' ? 'website' : 'state'
    case 'state':         return 'suburb'
    case 'suburb':        return 'customers'
    case 'website':       return 'customers'
    case 'customers':     return 'budget'
    case 'budget':        return 'launch'
    case 'launch':        return 'done'
    default:              return 'done'
  }
}

function parseAnswer(step: Step, answer: string): Partial<ChatData> {
  switch (step) {
    case 'intro':
      return { description: answer, businessName: answer.split(/[,.\n]/)[0]?.trim().substring(0, 80) ?? '' }
    case 'category':
      return { category: answer }
    case 'business_type':
      return { businessType: answer.toLowerCase().includes('online') ? 'online' : 'physical' }
    case 'state':
      return { state: STATE_FULL[answer] ?? answer }
    case 'suburb':
      return { suburb: answer }
    case 'website':
      return { websiteUrl: answer.toLowerCase() === 'none' ? '' : answer }
    case 'customers':
      return { targetCustomers: answer }
    case 'budget':
      return { budgetRange: answer }
    case 'launch':
      return { launchTimeframe: answer }
    default:
      return {}
  }
}

// ─── API payload builder (BUG 3) ──────────────────────────────────────────────

const BUDGET_MAP: Record<string, number> = {
  'Under $5K': 4000, '$5K–$20K': 12000, '$20K–$50K': 35000,
  '$50K–$100K': 75000, '$100K+': 150000,
}

function buildPayload(d: ChatData) {
  const isOnline = d.businessType === 'online'
  const budget   = BUDGET_MAP[d.budgetRange] ?? 12000

  return {
    user_goal_mode:              'start_new',
    business_name:               d.businessName || 'My Business',
    business_concept:            d.description,
    products_services:           d.description,
    business_type:               d.category || 'Other',
    business_model_type:         d.businessType,
    state:                       d.state || 'New South Wales',
    suburb:                      isOnline ? '' : d.suburb,
    city:                        isOnline ? '' : d.suburb,
    postcode:                    '',
    lat:                         null,
    lng:                         null,
    radius_km:                   10,
    website_url:                 d.websiteUrl,
    google_business_profile_url: '',
    delivery_coverage:           isOnline ? 'Australia-wide' : '',
    target_market:               isOnline ? 'Australia' : '',
    target_customers:            d.targetCustomers ? [d.targetCustomers] : ['General public'],
    staff_count:                 2,
    startup_budget:              String(budget),
    expected_revenue:            String(Math.round(budget * 0.25)),
    avg_price_range:             '$15–$50',
    launch_timeline:             d.launchTimeframe || '3–6 months',
    growth_goal:                 'Grow revenue',
    break_even_expectation:      '12–18 months',
    risk_tolerance:              'medium',
    current_monthly_revenue:     '',
    current_challenges:          [],
    growth_strategy_type:        '',
    current_location_suburb:     isOnline ? '' : d.suburb,
  }
}

const TEMP_KEY = 'globalbiz_temp_report'

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [step,       setStep]       = useState<Step>('intro')
  const [msgs,       setMsgs]       = useState<Msg[]>([{ role: 'ai', text: Q.intro }])
  const [input,      setInput]      = useState('')
  const [data,       setData]       = useState<ChatData>(INITIAL)
  const [generating, setGenerating] = useState(false)
  const [genError,   setGenError]   = useState<string | null>(null)
  const endRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function send(text: string) {
    if (!text.trim() || step === 'done' || generating) return

    const parsed   = parseAnswer(step, text)
    const newData  = { ...data, ...parsed }
    const next     = nextStep(step, newData)

    setData(newData)
    setMsgs(m => [
      ...m,
      { role: 'user', text },
      { role: 'ai',  text: Q[next] },
    ])
    setStep(next)
    setInput('')

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function generate() {
    setGenerating(true)
    setGenError(null)
    setMsgs(m => [...m, { role: 'ai', text: 'Generating your report… this usually takes 20–30 seconds. ⏳' }])

    try {
      const res  = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildPayload(data)),
      })
      const json = await res.json()

      if (!res.ok || !json.success) throw new Error(json.error ?? 'Report generation failed.')

      if (json._temp && json.report) {
        try {
          sessionStorage.setItem(
            `${TEMP_KEY}_${json.reportId}`,
            JSON.stringify({ ...json.report, analysis: json.report }),
          )
        } catch {}
      }

      onClose()
      router.push(`/report/${json.reportId}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setGenError(msg)
      setGenerating(false)
      setMsgs(m => [...m, { role: 'ai', text: `Sorry, there was a problem: ${msg} Please try again.` }])
    }
  }

  const chips = CHIPS[step]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
            <Bot size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">AI Business Analyst</div>
            <div className="text-xs text-slate-400">Powered by GlobalBiz AI</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="mr-2 mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <MessageCircle size={11} className="text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick-reply chips (BUG 4) */}
      {step !== 'done' && chips && chips.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2.5 flex gap-1.5 flex-wrap flex-shrink-0 max-h-32 overflow-y-auto">
          {chips.map(c => (
            <button
              key={c}
              onClick={() => send(c)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all whitespace-nowrap"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Done — generate button (BUG 3) */}
      {step === 'done' ? (
        <div className="border-t border-slate-200 px-4 py-3 flex-shrink-0">
          {genError && <p className="mb-2 text-xs text-red-600">{genError}</p>}
          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" /> Generating your report…</>
              : <>Generate My Report <ArrowRight size={15} /></>
            }
          </button>
        </div>
      ) : (
        /* Text input bar */
        <div className="border-t border-slate-200 px-4 py-3 flex items-center gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(input) }}
            placeholder="Type your answer…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white transition-all"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Floating button + slide-up drawer (BUG 2) ───────────────────────────────

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false)

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Floating button — always visible when drawer is closed */}
      <button
        onClick={() => setOpen(true)}
        title="Chat with AI Assistant"
        aria-label="Chat with AI Assistant"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 hover:shadow-xl ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MessageCircle size={22} />
      </button>

      {/* Dim overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer — slides up from bottom on mobile, anchored bottom-right on desktop */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 h-[90vh]
          sm:bottom-6 sm:right-6 sm:left-auto sm:h-[600px] sm:w-[400px] sm:rounded-2xl
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {open && <ChatPanel onClose={() => setOpen(false)} />}
      </div>
    </>
  )
}

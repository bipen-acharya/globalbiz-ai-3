'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// FloatingChatButton — lightweight founder assistant.
// Calls /api/chat with conversation history; falls back to friendly defaults
// when the chat endpoint isn't configured.
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'How does GlobalBiz AI work?',
  'What does the report include?',
  'Can I use it for an online business?',
  'Is it free to use?',
]

const FALLBACK_REPLIES: Record<string, string> = {
  'how does globalbiz ai work':
    'GlobalBiz AI generates a full feasibility report from your business idea — combining real Google Maps competitor data, suburb-level demand signals, and AI analysis. It takes about 3 minutes.',
  'what does the report include':
    'You get a Business Viability Score, Decision Confidence Score, competitor mapping, budget fit, Australian permit/compliance notes, expansion pathways, and a 90-day action plan.',
  'can i use it for an online business':
    'Yes — choose "Online / Digital" in the form. We&apos;ll read your website automatically and analyse online competitors instead of local ones.',
  'is it free to use':
    'Yes, completely free. No account required. There&apos;s a soft daily limit so the AI runs sustainably.',
}

function fallbackReply(question: string): string {
  const key = question.toLowerCase().trim().replace(/[?.,!]/g, '')
  for (const [k, v] of Object.entries(FALLBACK_REPLIES)) {
    if (key.includes(k.split(' ')[0]) && key.includes(k.split(' ')[1] ?? '')) return v
  }
  return 'Great question — start with the "Generate founder report" button to validate your idea, or "Grow existing business" to diagnose an existing one. Anything else I can clarify?'
}

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi — I'm the GlobalBiz AI guide. Ask me how the platform works, what's in a report, or which flow fits your situation.",
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending) return
    const next: Message[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(m => [...m, { role: 'assistant', content: data.reply || fallbackReply(content) }])
      } else {
        setMessages(m => [...m, { role: 'assistant', content: fallbackReply(content) }])
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: fallbackReply(content) }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium transition-all hover:scale-105"
        style={{
          background: 'var(--gold)',
          color: '#FFFFFF',
          boxShadow: '0 14px 32px -10px rgba(79, 70, 229, 0.45)',
        }}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask GlobalBiz'}</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden anim-fade-up"
          style={{
            height: 520,
            background: 'var(--ink-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
                <Sparkles size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--paper)' }}>GlobalBiz Guide</div>
                <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--paper-3)' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--ok)' }} />
                  Online · usually replies instantly
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 transition-colors hover:opacity-70" style={{ color: 'var(--paper-3)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed anim-fade-up"
                  style={
                    m.role === 'user'
                      ? { background: 'var(--gold)', color: '#FFFFFF' }
                      : { background: 'var(--ink-1)', color: 'var(--paper)', border: '1px solid var(--line)' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl px-4 py-3" style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}>
                  <span className="dot" />
                  <span className="dot" style={{ animationDelay: '120ms' }} />
                  <span className="dot" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-5 pb-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="chip text-xs"
                  style={{ padding: '4px 10px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask me anything…"
                className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--line-2)', color: 'var(--paper)' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--gold)', color: '#FFFFFF' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          <style jsx>{`
            .dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 999px;
              background: var(--paper-4);
              animation: bounce 1.2s ease-in-out infinite;
            }
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
              40% { transform: translateY(-4px); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

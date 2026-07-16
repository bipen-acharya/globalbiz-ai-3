export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-0)' }}>
      <div className="flex items-center gap-3">
        <div className="spinner" />
        <span className="text-sm" style={{ color: 'var(--paper-3)' }}>Loading…</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Notify Service — admin email alerts via Resend REST API (no SDK needed).
//
// Fire-and-forget: report generation never waits on or fails because of email.
// No-ops silently when RESEND_API_KEY / ADMIN_EMAIL are not configured.
// ─────────────────────────────────────────────────────────────────────────────

const RESEND_API_URL = 'https://api.resend.com/emails'

export interface ReportNotification {
  flow: 'New business' | 'Existing business' | 'Business ideas'
  businessType: string
  businessName?: string
  state?: string
  suburb?: string
  topScores?: { label: string; value: number }[]
  totalReports?: number
  totalLimit?: number
}

function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL)
}

function buildHtml(n: ReportNotification): string {
  const scores = (n.topScores ?? [])
    .map(s => `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;">${s.label}</td><td style="padding:4px 0;font-weight:600;">${s.value}%</td></tr>`)
    .join('')

  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:18px;">New report generated</h2>
    <p style="margin:0 0 16px;color:#6B6B6B;font-size:14px;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST</p>
    <table style="font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;">Flow</td><td style="padding:4px 0;font-weight:600;">${n.flow}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;">Business type</td><td style="padding:4px 0;font-weight:600;">${n.businessType || '—'}</td></tr>
      ${n.businessName ? `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;">Business name</td><td style="padding:4px 0;font-weight:600;">${n.businessName}</td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;">Location</td><td style="padding:4px 0;font-weight:600;">${[n.suburb, n.state].filter(Boolean).join(', ') || '—'}</td></tr>
      ${scores}
      ${n.totalReports !== undefined ? `<tr><td style="padding:12px 12px 4px 0;color:#6B6B6B;">Usage</td><td style="padding:12px 0 4px;font-weight:600;">${n.totalReports} / ${n.totalLimit} lifetime reports</td></tr>` : ''}
    </table>
  </div>`
}

/**
 * Send an admin notification. Never throws — logs and moves on.
 * Call without awaiting (or with `void`) so the user's request isn't delayed.
 */
export async function notifyReportGenerated(n: ReportNotification): Promise<void> {
  if (!isConfigured()) return

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GlobalBiz AI <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL],
        subject: `[GlobalBiz] ${n.flow} report — ${n.businessType}${n.suburb ? ` in ${n.suburb}` : ''}`,
        html: buildHtml(n),
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.warn('[notify] Resend responded', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.warn('[notify] email failed (non-fatal):', err)
  }
}

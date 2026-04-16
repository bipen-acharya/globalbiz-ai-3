# GlobalBiz AI — Deployment Guide

## 1. Supabase Setup

1. Go to https://supabase.com → New project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy your **service_role key** (keep this secret — server-side only)
4. Go to SQL Editor → New Query → paste contents of `supabase-schema.sql` → Run

## 2. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Make sure you have GPT-4o access (or change model in `src/lib/openai.ts` to `gpt-4o-mini`)

## 3. Google Maps API Key (optional for Phase 1)

1. Go to https://console.cloud.google.com
2. Enable: Maps JavaScript API, Places API, Geocoding API
3. Create credentials → API Key
4. Restrict to your domain in production

## 4. Local Development

```bash
# Clone and install
npm install

# Copy env file
cp .env.example .env.local

# Fill in your keys in .env.local
# At minimum you need:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   OPENAI_API_KEY

# Run dev server
npm run dev
```

Open http://localhost:3000

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts — select your project settings
# Framework: Next.js
# Build command: npm run build
# Output: .next
```

Or connect via GitHub:
1. Push repo to GitHub
2. Go to https://vercel.com → New Project → Import from GitHub
3. Add all environment variables from `.env.example`
4. Deploy

## 6. Custom Domain on Vercel

1. Vercel Dashboard → Your project → Settings → Domains
2. Add your domain → Follow DNS instructions
3. Add CNAME or A record in your domain registrar:
   - Type: A → Value: 76.76.19.19
   - Or CNAME: www → cname.vercel-dns.com
4. SSL is automatic via Let's Encrypt

## 7. Environment Variables (Vercel Dashboard)

Add these in Vercel → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... |
| `OPENAI_API_KEY` | sk-... |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | AIza... |
| `DAILY_REPORT_LIMIT` | 10 |
| `NEXT_PUBLIC_APP_URL` | https://yourdomain.com |

## 8. Stripe (Billing — Phase 2)

1. Create account at https://stripe.com
2. Get test keys from Dashboard → Developers → API Keys
3. Add to env vars
4. To activate Pro tier: implement subscription checkout in `/api/stripe/checkout` route

## 9. Post-Deploy Checklist

- [ ] Visit / — landing page loads
- [ ] Daily counter shows correctly
- [ ] /analyze — form works, all steps
- [ ] Form submits → loading screen → redirects to /report/[id]
- [ ] /report/[id] — scores, charts, roadmap all render
- [ ] /waitlist — form submits, success state shows
- [ ] Check Supabase → Table Editor to confirm data saving

## 10. Scaling Notes

- The `DAILY_REPORT_LIMIT` env var controls global daily cap (default: 10)
- Each report costs ~$0.05–0.20 in OpenAI API fees depending on detail
- Set OpenAI monthly spend limit at https://platform.openai.com/usage
- Enable Supabase Row Level Security (already in schema)
- Consider adding Vercel Edge Config for feature flags

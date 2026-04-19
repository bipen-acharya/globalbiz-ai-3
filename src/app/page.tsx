import Link from 'next/link'
import {
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Globe,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  Building2,
  Calculator,
  List,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { visaSubclasses, visaCategories } from '@/lib/visa-data'

const categoryIcons: Record<string, React.ReactNode> = {
  skilled: <Award className="h-4 w-4" />,
  employer: <Briefcase className="h-4 w-4" />,
  regional: <MapPin className="h-4 w-4" />,
  graduate: <GraduationCap className="h-4 w-4" />,
  student: <GraduationCap className="h-4 w-4" />,
  visitor: <Plane className="h-4 w-4" />,
  family: <Heart className="h-4 w-4" />,
  'working-holiday': <Globe className="h-4 w-4" />,
  temporary: <Building2 className="h-4 w-4" />,
}

const badgeVariantMap: Record<string, 'info' | 'purple' | 'success' | 'warning' | 'sky' | 'rose' | 'orange' | 'secondary'> = {
  skilled: 'info',
  employer: 'purple',
  regional: 'success',
  graduate: 'success',
  student: 'warning',
  visitor: 'sky',
  family: 'rose',
  'working-holiday': 'orange',
  temporary: 'secondary',
}

const sampleQuestions = [
  'What visa should I apply for to work as a software engineer in Australia?',
  "I'm married to an Australian citizen. What's the partner visa process?",
  'How long does a Subclass 482 visa take to process?',
  'Can I get permanent residency after a Working Holiday visa?',
  "What's the difference between Subclass 189 and 190?",
  'I just graduated from an Australian university. What are my options?',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
              <span className="text-[11px] font-black tracking-tight text-white">VG</span>
            </div>
            <span className="text-lg font-bold text-slate-900">VisaGuide</span>
            <Badge variant="info" className="text-[10px]">AU</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/occupations" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <List className="h-3.5 w-3.5" />
                Occupations
              </Button>
            </Link>
            <Link href="/stats" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <TrendingUp className="h-3.5 w-3.5" />
                PR Stats
              </Button>
            </Link>
            <Link href="/pr-calculator" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1.5 text-slate-600">
                <Calculator className="h-3.5 w-3.5" />
                PR Calculator
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="primary" size="sm" className="gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                Chat with AI
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{visaSubclasses.length} visa subclasses · 2025–26 fees · Real PR data</span>
        </div>
        <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Your Australian{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Visa Guide
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-500">
          Ask anything about Australian visas. Eligibility, 2025–26 costs, processing times, regional pathways,
          PR points calculator, and 80+ occupations for permanent residence.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/chat">
            <Button variant="primary" size="xl" className="gap-2 shadow-lg shadow-blue-200">
              <MessageCircle className="h-5 w-5" />
              Start chatting free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pr-calculator">
            <Button variant="outline" size="xl" className="gap-2">
              <Calculator className="h-5 w-5" />
              Calculate PR Points
            </Button>
          </Link>
          <Link href="/occupations">
            <Button variant="outline" size="xl" className="gap-2">
              <Briefcase className="h-5 w-5" />
              Occupation List
            </Button>
          </Link>
        </div>

        {/* Sample questions */}
        <div className="mt-12">
          <p className="mb-4 text-sm text-slate-400">Try asking about…</p>
          <div className="flex flex-wrap justify-center gap-2">
            {sampleQuestions.map((q) => (
              <Link key={q} href={`/chat?q=${encodeURIComponent(q)}`}>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow">
                  {q}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: <Award className="h-5 w-5 text-blue-600" />, value: `${visaSubclasses.length}`, label: 'Visa Subclasses' },
              { icon: <Briefcase className="h-5 w-5 text-indigo-600" />, value: '80+', label: 'PR Occupations' },
              { icon: <TrendingUp className="h-5 w-5 text-rose-600" />, value: '185k+', label: 'PR Grants 2024–25' },
              { icon: <Users className="h-5 w-5 text-teal-600" />, value: '5 yrs', label: 'Migration Data' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Tools */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">PR Planning Tools</h2>
          <p className="mt-2 text-slate-500">Everything you need to plan your path to permanent residence</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/pr-calculator">
            <div className="group cursor-pointer rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-slate-900 group-hover:text-blue-700">PR Points Calculator</h3>
              <p className="mb-4 text-sm text-slate-500">Calculate your Australian points test score for Subclass 189, 190, and 491 visas. See which visa you qualify for and how to maximise your score.</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                Calculate now <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
          <Link href="/occupations">
            <div className="group cursor-pointer rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 transition-all hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-slate-900 group-hover:text-purple-700">Occupation List for PR</h3>
              <p className="mb-4 text-sm text-slate-500">80+ ANZSCO occupations across all skill levels. See which visas each occupation can access, assessing bodies, and 2025 salary ranges.</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                Browse occupations <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
          <Link href="/chat">
            <div className="group cursor-pointer rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-md">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-slate-900 group-hover:text-emerald-700">AI Visa Advisor</h3>
              <p className="mb-4 text-sm text-slate-500">Chat with our AI advisor trained on all Australian visa subclasses. Get personalised guidance on your situation, requirements, and next steps.</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                Ask AI now <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
          <Link href="/stats">
            <div className="group cursor-pointer rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-6 transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-slate-900 group-hover:text-rose-700">PR Statistics 2023–24</h3>
              <p className="mb-4 text-sm text-slate-500">See who got PR last year — top occupations, state-by-state grants, visa stream breakdown, and SkillSelect invitation round data.</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-rose-600">
                View stats <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Visa Cards */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900">All {visaSubclasses.length} Visa Subclasses (2025–26)</h2>
          <p className="text-slate-500">
            Click any visa to start a conversation about it, or{' '}
            <Link href="/chat" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              ask a free-form question
            </Link>
            .
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visaSubclasses.map((visa) => {
            const cat = visaCategories[visa.category]
            const variantName = badgeVariantMap[visa.category]
            return (
              <Link
                key={visa.subclass}
                href={`/chat?q=${encodeURIComponent(`Tell me about the Subclass ${visa.subclass} ${visa.name} visa`)}`}
              >
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Subclass {visa.subclass}
                          </span>
                          {visa.pathwayToPR && (
                            <span className="rounded-sm bg-emerald-100 px-1 py-0.5 text-[10px] font-semibold text-emerald-700">
                              PR pathway
                            </span>
                          )}
                        </div>
                        <h3 className="mt-0.5 font-bold text-slate-900 group-hover:text-blue-700">
                          {visa.name}
                        </h3>
                      </div>
                      <Badge variant={variantName} className="shrink-0 gap-1">
                        {categoryIcons[visa.category]}
                        {cat.label}
                      </Badge>
                    </div>
                    <p className="mb-4 text-sm text-slate-500 line-clamp-2">{visa.description}</p>
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Processing</div>
                        <div className="text-xs font-medium text-slate-700">{visa.processingTime}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Validity</div>
                        <div className="text-xs font-medium text-slate-700">{visa.validity}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">Cost</div>
                        <div className="text-xs font-medium text-slate-700">{visa.cost}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center shadow-xl shadow-blue-200">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Not sure which visa is right for you?
          </h2>
          <p className="mb-8 text-blue-100">
            Describe your situation and our AI will guide you to the best pathway.
          </p>
          <Link href="/chat">
            <Button size="xl" variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
              <MessageCircle className="h-5 w-5" />
              Chat with AI Advisor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
        <p>
          VisaGuide is for informational purposes only and does not constitute legal advice.
          Always consult a registered migration agent (MARA) for your specific circumstances.
        </p>
        <p className="mt-2">
          Built with{' '}
          <span className="text-blue-600">Claude AI</span> · Next.js 14 · Tailwind CSS
        </p>
      </footer>
    </div>
  )
}

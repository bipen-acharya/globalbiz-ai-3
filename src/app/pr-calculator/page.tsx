"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Calculator,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Points Rules (Australian Skilled Migration Points Test 2025) ─────────────

const AGE_OPTIONS = [
  { label: "18–24 years", value: 25 },
  { label: "25–32 years", value: 30 },
  { label: "33–39 years", value: 25 },
  { label: "40–44 years", value: 15 },
  { label: "45–49 years", value: 0 },
];

const ENGLISH_OPTIONS = [
  { label: "Competent English (IELTS 6 each band / OET B)", value: 0 },
  { label: "Proficient English (IELTS 7 each band / OET B+)", value: 10 },
  { label: "Superior English (IELTS 8 each band / OET A)", value: 20 },
];

const OVERSEAS_EXP_OPTIONS = [
  { label: "Less than 3 years", value: 0 },
  { label: "3 to less than 5 years", value: 5 },
  { label: "5 to less than 8 years", value: 10 },
  { label: "8 years or more", value: 15 },
];

const AUS_EXP_OPTIONS = [
  { label: "Less than 1 year", value: 0 },
  { label: "1 to less than 3 years", value: 5 },
  { label: "3 to less than 5 years", value: 10 },
  { label: "5 to less than 8 years", value: 15 },
  { label: "8 years or more", value: 20 },
];

const EDUCATION_OPTIONS = [
  { label: "No recognised qualification", value: 0 },
  { label: "Trade/Diploma/Certificate (AQF 3–5)", value: 10 },
  { label: "Bachelor Degree (AQF 7)", value: 15 },
  { label: "Honours / Masters by Coursework (AQF 8–9)", value: 15 },
  { label: "Masters by Research / Doctorate / PhD (AQF 9–10)", value: 20 },
];

const PARTNER_OPTIONS = [
  {
    label: "Single, OR partner is Australian citizen/PR/NZ citizen",
    value: 10,
  },
  {
    label: "Partner has nominated occupation AND competent English",
    value: 10,
  },
  { label: "Other (partner does not have nominated skills/English)", value: 0 },
];

interface Points {
  age: number;
  english: number;
  overseasExp: number;
  ausExp: number;
  education: number;
  ausStudy: number;
  stem: number;
  communityLang: number;
  regionalStudy: number;
  professionalYear: number;
  partner: number;
}

const DEFAULT: Points = {
  age: 30,
  english: 10,
  overseasExp: 0,
  ausExp: 0,
  education: 15,
  ausStudy: 0,
  stem: 0,
  communityLang: 0,
  regionalStudy: 0,
  professionalYear: 0,
  partner: 0,
};

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function RadioGroup({
  options,
  selected,
  onChange,
  color = "blue",
}: {
  options: { label: string; value: number }[];
  selected: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
            selected === opt.value
              ? "border-blue-400 bg-blue-50 text-blue-900"
              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
          )}
        >
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              selected === opt.value
                ? "border-blue-500 bg-blue-500"
                : "border-slate-300"
            )}
          >
            {selected === opt.value && (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
          <span className="flex-1">{opt.label}</span>
          {opt.value > 0 && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                selected === opt.value
                  ? "bg-blue-200 text-blue-800"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              +{opt.value} pts
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  points,
  checked,
  onChange,
}: {
  label: string;
  sublabel?: string;
  points: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
        checked
          ? "border-emerald-400 bg-emerald-50"
          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded",
          checked ? "bg-emerald-500" : "border-2 border-slate-300"
        )}
      >
        {checked && <CheckCircle2 className="h-4 w-4 text-white" />}
      </div>
      <div className="flex-1">
        <span className={cn("font-medium", checked ? "text-emerald-900" : "text-slate-700")}>{label}</span>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
          checked ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"
        )}
      >
        +{points} pts
      </span>
    </button>
  );
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 75
      ? "bg-blue-500"
      : score >= 65
      ? "bg-amber-500"
      : "bg-red-400";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function PRCalculatorPage() {
  const [pts, setPts] = useState<Points>(DEFAULT);

  const update = <K extends keyof Points>(key: K, value: Points[K]) =>
    setPts((p) => ({ ...p, [key]: value }));

  const total = useMemo(
    () =>
      pts.age +
      pts.english +
      pts.overseasExp +
      pts.ausExp +
      pts.education +
      pts.ausStudy +
      pts.stem +
      pts.communityLang +
      pts.regionalStudy +
      pts.professionalYear +
      pts.partner,
    [pts]
  );

  const score189 = total;
  const score190 = total + 5;   // +5 state nomination
  const score491 = total + 15;  // +15 regional nomination

  const eligible = total >= 65;
  const eligible190 = score190 >= 65;
  const eligible491 = score491 >= 65;

  type EligStatus = "excellent" | "good" | "marginal" | "ineligible";
  function status(s: number): EligStatus {
    if (s >= 90) return "excellent";
    if (s >= 75) return "good";
    if (s >= 65) return "marginal";
    return "ineligible";
  }

  const statusConfig: Record<EligStatus, { label: string; color: string; bg: string; border: string }> = {
    excellent: { label: "Excellent — likely to receive invitation", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    good: { label: "Good — competitive score", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    marginal: { label: "Eligible — but may need to wait", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    ineligible: { label: "Below minimum (65 points required)", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  };

  const breakdown = [
    { label: "Age", value: pts.age },
    { label: "English Language", value: pts.english },
    { label: "Overseas Work Experience", value: pts.overseasExp },
    { label: "Australian Work Experience", value: pts.ausExp },
    { label: "Educational Qualification", value: pts.education },
    { label: "Australian Study Requirement", value: pts.ausStudy },
    { label: "STEM Qualification (AUS)", value: pts.stem },
    { label: "Credentialled Community Language", value: pts.communityLang },
    { label: "Study in Regional Australia", value: pts.regionalStudy },
    { label: "Professional Year (AUS)", value: pts.professionalYear },
    { label: "Partner Skills", value: pts.partner },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-[10px] font-black tracking-tight text-white">VG</span>
              </div>
              <span className="font-bold text-slate-900">PR Points Calculator</span>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="primary" size="sm">Ask AI Advisor</Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <Calculator className="h-3.5 w-3.5" />
            <span>Australian Skilled Migration — Points Test 2025</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Calculate Your PR Points Score
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500">
            The Australian Points Test determines your eligibility for skilled migration visas (Subclass 189, 190, 491). Minimum 65 points required. Most invitations go to 75–95+ points.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: form (2 cols) */}
          <div className="space-y-5 lg:col-span-2">
            {/* Age */}
            <Section title="Age at Time of Invitation" icon={<span className="text-lg">🎂</span>}>
              <RadioGroup
                options={AGE_OPTIONS}
                selected={pts.age}
                onChange={(v) => update("age", v)}
              />
              <p className="mt-2 text-xs text-slate-400">
                ⚠️ Age is assessed at the date of invitation to apply — not at lodgement. Must be under 45 at invitation.
              </p>
            </Section>

            {/* English */}
            <Section title="English Language Ability" icon={<span className="text-lg">🗣️</span>}>
              <RadioGroup
                options={ENGLISH_OPTIONS}
                selected={pts.english}
                onChange={(v) => update("english", v)}
              />
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
                <p><strong>Test equivalents for Superior English (20 pts):</strong></p>
                <p>IELTS Academic: 8.0 in each band | PTE Academic: 79 each | TOEFL iBT: 24L/24R/27W/23S | OET: A in all components | Cambridge C1/C2 Advanced: 185 each skill</p>
              </div>
            </Section>

            {/* Overseas Work Experience */}
            <Section title="Overseas Skilled Work Experience" icon={<span className="text-lg">✈️</span>}>
              <p className="mb-3 text-xs text-slate-500">
                Work experience outside Australia in your nominated occupation or closely related field (assessed within last 10 years)
              </p>
              <RadioGroup
                options={OVERSEAS_EXP_OPTIONS}
                selected={pts.overseasExp}
                onChange={(v) => update("overseasExp", v)}
              />
            </Section>

            {/* Australian Work Experience */}
            <Section title="Australian Skilled Work Experience" icon={<span className="text-lg">🦘</span>}>
              <p className="mb-3 text-xs text-slate-500">
                Paid skilled work in Australia in your nominated occupation or closely related field
              </p>
              <RadioGroup
                options={AUS_EXP_OPTIONS}
                selected={pts.ausExp}
                onChange={(v) => update("ausExp", v)}
              />
            </Section>

            {/* Education */}
            <Section title="Educational Qualification" icon={<span className="text-lg">🎓</span>}>
              <RadioGroup
                options={EDUCATION_OPTIONS}
                selected={pts.education}
                onChange={(v) => update("education", v)}
              />
              <p className="mt-2 text-xs text-slate-400">
                Qualification must be relevant to your nominated occupation and meet the skills assessment body's requirements.
              </p>
            </Section>

            {/* Partner Skills */}
            <Section title="Partner / Spouse Skills" icon={<span className="text-lg">💑</span>}>
              <RadioGroup
                options={PARTNER_OPTIONS}
                selected={pts.partner}
                onChange={(v) => update("partner", v)}
              />
              <p className="mt-2 text-xs text-slate-400">
                If your partner has a nominated occupation on the relevant list AND has at least competent English, you both score 10 points (not 20 total — the maximum partner bonus is 10 points).
              </p>
            </Section>

            {/* Bonus Points */}
            <Section title="Bonus Points (select all that apply)" icon={<Star className="h-4 w-4 text-amber-500" />}>
              <div className="space-y-3">
                <Toggle
                  label="Australian Study Requirement"
                  sublabel="Hold at least 1 AQF qualification (Diploma or higher) from an Australian institution after 2+ years of study in Australia"
                  points={5}
                  checked={pts.ausStudy === 5}
                  onChange={(v) => update("ausStudy", v ? 5 : 0)}
                />
                <Toggle
                  label="STEM Specialist Education Qualification"
                  sublabel="Masters or Doctorate (AQF 9 or 10) in a STEM field from an Australian institution"
                  points={10}
                  checked={pts.stem === 10}
                  onChange={(v) => update("stem", v ? 10 : 0)}
                />
                <Toggle
                  label="Credentialled Community Language"
                  sublabel="Certified by NAATI (National Accreditation Authority for Translators and Interpreters) as a translator/interpreter"
                  points={5}
                  checked={pts.communityLang === 5}
                  onChange={(v) => update("communityLang", v ? 5 : 0)}
                />
                <Toggle
                  label="Study in Regional Australia"
                  sublabel="Completed at least 2 academic years of study in a regional area of Australia (outside major cities)"
                  points={5}
                  checked={pts.regionalStudy === 5}
                  onChange={(v) => update("regionalStudy", v ? 5 : 0)}
                />
                <Toggle
                  label="Professional Year in Australia"
                  sublabel="Completed a Professional Year program in Australia (accounting, engineering, or ICT)"
                  points={5}
                  checked={pts.professionalYear === 5}
                  onChange={(v) => update("professionalYear", v ? 5 : 0)}
                />
              </div>
              <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
                <strong>Note:</strong> STEM bonus (10 pts) requires a qualifying AQF 9–10 STEM degree from an Australian institution AND you must already be claiming the Australian study requirement points.
              </div>
            </Section>
          </div>

          {/* Right: sticky score panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Main score */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
                <div className="mb-1 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Your Score
                </div>
                <div className="mb-3 text-center">
                  <span className={cn(
                    "text-7xl font-extrabold tabular-nums",
                    total >= 90 ? "text-emerald-600" :
                    total >= 75 ? "text-blue-600" :
                    total >= 65 ? "text-amber-600" : "text-red-500"
                  )}>
                    {total}
                  </span>
                  <span className="ml-2 text-2xl text-slate-400">/ 140</span>
                </div>
                <ScoreBar score={total} max={140} />
                <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                  <span>0</span>
                  <span className="font-semibold text-red-500">65 min</span>
                  <span className="text-blue-500">75 good</span>
                  <span className="text-emerald-500">90+ ideal</span>
                  <span>140</span>
                </div>
              </div>

              {/* Visa eligibility */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Visa Eligibility
                </h3>
                <div className="space-y-3">
                  {[
                    { subclass: "189", label: "Skilled Independent", score: score189, eligible: eligible, note: "No sponsorship needed" },
                    { subclass: "190", label: "Skilled Nominated", score: score190, eligible: eligible190, note: "+5 pts from state nomination" },
                    { subclass: "491", label: "Regional (Provisional)", score: score491, eligible: eligible491, note: "+15 pts from regional nomination" },
                  ].map((visa) => {
                    const s = status(visa.score);
                    const cfg = statusConfig[s];
                    return (
                      <div key={visa.subclass} className={cn("rounded-xl border p-3", cfg.border, cfg.bg)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-500">SC {visa.subclass}</span>
                              <span className="text-xs font-medium text-slate-700">{visa.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{visa.note}</p>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-xl font-extrabold tabular-nums", cfg.color)}>
                              {visa.score}
                            </div>
                            <div className={cn("text-[10px] font-semibold", cfg.color)}>
                              {visa.eligible ? "✓ Eligible" : "✗ Below 65"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                  * State nomination (190) and regional nomination (491) points are added automatically — you receive them when nominated.
                </p>
              </div>

              {/* Typical invitation rounds */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 font-bold text-slate-900 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Typical Invitation Rounds
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    { visa: "189 (ICT)", range: "75–85 pts", difficulty: "Very competitive" },
                    { visa: "189 (Accounting)", range: "80–90 pts", difficulty: "Very competitive" },
                    { visa: "189 (Engineering)", range: "75–90 pts", difficulty: "Competitive" },
                    { visa: "189 (Nursing)", range: "65–80 pts", difficulty: "Moderate" },
                    { visa: "190 (varies by state)", range: "65–80 pts", difficulty: "State dependent" },
                    { visa: "491 (Regional)", range: "65–75 pts", difficulty: "More accessible" },
                  ].map((r) => (
                    <div key={r.visa} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <span className="font-medium">{r.visa}</span>
                        <span className="ml-2 text-slate-400">{r.difficulty}</span>
                      </div>
                      <span className="font-bold text-blue-700">{r.range}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                  Invitation scores vary by occupation and change each round. Always check the latest SkillSelect data on the Department of Home Affairs website.
                </p>
              </div>

              {/* Score breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 font-bold text-slate-900">Point Breakdown</h3>
                <div className="space-y-1">
                  {breakdown.map((b) =>
                    b.value > 0 ? (
                      <div key={b.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{b.label}</span>
                        <span className="font-bold text-blue-700">+{b.value}</span>
                      </div>
                    ) : null
                  )}
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-bold">
                    <span>Total</span>
                    <span className={cn(
                      total >= 65 ? "text-blue-700" : "text-red-500"
                    )}>{total} pts</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-center text-white">
                <p className="mb-1 font-bold">Want personalised advice?</p>
                <p className="mb-4 text-sm text-blue-100">
                  Our AI advisor can help you understand your options and next steps.
                </p>
                <Link href={`/chat?q=${encodeURIComponent(`I have ${total} points in the Australian points test. What are my best visa options and how can I improve my score?`)}`}>
                  <Button variant="outline" size="sm" className="w-full bg-white text-blue-700 hover:bg-blue-50">
                    Ask AI with my score →
                  </Button>
                </Link>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  This calculator is for guidance only. Points are subject to official assessment by the Department of Home Affairs and relevant assessing authorities. Always consult a registered migration agent (MARA) for your specific situation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Globe,
  ArrowLeft,
  TrendingUp,
  Users,
  MapPin,
  Award,
  MessageCircle,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fiveYearTrend,
  countryDataByYear,
  getYearFacts,
  getCountryTrendData,
  migrationStreams,
  migrationOverview,
  topOccupationGrants,
  stateNominations,
  skillSelectRounds,
  type ProgrammeYear,
} from "@/lib/stats-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTRY_COLORS: Record<string, string> = {
  "India":           "#f97316",
  "China (PRC)":     "#ef4444",
  "Philippines":     "#3b82f6",
  "Nepal":           "#8b5cf6",
  "United Kingdom":  "#06b6d4",
  "Sri Lanka":       "#10b981",
  "Pakistan":        "#f59e0b",
  "Vietnam":         "#ec4899",
  "Afghanistan":     "#64748b",
  "South Africa":    "#6366f1",
};

const CAT_COLORS: Record<string, string> = {
  Healthcare:        "#06b6d4",
  ICT:               "#6366f1",
  Engineering:       "#f59e0b",
  Trades:            "#10b981",
  Education:         "#ec4899",
  "Business & Finance": "#8b5cf6",
  Hospitality:       "#64748b",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-AU");
}

function pct(a: number, b: number) {
  return `${Math.round((a / b) * 100)}%`;
}

// ── Custom Tooltips ───────────────────────────────────────────────────────────

function CountryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl text-sm max-w-xs">
      <p className="mb-2 font-bold text-slate-900">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-slate-800">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl text-sm">
      <p className="mb-1 font-semibold text-slate-900">{label}</p>
      <p className="text-slate-600">{fmt(payload[0].value)} grants</p>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl text-sm min-w-[200px]">
      <p className="mb-2 font-bold text-slate-900">{label}</p>
      {sorted.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: p.color }}>
            <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="text-xs font-semibold text-slate-700">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [selectedYear, setSelectedYear] = useState<ProgrammeYear>("2024-25");

  const yearData = useMemo(
    () => fiveYearTrend.find((y) => y.year === selectedYear)!,
    [selectedYear]
  );

  const countryData = useMemo(
    () => countryDataByYear.find((d) => d.year === selectedYear)!,
    [selectedYear]
  );

  const yearFacts = useMemo(() => getYearFacts(selectedYear), [selectedYear]);
  const countryTrendData = useMemo(() => getCountryTrendData(), []);

  const topCountriesForChart = useMemo(
    () =>
      [...countryData.countries]
        .sort((a, b) => b.grants - a.grants)
        .slice(0, 10),
    [countryData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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
              <span className="font-bold text-slate-900">Australian PR Statistics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/occupations">
              <Button variant="ghost" size="sm">Occupation List</Button>
            </Link>
            <Link href="/pr-calculator">
              <Button variant="outline" size="sm">Points Calculator</Button>
            </Link>
            <Link href="/chat">
              <Button variant="primary" size="sm" className="gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                Ask AI
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Official data · Department of Home Affairs · 2020–21 to 2024–25</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Who Got Australian PR?
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500">
            5 years of real migration data — which countries, which occupations, and which states
            dominated Australia&apos;s permanent residence programme.
          </p>
        </div>

        {/* ── Year Selector ────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {fiveYearTrend.map((y) => (
            <button
              key={y.year}
              onClick={() => setSelectedYear(y.year)}
              className={cn(
                "relative flex flex-col items-center rounded-xl border px-5 py-3 text-sm font-semibold transition-all",
                selectedYear === y.year
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <span className="text-base font-extrabold">{y.label}</span>
              <span className={cn(
                "text-[11px]",
                selectedYear === y.year ? "text-blue-200" : "text-slate-400"
              )}>
                {fmt(y.total)} grants
              </span>
              {!y.verified && (
                <span className={cn(
                  "mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  selectedYear === y.year ? "bg-blue-500 text-blue-100" : "bg-amber-100 text-amber-700"
                )}>
                  PRELIMINARY
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Year context note ────────────────────────────────────────────── */}
        <div className={cn(
          "mb-6 flex items-start gap-2 rounded-xl border p-3 text-sm",
          yearData.verified
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        )}>
          {yearData.verified
            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          }
          <span>
            <strong>{yearData.label}:</strong> {yearData.note}
            {!yearData.verified && " · Figures are preliminary from DHA Migration Trends 2024-25."}
          </span>
        </div>

        {/* ── Key Facts for selected year ──────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {yearFacts.map((f) => (
            <div
              key={f.label}
              className={cn(
                "rounded-2xl border p-5",
                f.color === "blue"   && "border-blue-200 bg-blue-50",
                f.color === "indigo" && "border-indigo-200 bg-indigo-50",
                f.color === "purple" && "border-purple-200 bg-purple-50",
                f.color === "rose"   && "border-rose-200 bg-rose-50"
              )}
            >
              <div className={cn(
                "mb-1 text-2xl font-extrabold",
                f.color === "blue"   && "text-blue-700",
                f.color === "indigo" && "text-indigo-700",
                f.color === "purple" && "text-purple-700",
                f.color === "rose"   && "text-rose-700"
              )}>
                {f.value}
              </div>
              <div className="font-semibold text-slate-800">{f.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{f.sub}</div>
              {!f.verified && (
                <div className="mt-1.5 text-[10px] font-semibold text-amber-600">~ estimated</div>
              )}
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION: 5-YEAR PROGRAMME TREND
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            5-Year Migration Programme — Total Grants
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Official DHA programme outcomes. Borders reopened November 2021 after COVID-19 closures.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fiveYearTrend} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="total" name="Total Grants" radius={[6, 6, 0, 0]}>
                {fiveYearTrend.map((y) => (
                  <Cell
                    key={y.year}
                    fill={y.year === selectedYear ? "#2563eb" : y.verified ? "#93c5fd" : "#fcd34d"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Skill vs Family stacked legend */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 uppercase tracking-wider">
                  <th className="pb-1.5 pr-4">Year</th>
                  <th className="pb-1.5 pr-4">Total</th>
                  <th className="pb-1.5 pr-4 text-blue-600">Skilled</th>
                  <th className="pb-1.5 pr-4 text-pink-600">Family</th>
                  <th className="pb-1.5">Skilled %</th>
                </tr>
              </thead>
              <tbody>
                {fiveYearTrend.map((y) => (
                  <tr
                    key={y.year}
                    className={cn(
                      "border-t border-slate-50",
                      y.year === selectedYear && "bg-blue-50 font-semibold"
                    )}
                  >
                    <td className="py-1.5 pr-4 font-semibold text-slate-700">{y.label}</td>
                    <td className="py-1.5 pr-4 text-slate-900">{fmt(y.total)}</td>
                    <td className="py-1.5 pr-4 text-blue-700">{fmt(y.skilled)}</td>
                    <td className="py-1.5 pr-4 text-pink-700">{fmt(y.family)}</td>
                    <td className="py-1.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5",
                        Math.round((y.skilled / y.total) * 100) >= 70
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {pct(y.skilled, y.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION: COUNTRY OF ORIGIN
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Globe className="h-5 w-5 text-indigo-600" />
            Who Got PR? — Country of Origin
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Country of citizenship. Showing {yearData.label} data.
          </p>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          {/* Bar chart — top 10 countries */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            <h3 className="mb-4 font-bold text-slate-900">
              Top 10 Countries — {yearData.label}
            </h3>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={topCountriesForChart}
                layout="vertical"
                margin={{ left: 12, right: 24, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  width={130}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="grants" radius={[0, 4, 4, 0]} name="PR Grants">
                  {topCountriesForChart.map((c) => (
                    <Cell
                      key={c.country}
                      fill={COUNTRY_COLORS[c.country] ?? "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country table */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            {topCountriesForChart.map((c, i) => {
              const total = countryData.countries.reduce((s, x) => s + x.grants, 0);
              const share = Math.round((c.grants / yearData.total) * 100);
              return (
                <div
                  key={c.country}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-all",
                    i === 0
                      ? "border-orange-200 bg-orange-50"
                      : "border-slate-100 bg-white"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
                    {c.flag}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {c.country}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-slate-900">
                        {fmt(c.grants)}
                      </span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct(c.grants, topCountriesForChart[0].grants)}`,
                          backgroundColor: COUNTRY_COLORS[c.country] ?? "#94a3b8",
                        }}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{share}% of total</span>
                      {c.yoyChange !== undefined && c.yoyChange !== null && (
                        <span className={cn(
                          "font-semibold",
                          c.yoyChange > 0 ? "text-emerald-600" : "text-red-500"
                        )}>
                          {c.yoyChange > 0 ? "▲" : "▼"} {Math.abs(c.yoyChange).toFixed(1)}% YoY
                        </span>
                      )}
                      {!c.verified && <span className="text-amber-500">~est.</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5-Year Country Trend Line Chart ─────────────────────────────── */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-1 font-bold text-slate-900">
            5-Year Trend — Top Source Countries
          </h3>
          <p className="mb-5 text-xs text-slate-500">
            India, Philippines, Nepal, Sri Lanka, UK and China — how each country&apos;s PR grants changed 2020–25.
            Dashed lines indicate estimated data.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={countryTrendData}
              margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend />
              {[
                "India",
                "Philippines",
                "China (PRC)",
                "Nepal",
                "United Kingdom",
                "Sri Lanka",
                "Pakistan",
              ].map((country) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={COUNTRY_COLORS[country]}
                  strokeWidth={country === "India" ? 2.5 : 1.8}
                  dot={{ r: 3, fill: COUNTRY_COLORS[country] }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Key insight callouts */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                flag: "🇮🇳",
                country: "India",
                insight: "Dominant source — 26–29% of all PRs every year. Peaked at 49,814 in 2023-24.",
                color: "orange",
              },
              {
                flag: "🇳🇵",
                country: "Nepal",
                insight: "Fastest growing source — 4,364 in 2022-23 to 11,501 in 2023-24 (+163%). Skill-heavy.",
                color: "purple",
              },
              {
                flag: "🇱🇰",
                country: "Sri Lanka",
                insight: "Surging in 2024-25 with +66.8% growth; 9,444 grants driven by skilled stream.",
                color: "emerald",
              },
            ].map((c) => (
              <div
                key={c.country}
                className={cn(
                  "rounded-xl border p-3",
                  c.color === "orange"  && "border-orange-200 bg-orange-50",
                  c.color === "purple"  && "border-purple-200 bg-purple-50",
                  c.color === "emerald" && "border-emerald-200 bg-emerald-50"
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span className="text-xl">{c.flag}</span> {c.country}
                </div>
                <p className="text-[11px] text-slate-600">{c.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skill vs Family by Country ───────────────────────────────────── */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Users className="h-5 w-5 text-blue-600" />
              Skill vs Family Stream by Country — {yearData.label}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right text-blue-600">Skilled</th>
                  <th className="px-5 py-3 text-right text-pink-600">Family</th>
                  <th className="px-5 py-3">Split</th>
                  <th className="px-5 py-3">YoY Change</th>
                  <th className="px-5 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {topCountriesForChart.map((c, i) => {
                  const skillPct = Math.round((c.skillStream / c.grants) * 100);
                  return (
                    <tr
                      key={c.country}
                      className={cn(
                        "border-b border-slate-50 hover:bg-blue-50/20 transition-colors",
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      )}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-semibold text-slate-900">{c.country}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">
                        {fmt(c.grants)}
                      </td>
                      <td className="px-5 py-3 text-right text-blue-700">{fmt(c.skillStream)}</td>
                      <td className="px-5 py-3 text-right text-pink-700">{fmt(c.familyStream)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-pink-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${skillPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-blue-700 font-semibold">{skillPct}% skilled</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {c.yoyChange !== undefined && c.yoyChange !== null ? (
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            c.yoyChange > 10  ? "bg-emerald-100 text-emerald-700"
                            : c.yoyChange > 0 ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                          )}>
                            {c.yoyChange > 0 ? "▲" : "▼"} {Math.abs(c.yoyChange).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {c.verified ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600">~ Estimated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION: VISA STREAM BREAKDOWN
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-blue-600" />
              Visa Stream Breakdown 2023–24
            </h2>
            <div className="space-y-3">
              {migrationStreams.map((s) => {
                const p = Math.round((s.granted2324 / migrationOverview.totalGranted2324) * 100);
                return (
                  <div key={s.stream}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.stream}</span>
                      <span className="font-bold text-slate-900">{fmt(s.granted2324)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: s.color }} />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{s.description}</span>
                      <span className="text-[11px] font-semibold" style={{ color: s.color }}>{p}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Users className="h-5 w-5 text-indigo-600" />
              Programme Mix 2023–24
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={migrationStreams}
                  dataKey="granted2324"
                  nameKey="stream"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    `${(name as string).split(" ")[0]} ${((percent as number) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {migrationStreams.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [fmt(Number(v)) + " grants", ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION: TOP OCCUPATIONS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Top Occupations — PR Grants 2023–24
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Permanent residence grants across employer-sponsored, points-tested, and regional streams.
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={topOccupationGrants}
              layout="vertical"
              margin={{ left: 16, right: 24, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <YAxis
                type="category"
                dataKey="occupation"
                width={195}
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="grantsTotal" radius={[0, 4, 4, 0]}>
                {topOccupationGrants.map((e) => (
                  <Cell key={e.anzsco} fill={CAT_COLORS[e.category] ?? "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-500">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation table */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <Users className="h-5 w-5 text-blue-600" />
              Occupation Detail — Top PR Grants 2023–24
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Occupation</th>
                  <th className="px-5 py-3">ANZSCO</th>
                  <th className="px-5 py-3 text-right">Total Grants</th>
                  <th className="px-5 py-3">Top State</th>
                  <th className="px-5 py-3 text-right">State Grants</th>
                  <th className="px-5 py-3">Common Visas</th>
                </tr>
              </thead>
              <tbody>
                {topOccupationGrants.map((occ, i) => (
                  <tr
                    key={occ.anzsco}
                    className={cn(
                      "border-b border-slate-50 hover:bg-blue-50/20",
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900">{occ.occupation}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{occ.anzsco}</td>
                    <td className="px-5 py-3 text-right font-bold text-blue-700">{fmt(occ.grantsTotal)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                        {occ.topState}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-slate-600">
                      {fmt(occ.topStateGrants)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {occ.visaSubclass.split(", ").map((v) => (
                          <span key={v} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION: STATE NOMINATIONS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="h-5 w-5 text-teal-600" />
              State Nomination Allocations 2024–25
            </h2>
            <div className="space-y-3">
              {stateNominations.map((s) => {
                const p = Math.round((s.allocation2425 / 26_260) * 100);
                return (
                  <div key={s.abbr}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-8 items-center justify-center rounded text-[10px] font-extrabold text-white" style={{ backgroundColor: s.color }}>
                          {s.abbr}
                        </span>
                        <span className="font-medium text-slate-700">{s.state}</span>
                      </div>
                      <span className="font-bold text-slate-900">{fmt(s.allocation2425)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: s.color }} />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Top occ: {s.topOccupation}</span>
                      <span>2023–24 granted: {fmt(s.granted2324)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-purple-600" />
              SkillSelect Invitation Rounds
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Minimum points needed to receive a SkillSelect invitation. Competitive = higher score needed.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-2">Round</th>
                  <th className="pb-2">Subclass</th>
                  <th className="pb-2 text-right">Min Score</th>
                  <th className="pb-2 text-right">Invitations</th>
                </tr>
              </thead>
              <tbody>
                {skillSelectRounds.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 text-xs text-slate-500">{r.date}</td>
                    <td className="py-2.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        r.subclass === "189" ? "bg-blue-100 text-blue-700"
                        : r.subclass === "190" ? "bg-indigo-100 text-indigo-700"
                        : "bg-teal-100 text-teal-700"
                      )}>
                        {r.subclass}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{r.lowestScore}</td>
                    <td className="py-2.5 text-right text-sm text-slate-600">{fmt(r.invitations)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <strong>Note:</strong> 189 visa consistently requires 85–90+ points in 2024–25 rounds.
              Some targeted rounds (e.g. Accountants) invite at lower scores within specific ANZSCO groups.
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            DATA SOURCES & DISCLAIMER
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Primary data sources (official DHA publications):</strong></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Australia&apos;s Migration Trends 2024-25, 2023-24, 2022-23, 2021-22, 2020-21 — Department of Home Affairs</li>
                <li>DHA Country Position Rankings 2023-24 (top-10 country data ✓ verified)</li>
                <li>DHA Migration Programme Reports 2022-23 and 2023-24 (stream breakdown ✓ verified)</li>
                <li>ABS Overseas Migration 2020-21 to 2024-25 — Australian Bureau of Statistics</li>
              </ul>
              <p className="mt-2">
                <strong>✓ Verified</strong> = exact figure from published DHA/ABS report.
                <strong className="mx-1">~ Estimated</strong> = calculated from published cohort percentages or trend extrapolation.
                <strong className="mx-1">PRELIMINARY</strong> = 2024-25 programme outcomes snapshot (not final report).
              </p>
              <p className="mt-2">
                <strong>Always verify at</strong> immi.homeaffairs.gov.au and consult a registered MARA migration agent before making immigration decisions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Ready to Start Your PR Journey?
          </h2>
          <p className="mb-6 text-blue-100">
            See where you stand with our points calculator, or ask our AI advisor what visa suits your profile.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pr-calculator">
              <Button size="lg" variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
                Calculate My Points
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/occupations">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/30">
                Check My Occupation
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/30">
                <MessageCircle className="h-4 w-4" />
                Ask AI Advisor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

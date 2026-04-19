"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  migrationOverview,
  migrationStreams,
  topOccupationGrants,
  stateNominations,
  skillSelectRounds,
  keyFacts,
} from "@/lib/stats-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-AU");
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="mb-1 font-semibold text-slate-900">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600">
          {fmt(p.value)} grants
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
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
                <Globe className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900">PR Statistics 2023–24</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Official data from Department of Home Affairs</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Who Got Australian PR in 2023–24?
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500">
            Real migration programme outcomes — top occupations, state-by-state
            nominations, visa stream breakdown, and SkillSelect invitation rounds.
          </p>
        </div>

        {/* Key Facts */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keyFacts.map((f) => (
            <div
              key={f.label}
              className={cn(
                "rounded-2xl border p-5",
                f.color === "blue" && "border-blue-200 bg-blue-50",
                f.color === "indigo" && "border-indigo-200 bg-indigo-50",
                f.color === "purple" && "border-purple-200 bg-purple-50",
                f.color === "teal" && "border-teal-200 bg-teal-50"
              )}
            >
              <div
                className={cn(
                  "mb-1 text-3xl font-extrabold",
                  f.color === "blue" && "text-blue-700",
                  f.color === "indigo" && "text-indigo-700",
                  f.color === "purple" && "text-purple-700",
                  f.color === "teal" && "text-teal-700"
                )}
              >
                {f.value}
              </div>
              <div className="font-semibold text-slate-800">{f.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Visa Stream Breakdown + Pie */}
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* Stream Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-blue-600" />
              Visa Stream Breakdown 2023–24
            </h2>
            <div className="space-y-3">
              {migrationStreams.map((s) => {
                const pct = Math.round((s.granted2324 / migrationOverview.totalGranted2324) * 100);
                return (
                  <div key={s.stream}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.stream}</span>
                      <span className="font-bold text-slate-900">{fmt(s.granted2324)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{s.description}</span>
                      <span className="text-[11px] font-semibold" style={{ color: s.color }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Users className="h-5 w-5 text-indigo-600" />
              Programme Mix
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={migrationStreams}
                  dataKey="granted2324"
                  nameKey="stream"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {migrationStreams.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v) + " grants"} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Occupations Bar Chart */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Top Occupations — PR Grants 2023–24
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Total permanent residence grants across all employer-sponsored, points-tested, and regional streams.
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
                width={190}
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="grantsTotal" radius={[0, 4, 4, 0]}>
                {topOccupationGrants.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.category === "Healthcare"
                        ? "#06b6d4"
                        : entry.category === "ICT"
                        ? "#6366f1"
                        : entry.category === "Engineering"
                        ? "#f59e0b"
                        : entry.category === "Trades"
                        ? "#10b981"
                        : entry.category === "Education"
                        ? "#ec4899"
                        : entry.category === "Business & Finance"
                        ? "#8b5cf6"
                        : "#64748b"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { cat: "Healthcare", color: "#06b6d4" },
              { cat: "ICT", color: "#6366f1" },
              { cat: "Engineering", color: "#f59e0b" },
              { cat: "Trades", color: "#10b981" },
              { cat: "Education", color: "#ec4899" },
              { cat: "Business & Finance", color: "#8b5cf6" },
              { cat: "Hospitality", color: "#64748b" },
            ].map((l) => (
              <div key={l.cat} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-slate-500">{l.cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation detail table */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Users className="h-5 w-5 text-blue-600" />
              Occupation Details — Top PR Grants
            </h2>
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
                      "border-b border-slate-50 hover:bg-blue-50/20 transition-colors",
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

        {/* State Nominations */}
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="h-5 w-5 text-teal-600" />
              State Nomination Allocations 2024–25
            </h2>
            <div className="space-y-3">
              {stateNominations.map((s) => {
                const pct = Math.round((s.allocation2425 / 26260) * 100);
                return (
                  <div key={s.abbr}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-8 items-center justify-center rounded text-[10px] font-extrabold text-white"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.abbr}
                        </span>
                        <span className="font-medium text-slate-700">{s.state}</span>
                      </div>
                      <span className="font-bold text-slate-900">{fmt(s.allocation2425)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Top occupation: {s.topOccupation}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        2023–24 granted: {fmt(s.granted2324)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SkillSelect rounds */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-purple-600" />
              SkillSelect Invitation Rounds
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Points needed to receive an invitation from the SkillSelect pool. Higher is more competitive.
            </p>
            <div className="overflow-x-auto">
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
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold",
                            r.subclass === "189"
                              ? "bg-blue-100 text-blue-700"
                              : r.subclass === "190"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-teal-100 text-teal-700"
                          )}
                        >
                          {r.subclass}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{r.lowestScore}</td>
                      <td className="py-2.5 text-right text-sm text-slate-600">
                        {fmt(r.invitations)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <strong>Note:</strong> Invitation scores vary each round based on pool size and visa
              places available. The 189 typically requires 85–90+ points to be competitive in 2024–25.
            </div>
          </div>
        </div>

        {/* State Nominations Bar Chart */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            State/Territory Nomination Allocations vs Granted — 2024–25
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={stateNominations}
              margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="abbr" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number, name: string) => [
                  fmt(v),
                  name === "allocation2425" ? "2024–25 Allocation" : "2023–24 Granted",
                ]}
              />
              <Bar dataKey="allocation2425" name="2024–25 Allocation" radius={[4, 4, 0, 0]}>
                {stateNominations.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Bar>
              <Bar dataKey="granted2324" name="2023–24 Granted" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-blue-600" />
              <span>2024–25 Allocation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-slate-300" />
              <span>2023–24 Granted</span>
            </div>
          </div>
        </div>

        {/* Disclaimer + CTA */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div className="text-xs text-blue-800">
              <strong>Data sources:</strong> Department of Home Affairs 2023–24 Migration Programme
              Report; Home Affairs Budget 2024–25 Planning Levels; SkillSelect monthly reports
              (Jan–Mar 2025). Occupation grant numbers are approximate based on published cohort data
              and may not sum exactly due to rounding or small sub-cohort suppression.
              <strong className="ml-1">
                Always verify current data at immi.homeaffairs.gov.au.
              </strong>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Ready to Start Your PR Journey?
          </h2>
          <p className="mb-6 text-blue-100">
            Calculate your points score or chat with our AI advisor for personalised guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pr-calculator">
              <Button size="lg" variant="outline" className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
                Calculate My Points
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

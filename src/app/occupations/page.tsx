"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Info,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  occupations,
  occupationCategories,
  listDescriptions,
  type OccupationList,
  type SkillLevel,
} from "@/lib/occupation-data";

const VISA_BADGES: Record<string, { label: string; color: string }> = {
  "189": { label: "189", color: "bg-blue-100 text-blue-800" },
  "190": { label: "190", color: "bg-indigo-100 text-indigo-800" },
  "491": { label: "491", color: "bg-teal-100 text-teal-800" },
  "494": { label: "494", color: "bg-cyan-100 text-cyan-800" },
  "186": { label: "186", color: "bg-purple-100 text-purple-800" },
  "482": { label: "482", color: "bg-orange-100 text-orange-800" },
  "482-SID": { label: "SID", color: "bg-rose-100 text-rose-800" },
};

const SKILL_LABELS: Record<SkillLevel, { label: string; color: string }> = {
  1: { label: "Skill Level 1 (Degree)", color: "bg-blue-100 text-blue-700" },
  2: { label: "Skill Level 2 (Diploma)", color: "bg-violet-100 text-violet-700" },
  3: { label: "Skill Level 3 (Trade)", color: "bg-amber-100 text-amber-700" },
};

const LIST_FILTERS: OccupationList[] = ["MLTSSL", "STSOL", "ROL", "CSOL"];

export default function OccupationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [listFilter, setListFilter] = useState<OccupationList | "All">("All");
  const [skillFilter, setSkillFilter] = useState<SkillLevel | 0>(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return occupations.filter((occ) => {
      if (q && !occ.title.toLowerCase().includes(q) && !occ.anzsco.includes(q) && !occ.category.toLowerCase().includes(q))
        return false;
      if (category !== "All" && occ.category !== category) return false;
      if (listFilter !== "All" && !occ.lists.includes(listFilter)) return false;
      if (skillFilter !== 0 && occ.skillLevel !== skillFilter) return false;
      return true;
    });
  }, [search, category, listFilter, skillFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const occ of filtered) {
      if (!map[occ.category]) map[occ.category] = [];
      map[occ.category].push(occ);
    }
    return map;
  }, [filtered]);

  const categoryOrder = occupationCategories.filter((c) => c !== "All" && grouped[c]);

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
              <span className="font-bold text-slate-900">Occupation List for PR</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pr-calculator">
              <Button variant="outline" size="sm" className="gap-1.5">Points Calculator</Button>
            </Link>
            <Link href="/chat">
              <Button variant="primary" size="sm">Ask AI Advisor</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{occupations.length} occupations across all skill levels</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Occupations for Australian PR
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500">
            Official ANZSCO occupation codes with visa access, assessing bodies, and salary ranges. Updated for 2025 occupation lists.
          </p>
        </div>

        {/* List legend */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {(Object.keys(listDescriptions) as OccupationList[]).map((list) => {
            const info = listDescriptions[list];
            return (
              <div key={list} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", info.color)}>{info.label}</span>
                </div>
                <p className="text-xs text-slate-500">{info.description}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by occupation name or ANZSCO code…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {occupationCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  category === cat
                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List + Skill filter */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-xs text-slate-500 mr-1">Occupation list:</span>
            {(["All", ...LIST_FILTERS] as ("All" | OccupationList)[]).map((l) => (
              <button
                key={l}
                onClick={() => setListFilter(l)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                  listFilter === l
                    ? l === "MLTSSL" ? "border-blue-500 bg-blue-500 text-white"
                      : l === "STSOL" ? "border-amber-500 bg-amber-500 text-white"
                      : l === "ROL" ? "border-teal-500 bg-teal-500 text-white"
                      : l === "CSOL" ? "border-purple-500 bg-purple-500 text-white"
                      : "border-slate-700 bg-slate-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {l === "All" ? "All Lists" : l}
              </button>
            ))}

            <span className="mx-2 text-slate-300">|</span>
            <span className="flex items-center text-xs text-slate-500 mr-1">Skill level:</span>
            {([0, 1, 2, 3] as (SkillLevel | 0)[]).map((sl) => (
              <button
                key={sl}
                onClick={() => setSkillFilter(sl)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  skillFilter === sl
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {sl === 0 ? "All Levels" : `Level ${sl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <strong>{filtered.length}</strong> of {occupations.length} occupations
          </p>
          {(search || category !== "All" || listFilter !== "All" || skillFilter !== 0) && (
            <button
              onClick={() => { setSearch(""); setCategory("All"); setListFilter("All"); setSkillFilter(0); }}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Occupation Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-slate-200" />
            <h3 className="font-bold text-slate-700">No occupations found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categoryOrder.map((cat) => (
              <div key={cat}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">{cat}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    {grouped[cat].length}
                  </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3">ANZSCO</th>
                        <th className="px-4 py-3">Occupation</th>
                        <th className="px-4 py-3">Skill Level</th>
                        <th className="px-4 py-3">Lists</th>
                        <th className="px-4 py-3">Visa Access</th>
                        <th className="px-4 py-3">Median Salary (AUD)</th>
                        <th className="px-4 py-3">Assessing Body</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[cat].map((occ, i) => (
                        <tr
                          key={occ.anzsco}
                          className={cn(
                            "border-b border-slate-50 transition-colors hover:bg-blue-50/30",
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          )}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{occ.anzsco}</td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-semibold text-slate-900">{occ.title}</span>
                              {occ.notes && (
                                <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{occ.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", SKILL_LABELS[occ.skillLevel].color)}>
                              Level {occ.skillLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {occ.lists.map((l) => (
                                <span key={l} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", listDescriptions[l].color)}>
                                  {l}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {occ.visaAccess.map((v) => (
                                <span key={v} className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", VISA_BADGES[v]?.color ?? "bg-slate-100 text-slate-600")}>
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-emerald-700">{occ.medianSalary}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{occ.assessingBody}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-3 md:hidden">
                  {grouped[cat].map((occ) => (
                    <div key={occ.anzsco} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900">{occ.title}</span>
                          <span className="ml-2 font-mono text-xs text-slate-400">{occ.anzsco}</span>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", SKILL_LABELS[occ.skillLevel].color)}>
                          L{occ.skillLevel}
                        </span>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {occ.lists.map((l) => (
                          <span key={l} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", listDescriptions[l].color)}>{l}</span>
                        ))}
                        {occ.visaAccess.map((v) => (
                          <span key={v} className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", VISA_BADGES[v]?.color ?? "bg-slate-100 text-slate-600")}>{v}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{occ.assessingBody}</span>
                        <span className="font-bold text-emerald-700">{occ.medianSalary}</span>
                      </div>
                      {occ.notes && (
                        <p className="mt-1.5 text-[11px] text-slate-400">{occ.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Important disclaimer + notes */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-blue-900">
              <Info className="h-4 w-4" />
              How Occupation Lists Work
            </h3>
            <div className="space-y-2 text-xs text-blue-800">
              <p><strong>MLTSSL</strong> occupations can access Subclass 189 (no sponsorship needed), plus 190, 491, 186, and SID medium-term stream.</p>
              <p><strong>STSOL</strong> occupations can access 190 (state nomination), 491 (regional), and SID short-term (2 years max) — NOT Subclass 189.</p>
              <p><strong>ROL</strong> occupations can only access 491 and 494 (regional visas) — ideal for those willing to live regionally.</p>
              <p><strong>CSOL</strong> (Core Skills Occupation List, Dec 2024): 456 occupations for the new Skills in Demand (SID) visa replacing TSS 482, and the 186 Direct Entry stream.</p>
              <p>Lists are reviewed by the Department of Home Affairs. Always verify at immi.homeaffairs.gov.au</p>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              PR Pathway Summary
            </h3>
            <div className="space-y-2 text-xs text-emerald-800">
              <p><strong>Fastest PR:</strong> MLTSSL occupation + 189 (no waiting, permanent immediately)</p>
              <p><strong>Via employer:</strong> 482 (medium-term) → 186 after 3 years (employer sponsored PR)</p>
              <p><strong>Via regional:</strong> 491 or 494 → 191 after 3 years (regional PR)</p>
              <p><strong>Via state:</strong> 190 (permanent from grant — immediate PR with state nomination)</p>
              <p><strong>Skills assessment</strong> is required before lodging an EOI for any points-tested visa. Allow 3–12 months for assessment.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
          <strong>Disclaimer:</strong> Occupation eligibility, assessing bodies, and visa access are subject to change. This data is for general guidance based on 2025 occupation lists. Always verify current occupation list status at the Department of Home Affairs website (immi.homeaffairs.gov.au) and consult a registered MARA migration agent before making any immigration decisions.
        </div>
      </div>
    </div>
  );
}

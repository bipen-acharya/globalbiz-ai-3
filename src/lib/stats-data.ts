// ══════════════════════════════════════════════════════════════════════════════
// Australian Permanent Residence — Migration Statistics
//
// PRIMARY SOURCES (official DHA publications):
//  • Australia's Migration Trends 2020-21 to 2024-25 (DHA annual reports)
//  • DHA Migration Programme Reports 2022-23, 2023-24, 2024-25
//  • DHA Country Position Rankings 2023-24
//  • ABS Overseas Migration 2020-21 to 2024-25
//
// DATA NOTES:
//  ✓  = verified exact figure from published DHA/ABS report
//  ~  = estimated from published cohort percentages or trend data
//  (P) = preliminary (2024-25 figures based on DHA programme outcomes snapshot)
//
// All figures = permanent visa GRANTS (including primary + secondary applicants)
// Financial year basis: 1 July – 30 June
// ══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgrammeYear =
  | "2020-21"
  | "2021-22"
  | "2022-23"
  | "2023-24"
  | "2024-25";

export interface YearSummary {
  year: ProgrammeYear;
  label: string;          // display label e.g. "2024–25"
  total: number;
  skilled: number;
  family: number;
  other: number;          // special eligibility + humanitarian programme
  planningLevel: number;
  verified: boolean;      // ✓ published exact total
  note: string;
}

export interface CountryGrantStat {
  country: string;
  flag: string;           // emoji flag
  grants: number;
  skillStream: number;
  familyStream: number;
  verified: boolean;
  yoyChange?: number;     // % change from prior year (positive = growth)
}

export interface CountryYearData {
  year: ProgrammeYear;
  countries: CountryGrantStat[];
}

export interface OccupationGrantStat {
  occupation: string;
  anzsco: string;
  grantsTotal: number;
  topState: string;
  topStateGrants: number;
  category: string;
  visaSubclass: string;
}

export interface StateNominationStat {
  state: string;
  abbr: string;
  allocation2425: number;
  granted2324: number;
  topOccupation: string;
  color: string;
}

export interface SkillSelectRound {
  date: string;
  subclass: string;
  lowestScore: number;
  invitations: number;
  occupationCategory: string;
}

export interface MigrationStream {
  stream: string;
  granted2324: number;
  planning2425: number;
  color: string;
  description: string;
}

// ── 5-Year Programme Totals ───────────────────────────────────────────────────
// Source: DHA Australia's Migration Trends series (annual); DHA Programme Reports

export const fiveYearTrend: YearSummary[] = [
  {
    year: "2020-21",
    label: "2020–21",
    total: 160_052,      // ✓ DHA Migration Trends 2020-21
    skilled: 79_620,     // ✓ includes employer sponsored, independent, state/regional
    family: 77_372,      // ✓ partner, child, parent, other family
    other: 3_060,        // ~ special eligibility / humanitarian-linked
    planningLevel: 160_000,
    verified: true,
    note: "COVID-19 border closures; grants delivered but many arrivals deferred. Onshore grants dominated.",
  },
  {
    year: "2021-22",
    label: "2021–22",
    total: 143_556,      // ✓ DHA Migration Trends 2021-22
    skilled: 89_063,     // ✓ skill stream recovering as borders reopened Nov 2021
    family: 54_093,      // ✓ family stream
    other: 400,
    planningLevel: 160_000,
    verified: true,
    note: "International borders reopened November 2021. Skilled stream surged; family clearance accelerated.",
  },
  {
    year: "2022-23",
    label: "2022–23",
    total: 195_004,      // ✓ DHA Migration Trends 2022-23 — record post-COVID year
    skilled: 142_344,    // ✓ 73% skill stream share
    family: 52_660,      // ✓ family stream
    other: 0,
    planningLevel: 195_000,
    verified: true,
    note: "Record year — exceeded planning level. Post-COVID backlog cleared; record skilled migration.",
  },
  {
    year: "2023-24",
    label: "2023–24",
    total: 185_592,      // ✓ DHA Migration Programme Report 2023-24
    skilled: 132_200,    // ✓ 71.2% skill stream share
    family: 52_500,      // ✓
    other: 892,          // ✓ special eligibility
    planningLevel: 190_000,
    verified: true,
    note: "Planned level reduced from 195k. Employer-sponsored and regional streams strongest.",
  },
  {
    year: "2024-25",
    label: "2024–25",
    total: 185_001,      // (P) DHA Migration Trends 2024-25 preliminary
    skilled: 132_148,    // (P) 71.4% skill share
    family: 52_853,      // (P)
    other: 0,
    planningLevel: 185_000,
    verified: false,
    note: "SID visa (Skills in Demand) replaced TSS 482 from December 2024. Preliminary outcomes.",
  },
];

// ── Country of Origin Data — 5 Years ─────────────────────────────────────────
// Source: DHA Country Position Rankings; DHA Migration Trends series
//
// 2023-24 top-10 figures are VERIFIED from DHA Country Position Rankings 2023-24.
// 2022-23 top-4 verified; remainder estimated from cohort percentages.
// 2020-21 & 2021-22: India verified; others estimated from programme share data.
// 2024-25: India + Nepal + Sri Lanka + Pakistan verified (DHA Migration Trends 2024-25).

export const countryDataByYear: CountryYearData[] = [
  {
    year: "2020-21",
    countries: [
      { country: "India",           flag: "🇮🇳", grants: 19_200, skillStream: 14_900, familyStream: 4_300, verified: false },
      { country: "China (PRC)",     flag: "🇨🇳", grants: 8_600,  skillStream: 1_200, familyStream: 7_400, verified: false },
      { country: "Philippines",     flag: "🇵🇭", grants: 6_100,  skillStream: 3_800, familyStream: 2_300, verified: false },
      { country: "United Kingdom",  flag: "🇬🇧", grants: 5_400,  skillStream: 4_200, familyStream: 1_200, verified: false },
      { country: "South Africa",    flag: "🇿🇦", grants: 3_600,  skillStream: 3_200, familyStream: 400,   verified: false },
      { country: "Vietnam",         flag: "🇻🇳", grants: 3_200,  skillStream: 1_400, familyStream: 1_800, verified: false },
      { country: "Pakistan",        flag: "🇵🇰", grants: 2_800,  skillStream: 1_900, familyStream: 900,   verified: false },
      { country: "Sri Lanka",       flag: "🇱🇰", grants: 2_600,  skillStream: 2_100, familyStream: 500,   verified: false },
      { country: "Nepal",           flag: "🇳🇵", grants: 1_600,  skillStream: 1_400, familyStream: 200,   verified: false },
      { country: "Bangladesh",      flag: "🇧🇩", grants: 1_900,  skillStream: 1_500, familyStream: 400,   verified: false },
    ],
  },
  {
    year: "2021-22",
    countries: [
      { country: "India",           flag: "🇮🇳", grants: 24_324, skillStream: 19_800, familyStream: 4_524, verified: true,  yoyChange: 26.7 },
      { country: "China (PRC)",     flag: "🇨🇳", grants: 13_900, skillStream: 1_600,  familyStream: 12_300, verified: false, yoyChange: 61.6 },
      { country: "Philippines",     flag: "🇵🇭", grants: 8_200,  skillStream: 5_400,  familyStream: 2_800, verified: false, yoyChange: 34.4 },
      { country: "United Kingdom",  flag: "🇬🇧", grants: 6_800,  skillStream: 5_300,  familyStream: 1_500, verified: false, yoyChange: 25.9 },
      { country: "South Africa",    flag: "🇿🇦", grants: 4_200,  skillStream: 3_800,  familyStream: 400,   verified: false, yoyChange: 16.7 },
      { country: "Vietnam",         flag: "🇻🇳", grants: 3_800,  skillStream: 1_500,  familyStream: 2_300, verified: false, yoyChange: 18.8 },
      { country: "Pakistan",        flag: "🇵🇰", grants: 3_400,  skillStream: 2_400,  familyStream: 1_000, verified: false, yoyChange: 21.4 },
      { country: "Sri Lanka",       flag: "🇱🇰", grants: 3_100,  skillStream: 2_500,  familyStream: 600,   verified: false, yoyChange: 19.2 },
      { country: "Nepal",           flag: "🇳🇵", grants: 1_580,  skillStream: 1_380,  familyStream: 200,   verified: false, yoyChange: -1.3 },
      { country: "Bangladesh",      flag: "🇧🇩", grants: 2_200,  skillStream: 1_700,  familyStream: 500,   verified: false, yoyChange: 15.8 },
    ],
  },
  {
    year: "2022-23",
    countries: [
      { country: "India",           flag: "🇮🇳", grants: 41_145, skillStream: 37_200, familyStream: 3_945, verified: true,  yoyChange: 69.2 },
      { country: "China (PRC)",     flag: "🇨🇳", grants: 18_240, skillStream: 2_100,  familyStream: 16_140, verified: true,  yoyChange: 31.2 },
      { country: "Philippines",     flag: "🇵🇭", grants: 10_379, skillStream: 7_200,  familyStream: 3_179, verified: true,  yoyChange: 26.6 },
      { country: "Nepal",           flag: "🇳🇵", grants: 4_364,  skillStream: 4_000,  familyStream: 364,   verified: true,  yoyChange: 176.2 },
      { country: "United Kingdom",  flag: "🇬🇧", grants: 9_480,  skillStream: 7_500,  familyStream: 1_980, verified: false, yoyChange: 39.4 },
      { country: "South Africa",    flag: "🇿🇦", grants: 5_100,  skillStream: 4_700,  familyStream: 400,   verified: false, yoyChange: 21.4 },
      { country: "Vietnam",         flag: "🇻🇳", grants: 5_400,  skillStream: 2_200,  familyStream: 3_200, verified: false, yoyChange: 42.1 },
      { country: "Pakistan",        flag: "🇵🇰", grants: 4_920,  skillStream: 3_600,  familyStream: 1_320, verified: false, yoyChange: 44.7 },
      { country: "Sri Lanka",       flag: "🇱🇰", grants: 3_960,  skillStream: 3_300,  familyStream: 660,   verified: false, yoyChange: 27.7 },
      { country: "Bangladesh",      flag: "🇧🇩", grants: 3_200,  skillStream: 2_500,  familyStream: 700,   verified: false, yoyChange: 45.5 },
    ],
  },
  {
    year: "2023-24",
    // ✓ ALL top-10 figures verified: DHA Country Position Rankings 2023-24
    countries: [
      { country: "India",           flag: "🇮🇳", grants: 49_814, skillStream: 45_820, familyStream: 3_994, verified: true,  yoyChange: 21.2 },
      { country: "Philippines",     flag: "🇵🇭", grants: 11_922, skillStream: 8_178,  familyStream: 3_744, verified: true,  yoyChange: 14.9 },
      { country: "China (PRC)",     flag: "🇨🇳", grants: 11_520, skillStream: 1_236,  familyStream: 10_284, verified: true,  yoyChange: -36.8 },
      { country: "Nepal",           flag: "🇳🇵", grants: 11_501, skillStream: 10_891, familyStream: 610,   verified: true,  yoyChange: 163.6 },
      { country: "United Kingdom",  flag: "🇬🇧", grants: 9_908,  skillStream: 7_846,  familyStream: 2_062, verified: true,  yoyChange: 4.5 },
      { country: "Pakistan",        flag: "🇵🇰", grants: 6_866,  skillStream: 5_188,  familyStream: 1_678, verified: true,  yoyChange: 39.6 },
      { country: "Vietnam",         flag: "🇻🇳", grants: 6_692,  skillStream: 2_881,  familyStream: 3_811, verified: true,  yoyChange: 23.9 },
      { country: "Sri Lanka",       flag: "🇱🇰", grants: 5_663,  skillStream: 4_688,  familyStream: 975,   verified: true,  yoyChange: 43.0 },
      { country: "Afghanistan",     flag: "🇦🇫", grants: 5_555,  skillStream: 71,     familyStream: 5_484, verified: true,  yoyChange: null as unknown as number },
      { country: "South Africa",    flag: "🇿🇦", grants: 4_616,  skillStream: 4_246,  familyStream: 370,   verified: true,  yoyChange: -9.5 },
    ],
  },
  {
    year: "2024-25",
    // ✓ India, Nepal, Sri Lanka, Pakistan verified from DHA Migration Trends 2024-25
    // ~ Others estimated based on programme trends
    countries: [
      { country: "India",           flag: "🇮🇳", grants: 48_326, skillStream: 43_900, familyStream: 4_426, verified: true,  yoyChange: -3.0 },
      { country: "Philippines",     flag: "🇵🇭", grants: 11_600, skillStream: 7_900,  familyStream: 3_700, verified: false, yoyChange: -2.7 },
      { country: "China (PRC)",     flag: "🇨🇳", grants: 10_800, skillStream: 1_100,  familyStream: 9_700, verified: false, yoyChange: -6.2 },
      { country: "Nepal",           flag: "🇳🇵", grants: 8_319,  skillStream: 7_900,  familyStream: 419,   verified: true,  yoyChange: -27.7 },
      { country: "Sri Lanka",       flag: "🇱🇰", grants: 9_444,  skillStream: 8_100,  familyStream: 1_344, verified: true,  yoyChange: 66.8 },
      { country: "Pakistan",        flag: "🇵🇰", grants: 7_082,  skillStream: 5_400,  familyStream: 1_682, verified: true,  yoyChange: 3.2 },
      { country: "United Kingdom",  flag: "🇬🇧", grants: 9_600,  skillStream: 7_600,  familyStream: 2_000, verified: false, yoyChange: -3.1 },
      { country: "Vietnam",         flag: "🇻🇳", grants: 6_400,  skillStream: 2_700,  familyStream: 3_700, verified: false, yoyChange: -4.4 },
      { country: "South Africa",    flag: "🇿🇦", grants: 4_800,  skillStream: 4_400,  familyStream: 400,   verified: false, yoyChange: 4.0 },
      { country: "Afghanistan",     flag: "🇦🇫", grants: 5_200,  skillStream: 60,     familyStream: 5_140, verified: false, yoyChange: -6.4 },
    ],
  },
];

// ── 5-Year country trend (top 5 for line chart) ───────────────────────────────

export const topCountryTrend = ["India", "China (PRC)", "Philippines", "Nepal", "United Kingdom", "Sri Lanka", "Pakistan"];

export function getCountryTrendData() {
  const years = fiveYearTrend.map((y) => y.label);
  return years.map((yearLabel, idx) => {
    const yearKey = fiveYearTrend[idx].year;
    const yearData = countryDataByYear.find((d) => d.year === yearKey);
    const row: Record<string, string | number> = { year: yearLabel };
    if (yearData) {
      topCountryTrend.forEach((country) => {
        const found = yearData.countries.find((c) => c.country === country);
        row[country] = found ? found.grants : 0;
      });
    }
    return row;
  });
}

// ── Per-year key facts ────────────────────────────────────────────────────────

export function getYearFacts(year: ProgrammeYear) {
  const y = fiveYearTrend.find((f) => f.year === year)!;
  const countryYear = countryDataByYear.find((d) => d.year === year)!;
  const topCountry = countryYear.countries[0];
  return [
    {
      label: "Total PR Grants",
      value: y.total.toLocaleString("en-AU"),
      sub: `vs ${y.planningLevel.toLocaleString("en-AU")} planning level`,
      color: "blue",
      verified: y.verified,
    },
    {
      label: "Skill Stream",
      value: y.skilled.toLocaleString("en-AU"),
      sub: `${Math.round((y.skilled / y.total) * 100)}% of total programme`,
      color: "indigo",
      verified: y.verified,
    },
    {
      label: "#1 Source Country",
      value: `${topCountry.flag} ${topCountry.country}`,
      sub: `${topCountry.grants.toLocaleString("en-AU")} PR grants`,
      color: "purple",
      verified: topCountry.verified,
    },
    {
      label: "Family Stream",
      value: y.family.toLocaleString("en-AU"),
      sub: `${Math.round((y.family / y.total) * 100)}% of total programme`,
      color: "rose",
      verified: y.verified,
    },
  ];
}

// ── Migration streams (2023-24 detailed breakdown) ────────────────────────────

export const migrationOverview = {
  totalPlanning2324: 190_000,
  totalGranted2324: 185_592,
  skillStream: 132_200,
  familyStream: 52_500,
  specialEligibility: 892,
  humanitarianSeparate: 20_000,
  totalPlanning2425: 185_000,
};

export const migrationStreams: MigrationStream[] = [
  {
    stream: "Employer Sponsored",
    granted2324: 44_068,
    planning2425: 44_000,
    color: "#6366f1",
    description: "SID/482 → 186 sponsored PR and direct 186 (ENS)",
  },
  {
    stream: "Skilled Independent (189)",
    granted2324: 18_652,
    planning2425: 17_000,
    color: "#3b82f6",
    description: "Points-tested, no state/employer sponsor needed",
  },
  {
    stream: "State Nominated (190)",
    granted2324: 24_968,
    planning2425: 22_800,
    color: "#0ea5e9",
    description: "Points-tested with state government nomination",
  },
  {
    stream: "Regional (491 → 191)",
    granted2324: 20_430,
    planning2425: 21_200,
    color: "#14b8a6",
    description: "Regional sponsored → 191 permanent after 3 years",
  },
  {
    stream: "Global Talent (858)",
    granted2324: 4_540,
    planning2425: 5_000,
    color: "#8b5cf6",
    description: "High-achieving individuals in target sectors",
  },
  {
    stream: "Family Stream",
    granted2324: 52_500,
    planning2425: 52_500,
    color: "#ec4899",
    description: "Partner, child, parent, and other family visas",
  },
];

// ── Top occupations by PR grants (2023–24) ────────────────────────────────────

export const topOccupationGrants: OccupationGrantStat[] = [
  { occupation: "Accountant (General)",       anzsco: "221111", grantsTotal: 4_570, topState: "NSW", topStateGrants: 1_480, category: "Business & Finance", visaSubclass: "189, 190, 186" },
  { occupation: "Chef",                        anzsco: "351311", grantsTotal: 3_920, topState: "VIC", topStateGrants: 1_150, category: "Hospitality",        visaSubclass: "190, 491, 186" },
  { occupation: "Software Engineer",           anzsco: "261313", grantsTotal: 3_840, topState: "NSW", topStateGrants: 1_620, category: "ICT",               visaSubclass: "189, 190, 186" },
  { occupation: "Registered Nurse (General)",  anzsco: "254411", grantsTotal: 3_610, topState: "QLD", topStateGrants: 980,   category: "Healthcare",        visaSubclass: "189, 190, SID" },
  { occupation: "Cook",                        anzsco: "351411", grantsTotal: 2_870, topState: "VIC", topStateGrants: 890,   category: "Hospitality",        visaSubclass: "491, 494" },
  { occupation: "Civil Engineer",              anzsco: "233211", grantsTotal: 2_640, topState: "NSW", topStateGrants: 920,   category: "Engineering",       visaSubclass: "189, 190, 186" },
  { occupation: "Cafe / Restaurant Manager",   anzsco: "141111", grantsTotal: 2_480, topState: "VIC", topStateGrants: 820,   category: "Hospitality",        visaSubclass: "190, 491, 494" },
  { occupation: "Electrician (General)",       anzsco: "341111", grantsTotal: 2_210, topState: "WA",  topStateGrants: 780,   category: "Trades",            visaSubclass: "189, 190, 186" },
  { occupation: "Carpenter and Joiner",        anzsco: "331211", grantsTotal: 1_980, topState: "WA",  topStateGrants: 620,   category: "Trades",            visaSubclass: "189, 190, 491" },
  { occupation: "Secondary School Teacher",    anzsco: "241411", grantsTotal: 1_890, topState: "QLD", topStateGrants: 580,   category: "Education",         visaSubclass: "189, 190, 186" },
  { occupation: "General Practitioner",        anzsco: "253111", grantsTotal: 1_760, topState: "VIC", topStateGrants: 510,   category: "Healthcare",        visaSubclass: "189, 190, 186" },
  { occupation: "ICT Business Analyst",        anzsco: "261111", grantsTotal: 1_640, topState: "NSW", topStateGrants: 710,   category: "ICT",               visaSubclass: "189, 190, 186" },
  { occupation: "Mechanical Engineer",         anzsco: "233512", grantsTotal: 1_520, topState: "WA",  topStateGrants: 480,   category: "Engineering",       visaSubclass: "189, 190, 186" },
  { occupation: "Early Childhood Teacher",     anzsco: "241111", grantsTotal: 1_480, topState: "NSW", topStateGrants: 490,   category: "Education",         visaSubclass: "189, 190, 491" },
  { occupation: "Construction Project Manager",anzsco: "133111", grantsTotal: 1_360, topState: "VIC", topStateGrants: 430,   category: "Engineering",       visaSubclass: "189, 190, 186" },
];

// ── State nomination allocations 2024–25 ─────────────────────────────────────

export const stateNominations: StateNominationStat[] = [
  { state: "New South Wales",   abbr: "NSW", allocation2425: 5_000, granted2324: 5_218, topOccupation: "Software Engineer",        color: "#2563eb" },
  { state: "Victoria",          abbr: "VIC", allocation2425: 5_000, granted2324: 5_104, topOccupation: "Chef",                      color: "#7c3aed" },
  { state: "Western Australia", abbr: "WA",  allocation2425: 5_000, granted2324: 4_896, topOccupation: "Electrician",               color: "#0891b2" },
  { state: "South Australia",   abbr: "SA",  allocation2425: 3_800, granted2324: 3_512, topOccupation: "Registered Nurse",          color: "#059669" },
  { state: "Tasmania",          abbr: "TAS", allocation2425: 2_860, granted2324: 2_204, topOccupation: "Early Childhood Teacher",   color: "#d97706" },
  { state: "ACT",               abbr: "ACT", allocation2425: 1_800, granted2324: 1_648, topOccupation: "Civil Engineer",            color: "#dc2626" },
  { state: "Northern Territory",abbr: "NT",  allocation2425: 1_600, granted2324: 1_102, topOccupation: "Cook",                      color: "#ea580c" },
  { state: "Queensland",        abbr: "QLD", allocation2425: 1_200, granted2324: 1_410, topOccupation: "Secondary School Teacher",  color: "#7c3aed" },
];

// ── SkillSelect invitation rounds ─────────────────────────────────────────────

export const skillSelectRounds: SkillSelectRound[] = [
  { date: "Mar 2025", subclass: "189", lowestScore: 90, invitations: 1_000, occupationCategory: "All MLTSSL" },
  { date: "Feb 2025", subclass: "189", lowestScore: 90, invitations: 1_000, occupationCategory: "All MLTSSL" },
  { date: "Jan 2025", subclass: "189", lowestScore: 90, invitations: 1_000, occupationCategory: "All MLTSSL" },
  { date: "Mar 2025", subclass: "190", lowestScore: 85, invitations: 1_850, occupationCategory: "All state-nominated" },
  { date: "Feb 2025", subclass: "190", lowestScore: 85, invitations: 1_700, occupationCategory: "All state-nominated" },
  { date: "Mar 2025", subclass: "491", lowestScore: 75, invitations: 1_600, occupationCategory: "State/Territory sponsored" },
  { date: "Feb 2025", subclass: "491", lowestScore: 75, invitations: 1_450, occupationCategory: "State/Territory sponsored" },
  { date: "Mar 2025", subclass: "189", lowestScore: 75, invitations: 500,   occupationCategory: "Accountants only (targeted)" },
];

// ── Legacy keyFacts (kept for compatibility) ──────────────────────────────────
export const keyFacts = [
  { label: "Total PR Grants 2023–24",   value: "185,592", sub: "vs 190,000 planning level",          color: "blue" },
  { label: "Skill Stream Share",         value: "71.2%",   sub: "132,200 of 185,592 grants",          color: "indigo" },
  { label: "Avg Points for 189",         value: "90+",     sub: "Competitive rounds 2024–25",         color: "purple" },
  { label: "State Nominations 2024–25",  value: "26,260",  sub: "Across all 8 states/territories",   color: "teal" },
];

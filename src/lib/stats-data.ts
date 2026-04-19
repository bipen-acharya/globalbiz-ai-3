// ──────────────────────────────────────────────────────────────────────────────
// Australian PR Statistics — 2023–24 Migration Programme Outcomes
// Source: Department of Home Affairs, 2023–24 Migration Programme Report
// ──────────────────────────────────────────────────────────────────────────────

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

// ── Migration Programme 2023–24 Overview ─────────────────────────────────────
export const migrationOverview = {
  totalPlanning2324: 190_000,
  totalGranted2324: 185_592,
  skillStream: 132_200,
  familyStream: 52_500,
  specialEligibility: 892,
  humanitarianSeparate: 20_000,
  totalPlanning2425: 185_000,
};

// ── Stream breakdown ──────────────────────────────────────────────────────────
export const migrationStreams: MigrationStream[] = [
  {
    stream: "Employer Sponsored",
    granted2324: 44_068,
    planning2425: 44_000,
    color: "#6366f1",
    description: "482/SID → 186 sponsored PR and direct 186",
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
    description: "Regional sponsored pathway to permanent residence",
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
  {
    occupation: "Accountant (General)",
    anzsco: "221111",
    grantsTotal: 4_570,
    topState: "NSW",
    topStateGrants: 1_480,
    category: "Business & Finance",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Chef",
    anzsco: "351311",
    grantsTotal: 3_920,
    topState: "VIC",
    topStateGrants: 1_150,
    category: "Hospitality",
    visaSubclass: "190, 491, 186",
  },
  {
    occupation: "Software Engineer",
    anzsco: "261313",
    grantsTotal: 3_840,
    topState: "NSW",
    topStateGrants: 1_620,
    category: "ICT",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Registered Nurse (General)",
    anzsco: "254411",
    grantsTotal: 3_610,
    topState: "QLD",
    topStateGrants: 980,
    category: "Healthcare",
    visaSubclass: "189, 190, 186, SID",
  },
  {
    occupation: "Cook",
    anzsco: "351411",
    grantsTotal: 2_870,
    topState: "VIC",
    topStateGrants: 890,
    category: "Hospitality",
    visaSubclass: "491, 494",
  },
  {
    occupation: "Civil Engineer",
    anzsco: "233211",
    grantsTotal: 2_640,
    topState: "NSW",
    topStateGrants: 920,
    category: "Engineering",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Cafe / Restaurant Manager",
    anzsco: "141111",
    grantsTotal: 2_480,
    topState: "VIC",
    topStateGrants: 820,
    category: "Hospitality",
    visaSubclass: "190, 491, 494",
  },
  {
    occupation: "Electrician (General)",
    anzsco: "341111",
    grantsTotal: 2_210,
    topState: "WA",
    topStateGrants: 780,
    category: "Trades",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Carpenter and Joiner",
    anzsco: "331211",
    grantsTotal: 1_980,
    topState: "WA",
    topStateGrants: 620,
    category: "Trades",
    visaSubclass: "189, 190, 491",
  },
  {
    occupation: "Secondary School Teacher",
    anzsco: "241411",
    grantsTotal: 1_890,
    topState: "QLD",
    topStateGrants: 580,
    category: "Education",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "General Practitioner",
    anzsco: "253111",
    grantsTotal: 1_760,
    topState: "VIC",
    topStateGrants: 510,
    category: "Healthcare",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "ICT Business Analyst",
    anzsco: "261111",
    grantsTotal: 1_640,
    topState: "NSW",
    topStateGrants: 710,
    category: "ICT",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Mechanical Engineer",
    anzsco: "233512",
    grantsTotal: 1_520,
    topState: "WA",
    topStateGrants: 480,
    category: "Engineering",
    visaSubclass: "189, 190, 186",
  },
  {
    occupation: "Early Childhood Teacher",
    anzsco: "241111",
    grantsTotal: 1_480,
    topState: "NSW",
    topStateGrants: 490,
    category: "Education",
    visaSubclass: "189, 190, 491",
  },
  {
    occupation: "Construction Project Manager",
    anzsco: "133111",
    grantsTotal: 1_360,
    topState: "VIC",
    topStateGrants: 430,
    category: "Engineering",
    visaSubclass: "189, 190, 186",
  },
];

// ── State/Territory nomination allocations 2024–25 ───────────────────────────
export const stateNominations: StateNominationStat[] = [
  {
    state: "New South Wales",
    abbr: "NSW",
    allocation2425: 5_000,
    granted2324: 5_218,
    topOccupation: "Software Engineer",
    color: "#2563eb",
  },
  {
    state: "Victoria",
    abbr: "VIC",
    allocation2425: 5_000,
    granted2324: 5_104,
    topOccupation: "Chef",
    color: "#7c3aed",
  },
  {
    state: "Western Australia",
    abbr: "WA",
    allocation2425: 5_000,
    granted2324: 4_896,
    topOccupation: "Electrician",
    color: "#0891b2",
  },
  {
    state: "South Australia",
    abbr: "SA",
    allocation2425: 3_800,
    granted2324: 3_512,
    topOccupation: "Registered Nurse",
    color: "#059669",
  },
  {
    state: "Tasmania",
    abbr: "TAS",
    allocation2425: 2_860,
    granted2324: 2_204,
    topOccupation: "Early Childhood Teacher",
    color: "#d97706",
  },
  {
    state: "ACT",
    abbr: "ACT",
    allocation2425: 1_800,
    granted2324: 1_648,
    topOccupation: "Civil Engineer",
    color: "#dc2626",
  },
  {
    state: "Northern Territory",
    abbr: "NT",
    allocation2425: 1_600,
    granted2324: 1_102,
    topOccupation: "Cook",
    color: "#ea580c",
  },
  {
    state: "Queensland",
    abbr: "QLD",
    allocation2425: 1_200,
    granted2324: 1_410,
    topOccupation: "Secondary School Teacher",
    color: "#7c3aed",
  },
];

// ── SkillSelect invitation rounds (recent) ────────────────────────────────────
export const skillSelectRounds: SkillSelectRound[] = [
  {
    date: "Mar 2025",
    subclass: "189",
    lowestScore: 90,
    invitations: 1_000,
    occupationCategory: "All MLTSSL",
  },
  {
    date: "Feb 2025",
    subclass: "189",
    lowestScore: 90,
    invitations: 1_000,
    occupationCategory: "All MLTSSL",
  },
  {
    date: "Mar 2025",
    subclass: "190",
    lowestScore: 85,
    invitations: 1_850,
    occupationCategory: "All state-nominated",
  },
  {
    date: "Feb 2025",
    subclass: "190",
    lowestScore: 85,
    invitations: 1_700,
    occupationCategory: "All state-nominated",
  },
  {
    date: "Mar 2025",
    subclass: "491",
    lowestScore: 75,
    invitations: 1_600,
    occupationCategory: "State/Territory sponsored",
  },
  {
    date: "Feb 2025",
    subclass: "491",
    lowestScore: 75,
    invitations: 1_450,
    occupationCategory: "State/Territory sponsored",
  },
  {
    date: "Mar 2025",
    subclass: "189",
    lowestScore: 75,
    invitations: 500,
    occupationCategory: "Accountants only (189 targeted)",
  },
];

// ── Key facts for display ─────────────────────────────────────────────────────
export const keyFacts = [
  {
    label: "Total PR Grants 2023–24",
    value: "185,592",
    sub: "vs 190,000 planning level",
    color: "blue",
  },
  {
    label: "Skill Stream Share",
    value: "71.2%",
    sub: "132,200 of 185,592 grants",
    color: "indigo",
  },
  {
    label: "Avg Points for 189",
    value: "90+",
    sub: "Competitive rounds 2024–25",
    color: "purple",
  },
  {
    label: "State Nominations 2024–25",
    value: "26,260",
    sub: "Across all 8 states/territories",
    color: "teal",
  },
];

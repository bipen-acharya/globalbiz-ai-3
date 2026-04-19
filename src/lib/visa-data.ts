export type VisaCategory =
  | "skilled"
  | "employer"
  | "graduate"
  | "student"
  | "visitor"
  | "family"
  | "working-holiday"
  | "temporary"
  | "regional";

export interface VisaSubclass {
  subclass: number;
  name: string;
  category: VisaCategory;
  description: string;
  eligibility: string[];
  processingTime: string;
  validity: string;
  cost: string;
  pathwayToPR: boolean;
  keyRequirements: string[];
  notes?: string;
}

// ─── 2025–26 Visa Data (fees effective 1 July 2025) ──────────────────────────

export const visaSubclasses: VisaSubclass[] = [
  // ── SKILLED MIGRATION ──────────────────────────────────────────────────────
  {
    subclass: 189,
    name: "Skilled Independent",
    category: "skilled",
    description:
      "Permanent residence for skilled workers not sponsored by an employer, state/territory, or family member. Points-tested via SkillSelect EOI system.",
    eligibility: [
      "Invited to apply through SkillSelect EOI",
      "Occupation on the MLTSSL",
      "Positive skills assessment from relevant authority",
      "Score at least 65 points on the points test",
      "Under 45 years of age at time of invitation",
    ],
    processingTime: "8–16 months",
    validity: "Permanent",
    cost: "AUD $4,770 (primary applicant 18+, 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Points test score ≥ 65 (competitive rounds typically 80–95+)",
      "Positive skills assessment",
      "Competent English minimum (IELTS 6 each band)",
      "Under 45 at time of invitation",
      "Health and character requirements",
      "Nominated occupation on MLTSSL",
    ],
    notes: "Typical invitation cutoffs: ICT 75–85 pts; Accounting 80–90 pts; Engineering 75–90 pts. No employer or state sponsorship required.",
  },
  {
    subclass: 190,
    name: "Skilled Nominated",
    category: "skilled",
    description:
      "Permanent residence for skilled workers nominated by an Australian state or territory government. Nomination adds 5 points to your score.",
    eligibility: [
      "Nominated by a state or territory government",
      "Invited to apply through SkillSelect",
      "Occupation on the relevant skilled occupation list",
      "Skills assessment completed",
      "Under 45 at time of invitation",
    ],
    processingTime: "9–16 months",
    validity: "Permanent",
    cost: "AUD $4,770 (primary applicant 18+, 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "State/territory nomination (adds 5 points to total)",
      "Points test score ≥ 65 (including nomination points)",
      "Skills assessment",
      "English proficiency",
      "Commit to live and work in nominating state for 2 years",
      "Occupation on state's skilled occupation list",
    ],
    notes: "Each state has different occupation demands and criteria. ACT, Victoria, NSW, QLD, SA, WA, TAS, NT each run their own programs.",
  },
  {
    subclass: 491,
    name: "Skilled Work Regional (Provisional)",
    category: "regional",
    description:
      "5-year provisional visa for skilled workers willing to live and work in regional Australia. Nominated by state/territory or sponsored by eligible family. Pathway to permanent residence via Subclass 191.",
    eligibility: [
      "State/territory nomination OR eligible family member sponsorship in regional area",
      "Invited through SkillSelect",
      "Points test score ≥ 65 (nomination adds 15 points)",
      "Occupation on relevant list (MLTSSL or STSOL for some states)",
      "Under 45 at invitation",
    ],
    processingTime: "7–14 months",
    validity: "5 years (provisional)",
    cost: "AUD $4,770 (primary applicant 18+, 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Must live and work in regional Australia for duration",
      "Points test score ≥ 65",
      "Skills assessment",
      "English proficiency",
      "Regional area means outside Sydney, Melbourne, Brisbane, Gold Coast, Perth",
      "Pathway to PR via Subclass 191 after 3 years",
    ],
    notes: "Leads to Subclass 191 (Permanent Residence via Regional) after 3 years of living and working in a regional area. Nomination adds 15 points — most competitive advantage for lower-scoring applicants.",
  },
  {
    subclass: 191,
    name: "Permanent Residence (Skilled Regional)",
    category: "regional",
    description:
      "Permanent residence visa for holders of Subclass 491 or 494 who have lived and worked in regional Australia for at least 3 years and met income thresholds.",
    eligibility: [
      "Hold or have held a Subclass 491 or 494 visa",
      "Lived in a regional area for at least 3 years while on 491/494",
      "Worked in a regional area for at least 3 years while on 491/494",
      "Met income threshold for at least 3 of the last 5 years",
    ],
    processingTime: "6–12 months",
    validity: "Permanent",
    cost: "AUD $510 (2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "3 years living in regional Australia on 491 or 494",
      "3 years working in regional Australia (cannot count periods of unemployment)",
      "Annual income ≥ AUD $53,900 (2024–25 threshold) for 3 of the last 5 years",
      "Health and character requirements",
      "Income threshold indexed annually",
    ],
    notes: "Income threshold was AUD $53,900 for 2024–25, indexed annually. One of the most affordable PR pathways after initially meeting regional obligations.",
  },

  // ── EMPLOYER SPONSORED ─────────────────────────────────────────────────────
  {
    subclass: 482,
    name: "Temporary Skill Shortage (TSS)",
    category: "employer",
    description:
      "Allows approved employers to sponsor overseas workers to fill genuine skill shortages. Two streams: Short-term (up to 2 years, STSOL occupations) and Medium-term (up to 4 years, MLTSSL occupations).",
    eligibility: [
      "Employer is an approved standard business sponsor",
      "Occupation on STSOL (Short-term) or MLTSSL (Medium-term)",
      "At least 2 years relevant work experience",
      "English proficiency requirement",
    ],
    processingTime: "1–4 months",
    validity: "Up to 2 years (Short-term) or 4 years (Medium-term)",
    cost: "AUD $3,215 primary applicant (2025–26); SAF levy paid by employer",
    pathwayToPR: false,
    keyRequirements: [
      "Approved employer sponsorship",
      "2+ years relevant work experience",
      "Competent English (IELTS 5.0 each band or equivalent)",
      "Skills assessment for some occupations",
      "Labour market testing by employer (advertised locally first)",
      "Salary at or above Temporary Skilled Migration Income Threshold (TSMIT): AUD $73,150 (2024–25)",
    ],
    notes: "Medium-term stream provides pathway to ENS Subclass 186 via Temporary Residence Transition stream after 3 years with same employer. SAF levy (Skilling Australians Fund) is AUD $1,200/year (small business) or AUD $1,800/year (other).",
  },
  {
    subclass: 186,
    name: "Employer Nomination Scheme (ENS)",
    category: "employer",
    description:
      "Permanent residence for skilled workers nominated by an approved Australian employer. Three streams: Temporary Residence Transition (TRT), Direct Entry (DE), and Labour Agreement.",
    eligibility: [
      "Employer nomination in an approved occupation",
      "TRT stream: 3+ years on Subclass 482/457 with same employer",
      "Direct Entry: 3+ years relevant overseas or Australian work experience",
      "Under 45 years of age (exemptions apply for some professions)",
    ],
    processingTime: "6–16 months",
    validity: "Permanent",
    cost: "AUD $4,770 (primary applicant 18+, 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Employer nomination from approved business",
      "Skills assessment (Direct Entry stream)",
      "Under 45 years at time of application (some exemptions for healthcare, academic)",
      "Competent English (IELTS 6.0 each band)",
      "Health and character",
      "Salary at or above TSMIT: AUD $73,150 (2024–25)",
    ],
    notes: "Most common pathway: Work on 482 for 3+ years → apply for 186 via TRT. Direct Entry requires skills assessment and 3 years experience. Some professions (nurses, academics) exempt from age limit.",
  },
  {
    subclass: 494,
    name: "Skilled Employer Sponsored Regional (Provisional)",
    category: "regional",
    description:
      "5-year provisional visa for skilled workers sponsored by an employer in a regional area. Similar to 482 but specifically for regional Australia with a clearer pathway to permanent residence via Subclass 191.",
    eligibility: [
      "Employer in a regional area is an approved sponsor",
      "Occupation on relevant list",
      "At least 3 years relevant work experience",
      "Employer located and operating in a regional area",
    ],
    processingTime: "3–8 months",
    validity: "5 years (provisional)",
    cost: "AUD $4,770 (primary applicant 18+, 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Employer in regional Australia must be approved sponsor",
      "3+ years relevant work experience",
      "English proficiency",
      "Skills assessment (some occupations)",
      "Must live and work in regional area for duration",
      "Pathway to 191 PR after 3 years living/working regionally",
    ],
    notes: "Regional employer sponsorship — a good alternative for those without enough points for skills-only visas. After 3 years, apply for Subclass 191 permanent residence. Employer pays SAF levy.",
  },

  // ── GRADUATE ───────────────────────────────────────────────────────────────
  {
    subclass: 485,
    name: "Temporary Graduate",
    category: "graduate",
    description:
      "Allows international students who recently graduated from an Australian institution to live, study and work in Australia. Two streams: Graduate Work (occupation-specific) and Post-Study Work (any occupation).",
    eligibility: [
      "Graduated from an eligible Australian institution",
      "Applied within 6 months of notification of results",
      "Held a student visa at some point",
      "Graduate Work stream: occupation on relevant skills list",
      "Post-Study Work: bachelor, masters or doctorate from Australian institution",
    ],
    processingTime: "75% within 5 months",
    validity: "2 years (Graduate Work) | 2–4 years (Post-Study by qualification level)",
    cost: "AUD $1,945 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Australian degree, diploma, or trade qualification",
      "Studied for at least 2 academic years in Australia",
      "Vocational English (IELTS 5.0 each band minimum)",
      "Applied within 6 months of graduation notification",
      "Age under 50 for Post-Study Work stream",
    ],
    notes: "Post-Study Work duration: 2 years (bachelor/honours), 3 years (masters by coursework), 4 years (masters by research/doctoral). Graduates from regional areas get extra 1–2 years. This visa gives time to gain Australian work experience for a skilled visa.",
  },

  // ── STUDENT ────────────────────────────────────────────────────────────────
  {
    subclass: 500,
    name: "Student",
    category: "student",
    description:
      "Study full-time in a registered CRICOS course in Australia. Eligible family members can accompany you. Work rights are limited during term (48 hours per fortnight) and unlimited during scheduled course breaks.",
    eligibility: [
      "Enrolled in a registered full-time course at a CRICOS-registered institution",
      "Confirmation of Enrolment (CoE)",
      "Meet English language requirements",
      "Genuine Temporary Entrant (GTE) requirement",
    ],
    processingTime: "1–3 months",
    validity: "Duration of course + up to 2 months",
    cost: "AUD $2,000 (effective 1 July 2025 — increased from AUD $1,600)",
    pathwayToPR: false,
    keyRequirements: [
      "Genuine Temporary Entrant (GTE) requirement — demonstrate intent to return home after study",
      "Confirmation of Enrolment (CoE) from CRICOS provider",
      "English proficiency (IELTS 5.5–6.0 depending on course level)",
      "Financial capacity: tuition fees + AUD $24,505/year living costs (2025)",
      "Overseas Student Health Cover (OSHC) for duration",
      "Health and character requirements",
    ],
    notes: "Visa application charge increased from AUD $1,600 to AUD $2,000 from 1 July 2025 as part of the Australian Government's international education reforms. Work rights: 48 hrs/fortnight during term, unlimited during scheduled breaks. Pathways: → Subclass 485 (Temporary Graduate) → Skilled Migration.",
  },
  {
    subclass: 590,
    name: "Student Guardian",
    category: "student",
    description:
      "Allows a parent or suitable relative to accompany or visit a student under 18 who is studying in Australia on a student visa.",
    eligibility: [
      "Parent or nominated guardian of a student under 18 on Subclass 500",
      "Student must be under 18 and studying in Australia",
      "Must genuinely intend to act as guardian",
    ],
    processingTime: "1–3 months",
    validity: "Duration of student's course + 1 month",
    cost: "AUD $710 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Student under 18 on Subclass 500 must be in Australia",
      "Genuine guardian relationship",
      "Sufficient funds for stay",
      "Health and character requirements",
      "Cannot work more than limited hours if at all",
    ],
    notes: "No work rights unless enrolled in study. Guardian must be a parent or nominated suitable adult — not just any family member.",
  },

  // ── VISITOR ────────────────────────────────────────────────────────────────
  {
    subclass: 600,
    name: "Visitor",
    category: "visitor",
    description:
      "Visit Australia for tourism, to see family and friends, or for short-term business activities. Available in multiple streams: Tourist, Business Visitor, Sponsored Family, and Approved Destination Status.",
    eligibility: [
      "Intend to visit for tourism, family, or approved business activities",
      "No intention to work (except business visitor activities)",
      "Sufficient funds for the visit",
      "Genuine temporary entrant",
    ],
    processingTime: "1 day – 4 weeks",
    validity: "Up to 3 months (tourist) or 12 months (some streams with multiple entry)",
    cost: "AUD $195 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Genuine visitor intent — must intend to depart before visa expires",
      "Sufficient financial resources",
      "Health and character requirements",
      "No unlawful work intention",
      "Strong ties to home country (helps establish genuine visitor intent)",
    ],
    notes: "Electronic Travel Authority (ETA) Subclass 601 (AUD $20) is faster for eligible passport holders (UK, USA, Canada, Japan, Singapore, South Korea, Hong Kong). Visitor visa can sometimes be extended onshore but not used to work.",
  },
  {
    subclass: 601,
    name: "Electronic Travel Authority (ETA)",
    category: "visitor",
    description:
      "Fast electronic visa for eligible passport holders for short tourism or business visits. Linked electronically to passport — no visa label required.",
    eligibility: [
      "Hold passport from an eligible country (UK, USA, Canada, Japan, Singapore, South Korea, Hong Kong, Brunei, Malaysia)",
      "Visit for tourism or business visitor activities only",
      "Stay no more than 3 months per visit",
    ],
    processingTime: "Instant – 24 hours (online)",
    validity: "12 months with multiple entries (each stay up to 3 months)",
    cost: "AUD $20 (service charge, 2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Eligible passport (check Department of Home Affairs list)",
      "No work in Australia",
      "Health and character",
      "Must have onward/return ticket",
    ],
    notes: "Apply through the Australian ETA app or online. Processed instantly in most cases. Can also apply for a 600 Visitor visa for longer stays or if ETA country not eligible.",
  },

  // ── FAMILY ─────────────────────────────────────────────────────────────────
  {
    subclass: 820,
    name: "Partner (Onshore — Temporary)",
    category: "family",
    description:
      "For partners of Australian citizens, permanent residents, or eligible NZ citizens applying from within Australia. Granted together with the Subclass 801 permanent partner visa. Includes both married and de facto couples.",
    eligibility: [
      "In a genuine relationship (married or de facto) with eligible sponsor",
      "Applying from within Australia",
      "Sponsor is Australian citizen, PR, or eligible NZ citizen",
      "Sponsor is aged 18+ (or 16+ in some circumstances)",
    ],
    processingTime: "14–28 months (temporary stage); additional 12 months for 801",
    validity: "Until Subclass 801 is decided",
    cost: "AUD $9,085 combined 820/801 fee (2025–26, primary applicant)",
    pathwayToPR: true,
    keyRequirements: [
      "Genuine and continuing relationship — must prove shared life",
      "Joint finances, cohabitation evidence, statutory declarations from others",
      "2-year waiting period from lodgement before PR granted (unless de facto 3+ years, or have children together)",
      "Health and character requirements",
      "Sponsor must not have previously sponsored another partner within 5 years",
    ],
    notes: "Applied together with Subclass 801 (permanent partner visa). Visa fee covers both stages. After 2 years from lodgement, if relationship continues, the 801 permanent visa is usually granted automatically. Can work full-time from grant of 820.",
  },
  {
    subclass: 801,
    name: "Partner (Permanent)",
    category: "family",
    description:
      "Permanent partner visa granted after the temporary Subclass 820 stage. Applied for together with the 820 — no separate application needed. Granted when the 2-year waiting period is satisfied.",
    eligibility: [
      "Hold Subclass 820 visa",
      "Relationship has continued since lodgement",
      "Meet health and character requirements at time of grant",
    ],
    processingTime: "Automatic assessment after 820 period — usually 3–5 years total from lodgement",
    validity: "Permanent",
    cost: "Included in combined 820/801 fee (AUD $9,085 for 2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Genuine ongoing relationship (assessed again at PR stage)",
      "2-year waiting period from lodgement (exceptions: de facto 3+ years, dependent children)",
      "Health and character re-assessed at grant",
      "Sponsor cannot sponsor another partner for 5 years after this grant",
    ],
    notes: "No new application required — applied together with 820. Some applicants skip the waiting period if they were in a de facto relationship for 3+ years before applying, or have children together.",
  },
  {
    subclass: 309,
    name: "Partner (Offshore — Temporary)",
    category: "family",
    description:
      "For partners of Australian citizens, PRs, or eligible NZ citizens applying from outside Australia. Granted with the Subclass 100 permanent partner visa.",
    eligibility: [
      "In a genuine relationship with eligible Australian sponsor",
      "Applying from outside Australia",
      "Sponsor must be Australian citizen, PR, or eligible NZ citizen",
    ],
    processingTime: "14–32 months",
    validity: "Up to 5 years (or until Subclass 100 decided)",
    cost: "AUD $9,085 combined 309/100 fee (2025–26)",
    pathwayToPR: true,
    keyRequirements: [
      "Genuine and continuing relationship — evidence of shared life",
      "Joint finances, cohabitation evidence, third-party statutory declarations",
      "2-year waiting period from lodgement before PR",
      "Health and character requirements",
    ],
    notes: "Applied together with Subclass 100 (offshore permanent partner visa). Offshore applicants can travel to Australia on the 309 while waiting for 100.",
  },
  {
    subclass: 100,
    name: "Partner (Offshore — Permanent)",
    category: "family",
    description:
      "Permanent partner visa for offshore applicants, granted after the temporary 309 stage. Applied together with Subclass 309.",
    eligibility: [
      "Hold or have held Subclass 309",
      "Relationship has continued and is genuine",
      "2-year waiting period satisfied",
    ],
    processingTime: "Assessed after 309 period (total 3–5 years from lodgement)",
    validity: "Permanent",
    cost: "Included in combined 309/100 fee",
    pathwayToPR: true,
    keyRequirements: [
      "Genuine ongoing relationship",
      "2-year wait from application lodgement",
      "Health and character",
    ],
    notes: "Granted automatically when 2-year period and health/character are satisfied, provided the relationship is still genuine.",
  },
  {
    subclass: 103,
    name: "Parent",
    category: "family",
    description:
      "Permanent residence for parents of settled Australian citizens, PRs, or eligible NZ citizens. Extremely long queue — queue currently estimated at 30+ years.",
    eligibility: [
      "Parent of a settled Australian citizen, PR, or eligible NZ citizen",
      "Meet the balance of family test (at least half your children permanently reside in Australia)",
      "Child must sponsor and be settled in Australia",
    ],
    processingTime: "30+ years (current queue — extremely long wait)",
    validity: "Permanent",
    cost: "AUD $4,770 primary applicant (2025–26) + Assurance of Support bond",
    pathwayToPR: true,
    keyRequirements: [
      "Balance of family test",
      "Sponsorship by Australian child",
      "Health and character requirements",
      "Assurance of Support (repayable bond): AUD $10,000 + AUD $4,000 per additional applicant",
      "Must not have any debts to the Australian Government",
    ],
    notes: "Due to the 30+ year queue, the Contributory Parent Visa (Subclass 143 offshore or 864 onshore) is strongly recommended if you can afford it — typically 3–5 years processing.",
  },
  {
    subclass: 143,
    name: "Contributory Parent",
    category: "family",
    description:
      "Faster permanent residence for parents of settled Australians. Requires a significant contribution to health costs but processes in 3–5 years instead of 30+ years for the standard Parent visa.",
    eligibility: [
      "Parent of settled Australian citizen, PR, or eligible NZ citizen",
      "Meet the balance of family test",
      "Ability to pay substantial contribution in two instalments",
    ],
    processingTime: "3–5 years",
    validity: "Permanent",
    cost: "AUD $48,565 primary applicant (2025–26, includes first instalment); second instalment AUD $44,795 due at grant",
    pathwayToPR: true,
    keyRequirements: [
      "First instalment at application; second instalment (~AUD $44,795) at visa grant",
      "Balance of family test",
      "Sponsorship by Australian child",
      "Health and character requirements",
      "Assurance of Support bond: AUD $10,000 for 2 years",
    ],
    notes: "Total cost ~AUD $93,000+ for primary applicant when both instalments combined. A temporary Contributory Parent visa (Subclass 173) exists for those who wish to come sooner while waiting for the permanent grant.",
  },
  {
    subclass: 870,
    name: "Sponsored Parent (Temporary)",
    category: "family",
    description:
      "A temporary visa allowing parents of Australian citizens or PRs to visit for extended periods — up to 3 or 5 years. Does not lead to permanent residence.",
    eligibility: [
      "Parent of an Australian citizen or PR (child born in Australia or naturalised)",
      "Sponsored by Australian citizen/PR child",
      "Child (sponsor) must have income at or above specified threshold",
    ],
    processingTime: "2–4 months",
    validity: "3 years or 5 years (no work rights)",
    cost: "AUD $5,000 (3-year) or AUD $10,000 (5-year), 2025–26",
    pathwayToPR: false,
    keyRequirements: [
      "Sponsor income threshold: AUD $83,453.20/year (2024–25, indexed annually)",
      "Parent cannot work in Australia",
      "Sponsor limited to sponsoring 2 parents at any one time",
      "Health insurance mandatory throughout stay",
      "Health and character",
    ],
    notes: "Maximum 10 years stay in Australia across all Subclass 870 grants. Cannot extend beyond 10 years total. Does not lead to PR — consider 143 if permanent residence desired.",
  },

  // ── WORKING HOLIDAY ────────────────────────────────────────────────────────
  {
    subclass: 417,
    name: "Working Holiday",
    category: "working-holiday",
    description:
      "Allows young adults from eligible countries to have an extended holiday and work in Australia to fund their travel. Up to 3 years total with extensions.",
    eligibility: [
      "18–30 years old (35 for Canada, France, Ireland, UK)",
      "Hold passport from an eligible country (UK, Canada, Ireland, France, Germany, Italy, Japan, South Korea, Sweden, and others)",
      "No dependent children accompanying you in Australia",
    ],
    processingTime: "1 day – 3 weeks (usually instant)",
    validity: "12 months (extensible to 2nd and 3rd year visa)",
    cost: "AUD $660 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Eligible passport holder",
      "Age requirement met at time of application",
      "Sufficient funds (at least AUD $5,000)",
      "Health and character",
      "Regional work required for 2nd/3rd year: 3 months specified regional work (harvest, construction, mining) for 2nd year; 6 months for 3rd year",
    ],
    notes: "2nd year visa requires 3 months specified regional work. 3rd year requires additional 6 months specified regional work. Working Holiday visa holders can work for any employer but only 6 months with same employer.",
  },
  {
    subclass: 462,
    name: "Work and Holiday",
    category: "working-holiday",
    description:
      "Similar to Working Holiday but for countries with Work and Holiday arrangements with Australia — different eligible countries list.",
    eligibility: [
      "18–30 years old",
      "Hold passport from an eligible Work and Holiday country (USA, China, Vietnam, Thailand, Indonesia, Chile, Peru, Argentina, and others)",
      "Meet educational or language requirements (varies by country)",
      "No dependent children",
    ],
    processingTime: "1 day – 3 weeks",
    validity: "12 months",
    cost: "AUD $660 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Eligible passport (different list from 417 — check Department of Home Affairs)",
      "Age 18–30",
      "Functional English proficiency",
      "Letter of support from home country government (some countries)",
      "Sufficient funds",
    ],
    notes: "Available to: USA, China, Vietnam, Thailand, Indonesia, Chile, Argentina, Peru, Uruguay, Turkey, Portugal, Poland, Spain, Czech Republic, Hungary, and others. Check DHA website for full list.",
  },

  // ── TEMPORARY ACTIVITY ─────────────────────────────────────────────────────
  {
    subclass: 408,
    name: "Temporary Activity",
    category: "temporary",
    description:
      "Covers a wide range of short-term activities: entertainment, sport, exchange programs, volunteer work, religious activities, and more. Replaced several older temporary visas.",
    eligibility: [
      "Sponsored by an approved sponsor or eligible organisation",
      "Activity falls under one of the approved streams",
      "Evidence of the specific activity",
    ],
    processingTime: "2–6 weeks",
    validity: "Up to 2 years (activity dependent)",
    cost: "AUD $375 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Sponsor or host organisation in Australia",
      "Evidence of the approved activity",
      "Health and character requirements",
      "Financial capacity",
    ],
    notes: "Streams include: Entertainment (film, TV, music), Sport, Exchange (cultural programs, secondary student exchange), Volunteer, Religious Worker, Government Agreement, Domestic Worker, and Pacific engagement activities.",
  },
  {
    subclass: 400,
    name: "Temporary Work (Short Stay Specialist)",
    category: "temporary",
    description:
      "For highly specialised, non-ongoing short-term work in Australia — typically for a specific project or task that cannot be filled by an Australian. Maximum 6 months.",
    eligibility: [
      "Highly specialised skills not available in Australia",
      "Specific work that is non-ongoing",
      "Employer must demonstrate specialised need",
    ],
    processingTime: "2–6 weeks",
    validity: "Up to 6 months (usually less)",
    cost: "AUD $375 (2025–26)",
    pathwayToPR: false,
    keyRequirements: [
      "Highly specialised skill or expertise",
      "Non-ongoing, specific task-based work",
      "Australian employer/organisation",
      "Health and character",
    ],
    notes: "Not suitable for ongoing roles. Used for roles like: international experts, specialist trainers, or short-term project consultants.",
  },
];

// ─── Category Metadata ────────────────────────────────────────────────────────

export const visaCategories: Record<VisaCategory, { label: string; color: string; bg: string }> = {
  skilled: { label: "Skilled Migration", color: "text-blue-700", bg: "bg-blue-50" },
  employer: { label: "Employer Sponsored", color: "text-purple-700", bg: "bg-purple-50" },
  regional: { label: "Regional", color: "text-teal-700", bg: "bg-teal-50" },
  graduate: { label: "Graduate", color: "text-emerald-700", bg: "bg-emerald-50" },
  student: { label: "Student", color: "text-amber-700", bg: "bg-amber-50" },
  visitor: { label: "Visitor", color: "text-sky-700", bg: "bg-sky-50" },
  family: { label: "Family", color: "text-rose-700", bg: "bg-rose-50" },
  "working-holiday": { label: "Working Holiday", color: "text-orange-700", bg: "bg-orange-50" },
  temporary: { label: "Temporary Activity", color: "text-slate-700", bg: "bg-slate-50" },
};

/** Build context string for AI system prompt */
export function buildVisaContext(): string {
  return visaSubclasses
    .map(
      (v) =>
        `## Subclass ${v.subclass} — ${v.name} (${visaCategories[v.category].label})
Description: ${v.description}
Validity: ${v.validity} | Processing: ${v.processingTime} | Cost: ${v.cost} | Pathway to PR: ${v.pathwayToPR ? "Yes" : "No"}
Key Requirements: ${v.keyRequirements.join("; ")}
Eligibility: ${v.eligibility.join("; ")}${v.notes ? `\nNote: ${v.notes}` : ""}`
    )
    .join("\n\n");
}

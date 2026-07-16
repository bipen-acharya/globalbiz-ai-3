// ─────────────────────────────────────────────────────────────────────────────
// Idea Service — generates ranked business ideas for the Explore Ideas surface.
// ─────────────────────────────────────────────────────────────────────────────

import { generateJSON } from './aiClient'

export interface BusinessIdea {
  id: number
  name: string
  category: string
  tagline: string
  opportunityScore: number
  demandLevel: 'High' | 'Medium' | 'Growing'
  competitorDensity: 'Low' | 'Medium' | 'High'
  estimatedStartupCost: string
  timeToProfit: string
  whyNow: string
  targetCustomer: string
}

const CATEGORIES = [
  'Food & Beverage', 'Retail & Fashion', 'Trades & Services',
  'Health & Wellness', 'Tech & Digital', 'Education & Training',
  'Home & Garden', 'Auto & Transport',
] as const

export async function generateBusinessIdeas(query: string, category?: string): Promise<BusinessIdea[]> {
  const searchTerm = query || category || 'general business'

  const prompt = `You are an Australian business opportunity analyst.
A user is searching for business ideas related to: "${searchTerm}"

Generate exactly 6 relevant business ideas for the Australian market (focus on cities like
Adelaide, Melbourne, Sydney, Brisbane, Perth).

Respond ONLY with a valid JSON object of the shape {"ideas": [ ... ]} — no markdown, no explanation.

Each object in the "ideas" array must have exactly these fields:
{
  "id": number (1-6),
  "name": string (short business name, e.g. "Mobile Dog Grooming"),
  "category": string (one of: ${CATEGORIES.join(', ')}),
  "tagline": string (one compelling sentence about the opportunity),
  "opportunityScore": number (60-95, realistic score),
  "demandLevel": string ("High" | "Medium" | "Growing"),
  "competitorDensity": string ("Low" | "Medium" | "High"),
  "estimatedStartupCost": string (e.g. "$15,000 – $40,000"),
  "timeToProfit": string (e.g. "6–12 months"),
  "whyNow": string (1-2 sentences on why this works in Australia right now),
  "targetCustomer": string (brief description of ideal customer)
}`

  const result = await generateJSON<{ ideas: BusinessIdea[] }>(prompt, {
    tier: 'smart',
    temperature: 0.7,
    maxTokens: 2000,
  })
  return result.ideas ?? []
}

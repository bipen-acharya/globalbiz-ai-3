import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, category } = await req.json();

    const searchTerm = query || category || 'general business';

    const prompt = `You are an Australian business opportunity analyst.
A user is searching for business ideas related to: "${searchTerm}"

Generate exactly 6 relevant business ideas for the Australian market (focus on cities like
Adelaide, Melbourne, Sydney, Brisbane, Perth).

Respond ONLY with a valid JSON array. No markdown, no explanation. Just the JSON array.

Each object must have exactly these fields:
{
  "id": number (1-6),
  "name": string (short business name, e.g. "Mobile Dog Grooming"),
  "category": string (one of: Food & Beverage, Retail & Fashion, Trades & Services, Health & Wellness, Tech & Digital, Education & Training, Home & Garden, Auto & Transport),
  "tagline": string (one compelling sentence about the opportunity),
  "opportunityScore": number (60-95, realistic score),
  "demandLevel": string ("High" | "Medium" | "Growing"),
  "competitorDensity": string ("Low" | "Medium" | "High"),
  "estimatedStartupCost": string (e.g. "$15,000 – $40,000"),
  "timeToProfit": string (e.g. "6–12 months"),
  "whyNow": string (1-2 sentences on why this works in Australia right now),
  "targetCustomer": string (brief description of ideal customer)
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || '[]';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const ideas = JSON.parse(cleaned);

    return NextResponse.json({ ideas, query: searchTerm });
  } catch (error) {
    console.error('Explore ideas error:', error);
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 });
  }
}

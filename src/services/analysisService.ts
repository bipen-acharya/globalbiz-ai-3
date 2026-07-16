// ─────────────────────────────────────────────────────────────────────────────
// Analysis Service — façade for new and existing-business report generation.
// Heavy prompt-building lives in lib/openai.ts and lib/openai-existing.ts.
// This module is the stable import surface for controllers.
// ─────────────────────────────────────────────────────────────────────────────

export { generateAnalysis } from '@/lib/openai'
export { generateExistingAnalysis } from '@/lib/openai-existing'

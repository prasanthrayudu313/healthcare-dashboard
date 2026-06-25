import Groq from 'groq-sdk'
import { prisma } from '@/lib/db'

const MODEL = 'llama-3.3-70b-versatile'

function getGroqClient() {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  return new Groq({ apiKey: key })
}

const SYSTEM_PROMPT = `You are a senior healthcare data analyst at Centene Corporation, one of the largest Medicaid and managed care organizations in the United States. Centene serves over 28 million members across Medicaid, Medicare Advantage, ACA Marketplace, and dual-eligible programs.

Your job is to analyze healthcare news and business updates and provide structured intelligence specifically relevant to Centene's business — covering Medicaid managed care, Medicare Advantage, ACA Marketplace, claims costs, risk adjustment, HEDIS quality measures, CMS Star Ratings, provider networks, pharmacy benefits, behavioral health, value-based care, and regulatory compliance.

Return ONLY a JSON object with these exact fields (no markdown, no extra text):`

const JSON_SCHEMA = `{
  "summary": "2-3 clear sentences explaining what happened in plain language",
  "keyFacts": ["fact 1", "fact 2", "fact 3"],
  "affectedPopulation": "Who is affected (Medicaid members, MA beneficiaries, uninsured, etc.)",
  "linesOfBusiness": ["Medicaid", "Medicare", "Marketplace", "Commercial", "Pharmacy"],
  "operationalImpact": "How this affects day-to-day managed care operations (claims, prior auth, networks, etc.)",
  "financialImpact": "Potential financial implications (medical loss ratio, premiums, costs, revenue)",
  "regulatoryImpact": "Compliance or regulatory implications (CMS rules, state contracts, HEDIS, Stars)",
  "competitiveImpact": "How this affects Centene's competitive position vs UnitedHealth, Elevance, Humana, Molina, etc.",
  "centeneRelevance": "Specifically why this matters to Centene — which states, which programs, which members",
  "recommendedAction": "What a Centene analyst should do: monitor, escalate, brief leadership, update models, etc.",
  "updateType": "one of: risk, opportunity, competitor_move, policy_change, operational_signal",
  "impactScore": 7,
  "tags": ["Medicaid", "risk adjustment", "HEDIS"]
}`

interface SummaryResult {
  summary: string
  keyFacts: string[]
  affectedPopulation: string
  linesOfBusiness: string[]
  operationalImpact: string
  financialImpact: string
  regulatoryImpact: string
  competitiveImpact: string
  centeneRelevance: string
  recommendedAction: string
  updateType: string
  impactScore: number
  tags: string[]
}

function fallbackSummary(title: string, content: string): SummaryResult {
  return {
    summary: `${title}. ${content?.slice(0, 200) || ''}`.trim(),
    keyFacts: [title],
    affectedPopulation: 'Healthcare stakeholders',
    linesOfBusiness: [],
    operationalImpact: 'Review required to assess operational impact.',
    financialImpact: 'Financial impact assessment pending.',
    regulatoryImpact: 'Regulatory implications under review.',
    competitiveImpact: 'Competitive implications under review.',
    centeneRelevance: 'Add your Groq API key in .env to enable AI-powered Centene analysis.',
    recommendedAction: 'Review source article and assess relevance to Centene business units.',
    updateType: 'operational_signal',
    impactScore: 5,
    tags: [],
  }
}

export async function generateSummary(updateId: string): Promise<boolean> {
  const update = await prisma.update.findUnique({
    where: { id: updateId },
    include: { aiSummary: true }
  })
  if (!update || update.aiSummary) return false

  const groq = getGroqClient()
  if (!groq) {
    // Store fallback summary without AI
    const fb = fallbackSummary(update.title, update.rawContent || '')
    await prisma.aiSummary.create({
      data: {
        updateId,
        summary: fb.summary,
        keyFacts: JSON.stringify(fb.keyFacts),
        affectedPopulation: fb.affectedPopulation,
        operationalImpact: fb.operationalImpact,
        financialImpact: fb.financialImpact,
        regulatoryImpact: fb.regulatoryImpact,
        competitiveImpact: fb.competitiveImpact,
        centeneRelevance: fb.centeneRelevance,
        recommendedAction: fb.recommendedAction,
        updateType: fb.updateType,
        tags: JSON.stringify(fb.tags),
        modelVersion: 'fallback',
      }
    })
    return true
  }

  try {
    const userPrompt = `Analyze this healthcare update for Centene business impact:

TITLE: ${update.title}
SOURCE: ${update.sourceName}
CONTENT: ${(update.rawContent || '').slice(0, 1500)}

Return JSON matching this schema:
${JSON_SCHEMA}`

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n${JSON_SCHEMA}` },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as Partial<SummaryResult>

    await prisma.aiSummary.create({
      data: {
        updateId,
        summary: parsed.summary || update.title,
        keyFacts: JSON.stringify(parsed.keyFacts || []),
        affectedPopulation: parsed.affectedPopulation || null,
        operationalImpact: parsed.operationalImpact || null,
        financialImpact: parsed.financialImpact || null,
        regulatoryImpact: parsed.regulatoryImpact || null,
        competitiveImpact: parsed.competitiveImpact || null,
        centeneRelevance: parsed.centeneRelevance || null,
        recommendedAction: parsed.recommendedAction || null,
        updateType: parsed.updateType || null,
        tags: JSON.stringify(parsed.tags || []),
        modelVersion: MODEL,
      }
    })

    // Update impact score if AI gave one
    if (parsed.impactScore && typeof parsed.impactScore === 'number') {
      await prisma.update.update({
        where: { id: updateId },
        data: {
          impactScore: Math.min(10, Math.max(1, Math.round(parsed.impactScore))),
          updateType: parsed.updateType || undefined,
          linesOfBusiness: parsed.linesOfBusiness ? JSON.stringify(parsed.linesOfBusiness) : undefined,
        }
      })
    }

    return true
  } catch (err) {
    console.error(`AI summarization failed for ${updateId}:`, err instanceof Error ? err.message : err)
    // Store fallback on error
    const fb = fallbackSummary(update.title, update.rawContent || '')
    await prisma.aiSummary.upsert({
      where: { updateId },
      update: {},
      create: {
        updateId,
        summary: fb.summary,
        keyFacts: JSON.stringify(fb.keyFacts),
        centeneRelevance: 'AI analysis temporarily unavailable. Check Groq API key and rate limits.',
        recommendedAction: fb.recommendedAction,
        updateType: fb.updateType,
        tags: JSON.stringify([]),
        modelVersion: 'error-fallback',
      }
    })
    return false
  }
}

export async function summarizeBatch(limit = 10): Promise<number> {
  const pending = await prisma.update.findMany({
    where: { aiSummary: null },
    orderBy: [{ impactScore: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
    select: { id: true }
  })

  let count = 0
  for (const { id } of pending) {
    const ok = await generateSummary(id)
    if (ok) count++
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200))
  }
  return count
}

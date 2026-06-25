import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSummary } from '@/lib/ai/summarize'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeJsonParse<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const update = await prisma.update.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        source: true,
        aiSummary: true,
      }
    })

    if (!update) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Trigger AI summary if missing (async, don't wait)
    if (!update.aiSummary) {
      generateSummary(params.id).catch(console.error)
    }

    return NextResponse.json({
      ...update,
      publishedAt: update.publishedAt.toISOString(),
      ingestedAt: update.ingestedAt.toISOString(),
      linesOfBusiness: safeJsonParse(update.linesOfBusiness, []),
      states: safeJsonParse(update.states, []),
      aiSummary: update.aiSummary ? {
        ...update.aiSummary,
        keyFacts: safeJsonParse(update.aiSummary.keyFacts, []),
        tags: safeJsonParse(update.aiSummary.tags, []),
        generatedAt: update.aiSummary.generatedAt.toISOString(),
      } : null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch update' }, { status: 500 })
  }
}

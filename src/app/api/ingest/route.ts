import { NextRequest, NextResponse } from 'next/server'
import { runIngestion, seedCompanies } from '@/lib/ingestion'
import { summarizeBatch } from '@/lib/ai/summarize'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

let isRunning = false

export async function POST(req: NextRequest) {
  if (isRunning) {
    return NextResponse.json({ status: 'already_running' }, { status: 202 })
  }

  isRunning = true
  try {
    // Seed companies on first run
    await seedCompanies()

    // Ingest data
    const { found, added, errors } = await runIngestion()

    // Summarize top new items with AI (up to 15)
    const summarized = await summarizeBatch(15)

    return NextResponse.json({
      status: 'ok',
      found,
      added,
      summarized,
      errors: errors.slice(0, 5),
    })
  } catch (err) {
    console.error('Ingest error:', err)
    return NextResponse.json({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  } finally {
    isRunning = false
  }
}

export async function GET() {
  const lastLog = await import('@/lib/db').then(m =>
    m.prisma.ingestLog.findFirst({ orderBy: { ranAt: 'desc' } })
  )
  return NextResponse.json({ lastRun: lastLog })
}

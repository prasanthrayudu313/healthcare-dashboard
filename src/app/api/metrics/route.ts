import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      total,
      highImpact,
      medicaidRaw,
      medicareRaw,
      marketplaceRaw,
      regulatory,
      fda,
      cmsPolicy,
      stateMedicaid,
      earnings,
      ma,
      competitor,
      lastUpdate,
    ] = await Promise.all([
      prisma.update.count({ where: { publishedAt: { gte: today } } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, impactScore: { gte: 7 } } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, linesOfBusiness: { contains: 'Medicaid' } } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, linesOfBusiness: { contains: 'Medicare' } } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, linesOfBusiness: { contains: 'Marketplace' } } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, category: 'regulatory' } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, OR: [{ category: 'fda_approval' }, { category: 'fda_recall' }] } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, category: 'cms_policy' } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, category: 'state_contract' } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, category: 'earnings' } }),
      prisma.update.count({ where: { publishedAt: { gte: today }, category: 'ma_activity' } }),
      prisma.update.count({ where: {
        publishedAt: { gte: today },
        updateType: 'competitor_move'
      }}),
      prisma.update.findFirst({ orderBy: { ingestedAt: 'desc' }, select: { ingestedAt: true } }),
    ])

    return NextResponse.json({
      total,
      highImpact,
      medicaid: medicaidRaw,
      medicare: medicareRaw,
      marketplace: marketplaceRaw,
      regulatory,
      fda,
      cmsPolicy,
      stateMedicaid,
      earnings,
      ma,
      competitor,
      lastUpdated: lastUpdate?.ingestedAt?.toISOString() || new Date().toISOString(),
    })
  } catch (err) {
    console.error('Metrics error:', err)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

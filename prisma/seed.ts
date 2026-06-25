import { PrismaClient } from '@prisma/client'
import { TRACKED_COMPANIES, RSS_SOURCES } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding companies...')
  for (const co of TRACKED_COMPANIES) {
    const id = co.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    await prisma.company.upsert({
      where: { id },
      update: { name: co.name, ticker: co.ticker || null, sector: co.sector, orgType: co.orgType, hqState: co.hqState || null },
      create: { id, name: co.name, ticker: co.ticker || null, sector: co.sector, orgType: co.orgType, hqState: co.hqState || null },
    })
  }
  console.log(`Seeded ${TRACKED_COMPANIES.length} companies.`)

  console.log('Seeding data sources...')
  for (const src of RSS_SOURCES) {
    await prisma.dataSource.upsert({
      where: { url: src.url },
      update: { name: src.name, credScore: src.credScore, pollIntervalMin: src.pollMin },
      create: { name: src.name, type: 'rss', url: src.url, credScore: src.credScore, pollIntervalMin: src.pollMin },
    })
  }
  console.log(`Seeded ${RSS_SOURCES.length} data sources.`)
  console.log('Done! Run npm run dev and click "Refresh Data" to fetch your first healthcare updates.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

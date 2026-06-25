// Background worker — calls the Next.js ingest API every 30 minutes
// Used by Docker Compose. Not needed for local `npm run dev`.

const APP_URL = process.env.APP_URL || 'http://app:3000'
const INTERVAL_MS = parseInt(process.env.INGEST_INTERVAL_MS || '1800000') // 30 min

async function ingest() {
  const now = new Date().toISOString()
  console.log(`[${now}] Running ingestion...`)
  try {
    const res = await fetch(`${APP_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(90000),
    })
    const data = await res.json()
    console.log(`[${now}] Ingestion complete: +${data.added || 0} new updates, ${data.summarized || 0} AI summaries`)
  } catch (err) {
    console.error(`[${now}] Ingestion failed:`, err.message)
  }
}

// Wait for app to be ready, then run immediately, then on schedule
async function start() {
  console.log(`Healthcare Intelligence Worker starting — polling ${APP_URL} every ${INTERVAL_MS / 60000} minutes`)
  await new Promise(r => setTimeout(r, 15000)) // Wait 15s for app to start
  await ingest()
  setInterval(ingest, INTERVAL_MS)
}

start().catch(console.error)

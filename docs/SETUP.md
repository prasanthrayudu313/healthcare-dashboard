# Centene Intelligence Hub — Setup Guide

A real-time healthcare market intelligence dashboard tracking 60+ companies and agencies,
with AI-powered analysis through a Centene managed care lens.

---

## Quick Start (3 steps)

### Step 1 — Prerequisites
- **Node.js 18+** — download at https://nodejs.org
- Or **Docker Desktop** — download at https://docker.com

### Step 2 — Get a free AI key (optional but recommended)
1. Go to https://console.groq.com and create a free account
2. Click "API Keys" → "Create API Key"
3. Copy your key — it starts with `gsk_`
4. Open the `.env` file in this folder and paste it:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```
   Without this key, the dashboard still works — it just shows rule-based summaries instead of full AI analysis.

### Step 3 — Run it

**Option A: Local (fastest)**
```bash
npm install
npm run setup        # creates database and seeds companies
npm run dev          # starts on http://localhost:3000
```
Then open http://localhost:3000 and click the **"Refresh Data"** button to fetch live healthcare news.

**Option B: Docker**
```bash
docker-compose up --build
```
Open http://localhost:3000. The worker container will auto-fetch data every 30 minutes.

---

## What You'll See

### Main Dashboard
- **12 KPI cards** — total updates, high-impact, Medicaid, Medicare, Marketplace, FDA alerts, CMS policy, M&A activity, and more
- **Live intelligence feed** — sorted by newest, impact, or Centene relevance
- **Filter sidebar** — filter by severity, line of business, category, date range, update type, and sector
- **Right panel** — critical alerts, competitor moves, and tracked companies

### Each Update Card Shows
- Category badge (FDA Approval, CMS Policy, Clinical Trial, etc.)
- Severity level (Critical → Low)
- Impact score (1-10 bar)
- AI summary in plain English
- "Why this matters to Centene" — Medicaid, MA, Marketplace impact
- Recommended analyst action
- Link to original source

### Analytics Page
- Updates by category (bar chart)
- Line of business breakdown (pie chart)
- Daily activity timeline (line chart)
- Severity distribution

---

## Data Sources (All Free, No Scraping)

| Source | Type | Frequency |
|--------|------|-----------|
| FDA Press Announcements | RSS | Every 30 min |
| FDA Drug Safety Alerts | RSS | Every 30 min |
| CMS Newsroom | RSS | Every 30 min |
| NIH News | RSS | Every 60 min |
| HHS News | RSS | Every 60 min |
| CDC News | RSS | Every 60 min |
| WHO News | RSS | Every 60 min |
| STAT News | RSS | Every 20 min |
| Fierce Healthcare | RSS | Every 20 min |
| Fierce Pharma | RSS | Every 20 min |
| Becker's Hospital Review | RSS | Every 30 min |
| Healthcare IT News | RSS | Every 30 min |
| Kaiser Family Foundation | RSS | Every 60 min |
| Health Affairs | RSS | Every 2 hours |
| MedCity News | RSS | Every 30 min |
| FDA OpenFDA API | API | Every 30 min |
| ClinicalTrials.gov | API | Every 60 min |
| SEC EDGAR 8-K filings | API | Every 60 min |

---

## Tracked Companies (32 organizations)

**Payers:** Centene, UnitedHealth Group, CVS/Aetna, Elevance Health, Cigna, Humana, Molina, Oscar Health, Kaiser Permanente, BCBS, Clover Health

**Regulators:** CMS, FDA, CDC, NIH, HHS, WHO

**Pharma:** J&J, Pfizer, Merck, AbbVie, Bristol Myers Squibb, Eli Lilly, Amgen, Gilead, Moderna

**Hospital Systems:** HCA Healthcare, CommonSpirit Health, Ascension Health

**Digital Health:** Teladoc Health, Veeva Systems, Inovalon

---

## AI Analysis (Groq — Free)

Each update gets analyzed with a Centene-specific prompt covering:
- Simple plain-language summary
- Key facts extracted
- Affected population
- Lines of business impacted (Medicaid, Medicare, Marketplace, etc.)
- Operational / Financial / Regulatory / Competitive impact
- "Why this matters to Centene" — specific to their programs and states
- Recommended analyst action
- Tags for search and filtering

**Groq free tier limits:** 6,000 requests/minute, no daily cap. More than enough.

---

## Disclaimer

This dashboard is for informational and business analysis purposes only. It is not medical, legal, or investment advice. All data is sourced from publicly available sources. No PHI or PII is collected or stored.

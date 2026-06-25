export const RSS_SOURCES = [
  // Government / Regulators
  {
    name: 'FDA Press Announcements',
    url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml',
    credScore: 10, company: 'FDA', pollMin: 30
  },
  {
    name: 'FDA Drug Safety',
    url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch-safety-alerts/rss.xml',
    credScore: 10, company: 'FDA', pollMin: 30
  },
  {
    name: 'CMS Newsroom',
    url: 'https://www.cms.gov/newsroom/rss.xml',
    credScore: 10, company: 'CMS', pollMin: 30
  },
  {
    name: 'NIH News',
    url: 'https://www.nih.gov/news-releases/feed.xml',
    credScore: 10, company: 'NIH', pollMin: 60
  },
  {
    name: 'HHS News',
    url: 'https://www.hhs.gov/rss/news.xml',
    credScore: 10, company: 'HHS', pollMin: 60
  },
  {
    name: 'CDC News',
    url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    credScore: 10, company: 'CDC', pollMin: 60
  },
  {
    name: 'WHO News',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    credScore: 10, company: 'WHO', pollMin: 60
  },
  // Healthcare News
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
    credScore: 9, company: null, pollMin: 20
  },
  {
    name: 'Fierce Healthcare',
    url: 'https://www.fiercehealthcare.com/rss/xml',
    credScore: 8, company: null, pollMin: 20
  },
  {
    name: 'Fierce Pharma',
    url: 'https://www.fiercepharma.com/rss/xml',
    credScore: 8, company: null, pollMin: 20
  },
  {
    name: "Becker's Hospital Review",
    url: 'https://www.beckershospitalreview.com/rss.xml',
    credScore: 8, company: null, pollMin: 30
  },
  {
    name: 'Healthcare IT News',
    url: 'https://www.healthcareitnews.com/rss.xml',
    credScore: 8, company: null, pollMin: 30
  },
  {
    name: 'Kaiser Family Foundation',
    url: 'https://www.kff.org/feed/',
    credScore: 9, company: 'KFF', pollMin: 60
  },
  {
    name: 'Health Affairs',
    url: 'https://www.healthaffairs.org/rss/current.xml',
    credScore: 9, company: 'Health Affairs', pollMin: 120
  },
  {
    name: 'Fierce Biotech',
    url: 'https://www.fiercebiotech.com/rss/xml',
    credScore: 8, company: null, pollMin: 30
  },
  {
    name: 'MedCity News',
    url: 'https://medcitynews.com/feed/',
    credScore: 7, company: null, pollMin: 30
  },
  {
    name: 'Healthcare Finance News',
    url: 'https://www.healthcarefinancenews.com/rss.xml',
    credScore: 8, company: null, pollMin: 30
  },
  {
    name: 'Modern Healthcare',
    url: 'https://www.modernhealthcare.com/section/feed',
    credScore: 9, company: null, pollMin: 30
  },
  {
    name: 'Axios Health',
    url: 'https://api.axios.com/feed/stream/3ef9e1ce-a8a1-435d-be2e-b2cc0e16aa66',
    credScore: 8, company: null, pollMin: 20
  },
]

export const TRACKED_COMPANIES = [
  // Payers
  { name: 'Centene Corporation', ticker: 'CNC', sector: 'payer', orgType: 'payer', hqState: 'MO' },
  { name: 'UnitedHealth Group', ticker: 'UNH', sector: 'payer', orgType: 'payer', hqState: 'MN' },
  { name: 'CVS Health / Aetna', ticker: 'CVS', sector: 'payer', orgType: 'payer', hqState: 'RI' },
  { name: 'Elevance Health', ticker: 'ELV', sector: 'payer', orgType: 'payer', hqState: 'IN' },
  { name: 'Cigna / Evernorth', ticker: 'CI', sector: 'payer', orgType: 'payer', hqState: 'CT' },
  { name: 'Humana', ticker: 'HUM', sector: 'payer', orgType: 'payer', hqState: 'KY' },
  { name: 'Molina Healthcare', ticker: 'MOH', sector: 'payer', orgType: 'payer', hqState: 'CA' },
  { name: 'Oscar Health', ticker: 'OSCR', sector: 'payer', orgType: 'payer', hqState: 'NY' },
  { name: 'Kaiser Permanente', ticker: null, sector: 'payer', orgType: 'payer', hqState: 'CA' },
  { name: 'Blue Cross Blue Shield', ticker: null, sector: 'payer', orgType: 'payer', hqState: null },
  { name: 'Clover Health', ticker: 'CLOV', sector: 'payer', orgType: 'payer', hqState: 'NJ' },
  // Regulators
  { name: 'CMS', ticker: null, sector: 'regulator', orgType: 'government', hqState: 'MD' },
  { name: 'FDA', ticker: null, sector: 'regulator', orgType: 'government', hqState: 'MD' },
  { name: 'CDC', ticker: null, sector: 'regulator', orgType: 'government', hqState: 'GA' },
  { name: 'NIH', ticker: null, sector: 'regulator', orgType: 'government', hqState: 'MD' },
  { name: 'HHS', ticker: null, sector: 'regulator', orgType: 'government', hqState: 'DC' },
  { name: 'WHO', ticker: null, sector: 'regulator', orgType: 'government', hqState: null },
  // Pharma
  { name: 'Johnson & Johnson', ticker: 'JNJ', sector: 'pharma', orgType: 'manufacturer', hqState: 'NJ' },
  { name: 'Pfizer', ticker: 'PFE', sector: 'pharma', orgType: 'manufacturer', hqState: 'NY' },
  { name: 'Merck', ticker: 'MRK', sector: 'pharma', orgType: 'manufacturer', hqState: 'NJ' },
  { name: 'AbbVie', ticker: 'ABBV', sector: 'pharma', orgType: 'manufacturer', hqState: 'IL' },
  { name: 'Bristol Myers Squibb', ticker: 'BMY', sector: 'pharma', orgType: 'manufacturer', hqState: 'NY' },
  { name: 'Eli Lilly', ticker: 'LLY', sector: 'pharma', orgType: 'manufacturer', hqState: 'IN' },
  { name: 'Amgen', ticker: 'AMGN', sector: 'biotech', orgType: 'manufacturer', hqState: 'CA' },
  { name: 'Gilead Sciences', ticker: 'GILD', sector: 'biotech', orgType: 'manufacturer', hqState: 'CA' },
  { name: 'Moderna', ticker: 'MRNA', sector: 'biotech', orgType: 'manufacturer', hqState: 'MA' },
  // Hospital Systems
  { name: 'HCA Healthcare', ticker: 'HCA', sector: 'hospital', orgType: 'provider', hqState: 'TN' },
  { name: 'CommonSpirit Health', ticker: null, sector: 'hospital', orgType: 'provider', hqState: 'IL' },
  { name: 'Ascension Health', ticker: null, sector: 'hospital', orgType: 'provider', hqState: 'MO' },
  // Digital Health
  { name: 'Teladoc Health', ticker: 'TDOC', sector: 'digital', orgType: 'digital', hqState: 'NY' },
  { name: 'Veeva Systems', ticker: 'VEEV', sector: 'digital', orgType: 'digital', hqState: 'CA' },
  { name: 'Inovalon', ticker: null, sector: 'digital', orgType: 'digital', hqState: 'MD' },
]

export const CATEGORY_LABELS: Record<string, string> = {
  fda_approval: 'FDA Approval',
  fda_recall: 'FDA Recall',
  safety_alert: 'Safety Alert',
  cms_policy: 'CMS Policy',
  state_contract: 'State Contract',
  earnings: 'Earnings',
  trial_update: 'Clinical Trial',
  drug_launch: 'Drug Launch',
  ma_activity: 'M&A',
  partnership: 'Partnership',
  regulatory: 'Regulatory',
  research: 'Research',
  leadership: 'Leadership',
  vbc: 'Value-Based Care',
  digital_health: 'Digital Health',
  news: 'News',
}

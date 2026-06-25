-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ticker" TEXT,
    "sector" TEXT NOT NULL,
    "orgType" TEXT NOT NULL,
    "hqState" TEXT,
    "logoUrl" TEXT,
    "isTracked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "credScore" INTEGER NOT NULL DEFAULT 8,
    "pollIntervalMin" INTEGER NOT NULL DEFAULT 30,
    "lastPolledAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "rawContent" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "linesOfBusiness" TEXT,
    "states" TEXT,
    "impactScore" INTEGER NOT NULL DEFAULT 5,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "updateType" TEXT,
    "contentHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "updates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "updates_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "data_sources" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updateId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyFacts" TEXT,
    "affectedPopulation" TEXT,
    "operationalImpact" TEXT,
    "financialImpact" TEXT,
    "regulatoryImpact" TEXT,
    "competitiveImpact" TEXT,
    "centeneRelevance" TEXT,
    "recommendedAction" TEXT,
    "updateType" TEXT,
    "tags" TEXT,
    "modelVersion" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_summaries_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingest_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsNew" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error" TEXT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_url_key" ON "data_sources"("url");

-- CreateIndex
CREATE UNIQUE INDEX "updates_url_key" ON "updates"("url");

-- CreateIndex
CREATE INDEX "updates_publishedAt_idx" ON "updates"("publishedAt");

-- CreateIndex
CREATE INDEX "updates_category_idx" ON "updates"("category");

-- CreateIndex
CREATE INDEX "updates_impactScore_idx" ON "updates"("impactScore");

-- CreateIndex
CREATE INDEX "updates_severity_idx" ON "updates"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ai_summaries_updateId_key" ON "ai_summaries"("updateId");

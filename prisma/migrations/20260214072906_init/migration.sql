-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'active',
    "scrapeFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "lastScrapedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Competitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "htmlHash" TEXT NOT NULL,
    "metaData" JSONB,
    "screenshotUrl" TEXT,
    "httpStatus" INTEGER NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Snapshot_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Change" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitorId" TEXT NOT NULL,
    "oldSnapshotId" TEXT,
    "newSnapshotId" TEXT,
    "changeType" TEXT NOT NULL,
    "summary" TEXT,
    "diffData" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Change_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Change_oldSnapshotId_fkey" FOREIGN KEY ("oldSnapshotId") REFERENCES "Snapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Change_newSnapshotId_fkey" FOREIGN KEY ("newSnapshotId") REFERENCES "Snapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "keywords" JSONB,
    "topics" JSONB,
    "sentimentScore" REAL,
    "wordCount" INTEGER,
    "readabilityScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "summary" TEXT,
    "reportData" JSONB,
    "htmlUrl" TEXT,
    "pdfUrl" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Competitor_userId_idx" ON "Competitor"("userId");

-- CreateIndex
CREATE INDEX "Competitor_status_idx" ON "Competitor"("status");

-- CreateIndex
CREATE INDEX "Snapshot_competitorId_idx" ON "Snapshot"("competitorId");

-- CreateIndex
CREATE INDEX "Snapshot_scrapedAt_idx" ON "Snapshot"("scrapedAt");

-- CreateIndex
CREATE INDEX "Change_competitorId_idx" ON "Change"("competitorId");

-- CreateIndex
CREATE INDEX "Change_detectedAt_idx" ON "Change"("detectedAt");

-- CreateIndex
CREATE INDEX "Analysis_snapshotId_idx" ON "Analysis"("snapshotId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_periodEnd_idx" ON "Report"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

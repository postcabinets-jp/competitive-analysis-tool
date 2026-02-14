/**
 * スクレイピングワーカー
 * BullMQを使用してバックグラウンドでスクレイピングを実行
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { ScraperService } from '../services/scraper.service';
import { AnalyzerService } from '../services/analyzer.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const scraper = new ScraperService();
const analyzer = new AnalyzerService();

// Redisに接続
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

interface ScrapeJobData {
  competitorId: string;
  url: string;
}

/**
 * スクレイピングジョブの処理
 */
async function processScrapeJob(job: Job<ScrapeJobData>) {
  const { competitorId, url } = job.data;

  console.log(`[Worker] Starting scrape job for competitor ${competitorId}: ${url}`);

  try {
    // 1. スクレイピング実行
    const scrapedData = await scraper.scrapeUrl(url);
    
    // 2. データベースに保存
    const snapshot = await prisma.snapshot.create({
      data: {
        competitorId,
        url: scrapedData.url,
        title: scrapedData.title,
        description: scrapedData.description,
        content: scrapedData.content,
        htmlHash: scrapedData.htmlHash,
        metaData: scrapedData.metaData as any,
        screenshotUrl: scrapedData.screenshotUrl,
        httpStatus: scrapedData.httpStatus,
        scrapedAt: scrapedData.scrapedAt,
      },
    });

    // 3. 変更検知
    const previousSnapshot = await prisma.snapshot.findFirst({
      where: {
        competitorId,
        id: { not: snapshot.id },
      },
      orderBy: { scrapedAt: 'desc' },
    });

    if (previousSnapshot) {
      const change = analyzer.detectChanges(
        previousSnapshot as any,
        scrapedData
      );

      if (change) {
        await prisma.change.create({
          data: {
            competitorId,
            oldSnapshotId: previousSnapshot.id,
            newSnapshotId: snapshot.id,
            changeType: change.changeType,
            summary: change.summary,
            diffData: change.diffData as any,
            severity: change.severity,
          },
        });

        console.log(`[Worker] Change detected: ${change.summary}`);
      }
    }

    // 4. 分析実行
    const analysis = analyzer.analyze(scrapedData);
    await prisma.analysis.create({
      data: {
        snapshotId: snapshot.id,
        keywords: analysis.keywords as any,
        topics: analysis.topics as any,
        wordCount: analysis.wordCount,
        readabilityScore: analysis.readabilityScore,
      },
    });

    // 5. 最終スクレイピング時刻を更新
    await prisma.competitor.update({
      where: { id: competitorId },
      data: { lastScrapedAt: new Date() },
    });

    console.log(`[Worker] Scrape job completed for competitor ${competitorId}`);
    
    return { success: true, snapshotId: snapshot.id };
  } catch (error) {
    console.error(`[Worker] Scrape job failed:`, error);
    
    // エラー状態を記録
    await prisma.competitor.update({
      where: { id: competitorId },
      data: { status: 'error' },
    });

    throw error;
  }
}

// ワーカー起動
const worker = new Worker('scrape-queue', processScrapeJob, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Scrape worker started');

// グレースフルシャットダウン
process.on('SIGINT', async () => {
  console.log('[Worker] Shutting down...');
  await worker.close();
  await scraper.closeBrowser();
  await prisma.$disconnect();
  process.exit(0);
});

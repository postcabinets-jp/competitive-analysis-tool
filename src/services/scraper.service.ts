/**
 * スクレイピングサービス
 * Playwrightを使用してWebサイトの情報を取得
 */

import { chromium, Browser, Page } from 'playwright';
import crypto from 'crypto';

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  content: string;
  htmlHash: string;
  metaData: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    keywords?: string[];
    headings: { level: number; text: string }[];
    links: string[];
  };
  screenshotUrl?: string;
  httpStatus: number;
  scrapedAt: Date;
}

export class ScraperService {
  private browser: Browser | null = null;

  /**
   * ブラウザを初期化
   */
  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  /**
   * ブラウザをクローズ
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * URLをスクレイピング
   */
  async scrapeUrl(url: string): Promise<ScrapedData> {
    await this.initBrowser();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // User-Agentを設定（ボット検出回避）
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      );

      // ページにアクセス
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const httpStatus = response?.status() || 0;

      // タイトル取得
      const title = await page.title();

      // メタ情報取得
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content')
        .catch(() => '');

      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute('content')
        .catch(() => undefined);

      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute('content')
        .catch(() => undefined);

      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute('content')
        .catch(() => undefined);

      // メインコンテンツ抽出
      const content = await page.evaluate(() => {
        // 不要な要素を除外
        const elementsToRemove = ['script', 'style', 'nav', 'footer', 'header'];
        elementsToRemove.forEach(tag => {
          document.querySelectorAll(tag).forEach(el => el.remove());
        });

        return document.body.innerText;
      });

      // 見出し抽出
      const headings = await page.evaluate(() => {
        const headingElements = Array.from(
          document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        );
        return headingElements.map(el => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent?.trim() || '',
        }));
      });

      // リンク抽出
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(
          a => (a as HTMLAnchorElement).href
        );
      });

      // HTML全体のハッシュ計算（変更検知用）
      const html = await page.content();
      const htmlHash = crypto.createHash('sha256').update(html).digest('hex');

      // スクリーンショット取得（オプション）
      // const screenshot = await page.screenshot({ fullPage: true });
      // const screenshotUrl = await this.uploadScreenshot(screenshot);

      return {
        url,
        title,
        description: description || '',
        content: content.slice(0, 10000), // 最大10KB
        htmlHash,
        metaData: {
          ogTitle,
          ogDescription,
          ogImage,
          headings,
          links: links.slice(0, 100), // 最大100リンク
        },
        httpStatus,
        scrapedAt: new Date(),
      };
    } finally {
      await page.close();
    }
  }

  /**
   * 複数URLを並行スクレイピング
   */
  async scrapeUrls(urls: string[]): Promise<ScrapedData[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeUrl(url))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<ScrapedData> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
}

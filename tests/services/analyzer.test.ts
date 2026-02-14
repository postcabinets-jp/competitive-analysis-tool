/**
 * Analyzerサービスのテスト
 */

import { AnalyzerService } from '../../src/services/analyzer.service';
import { ScrapedData } from '../../src/services/scraper.service';

describe('AnalyzerService', () => {
  let analyzer: AnalyzerService;

  beforeEach(() => {
    analyzer = new AnalyzerService();
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = `
        人工知能（AI）は急速に発展しています。
        機械学習やディープラーニングの技術が進化し、
        多くの企業がAIを導入しています。
      `;

      const keywords = analyzer.extractKeywords(text, 5);

      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords[0]).toHaveProperty('word');
      expect(keywords[0]).toHaveProperty('count');
      expect(keywords[0].count).toBeGreaterThan(0);
    });

    it('should filter out stop words', () => {
      const text = 'の に は を た が で て と し れ さ';
      const keywords = analyzer.extractKeywords(text);

      expect(keywords.length).toBe(0);
    });

    it('should return top N keywords', () => {
      const text = 'AI AI AI machine machine learning';
      const keywords = analyzer.extractKeywords(text, 2);

      expect(keywords.length).toBeLessThanOrEqual(2);
      expect(keywords[0].word).toBe('ai');
      expect(keywords[0].count).toBe(3);
    });
  });

  describe('extractTopics', () => {
    it('should extract topics from scraped data', () => {
      const scrapedData: ScrapedData = {
        url: 'https://example.com',
        title: 'AI Technology Overview',
        description: 'An overview of AI technology',
        content: 'Machine learning and deep learning are revolutionizing AI...',
        htmlHash: 'abc123',
        metaData: {
          headings: [
            { level: 1, text: 'Introduction to AI' },
            { level: 2, text: 'Machine Learning Basics' },
            { level: 2, text: 'Deep Learning Applications' },
          ],
          links: [],
        },
        httpStatus: 200,
        scrapedAt: new Date(),
      };

      const topics = analyzer.extractTopics(scrapedData);

      expect(topics.length).toBeGreaterThan(0);
      expect(topics).toContain('Introduction to AI');
    });
  });

  describe('detectChanges', () => {
    it('should detect no change when HTML hash is same', () => {
      const oldData: ScrapedData = {
        url: 'https://example.com',
        title: 'Test Page',
        description: '',
        content: 'Sample content',
        htmlHash: 'abc123',
        metaData: { headings: [], links: [] },
        httpStatus: 200,
        scrapedAt: new Date('2024-01-01'),
      };

      const newData: ScrapedData = {
        ...oldData,
        scrapedAt: new Date('2024-01-08'),
      };

      const change = analyzer.detectChanges(oldData, newData);
      expect(change).toBeNull();
    });

    it('should detect title change', () => {
      const oldData: ScrapedData = {
        url: 'https://example.com',
        title: 'Old Title',
        description: '',
        content: 'Sample content',
        htmlHash: 'abc123',
        metaData: { headings: [], links: [] },
        httpStatus: 200,
        scrapedAt: new Date('2024-01-01'),
      };

      const newData: ScrapedData = {
        ...oldData,
        title: 'New Title',
        htmlHash: 'def456',
        scrapedAt: new Date('2024-01-08'),
      };

      const change = analyzer.detectChanges(oldData, newData);
      
      expect(change).not.toBeNull();
      expect(change?.changeType).toBe('title_change');
      expect(change?.severity).toBe('medium');
      expect(change?.diffData.titleChanged).toBe(true);
    });

    it('should detect content change and calculate severity', () => {
      const oldData: ScrapedData = {
        url: 'https://example.com',
        title: 'Test Page',
        description: '',
        content: 'old content word1 word2 word3',
        htmlHash: 'abc123',
        metaData: { headings: [], links: [] },
        httpStatus: 200,
        scrapedAt: new Date('2024-01-01'),
      };

      const newData: ScrapedData = {
        ...oldData,
        content: 'completely different content with many new words',
        htmlHash: 'def456',
        scrapedAt: new Date('2024-01-08'),
      };

      const change = analyzer.detectChanges(oldData, newData);
      
      expect(change).not.toBeNull();
      expect(change?.changeType).toBe('content_update');
      expect(change?.diffData.contentChangePercentage).toBeGreaterThan(0);
    });

    it('should classify severity as high for major changes', () => {
      const oldData: ScrapedData = {
        url: 'https://example.com',
        title: 'Test',
        description: '',
        content: 'short',
        htmlHash: 'abc123',
        metaData: { headings: [], links: [] },
        httpStatus: 200,
        scrapedAt: new Date('2024-01-01'),
      };

      const newData: ScrapedData = {
        ...oldData,
        content: 'completely different long content with lots of new information and many words',
        htmlHash: 'def456',
        scrapedAt: new Date('2024-01-08'),
      };

      const change = analyzer.detectChanges(oldData, newData);
      
      expect(change).not.toBeNull();
      expect(change?.severity).toBe('high');
    });
  });

  describe('analyze', () => {
    it('should analyze scraped data comprehensively', () => {
      const scrapedData: ScrapedData = {
        url: 'https://example.com',
        title: 'Machine Learning Tutorial',
        description: 'Learn ML',
        content: `
          Machine learning is a subset of artificial intelligence.
          It focuses on training algorithms to learn from data.
          Deep learning is a specialized form of machine learning.
        `,
        htmlHash: 'abc123',
        metaData: {
          headings: [
            { level: 1, text: 'Introduction' },
            { level: 2, text: 'What is Machine Learning?' },
          ],
          links: [],
        },
        httpStatus: 200,
        scrapedAt: new Date(),
      };

      const result = analyzer.analyze(scrapedData);

      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('topics');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('readabilityScore');
      
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.readabilityScore).toBeLessThanOrEqual(100);
    });
  });
});

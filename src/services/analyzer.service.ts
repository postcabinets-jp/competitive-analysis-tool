/**
 * 分析サービス
 * スクレイピングしたデータを分析
 */

import { ScrapedData } from './scraper.service';

export interface AnalysisResult {
  keywords: { word: string; count: number }[];
  topics: string[];
  wordCount: number;
  readabilityScore: number;
}

export interface ChangeDetection {
  changeType: 'new_page' | 'content_update' | 'title_change' | 'deleted';
  summary: string;
  severity: 'low' | 'medium' | 'high';
  diffData: {
    addedWords?: string[];
    removedWords?: string[];
    titleChanged?: boolean;
    contentChangePercentage?: number;
  };
}

export class AnalyzerService {
  /**
   * キーワード抽出（簡易版）
   */
  extractKeywords(text: string, topN: number = 20): { word: string; count: number }[] {
    // ストップワード（除外する単語）
    const stopWords = new Set([
      'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある',
      'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる',
      'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの',
      'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ', 'によって',
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    ]);

    // テキストを単語に分割
    const words = text
      .toLowerCase()
      .replace(/[^\w\sぁ-んァ-ヶー一-龯]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.has(word));

    // 単語の出現回数をカウント
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // 出現回数でソートして上位N件を返す
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * トピック抽出（簡易版）
   */
  extractTopics(scrapedData: ScrapedData): string[] {
    const keywords = this.extractKeywords(scrapedData.content, 10);
    const headings = scrapedData.metaData.headings
      .filter(h => h.level <= 2)
      .map(h => h.text);

    // 見出しとキーワードからトピックを推定
    const topics = new Set<string>();
    
    headings.forEach(heading => {
      if (heading.length > 5 && heading.length < 100) {
        topics.add(heading);
      }
    });

    keywords.slice(0, 5).forEach(kw => {
      topics.add(kw.word);
    });

    return Array.from(topics).slice(0, 10);
  }

  /**
   * 変更検知
   */
  detectChanges(oldData: ScrapedData, newData: ScrapedData): ChangeDetection | null {
    // ハッシュが同じ = 変更なし
    if (oldData.htmlHash === newData.htmlHash) {
      return null;
    }

    const changeData: ChangeDetection = {
      changeType: 'content_update',
      summary: '',
      severity: 'low',
      diffData: {},
    };

    // タイトル変更チェック
    if (oldData.title !== newData.title) {
      changeData.changeType = 'title_change';
      changeData.diffData.titleChanged = true;
      changeData.severity = 'medium';
      changeData.summary = `タイトルが変更されました: "${oldData.title}" → "${newData.title}"`;
    }

    // コンテンツ変更率計算（簡易版）
    const oldWords = new Set(oldData.content.split(/\s+/));
    const newWords = new Set(newData.content.split(/\s+/));

    const addedWords = Array.from(newWords).filter(w => !oldWords.has(w));
    const removedWords = Array.from(oldWords).filter(w => !newWords.has(w));

    const totalWords = oldWords.size + newWords.size;
    const changedWords = addedWords.length + removedWords.length;
    const changePercentage = (changedWords / totalWords) * 100;

    changeData.diffData.contentChangePercentage = changePercentage;
    changeData.diffData.addedWords = addedWords.slice(0, 20);
    changeData.diffData.removedWords = removedWords.slice(0, 20);

    // 変更の重要度判定
    if (changePercentage > 50) {
      changeData.severity = 'high';
      changeData.summary = `大幅なコンテンツ変更（${changePercentage.toFixed(1)}%）`;
    } else if (changePercentage > 20) {
      changeData.severity = 'medium';
      changeData.summary = `中程度のコンテンツ変更（${changePercentage.toFixed(1)}%）`;
    } else {
      changeData.severity = 'low';
      changeData.summary = `軽微なコンテンツ変更（${changePercentage.toFixed(1)}%）`;
    }

    return changeData;
  }

  /**
   * 分析実行
   */
  analyze(scrapedData: ScrapedData): AnalysisResult {
    const keywords = this.extractKeywords(scrapedData.content);
    const topics = this.extractTopics(scrapedData);
    const wordCount = scrapedData.content.split(/\s+/).length;

    // 読みやすさスコア（簡易版: 単語数と文長から推定）
    const sentences = scrapedData.content.split(/[。.!?]/);
    const avgWordsPerSentence = wordCount / sentences.length;
    const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));

    return {
      keywords,
      topics,
      wordCount,
      readabilityScore,
    };
  }
}

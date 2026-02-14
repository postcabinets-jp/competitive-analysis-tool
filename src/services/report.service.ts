/**
 * レポート生成サービス
 */

import { ScrapedData } from './scraper.service';
import { AnalysisResult, ChangeDetection } from './analyzer.service';

export interface CompetitorReport {
  competitorName: string;
  url: string;
  summary: {
    totalChanges: number;
    highSeverityChanges: number;
    lastScrapedAt: Date;
  };
  changes: ChangeDetection[];
  analysis: AnalysisResult;
  topKeywords: { word: string; count: number }[];
}

export interface WeeklyReport {
  periodStart: Date;
  periodEnd: Date;
  competitorReports: CompetitorReport[];
  executiveSummary: string;
}

export class ReportService {
  /**
   * 週次レポート生成
   */
  generateWeeklyReport(
    periodStart: Date,
    periodEnd: Date,
    competitorReports: CompetitorReport[]
  ): WeeklyReport {
    const executiveSummary = this.generateExecutiveSummary(competitorReports);

    return {
      periodStart,
      periodEnd,
      competitorReports,
      executiveSummary,
    };
  }

  /**
   * エグゼクティブサマリー生成
   */
  private generateExecutiveSummary(reports: CompetitorReport[]): string {
    const totalChanges = reports.reduce((sum, r) => sum + r.summary.totalChanges, 0);
    const highSeverityCount = reports.reduce(
      (sum, r) => sum + r.summary.highSeverityChanges,
      0
    );

    const mostActiveCompetitor = reports.reduce((prev, current) =>
      current.summary.totalChanges > prev.summary.totalChanges ? current : prev
    );

    return `
今週の競合分析サマリー:
- 監視競合数: ${reports.length}社
- 検知された変更総数: ${totalChanges}件
- 重要度の高い変更: ${highSeverityCount}件
- 最も活発な競合: ${mostActiveCompetitor.competitorName} (${mostActiveCompetitor.summary.totalChanges}件の変更)
    `.trim();
  }

  /**
   * HTMLレポート生成
   */
  generateHtmlReport(weeklyReport: WeeklyReport): string {
    const { periodStart, periodEnd, competitorReports, executiveSummary } = weeklyReport;

    const competitorSections = competitorReports
      .map(report => this.generateCompetitorSection(report))
      .join('\n');

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>週次競合分析レポート</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #1a1a1a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #2563eb; margin-top: 40px; }
    .period { color: #6b7280; font-size: 14px; }
    .summary { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .competitor { border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .change { background: #fef3c7; padding: 10px; margin: 10px 0; border-left: 4px solid #f59e0b; }
    .change.high { background: #fee2e2; border-left-color: #ef4444; }
    .keywords { display: flex; flex-wrap: wrap; gap: 8px; }
    .keyword { background: #dbeafe; padding: 4px 12px; border-radius: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>週次競合分析レポート</h1>
  <p class="period">${periodStart.toLocaleDateString('ja-JP')} 〜 ${periodEnd.toLocaleDateString('ja-JP')}</p>
  
  <div class="summary">
    <h2>📊 エグゼクティブサマリー</h2>
    <pre>${executiveSummary}</pre>
  </div>

  ${competitorSections}
</body>
</html>
    `.trim();
  }

  /**
   * 競合セクション生成
   */
  private generateCompetitorSection(report: CompetitorReport): string {
    const { competitorName, url, summary, changes, topKeywords } = report;

    const changesList = changes
      .map(
        change => `
      <div class="change ${change.severity}">
        <strong>${change.changeType}</strong>: ${change.summary}
      </div>
    `
      )
      .join('');

    const keywordTags = topKeywords
      .slice(0, 10)
      .map(kw => `<span class="keyword">${kw.word} (${kw.count})</span>`)
      .join('');

    return `
  <div class="competitor">
    <h2>${competitorName}</h2>
    <p><a href="${url}" target="_blank">${url}</a></p>
    <p><strong>変更検知:</strong> ${summary.totalChanges}件 (うち重要: ${summary.highSeverityChanges}件)</p>
    
    <h3>🔍 検知された変更</h3>
    ${changesList || '<p>変更なし</p>'}
    
    <h3>🏷️ トップキーワード</h3>
    <div class="keywords">${keywordTags}</div>
  </div>
    `;
  }
}

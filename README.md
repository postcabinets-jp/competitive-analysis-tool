# Competitive Analysis Tool (MVP)

競合URLを入力すると、サイト/SNSを分析して週次レポートを自動配信するツール。

## 🎯 プロジェクト概要

**ターゲット:** マーケター向けSaaS  
**価格帯:** ¥14,800~/月  
**開発期間:** 12週間（3ヶ月）

## 📋 主要機能

### MVP機能
- ✅ 競合URL登録（最大3社）
- ✅ 週次自動スクレイピング
- ✅ 変更検知・キーワード分析
- ✅ HTMLレポート生成
- ✅ メール配信
- ✅ 基本ダッシュボード

### 将来機能
- ⏳ SNS連携（Twitter/X、Instagram）
- ⏳ AI予測・トレンド分析
- ⏳ Slack連携
- ⏳ PDF生成
- ⏳ チーム機能

## 🏗️ アーキテクチャ

```
Frontend: Next.js 14 + React 18 + Tailwind CSS
Backend: Next.js API Routes + Node.js 20
Database: PostgreSQL (Supabase) + Redis (Upstash)
Queue: BullMQ
Scraping: Playwright
Hosting: Vercel + AWS ECS/GCP Cloud Run
```

## 🚀 セットアップ

### 必要なツール
- Node.js 20 LTS
- npm or pnpm
- Docker (ローカルDB用)
- PostgreSQL 15+

### インストール

```bash
# リポジトリクローン
git clone <repository-url>
cd competitive-analysis-tool

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localを編集

# Playwrightブラウザインストール
npx playwright install

# データベースマイグレーション
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

### 環境変数

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cia_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
RESEND_API_KEY="re_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📁 プロジェクト構造

```
competitive-analysis-tool/
├── docs/                        # ドキュメント
│   ├── 01-requirements.md      # 要件定義
│   ├── 02-system-design.md     # システム設計
│   └── 03-implementation-plan.md # 実装計画
├── prisma/                      # Prismaスキーマ
│   └── schema.prisma
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # React コンポーネント
│   ├── services/                # ビジネスロジック
│   │   ├── scraper.service.ts  # スクレイピング
│   │   ├── analyzer.service.ts # 分析
│   │   └── report.service.ts   # レポート生成
│   ├── workers/                 # バックグラウンドワーカー
│   │   └── scrape.worker.ts
│   └── lib/                     # ユーティリティ
├── tests/                       # テスト
├── package.json
└── README.md
```

## 🧪 テスト

```bash
# ユニットテスト
npm test

# カバレッジ確認
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

## 📊 開発進捗

### 完了フェーズ
- ✅ Phase 0: 要件定義
- ✅ Phase 1: システム設計
- ✅ Phase 2: 実装計画
- ✅ Phase 3: コア実装（サービスクラス）

### 進行中
- 🔄 Phase 4: API実装
- ⏳ Phase 5: UI実装
- ⏳ Phase 6: テスト
- ⏳ Phase 7: デプロイ

## 🔧 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Prisma Studio起動（DBブラウザ）
npm run prisma:studio

# ワーカー起動
npm run worker
```

## 📖 ドキュメント

詳細なドキュメントは `docs/` ディレクトリを参照してください：

- [要件定義書](docs/01-requirements.md)
- [システム設計書](docs/02-system-design.md)
- [実装計画書](docs/03-implementation-plan.md)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📝 ライセンス

MIT License

## 📧 お問い合わせ

プロジェクト管理者: [あなたの名前]  
Email: [your-email@example.com]

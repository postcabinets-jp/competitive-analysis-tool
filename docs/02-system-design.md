# システム設計書：競合分析レポート自動生成ツール

**作成日:** 2026-02-14  
**バージョン:** 1.0  
**前提:** 要件定義書 v1.0

---

## 1. システムアーキテクチャ

### 1.1 全体アーキテクチャ（3層構造）

```
┌─────────────────────────────────────────────────────────────┐
│                    クライアント層                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web Browser  │  │  Email       │  │  Slack       │      │
│  │ (Next.js)    │  │  Client      │  │  App         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    アプリケーション層                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Gateway (Next.js API Routes)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   Auth Service │  │  User Service  │  │ Competitor   │  │
│  │   (NextAuth)   │  │                │  │ Service      │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Scraper       │  │  Analyzer      │  │  Report      │  │
│  │  Service       │  │  Service       │  │  Service     │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  Notification  │  │  Billing       │                    │
│  │  Service       │  │  Service       │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    バックグラウンド処理層                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Task Queue (BullMQ / Celery)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Scrape Worker │  │ Analysis Worker│  │ Report Worker│  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    データ層                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  PostgreSQL    │  │     Redis      │  │  S3/GCS      │  │
│  │  (Primary DB)  │  │  (Cache/Queue) │  │  (Storage)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    外部サービス                               │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐   │
│  │ Stripe   │ │ SendGrid │ │ Twitter │ │  Playwright  │   │
│  │ (決済)   │ │ (Email)  │ │ API     │ │  (Browser)   │   │
│  └──────────┘ └──────────┘ └─────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック決定（MVP）

**フロントエンド**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Form:** React Hook Form + Zod
- **Auth:** NextAuth.js v5

**バックエンド**
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js API Routes (サーバーレス関数)
- **ORM:** Prisma
- **Validation:** Zod

**データベース**
- **Primary:** PostgreSQL 15 (Supabase)
- **Cache:** Redis (Upstash Redis)
- **Storage:** Vercel Blob / AWS S3

**バックグラウンド処理**
- **Queue:** BullMQ (Redis-based)
- **Scheduler:** node-cron
- **Scraping:** Playwright

**インフラ**
- **Hosting:** Vercel (フロントエンド + API)
- **Worker:** Docker on AWS ECS / GCP Cloud Run
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Vercel Analytics

**外部サービス**
- **Payment:** Stripe
- **Email:** Resend / SendGrid
- **Analytics:** PostHog

---

## 2. データベース設計

### 2.1 ER図

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │1      n │ competitors  │1      n │  snapshots  │
│─────────────│◄────────│──────────────│◄────────│─────────────│
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ email       │         │ user_id (FK) │         │ comp_id(FK) │
│ name        │         │ name         │         │ url         │
│ password    │         │ url          │         │ title       │
│ plan        │         │ type         │         │ content     │
│ created_at  │         │ status       │         │ meta_data   │
│ updated_at  │         │ created_at   │         │ created_at  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                        │
       │                        │                        │
       │1                       │1                       │1
       │                        │                        │
       │n                       │n                       │n
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ reports     │         │   changes    │         │  analyses   │
│─────────────│         │──────────────│         │─────────────│
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ user_id(FK) │         │ comp_id (FK) │         │ snap_id(FK) │
│ period_start│         │ old_snap(FK) │         │ keywords    │
│ period_end  │         │ new_snap(FK) │         │ sentiment   │
│ status      │         │ change_type  │         │ topics      │
│ pdf_url     │         │ detected_at  │         │ score       │
│ sent_at     │         └──────────────┘         │ created_at  │
│ created_at  │                                  └─────────────┘
└─────────────┘
```

### 2.2 テーブル定義

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',  -- free, basic, pro
  stripe_customer_id VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
```

#### competitors
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'website',  -- website, twitter, facebook, instagram
  status VARCHAR(20) DEFAULT 'active',  -- active, paused, error
  scrape_frequency VARCHAR(20) DEFAULT 'weekly',  -- daily, weekly
  last_scraped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_competitors_user_id ON competitors(user_id);
CREATE INDEX idx_competitors_status ON competitors(status);
```

#### snapshots
```sql
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT,  -- 主要なテキストコンテンツ
  html_hash VARCHAR(64),  -- SHA-256 hash for change detection
  meta_data JSONB,  -- OGP, headings, links, etc.
  screenshot_url TEXT,
  http_status INTEGER,
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_snapshots_competitor_id ON snapshots(competitor_id);
CREATE INDEX idx_snapshots_scraped_at ON snapshots(scraped_at);
```

#### changes
```sql
CREATE TABLE changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  old_snapshot_id UUID REFERENCES snapshots(id),
  new_snapshot_id UUID REFERENCES snapshots(id),
  change_type VARCHAR(50),  -- new_page, content_update, deleted, title_change
  summary TEXT,
  diff_data JSONB,  -- 詳細な差分情報
  severity VARCHAR(20) DEFAULT 'low',  -- low, medium, high
  detected_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_changes_competitor_id ON changes(competitor_id);
CREATE INDEX idx_changes_detected_at ON changes(detected_at);
```

#### analyses
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  keywords JSONB,  -- [{"word": "AI", "count": 15}, ...]
  topics JSONB,  -- 抽出されたトピック
  sentiment_score FLOAT,  -- -1.0 to 1.0
  word_count INTEGER,
  readability_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_analyses_snapshot_id ON analyses(snapshot_id);
```

#### reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'generating',  -- generating, completed, failed, sent
  summary TEXT,
  report_data JSONB,  -- レポートの構造化データ
  html_url TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_period_end ON reports(period_end);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(100) UNIQUE,
  plan VARCHAR(20) NOT NULL,  -- basic, pro
  status VARCHAR(20) NOT NULL,  -- active, canceled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

---

## 3. API設計

### 3.1 RESTful API エンドポイント

#### 認証
```
POST   /api/auth/signup          # ユーザー登録
POST   /api/auth/login           # ログイン
POST   /api/auth/logout          # ログアウト
POST   /api/auth/forgot-password # パスワードリセット
GET    /api/auth/session         # セッション確認
```

#### 競合管理
```
GET    /api/competitors          # 競合一覧取得
POST   /api/competitors          # 競合追加
GET    /api/competitors/:id      # 競合詳細取得
PUT    /api/competitors/:id      # 競合更新
DELETE /api/competitors/:id      # 競合削除
POST   /api/competitors/:id/scrape  # 手動スクレイピング実行
```

#### スナップショット
```
GET    /api/snapshots?competitor_id=xxx  # スナップショット一覧
GET    /api/snapshots/:id                # スナップショット詳細
```

#### 変更検知
```
GET    /api/changes?competitor_id=xxx&from=date&to=date  # 変更履歴
GET    /api/changes/:id                                  # 変更詳細
```

#### レポート
```
GET    /api/reports              # レポート一覧
GET    /api/reports/:id          # レポート詳細取得
POST   /api/reports/generate     # レポート手動生成
GET    /api/reports/:id/download # レポートダウンロード（PDF/HTML）
```

#### ユーザー設定
```
GET    /api/user/profile         # プロフィール取得
PUT    /api/user/profile         # プロフィール更新
GET    /api/user/settings        # 設定取得
PUT    /api/user/settings        # 設定更新
```

#### サブスクリプション
```
GET    /api/subscription         # サブスクリプション情報
POST   /api/subscription/checkout # チェックアウトセッション作成
POST   /api/subscription/portal   # カスタマーポータルURL取得
POST   /api/webhook/stripe        # Stripe Webhook
```

### 3.2 APIレスポンス形式

#### 成功レスポンス
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example Corp",
    "url": "https://example.com"
  },
  "meta": {
    "timestamp": "2026-02-14T08:30:00Z"
  }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not accessible",
    "details": {
      "url": "https://invalid.example"
    }
  },
  "meta": {
    "timestamp": "2026-02-14T08:30:00Z"
  }
}
```

---

## 4. コンポーネント設計

### 4.1 フロントエンドコンポーネント構成

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── competitors/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/                  # API Routes
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── competitors/
│   │   ├── CompetitorCard.tsx
│   │   ├── CompetitorForm.tsx
│   │   └── CompetitorList.tsx
│   ├── reports/
│   │   ├── ReportCard.tsx
│   │   ├── ReportViewer.tsx
│   │   └── ReportChart.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── redis.ts              # Redis client
│   └── utils.ts
└── types/
    └── index.ts
```

### 4.2 バックエンドサービス構成

```
src/
├── services/
│   ├── auth.service.ts
│   ├── competitor.service.ts
│   ├── scraper.service.ts
│   ├── analyzer.service.ts
│   ├── report.service.ts
│   └── notification.service.ts
├── workers/
│   ├── scrape.worker.ts      # スクレイピングワーカー
│   ├── analyze.worker.ts     # 分析ワーカー
│   └── report.worker.ts      # レポート生成ワーカー
├── jobs/
│   └── scheduler.ts          # cron jobs
└── lib/
    ├── playwright.ts         # Browser automation
    ├── queue.ts              # BullMQ setup
    └── email.ts              # Email service
```

---

## 5. データフロー

### 5.1 スクレイピング & 分析フロー

```
[Scheduler (Cron)]
    ↓ 毎週日曜23:00
[スクレイピングジョブ作成]
    ↓
[Queue: scrape-jobs]
    ↓
[Scrape Worker]
    ├─→ Playwright起動
    ├─→ ページアクセス
    ├─→ コンテンツ抽出
    ├─→ スクリーンショット
    └─→ DB保存 (snapshots)
    ↓
[変更検知処理]
    ├─→ 前回スナップショット取得
    ├─→ Diff計算
    └─→ DB保存 (changes)
    ↓
[Queue: analyze-jobs]
    ↓
[Analyze Worker]
    ├─→ キーワード抽出
    ├─→ トピック分析
    ├─→ センチメント分析
    └─→ DB保存 (analyses)
```

### 5.2 レポート生成 & 配信フロー

```
[Scheduler (Cron)]
    ↓ 毎週月曜8:00
[レポート生成ジョブ作成]
    ↓
[Queue: report-jobs]
    ↓
[Report Worker]
    ├─→ 過去7日間のデータ取得
    ├─→ 統計計算
    ├─→ グラフ生成
    ├─→ HTMLレポート生成
    ├─→ PDF変換（Playwright）
    ├─→ S3/GCSアップロード
    └─→ DB保存 (reports)
    ↓
[Queue: notification-jobs]
    ↓
[Notification Worker]
    ├─→ メール送信 (SendGrid)
    ├─→ Slack通知（オプション）
    └─→ DB更新 (sent_at)
```

---

## 6. セキュリティ設計

### 6.1 認証・認可
- **認証:** NextAuth.js (Credentials Provider)
- **セッション:** JWT (httpOnly cookie)
- **パスワード:** bcrypt (salt rounds: 12)
- **CSRF保護:** Next.js組み込み機能

### 6.2 データ保護
- **通信暗号化:** HTTPS強制 (TLS 1.3)
- **DB暗号化:** PostgreSQL透過的データ暗号化
- **環境変数:** `.env.local` (Git除外)
- **シークレット管理:** Vercel Environment Variables

### 6.3 レート制限
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
})
```

---

## 7. パフォーマンス最適化

### 7.1 キャッシング戦略
- **API レスポンス:** Redis (TTL: 5分)
- **静的アセット:** CDN (Vercel Edge Network)
- **データベースクエリ:** Prisma query caching

### 7.2 非同期処理
- **重い処理:** すべてキューイング
- **並列処理:** 複数ワーカー起動可能

---

## 8. モニタリング & ログ

### 8.1 ログ収集
- **アプリケーションログ:** Vercel Logs
- **エラー追跡:** Sentry
- **パフォーマンス:** Vercel Analytics

### 8.2 アラート
- **エラー率:** 5%超過でSlack通知
- **レスポンスタイム:** 3秒超過でアラート
- **Queue遅延:** 10分超過でアラート

---

## 9. デプロイ戦略

### 9.1 環境
- **Development:** ローカル (localhost:3000)
- **Staging:** Vercel Preview (自動デプロイ)
- **Production:** Vercel Production

### 9.2 CI/CD
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 10. スケーリング計画

### 10.1 初期フェーズ（〜100ユーザー）
- Vercel Hobby/Pro プラン
- Supabase Free Tier
- 単一リージョン

### 10.2 成長フェーズ（100〜1000ユーザー）
- Vercel Pro/Enterprise
- Supabase Pro（レプリカ追加）
- Worker増強（ECS/Cloud Run）
- Redis Cluster

### 10.3 大規模フェーズ（1000ユーザー〜）
- マルチリージョン展開
- DBシャーディング
- CDN最適化

---

## 11. 次のステップ

1. ✅ システム設計完了
2. ⏳ 実装計画策定（タスク分割、スケジューリング）
3. ⏳ 開発環境セットアップ
4. ⏳ 実装開始

**設計承認:** [プロジェクトマネージャー]  
**承認日:** 2026-02-14

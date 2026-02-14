# 実装計画書：競合分析レポート自動生成ツール

**作成日:** 2026-02-14  
**バージョン:** 1.0  
**開発期間:** 12週間（3ヶ月）

---

## 1. 開発方針

### 1.1 アジャイル開発
- **スプリント:** 2週間単位
- **デモ:** 各スプリント終了時
- **レトロスペクティブ:** 各スプリント終了後

### 1.2 品質基準
- **テストカバレッジ:** 80%以上
- **コードレビュー:** 必須
- **ドキュメント:** 同時更新

### 1.3 優先順位
1. **P0 (Critical):** MVPに必須
2. **P1 (High):** 重要だが後回し可能
3. **P2 (Medium):** あると良い
4. **P3 (Low):** 将来検討

---

## 2. フェーズ別タスク分割

### Phase 0: セットアップ（Week 1）

#### タスク一覧
| ID | タスク | 優先度 | 担当 | 工数 |
|----|--------|--------|------|------|
| S01 | プロジェクト初期化（Next.js） | P0 | Dev | 2h |
| S02 | Git リポジトリ作成 | P0 | Dev | 1h |
| S03 | 開発環境セットアップ（ESLint, Prettier） | P0 | Dev | 2h |
| S04 | Prisma セットアップ | P0 | Dev | 3h |
| S05 | Supabase プロジェクト作成 | P0 | Dev | 1h |
| S06 | Upstash Redis セットアップ | P0 | Dev | 1h |
| S07 | Vercel プロジェクト作成 | P0 | Dev | 1h |
| S08 | CI/CD パイプライン構築 | P1 | Dev | 4h |
| S09 | shadcn/ui インストール | P0 | Dev | 2h |
| S10 | ディレクトリ構造作成 | P0 | Dev | 1h |

**合計:** 18時間（3日）

---

### Phase 1: 認証・基盤（Week 2-3）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| A01 | NextAuth.js セットアップ | P0 | 4h |
| A02 | User モデル作成（Prisma） | P0 | 2h |
| A03 | サインアップAPI実装 | P0 | 4h |
| A04 | ログインAPI実装 | P0 | 3h |
| A05 | セッション管理実装 | P0 | 3h |
| A06 | パスワードリセット実装 | P1 | 4h |
| A07 | メール認証実装 | P1 | 4h |
| A08 | ログインページUI | P0 | 4h |
| A09 | サインアップページUI | P0 | 4h |
| A10 | ミドルウェア（認証チェック） | P0 | 3h |
| A11 | レート制限実装 | P1 | 3h |
| A12 | テスト（Auth） | P0 | 4h |

**合計:** 42時間（1週間）

---

### Phase 2: 競合管理機能（Week 4-5）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| C01 | Competitor モデル作成 | P0 | 2h |
| C02 | 競合追加API実装 | P0 | 4h |
| C03 | 競合一覧取得API実装 | P0 | 3h |
| C04 | 競合詳細取得API実装 | P0 | 2h |
| C05 | 競合更新API実装 | P0 | 3h |
| C06 | 競合削除API実装 | P0 | 2h |
| C07 | URL検証ロジック実装 | P0 | 3h |
| C08 | 競合一覧ページUI | P0 | 6h |
| C09 | 競合追加フォームUI | P0 | 5h |
| C10 | 競合詳細ページUI | P0 | 5h |
| C11 | 競合編集機能UI | P0 | 4h |
| C12 | テスト（Competitor） | P0 | 4h |

**合計:** 43時間（1週間）

---

### Phase 3: スクレイピング機能（Week 6-7）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| SC01 | Playwright セットアップ | P0 | 3h |
| SC02 | Snapshot モデル作成 | P0 | 2h |
| SC03 | スクレイピングサービス実装 | P0 | 8h |
| SC04 | コンテンツ抽出ロジック | P0 | 6h |
| SC05 | スクリーンショット機能 | P1 | 4h |
| SC06 | ハッシュ計算（変更検知） | P0 | 3h |
| SC07 | エラーハンドリング | P0 | 4h |
| SC08 | BullMQ セットアップ | P0 | 4h |
| SC09 | スクレイピングワーカー実装 | P0 | 6h |
| SC10 | 手動スクレイピングAPI | P0 | 3h |
| SC11 | スクレイピング状態表示UI | P1 | 4h |
| SC12 | テスト（Scraper） | P0 | 5h |

**合計:** 52時間（1.5週間）

---

### Phase 4: 変更検知・分析機能（Week 8-9）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| AN01 | Change モデル作成 | P0 | 2h |
| AN02 | Analysis モデル作成 | P0 | 2h |
| AN03 | Diff計算ロジック実装 | P0 | 6h |
| AN04 | 変更検知サービス実装 | P0 | 5h |
| AN05 | キーワード抽出実装 | P0 | 6h |
| AN06 | トピック分析実装 | P1 | 6h |
| AN07 | センチメント分析実装 | P2 | 5h |
| AN08 | 分析ワーカー実装 | P0 | 4h |
| AN09 | 変更履歴API実装 | P0 | 3h |
| AN10 | 変更履歴表示UI | P1 | 5h |
| AN11 | 分析結果表示UI | P1 | 5h |
| AN12 | テスト（Analysis） | P0 | 5h |

**合計:** 54時間（1.5週間）

---

### Phase 5: レポート生成・配信（Week 10-11）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| R01 | Report モデル作成 | P0 | 2h |
| R02 | レポートデータ集計ロジック | P0 | 6h |
| R03 | HTMLレポートテンプレート作成 | P0 | 8h |
| R04 | グラフ生成（Chart.js） | P0 | 6h |
| R05 | PDF生成実装（Playwright） | P1 | 5h |
| R06 | S3/Blob ストレージ連携 | P0 | 4h |
| R07 | レポート生成ワーカー実装 | P0 | 6h |
| R08 | メール送信実装（Resend） | P0 | 4h |
| R09 | 通知ワーカー実装 | P0 | 3h |
| R10 | レポート一覧API実装 | P0 | 3h |
| R11 | レポート詳細API実装 | P0 | 3h |
| R12 | レポート一覧ページUI | P0 | 5h |
| R13 | レポート詳細ページUI | P0 | 6h |
| R14 | レポートダウンロード機能 | P0 | 3h |
| R15 | テスト（Report） | P0 | 6h |

**合計:** 70時間（2週間）

---

### Phase 6: スケジューラー・統合（Week 12）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| J01 | node-cron セットアップ | P0 | 2h |
| J02 | 週次スクレイピングジョブ | P0 | 3h |
| J03 | 週次レポート生成ジョブ | P0 | 3h |
| J04 | エラー通知実装 | P1 | 3h |
| J05 | ヘルスチェックAPI | P1 | 2h |
| J06 | 統合テスト | P0 | 8h |
| J07 | E2Eテスト（Playwright） | P1 | 6h |
| J08 | パフォーマンステスト | P1 | 4h |
| J09 | セキュリティチェック | P0 | 3h |
| J10 | ドキュメント最終化 | P0 | 4h |

**合計:** 38時間（1週間）

---

### Phase 7: サブスクリプション・決済（Optional）

#### タスク一覧
| ID | タスク | 優先度 | 工数 |
|----|--------|--------|------|
| P01 | Stripe アカウント作成 | P1 | 1h |
| P02 | Subscription モデル作成 | P1 | 2h |
| P03 | Stripe Checkout 実装 | P1 | 6h |
| P04 | Webhook ハンドラー実装 | P1 | 5h |
| P05 | プラン制限実装 | P1 | 4h |
| P06 | カスタマーポータル実装 | P1 | 3h |
| P07 | 料金プランページUI | P1 | 5h |
| P08 | テスト（Payment） | P1 | 4h |

**合計:** 30時間（1週間）

---

## 3. マイルストーン

### M1: Week 3終了時
- ✅ 認証機能完成
- ✅ ユーザー登録・ログイン動作確認

### M2: Week 5終了時
- ✅ 競合管理機能完成
- ✅ CRUD操作すべて動作

### M3: Week 7終了時
- ✅ スクレイピング機能完成
- ✅ 週次で自動スクレイピング実行

### M4: Week 9終了時
- ✅ 変更検知・分析機能完成
- ✅ 変更履歴が正しく記録される

### M5: Week 11終了時
- ✅ レポート生成・配信機能完成
- ✅ メールでレポート受信確認

### M6: Week 12終了時（MVP完成）
- ✅ すべてのコア機能統合
- ✅ テスト完了
- ✅ 本番環境デプロイ

---

## 4. リスク管理

### 高リスク項目
| リスク | 影響 | 対策 | 担当 |
|--------|------|------|------|
| スクレイピング対策サイト | 高 | Playwright + User-Agent偽装、Proxy検討 | Dev |
| API制限（Twitter等） | 中 | 公式API使用、レート制限遵守 | Dev |
| PDF生成パフォーマンス | 中 | 非同期処理、キャッシング | Dev |
| 初期ユーザー獲得困難 | 高 | フリープラン提供、SNSマーケティング | PM |

---

## 5. 開発環境セットアップ手順

### 5.1 必要なツール
```bash
# Node.js 20 LTS
nvm install 20
nvm use 20

# pnpm（パッケージマネージャー）
npm install -g pnpm

# Docker（ローカルDB用）
# https://www.docker.com/products/docker-desktop
```

### 5.2 プロジェクト初期化
```bash
# Next.js プロジェクト作成
npx create-next-app@latest competitive-analysis-tool \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd competitive-analysis-tool

# 依存パッケージインストール
pnpm add @prisma/client prisma
pnpm add next-auth@beta
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand
pnpm add bullmq ioredis
pnpm add playwright
pnpm add resend
pnpm add stripe
pnpm add @upstash/redis @upstash/ratelimit

# 開発依存
pnpm add -D @types/node
pnpm add -D eslint-config-prettier
pnpm add -D @playwright/test
pnpm add -D vitest @testing-library/react

# shadcn/ui セットアップ
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label form
```

### 5.3 環境変数設定
```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/cia_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/cia_dev"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

REDIS_URL="redis://localhost:6379"

RESEND_API_KEY="re_..."

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 5.4 データベースセットアップ
```bash
# Docker Compose で PostgreSQL 起動
docker-compose up -d

# Prisma マイグレーション
npx prisma migrate dev --name init

# Prisma Studio 起動（DBブラウザ）
npx prisma studio
```

---

## 6. テスト戦略

### 6.1 テストレベル
- **Unit Test:** 各サービス・関数（Vitest）
- **Integration Test:** API エンドポイント（Vitest）
- **E2E Test:** ユーザーフロー（Playwright）

### 6.2 テスト実行
```bash
# ユニット・統合テスト
pnpm test

# カバレッジ確認
pnpm test:coverage

# E2E テスト
pnpm test:e2e
```

---

## 7. デプロイ手順

### 7.1 Staging デプロイ
```bash
# GitHub に push
git push origin main

# Vercel が自動デプロイ（Preview）
```

### 7.2 Production デプロイ
```bash
# main ブランチにマージ
git checkout main
git merge develop
git push origin main

# Vercel が自動デプロイ（Production）
```

---

## 8. ドキュメント

### 8.1 必須ドキュメント
- ✅ README.md（セットアップ手順）
- ✅ API.md（API仕様書）
- ✅ CONTRIBUTING.md（コントリビューションガイド）
- ⏳ USER_GUIDE.md（ユーザーマニュアル）

---

## 9. 完了定義（Definition of Done）

各タスクは以下を満たす必要がある：
- ✅ コード実装完了
- ✅ ユニットテスト作成・パス
- ✅ コードレビュー完了
- ✅ ドキュメント更新
- ✅ Staging環境で動作確認

---

## 10. 次のステップ

1. ✅ 実装計画完了
2. ⏳ Phase 0: セットアップ開始
3. ⏳ 実装開始

**計画承認:** [プロジェクトマネージャー]  
**承認日:** 2026-02-14

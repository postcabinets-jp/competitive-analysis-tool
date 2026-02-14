# Vercelデプロイ手順

## 🚀 クイックデプロイ

### 1. Vercelアカウント準備
- https://vercel.com にアクセス
- GitHubアカウントでログイン

### 2. プロジェクトインポート
1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ「postcabinets-jp/competitive-analysis-tool」を選択
3. 「Import」をクリック

### 3. ビルド設定
以下の設定が自動検出されます：
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install --legacy-peer-deps`
- **Output Directory:** `.next`

### 4. 環境変数設定（必須）
「Environment Variables」セクションで以下を設定：

#### 必須:
```
DATABASE_URL = postgresql://your-db-url
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = your-random-secret-key-here
```

#### オプション（後で設定可能）:
```
REDIS_URL = redis://your-redis-url
RESEND_API_KEY = re_your_api_key
```

### 5. デプロイ実行
「Deploy」ボタンをクリック

---

## 📊 データベースセットアップ（Supabase推奨）

### Supabase無料プラン
1. https://supabase.com でアカウント作成
2. 新しいプロジェクト作成
3. 「Settings」→「Database」から接続文字列をコピー
4. Vercelの環境変数 `DATABASE_URL` に設定

接続文字列例:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### マイグレーション実行
```bash
# ローカルで本番DBにマイグレーション
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🔐 NEXTAUTH_SECRET生成

```bash
openssl rand -base64 32
```

生成された文字列をVercelの環境変数 `NEXTAUTH_SECRET` に設定

---

## ⚠️ 注意点

### SQLite → PostgreSQL移行
開発環境はSQLiteですが、本番はPostgreSQLに変更する必要があります。

**prisma/schema.prisma の修正:**
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" から変更
  url      = env("DATABASE_URL")
}
```

**必要な型修正:**
- `@db.Text` → 削除済み（問題なし）
- 他の型は互換性あり

### 再デプロイ手順
コード変更後:
```bash
git add .
git commit -m "Update: ..."
git push origin main
```
→ Vercelが自動デプロイ

---

## 🎯 デプロイ後の確認

1. デプロイURLにアクセス（例: https://competitive-analysis-tool.vercel.app）
2. サインアップページで新規登録
3. ログインしてダッシュボード確認
4. 競合追加テスト

---

## 🐛 トラブルシューティング

### ビルドエラー「ERESOLVE」
→ Install Command を `npm install --legacy-peer-deps` に変更

### データベース接続エラー
→ DATABASE_URL が正しく設定されているか確認
→ Supabaseで接続プーリングを有効化

### 認証エラー
→ NEXTAUTH_URL がデプロイURLと一致しているか確認
→ NEXTAUTH_SECRET が設定されているか確認

---

## 📝 環境変数一覧（Vercel設定）

| 変数名 | 必須 | 例 | 説明 |
|--------|------|-----|------|
| DATABASE_URL | ✅ | postgresql://... | PostgreSQL接続文字列 |
| NEXTAUTH_URL | ✅ | https://your-app.vercel.app | デプロイURL |
| NEXTAUTH_SECRET | ✅ | ランダム文字列 | セッション暗号化キー |
| REDIS_URL | ❌ | redis://... | Redis接続文字列（後で） |
| RESEND_API_KEY | ❌ | re_... | メール送信API（後で） |

---

## 🎉 完了！

デプロイが成功したら、URLを共有して動作確認してください。

デプロイURL: https://competitive-analysis-tool.vercel.app（自動生成）

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold text-indigo-600">
              競合分析ツール
            </div>
            <div className="flex gap-4">
              <Link
                href="/demo"
                className="text-gray-700 hover:text-gray-900"
              >
                デモを見る
              </Link>
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            競合を自動追跡・分析
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            競合サイトの変更を週次で自動監視。
            <br />
            キーワード分析から詳細レポートまで、すべて自動化。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700"
            >
              デモを見る
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700"
            >
              無料で始める
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-gray-900 px-8 py-3 rounded-md text-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
            >
              ログイン
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">自動スクレイピング</h3>
            <p className="text-gray-600">
              週次で競合サイトを自動収集。変更を見逃しません。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">詳細分析</h3>
            <p className="text-gray-600">
              キーワード抽出、トピック分析、変更検知を自動実行。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">レポート配信</h3>
            <p className="text-gray-600">
              週次レポートをメールで自動配信。いつでも確認可能。
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ無料で始めよう
          </h2>
          <p className="text-gray-600 mb-6">
            フリープランなら競合3社まで無料で監視できます
          </p>
          <Link
            href="/auth/signup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 inline-block"
          >
            サインアップ
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2026 競合分析ツール. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

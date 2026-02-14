"use client";

import { useState } from "react";
import Link from "next/link";

interface Competitor {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  createdAt: string;
  snapshots: number;
  changes: number;
}

export default function DemoPage() {
  const [competitors] = useState<Competitor[]>([
    {
      id: "1",
      name: "Google",
      url: "https://www.google.com",
      type: "website",
      status: "active",
      createdAt: new Date().toISOString(),
      snapshots: 12,
      changes: 3,
    },
    {
      id: "2",
      name: "Yahoo Japan",
      url: "https://www.yahoo.co.jp",
      type: "website",
      status: "active",
      createdAt: new Date().toISOString(),
      snapshots: 8,
      changes: 1,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">
              競合分析ツール - デモモード
            </h1>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            📌 これはデモモードです。データは保存されません。
            <br />
            実際に使用するには、アカウント登録が必要です。
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h2>
          <p className="text-gray-600">
            競合サイトの監視と分析レポートを確認できます
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showAddForm ? "キャンセル" : "競合を追加"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">新しい競合を追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  競合名
                </label>
                <input
                  type="text"
                  placeholder="例: Competitor Inc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイプ
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                >
                  <option>Website</option>
                  <option>Twitter/X</option>
                  <option>Facebook</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                ※ デモモードでは追加できません
              </p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">登録済み競合</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {competitor.name}
                    </h3>
                    <p className="text-sm text-gray-500">{competitor.url}</p>
                    <div className="mt-2 flex gap-4 text-sm text-gray-600">
                      <span>タイプ: {competitor.type}</span>
                      <span>ステータス: {competitor.status}</span>
                      <span>スナップショット: {competitor.snapshots}</span>
                      <span>変更: {competitor.changes}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">主な機能</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium mb-2">🔍 自動スクレイピング</h4>
              <p className="text-sm text-gray-600">
                週次で競合サイトを自動収集し、変更を検知します。
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium mb-2">📊 キーワード分析</h4>
              <p className="text-sm text-gray-600">
                コンテンツからキーワードを抽出し、トレンドを分析します。
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium mb-2">📧 レポート配信</h4>
              <p className="text-sm text-gray-600">
                週次レポートをメールで自動配信します。
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium mb-2">⚡ リアルタイム通知</h4>
              <p className="text-sm text-gray-600">
                重要な変更があった場合、即座に通知します。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            実際に使用するにはアカウント登録が必要です
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700"
          >
            無料で始める
          </Link>
        </div>
      </div>
    </div>
  );
}

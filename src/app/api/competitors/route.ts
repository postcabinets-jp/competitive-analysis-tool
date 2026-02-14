/**
 * 競合管理API
 * GET /api/competitors - 競合一覧取得
 * POST /api/competitors - 競合追加
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// リクエストバリデーションスキーマ
const createCompetitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  type: z.enum(['website', 'twitter', 'facebook', 'instagram']).default('website'),
});

/**
 * GET /api/competitors
 * ログインユーザーの競合一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: NextAuthでユーザー認証
    const userId = request.headers.get('x-user-id'); // 仮実装
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const competitors = await prisma.competitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            snapshots: true,
            changes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: competitors,
    });
  } catch (error) {
    console.error('[API] Error fetching competitors:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch competitors' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitors
 * 新しい競合を追加
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id'); // 仮実装
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // リクエストボディのパース
    const body = await request.json();
    
    // バリデーション
    const validationResult = createCompetitorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { name, url, type } = validationResult.data;

    // 登録数制限チェック（フリープランは3社まで）
    const competitorCount = await prisma.competitor.count({
      where: { userId },
    });

    if (competitorCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIMIT_REACHED',
            message: 'Free plan allows maximum 3 competitors. Please upgrade.',
          },
        },
        { status: 403 }
      );
    }

    // URLアクセス可能性チェック（簡易版）
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!response.ok && response.status >= 400) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_URL',
              message: 'The URL is not accessible',
              details: { status: response.status },
            },
          },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'The URL is not accessible',
          },
        },
        { status: 400 }
      );
    }

    // 競合を作成
    const competitor = await prisma.competitor.create({
      data: {
        userId,
        name,
        url,
        type,
      },
    });

    // TODO: スクレイピングジョブをキューに追加
    // await addScrapeJob({ competitorId: competitor.id, url: competitor.url });

    return NextResponse.json(
      {
        success: true,
        data: competitor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating competitor:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create competitor' } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reports
 * レポート一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * 新しいレポートを生成（手動トリガー）
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { periodStart, periodEnd } = body;

    // Create report
    const report = await prisma.report.create({
      data: {
        userId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: "generating",
      },
    });

    // TODO: キューにレポート生成ジョブを追加
    // await addReportJob({ reportId: report.id });

    return NextResponse.json(
      { success: true, data: report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

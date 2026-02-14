import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCompetitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  status: z.enum(["active", "paused"]).optional(),
  scrapeFrequency: z.enum(["daily", "weekly"]).optional(),
});

/**
 * GET /api/competitors/[id]
 * 競合の詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const competitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        snapshots: {
          orderBy: { scrapedAt: "desc" },
          take: 10,
        },
        changes: {
          orderBy: { detectedAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            snapshots: true,
            changes: true,
          },
        },
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: competitor });
  } catch (error) {
    console.error("Error fetching competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/competitors/[id]
 * 競合情報を更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateCompetitorSchema.parse(body);

    // Check ownership
    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.competitor.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/competitors/[id]
 * 競合を削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    // Delete (cascade will handle related records)
    await prisma.competitor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Competitor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

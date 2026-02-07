import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/logs
 * Récupère l'historique des actions admin.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const action = request.nextUrl.searchParams.get("action");
    const adminId = request.nextUrl.searchParams.get("adminId");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "100");

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;

    const logs = await prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur admin logs:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

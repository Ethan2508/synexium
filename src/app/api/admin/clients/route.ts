import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/clients
 * Liste tous les clients avec leur statut. ADMIN uniquement.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");

    const where: Record<string, unknown> = { role: "CLIENT" };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { siret: { contains: search } },
      ];
    }

    const clients = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        siret: true,
        phone: true,
        status: true,
        kbisUrl: true,
        idCardFrontUrl: true,
        idCardBackUrl: true,
        rejectedReason: true,
        createdAt: true,
        _count: { select: { orders: true, customerPrices: true } },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur admin clients:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/clients
 * Valider ou refuser un client. ADMIN uniquement.
 * Body: { clientId, action: "approve" | "reject", reason? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { clientId, action, reason } = await request.json();

    if (!clientId || !action) {
      return NextResponse.json({ error: "clientId et action requis." }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'approve' ou 'reject'." },
        { status: 400 }
      );
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: clientId },
      data: {
        status: action === "approve" ? "ACTIVE" : "REJECTED",
        rejectedReason: action === "reject" ? reason || "Non spécifié" : null,
      },
    });

    // Log admin
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: action === "approve" ? "CLIENT_APPROVED" : "CLIENT_REJECTED",
        targetType: "User",
        targetId: clientId,
        details: action === "reject" ? `Motif: ${reason || "Non spécifié"}` : null,
      },
    });

    return NextResponse.json({
      success: true,
      client: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur validation client:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

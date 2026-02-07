import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/orders
 * Liste toutes les commandes. ADMIN uniquement.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const status = request.nextUrl.searchParams.get("status");
    const customerId = request.nextUrl.searchParams.get("customerId");
    const search = request.nextUrl.searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { customer: { company: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, company: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            variant: { select: { sku: true, designation: true, powerKw: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur admin orders:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders
 * Met à jour le statut d'une commande. ADMIN uniquement.
 * Body: { orderId, status }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId et status requis." }, { status: 400 });
    }

    const validStatuses = ["DRAFT", "SUBMITTED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Log admin
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "ORDER_STATUS_CHANGED",
        targetType: "Order",
        targetId: orderId,
        details: `Statut changé: ${order.status} -> ${status}`,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur update order:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

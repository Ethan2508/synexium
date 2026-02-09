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
    const body = await request.json();
    const { orderId, status, trackingNumber, invoiceUrl } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId requis." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Update status if provided
    if (status) {
      const validStatuses = ["DRAFT", "SUBMITTED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update tracking number if provided (allow null to clear)
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update invoice URL if provided (allow null to clear)
    if (invoiceUrl !== undefined) {
      updateData.invoiceUrl = invoiceUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Log admin
    const details: string[] = [];
    if (status) details.push(`Statut: ${order.status} → ${status}`);
    if (trackingNumber !== undefined) details.push(`Suivi: ${trackingNumber || "(supprimé)"}`);
    if (invoiceUrl !== undefined) details.push(`Facture: ${invoiceUrl || "(supprimé)"}`);

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "ORDER_STATUS_CHANGED",
        targetType: "Order",
        targetId: orderId,
        details: details.join(" | "),
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

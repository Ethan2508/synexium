import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/prices
 * Liste les prix personnalisés. ADMIN uniquement.
 * Query: ?clientId=xxx ou ?variantId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const clientId = request.nextUrl.searchParams.get("clientId");
    const variantId = request.nextUrl.searchParams.get("variantId");

    const where: Record<string, unknown> = {};
    if (clientId) where.customerId = clientId;
    if (variantId) where.variantId = variantId;

    const prices = await prisma.customerPrice.findMany({
      where,
      include: {
        customer: { select: { id: true, company: true, email: true } },
        variant: {
          select: {
            id: true,
            sku: true,
            designation: true,
            catalogPriceHT: true,
            product: { select: { name: true, family: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ prices });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur admin prices:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/prices?id=xxx
 * Supprime un prix personnalisé. ADMIN uniquement.
 */
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis." }, { status: 400 });
    }

    const priceToDelete = await prisma.customerPrice.findUnique({ where: { id } });
    await prisma.customerPrice.delete({ where: { id } });

    // Log admin
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "PRICE_DELETED",
        targetType: "CustomerPrice",
        targetId: id,
        details: priceToDelete ? `Client: ${priceToDelete.customerId}, Variante: ${priceToDelete.variantId}` : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur suppression prix:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

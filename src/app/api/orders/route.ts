import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser, requireAdmin, getAuthUser } from "@/lib/auth";

/**
 * Calcule le prix final pour un client.
 */
async function calculatePrice(variantId: string, customerId: string): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { catalogPriceHT: true },
  });

  if (!variant) throw new Error("Variante introuvable");

  const customerPrice = await prisma.customerPrice.findUnique({
    where: { customerId_variantId: { customerId, variantId } },
  });

  if (!customerPrice) return variant.catalogPriceHT;

  const now = new Date();
  if (customerPrice.startDate && customerPrice.startDate > now) return variant.catalogPriceHT;
  if (customerPrice.endDate && customerPrice.endDate < now) return variant.catalogPriceHT;

  if (customerPrice.type === "FIXED") return customerPrice.value;
  return variant.catalogPriceHT * (1 - customerPrice.value / 100);
}

/**
 * Génère une référence de commande unique
 */
function generateOrderReference(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FE${year}${month}-${random}`;
}

/**
 * GET /api/orders
 * Récupère les commandes de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = { customerId: user.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            variant: {
              select: { sku: true, designation: true, powerKw: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Crée une nouvelle commande à partir du panier
 * Body: { notes?, deliveryMethod?, pickupLocation? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const { notes, deliveryMethod, pickupLocation } = await request.json().catch(() => ({}));

    // Pour la livraison, on utilise l'adresse du profil utilisateur
    const deliveryAddress = deliveryMethod === "DELIVERY" ? (user.address || `${user.company}`) : null;

    // Récupérer le panier
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        variant: { select: { id: true, realStock: true, active: true } },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
    }

    // Vérifier la disponibilité et le stock
    for (const item of cartItems) {
      if (!item.variant.active) {
        return NextResponse.json(
          { error: `Variante ${item.variantId} n'est plus disponible.` },
          { status: 400 }
        );
      }
      if (item.variant.realStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour ${item.variantId}. Disponible : ${Math.floor(item.variant.realStock)}, demandé : ${item.quantity}.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculer les prix et totaux
    let totalHT = 0;
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const unitPriceHT = await calculatePrice(item.variantId, user.id);
        const lineTotal = unitPriceHT * item.quantity;
        totalHT += lineTotal;
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceHT,
          totalHT: lineTotal,
        };
      })
    );

    const totalTTC = totalHT * 1.2;

    // Créer la commande dans une transaction
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          reference: generateOrderReference(),
          customerId: user.id,
          status: "SUBMITTED",
          totalHT,
          totalTTC,
          notes,
          deliveryMethod,
          pickupLocation,
          deliveryAddress,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              variant: { select: { sku: true, designation: true } },
            },
          },
        },
      });

      // Décrémenter le stock pour chaque variante
      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { realStock: { decrement: item.quantity } },
        });
      }

      // Vider le panier
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        totalHT: order.totalHT,
        totalTTC: order.totalTTC,
        itemCount: order.items.length,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur création commande:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser, getAuthUser } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendNewOrderNotification } from "@/lib/email";
import { calculatePricesBatch } from "@/lib/pricing";
import { Prisma } from "@prisma/client";

/**
 * Génère une référence PL-WEB-YYYY-XXXX séquentielle par année.
 * Doit être appelée à l'intérieur d'une transaction Prisma.
 */
async function generateOrderReference(
  tx: Prisma.TransactionClient
): Promise<string> {
  const year = new Date().getFullYear();

  // Upsert atomique : crée ou incrémente le compteur pour l'année
  const counter = await tx.orderCounter.upsert({
    where: { year },
    update: { seq: { increment: 1 } },
    create: { year, seq: 1 },
  });

  return `PL-WEB-${year}-${counter.seq.toString().padStart(4, "0")}`;
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

    // Calculer les prix en batch (2 requêtes au lieu de N*2)
    const variantIds = cartItems.map((item) => item.variantId);
    const pricesMap = await calculatePricesBatch(variantIds, user.id);

    let totalHT = 0;
    const orderItems = cartItems.map((item) => {
      const unitPriceHT = pricesMap.get(item.variantId) ?? 0;
      const lineTotal = unitPriceHT * item.quantity;
      totalHT += lineTotal;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceHT,
        totalHT: lineTotal,
      };
    });

    const totalTTC = totalHT * 1.2;

    // Créer la commande dans une transaction
    const order = await prisma.$transaction(async (tx) => {
      // Générer la référence séquentielle
      const reference = await generateOrderReference(tx);

      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          reference,
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

    // Emails de confirmation (non-bloquants)
    sendOrderConfirmationEmail(
      user.email,
      user.firstName,
      order.reference,
      order.totalTTC,
      order.items.map((item) => ({
        designation: item.variant.designation,
        quantity: item.quantity,
        unitPriceHT: item.unitPriceHT,
      })),
      deliveryMethod || "DELIVERY",
      pickupLocation
    );
    sendNewOrderNotification(user.company, order.reference, order.totalTTC);

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

    // Note: emails envoyés après la réponse pour ne pas bloquer
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

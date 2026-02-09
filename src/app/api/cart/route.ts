import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireActiveUser } from "@/lib/auth";

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
 * GET /api/cart
 * Récupère le panier de l'utilisateur connecté (ACTIVE uniquement)
 */
export async function GET() {
  try {
    const user = await requireActiveUser();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, family: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculer les prix pour chaque item
    const itemsWithPrices = await Promise.all(
      cartItems.map(async (item) => {
        const unitPrice = await calculatePrice(item.variantId, user.id);
        return {
          id: item.id,
          quantity: item.quantity,
          variant: {
            id: item.variant.id,
            sku: item.variant.sku,
            designation: item.variant.designation,
            powerKw: item.variant.powerKw,
            capacity: item.variant.capacity,
            realStock: item.variant.realStock,
            catalogPriceHT: item.variant.catalogPriceHT,
          },
          product: item.variant.product,
          unitPriceHT: unitPrice,
          totalHT: unitPrice * item.quantity,
        };
      })
    );

    const totalHT = itemsWithPrices.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    return NextResponse.json({
      items: itemsWithPrices,
      itemCount: itemsWithPrices.length,
      totalHT,
      totalTTC,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur récupération panier:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Ajoute ou met à jour un article dans le panier
 * Body: { variantId, quantity }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const { variantId, quantity } = await request.json();

    if (!variantId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "variantId et quantity (>= 1) requis." },
        { status: 400 }
      );
    }

    // Vérifier que la quantité est un entier
    if (!Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "La quantité doit être un nombre entier." },
        { status: 400 }
      );
    }

    // Vérifier que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId, active: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variante introuvable." }, { status: 404 });
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId: user.id, variantId } },
    });

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    // Vérifier le stock pour la quantité totale
    if (newQuantity > variant.realStock) {
      return NextResponse.json(
        { error: `Stock insuffisant. Disponible : ${Math.floor(variant.realStock)}. Déjà au panier : ${existingItem?.quantity || 0}` },
        { status: 400 }
      );
    }

    // Upsert: ADDITIONNE la quantité si l'article existe déjà
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_variantId: { userId: user.id, variantId } },
      update: { quantity: newQuantity },
      create: { userId: user.id, variantId, quantity },
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur ajout panier:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/cart?variantId=xxx
 * Supprime un article du panier
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const variantId = request.nextUrl.searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json({ error: "variantId requis." }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id, variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur suppression panier:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

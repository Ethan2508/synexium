import { prisma } from "@/lib/prisma";

/**
 * Calcule le prix final pour un client (single variant).
 */
export async function calculatePrice(
  variantId: string,
  customerId: string | null
): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { catalogPriceHT: true },
  });

  if (!variant) throw new Error("Variante introuvable");
  if (!customerId) return variant.catalogPriceHT;

  const customerPrice = await prisma.customerPrice.findUnique({
    where: { customerId_variantId: { customerId, variantId } },
  });

  if (!customerPrice) return variant.catalogPriceHT;

  const now = new Date();
  if (customerPrice.startDate && customerPrice.startDate > now)
    return variant.catalogPriceHT;
  if (customerPrice.endDate && customerPrice.endDate < now)
    return variant.catalogPriceHT;

  if (customerPrice.type === "FIXED") return customerPrice.value;
  return variant.catalogPriceHT * (1 - customerPrice.value / 100);
}

/**
 * Calcule les prix pour PLUSIEURS variantes en batch (évite N+1).
 * Retourne un Map<variantId, prixFinal>.
 */
export async function calculatePricesBatch(
  variantIds: string[],
  customerId: string
): Promise<Map<string, number>> {
  if (variantIds.length === 0) return new Map();

  // 1 seule requête pour toutes les variantes
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, catalogPriceHT: true },
  });

  // 1 seule requête pour tous les prix clients
  const customerPrices = await prisma.customerPrice.findMany({
    where: { customerId, variantId: { in: variantIds } },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v.catalogPriceHT]));
  const priceMap = new Map(customerPrices.map((cp) => [cp.variantId, cp]));
  const result = new Map<string, number>();
  const now = new Date();

  for (const vid of variantIds) {
    const catalogPrice = variantMap.get(vid);
    if (catalogPrice === undefined) continue;

    const cp = priceMap.get(vid);
    if (!cp) {
      result.set(vid, catalogPrice);
      continue;
    }

    if (cp.startDate && cp.startDate > now) {
      result.set(vid, catalogPrice);
      continue;
    }
    if (cp.endDate && cp.endDate < now) {
      result.set(vid, catalogPrice);
      continue;
    }

    if (cp.type === "FIXED") {
      result.set(vid, cp.value);
    } else {
      result.set(vid, catalogPrice * (1 - cp.value / 100));
    }
  }

  return result;
}

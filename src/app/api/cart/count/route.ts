import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth";

/**
 * GET /api/cart/count
 * Retourne uniquement le nombre d'articles — bien plus léger que GET /api/cart
 */
export async function GET() {
  try {
    const user = await requireActiveUser();

    const result = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });

    return NextResponse.json({ count: result._sum.quantity || 0 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED" || msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

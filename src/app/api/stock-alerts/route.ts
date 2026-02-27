import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth";

/**
 * POST /api/stock-alerts
 * Body: { variantId }
 * Crée une alerte stock pour l'utilisateur connecté.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const { variantId } = await request.json();

    if (!variantId) {
      return NextResponse.json({ error: "variantId requis." }, { status: 400 });
    }

    // Vérifier que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      return NextResponse.json({ error: "Variante introuvable." }, { status: 404 });
    }

    // Upsert : créer ou réactiver l'alerte (reset notified à false)
    await prisma.stockAlert.upsert({
      where: { userId_variantId: { userId: user.id, variantId } },
      update: { notified: false },
      create: { userId: user.id, variantId },
    });

    return NextResponse.json({ success: true, message: "Alerte activée." });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur stock alert:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/stock-alerts?variantId=xxx
 * Supprime l'alerte stock pour l'utilisateur connecté.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const variantId = request.nextUrl.searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json({ error: "variantId requis." }, { status: 400 });
    }

    await prisma.stockAlert.deleteMany({
      where: { userId: user.id, variantId },
    });

    return NextResponse.json({ success: true, message: "Alerte supprimée." });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }
    if (msg === "ACCOUNT_NOT_ACTIVE") {
      return NextResponse.json({ error: "Compte non validé." }, { status: 403 });
    }
    console.error("Erreur stock alert:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * GET /api/stock-alerts?variantId=xxx
 * Vérifie si l'utilisateur a une alerte active pour cette variante.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireActiveUser();
    const variantId = request.nextUrl.searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json({ error: "variantId requis." }, { status: 400 });
    }

    const alert = await prisma.stockAlert.findUnique({
      where: {
        userId_variantId: { userId: user.id, variantId },
      },
    });

    return NextResponse.json({
      hasAlert: !!alert && !alert.notified,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHENTICATED") {
      return NextResponse.json({ authenticated: false, hasAlert: false }, { status: 401 });
    }
    return NextResponse.json({ hasAlert: false });
  }
}

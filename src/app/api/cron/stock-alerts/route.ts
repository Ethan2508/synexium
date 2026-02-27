import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStockAlertEmail } from "@/lib/email";

/**
 * GET /api/cron/stock-alerts
 * Vérifie les alertes stock non notifiées et envoie un email
 * quand la variante est de nouveau en stock (realStock > 0).
 *
 * Protégé par un header CRON_SECRET (Vercel Cron ou appel manuel).
 */
export async function GET(request: NextRequest) {
  // Vérifier le secret cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    // Trouver toutes les alertes non notifiées où le stock est revenu > 0
    const alerts = await prisma.stockAlert.findMany({
      where: {
        notified: false,
        variant: { realStock: { gt: 0 } },
      },
      include: {
        user: { select: { email: true, firstName: true } },
        variant: {
          select: {
            designation: true,
            product: { select: { name: true, slug: true } },
          },
        },
      },
      take: 100, // Limiter à 100 par exécution pour ne pas timeout
    });

    if (alerts.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Envoyer les emails et marquer comme notifié
    let sent = 0;
    for (const alert of alerts) {
      try {
        await sendStockAlertEmail(
          alert.user.email,
          alert.user.firstName,
          alert.variant.product.name,
          alert.variant.product.slug
        );

        await prisma.stockAlert.update({
          where: { id: alert.id },
          data: { notified: true },
        });
        sent++;
      } catch (err) {
        console.error(`Erreur envoi alerte ${alert.id}:`, err);
      }
    }

    return NextResponse.json({ sent, total: alerts.length });
  } catch (error) {
    console.error("Erreur cron stock-alerts:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

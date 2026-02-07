import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/clients/[id]
 * Détail complet d'un client. ADMIN uniquement.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const client = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        siret: true,
        phone: true,
        address: true,
        kbisUrl: true,
        idCardFrontUrl: true,
        idCardBackUrl: true,
        role: true,
        status: true,
        rejectedReason: true,
        cgvAcceptedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            customerPrices: true,
          },
        },
        orders: {
          select: {
            id: true,
            reference: true,
            status: true,
            totalHT: true,
            totalTTC: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: unknown) {
    console.error("Erreur détail client:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

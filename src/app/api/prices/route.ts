import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAdmin } from '@/lib/auth';
import { calculatePrice } from '@/lib/pricing';

/**
 * GET /api/prices?variantId=xxx
 * ⛔ BLOQUÉ si l'utilisateur n'est pas connecté ET ACTIF.
 */
export async function GET(request: NextRequest) {
  try {
    // ── Vérification auth stricte ──
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise pour consulter les prix.' },
        { status: 401 }
      );
    }
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Votre compte doit être validé pour accéder aux prix.' },
        { status: 403 }
      );
    }

    const variantId = request.nextUrl.searchParams.get('variantId');
    if (!variantId) {
      return NextResponse.json({ error: 'variantId requis' }, { status: 400 });
    }

    const price = await calculatePrice(variantId, user.id);

    return NextResponse.json({
      variantId,
      priceHT: price,
      priceTTC: price * 1.2,
    });
  } catch (error) {
    console.error('Erreur calcul prix:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/prices
 * ⛔ ADMIN uniquement – Créer/Modifier un prix client.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { customerId, variantId, type, value, startDate, endDate, note } = body;

    if (!customerId || !variantId || !type || value === undefined) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }
    if (type !== 'FIXED' && type !== 'PERCENTAGE') {
      return NextResponse.json({ error: 'Type invalide (FIXED ou PERCENTAGE)' }, { status: 400 });
    }

    const customerPrice = await prisma.customerPrice.upsert({
      where: { customerId_variantId: { customerId, variantId } },
      create: {
        customerId,
        variantId,
        type,
        value,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        note,
      },
      update: {
        type,
        value,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        note,
      },
    });

    return NextResponse.json({ success: true, customerPrice });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Accès admin requis.' }, { status: 403 });
    }
    console.error('Erreur prix:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

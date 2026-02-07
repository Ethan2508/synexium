import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/suppliers
 * Liste tous les fournisseurs (ADMIN uniquement)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    // Seuls les admins peuvent voir les fournisseurs
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: { select: { variants: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Erreur récupération fournisseurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

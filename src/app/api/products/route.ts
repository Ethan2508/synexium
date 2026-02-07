import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/products
 * Liste les produits avec filtres (schéma normalisé).
 * ⛔ Les prix sont SUPPRIMÉS de la réponse si l'utilisateur n'est pas ACTIVE.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');

  try {
    const user = await getAuthUser();
    const canSeePrices = user?.status === 'ACTIVE';

    const where: Record<string, unknown> = { active: true };
    
    // Filtre par catégorie (slug)
    if (category) {
      where.category = { slug: category };
    }
    
    // Filtre par marque (slug)
    if (brand) {
      where.brand = { slug: brand };
    }
    
    // Recherche
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
        { variants: { some: { designation: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          variants: {
            where: { active: true },
            orderBy: { powerKw: 'asc' },
          },
          image: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    
    // Strip prices from API response if user not ACTIVE
    const safeProducts = products.map((p: Record<string, unknown>) => ({
      ...p,
      variants: (p.variants as Record<string, unknown>[]).map((v: Record<string, unknown>) => ({
        ...v,
        catalogPriceHT: canSeePrices ? v.catalogPriceHT : null,
      })),
    }));

    return NextResponse.json({
      products: safeProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

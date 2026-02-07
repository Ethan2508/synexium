import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

/* =========================================================================
   CATALOGUE – Liste produits B2B (schéma normalisé)
   ========================================================================= */

interface CataloguePageProps {
  searchParams: Promise<{ category?: string; brand?: string; search?: string }>;
}

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: { products: number };
};

type BrandWithCount = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  category: { id: string; name: string; slug: string; color: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  image: { url: string; alt: string } | null;
  variants: Array<{ id: string; catalogPriceHT: number }>;
};

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const { category, brand, search } = await searchParams;
  const user = await getAuthUser();
  const canSeePrices = user?.status === "ACTIVE";

  // Récupérer les catégories avec comptage
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  }) as CategoryWithCount[];

  // Récupérer les marques avec comptage
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  }) as BrandWithCount[];

  // Construire la clause WHERE
  const whereClause: Record<string, unknown> = { active: true };
  if (category) whereClause.category = { slug: category };
  if (brand) whereClause.brand = { slug: brand };
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
      { variants: { some: { designation: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const products: ProductWithRelations[] = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
      brand: true,
      variants: { where: { active: true }, orderBy: { catalogPriceHT: "asc" }, take: 1 },
      image: true,
    },
    orderBy: { name: "asc" },
    take: 60,
  });

  const total = categories.reduce((s, c) => s + c._count.products, 0);
  const activeCategory = categories.find(c => c.slug === category);
  const activeBrand = brands.find(b => b.slug === brand);

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Header catalogue ── */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">
            {activeCategory?.name || activeBrand?.name || "Tous les produits"}
          </h1>
          <p className="text-white/70 text-sm">
            {products.length} produit{products.length > 1 ? "s" : ""} trouvé
            {products.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:flex gap-8">
        {/* ── Sidebar filtres ── */}
        <aside className="lg:w-64 shrink-0 mb-8 lg:mb-0 space-y-6">
          {/* Catégories */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              Catégories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/catalogue"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category && !brand
                      ? "bg-primary !text-white"
                      : "text-text-secondary hover:bg-surface"
                  }`}
                >
                  Tous ({total})
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogue?category=${c.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === c.slug
                        ? "bg-primary !text-white"
                        : "text-text-secondary hover:bg-surface"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category === c.slug ? "#ffffff" : c.color }}
                    />
                    <span className="truncate">{c.name}</span>
                    <span className={`ml-auto text-xs ${category === c.slug ? "text-white/70" : "opacity-60"}`}>{c._count.products}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marques */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              Marques
            </h3>
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {brands.filter(b => b._count.products > 0).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/catalogue?brand=${b.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      brand === b.slug
                        ? "bg-primary !text-white"
                        : "text-text-secondary hover:bg-surface"
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className={`ml-auto text-xs ${brand === b.slug ? "text-white/70" : "opacity-60"}`}>{b._count.products}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Grille produits ── */}
        <section className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-text-secondary">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">Aucun produit trouvé</p>
              <p className="text-sm mt-1">Essayez un autre filtre ou terme de recherche.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} canSeePrices={canSeePrices} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ===================================================================
   PRODUCT CARD
   =================================================================== */

function ProductCard({ product, canSeePrices }: { product: ProductWithRelations; canSeePrices: boolean }) {
  // Calculer le prix minimum parmi les variantes avec un prix > 0
  const pricesAboveZero = product.variants
    .map(v => v.catalogPriceHT)
    .filter(p => p > 0);
  const minPrice = pricesAboveZero.length > 0 ? Math.min(...pricesAboveZero) : null;
  const hasNoPricing = pricesAboveZero.length === 0;
  
  const color = product.category?.color || "#283084";

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-surface-dark flex items-center justify-center p-6 relative">
        {product.image ? (
          <img
            src={product.image.url}
            alt={product.image.alt}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-6xl opacity-30">📦</span>
        )}
        {/* Badge catégorie */}
        {product.category && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: color }}
          >
            {product.category.name}
          </span>
        )}
        {/* Badge marque */}
        {product.brand && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-text-primary shadow-sm">
            {product.brand.name}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-end justify-between">
          {!canSeePrices ? (
            <span className="text-xs text-primary font-medium">
              Connectez-vous pour voir les prix
            </span>
          ) : hasNoPricing ? (
            <span className="text-xs text-text-secondary font-medium">
              Prix sur demande
            </span>
          ) : (
            <div>
              <span className="text-xs text-text-secondary">À partir de</span>
              <div className="text-lg font-bold text-primary">
                {minPrice!.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}&nbsp;€
                <span className="text-xs font-normal text-text-secondary ml-1">HT</span>
              </div>
            </div>
          )}

          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Détails →
          </span>
        </div>
      </div>
    </Link>
  );
}

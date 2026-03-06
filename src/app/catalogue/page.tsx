import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import FilterSection from "@/components/catalogue/FilterSection";

export const revalidate = 60; // ISR: revalider toutes les 60s

/* =========================================================================
   CATALOGUE – Liste produits B2B (schéma normalisé)
   ========================================================================= */

interface CataloguePageProps {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; family?: string; power?: string; supplier?: string; inStock?: string }>;
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
  variants: Array<{ id: string; catalogPriceHT: number; powerKw: number | null; supplierReference: string | null }>;
};

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const { category, brand, search, family, power, supplier, inStock } = await searchParams;

  // Récupérer catégories, marques, puissances, fournisseurs et familles en parallèle
  const [categories, brands, powerValues, suppliers, families] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }) as Promise<CategoryWithCount[]>,
    prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }) as Promise<BrandWithCount[]>,
    prisma.productVariant.findMany({
      where: { active: true, powerKw: { not: null } },
      select: { powerKw: true },
      distinct: ["powerKw"],
      orderBy: { powerKw: "asc" },
    }).then((rows) => rows.map((r) => r.powerKw!).filter(Boolean)),
    prisma.supplier.findMany({
      where: { active: true },
      include: { _count: { select: { variants: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true, family: { not: null } },
      select: { family: true },
      distinct: ["family"],
      orderBy: { family: "asc" },
    }).then((rows) => rows.map((r) => r.family!).filter(Boolean)),
  ]);

  // Construire la clause WHERE
  const whereClause: Record<string, unknown> = { active: true };
  if (category) whereClause.category = { slug: category };
  if (brand) whereClause.brand = { slug: brand };
  if (family) whereClause.family = { contains: family, mode: "insensitive" };
  if (supplier) {
    whereClause.variants = { 
      ...((whereClause.variants as Record<string, unknown>) || {}),
      some: { 
        active: true, 
        supplier: { slug: supplier },
        ...(power ? { powerKw: parseFloat(power) } : {}),
      } 
    };
  } else if (power) {
    const powerNum = parseFloat(power);
    if (!isNaN(powerNum)) {
      whereClause.variants = { some: { active: true, powerKw: powerNum } };
    }
  }
  if (inStock === "1") {
    if (whereClause.variants) {
      const existing = (whereClause.variants as { some: Record<string, unknown> }).some;
      (whereClause.variants as { some: Record<string, unknown> }).some = { ...existing, realStock: { gt: 0 } };
    } else {
      whereClause.variants = { some: { active: true, realStock: { gt: 0 } } };
    }
  }
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
      variants: { where: { active: true }, orderBy: { catalogPriceHT: "asc" }, take: 1, select: { id: true, catalogPriceHT: true, powerKw: true, supplierReference: true } },
      image: true,
    },
    orderBy: { name: "asc" },
    take: 60,
  });

  const total = categories.reduce((s, c) => s + c._count.products, 0);
  const activeCategory = categories.find(c => c.slug === category);
  const activeBrand = brands.find(b => b.slug === brand);
  
  // Titre dynamique selon le filtre actif
  const pageTitle = family 
    ? family.replace(/\+/g, " ")
    : activeCategory?.name 
    || activeBrand?.name 
    || "Tous les produits";

  // Helper pour construire des liens de filtre sans perdre les autres params
  const buildFilterUrl = (params: Record<string, string | undefined>) => {
    const base: Record<string, string> = {};
    if (category) base.category = category;
    if (brand) base.brand = brand;
    if (search) base.search = search;
    if (family) base.family = family;
    if (power) base.power = power;
    if (supplier) base.supplier = supplier;
    if (inStock) base.inStock = inStock;
    // Override/remove
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) delete base[k];
      else base[k] = v;
    }
    const qs = new URLSearchParams(base).toString();
    return `/catalogue${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Header catalogue ── */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">
            {pageTitle}
          </h1>
          <p className="text-white/70 text-sm">
            {products.length} produit{products.length > 1 ? "s" : ""} trouvé
            {products.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:flex gap-8">
        {/* ── Sidebar filtres ── */}
        <aside className="lg:w-64 shrink-0 mb-8 lg:mb-0 space-y-3">
          {/* Filtres actifs — bouton reset */}
          {(category || brand || family || power || supplier || inStock || search) && (
            <Link
              href="/catalogue"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser les filtres
            </Link>
          )}

          {/* Catégories */}
          <FilterSection title="Catégories" defaultOpen={true} count={categories.length}>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildFilterUrl({ category: undefined })}
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
                    href={buildFilterUrl({ category: c.slug, brand: undefined })}
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
          </FilterSection>

          {/* Familles */}
          {families.length > 0 && (
            <FilterSection title="Familles" count={families.length}>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {families.map((f) => (
                  <li key={f}>
                    <Link
                      href={buildFilterUrl({ family: family === f ? undefined : f })}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        family === f
                          ? "bg-primary !text-white"
                          : "text-text-secondary hover:bg-surface"
                      }`}
                    >
                      {f.replace(/\+/g, " ")}
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterSection>
          )}

          {/* Marques */}
          <FilterSection title="Marques" count={brands.filter(b => b._count.products > 0).length}>
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {brands.filter(b => b._count.products > 0).map((b) => (
                <li key={b.id}>
                  <Link
                    href={buildFilterUrl({ brand: brand === b.slug ? undefined : b.slug, category: undefined })}
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
          </FilterSection>

          {/* Fournisseurs */}
          {suppliers.length > 0 && (
            <FilterSection title="Fournisseurs" count={suppliers.filter(s => s._count.variants > 0).length}>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {suppliers.filter(s => s._count.variants > 0).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={buildFilterUrl({ supplier: supplier === s.slug ? undefined : s.slug })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        supplier === s.slug
                          ? "bg-primary !text-white"
                          : "text-text-secondary hover:bg-surface"
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className={`ml-auto text-xs ${supplier === s.slug ? "text-white/70" : "opacity-60"}`}>{s._count.variants}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterSection>
          )}

          {/* Puissances */}
          {powerValues.length > 0 && (
            <FilterSection title="Puissance" count={powerValues.length}>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {powerValues.map((p) => (
                  <li key={p}>
                    <Link
                      href={buildFilterUrl({ power: power === String(p) ? undefined : String(p) })}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        power === String(p)
                          ? "bg-primary !text-white"
                          : "text-text-secondary hover:bg-surface"
                      }`}
                    >
                      {p} kW
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterSection>
          )}

          {/* Stock disponible */}
          <FilterSection title="Disponibilité" defaultOpen={true}>
            <Link
              href={buildFilterUrl({ inStock: inStock === "1" ? undefined : "1" })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                inStock === "1"
                  ? "bg-solar-green !text-white"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${inStock === "1" ? "bg-white" : "bg-solar-green"}`} />
              En stock uniquement
            </Link>
          </FilterSection>
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
                <ProductCard key={product.id} product={product} />
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

function ProductCard({ product }: { product: ProductWithRelations }) {
  const color = product.category?.color || "#283084";
  const mainPower = product.variants[0]?.powerKw;
  const supplierRef = product.variants[0]?.supplierReference;

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-surface-dark flex items-center justify-center p-6 relative">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6"
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
        <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {supplierRef && (
          <p className="text-[11px] text-text-secondary mb-2 font-mono truncate">
            Réf. {supplierRef}
          </p>
        )}

        {mainPower && (
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-solar-green/10 text-solar-green">
              {mainPower} kW
            </span>
          </div>
        )}

        <div className="flex items-end justify-between">
          <span className="text-xs text-primary font-medium">
            Connectez-vous pour voir les prix
          </span>
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Détails →
          </span>
        </div>
      </div>
    </Link>
  );
}

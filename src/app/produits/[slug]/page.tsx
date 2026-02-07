import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

/* =========================================================================
   FICHE PRODUIT – Détail gamme + variantes (schéma normalisé)
   ========================================================================= */

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

type Variant = {
  id: string;
  sku: string;
  powerKw: number | null;
  capacity: number | null;
  designation: string;
  realStock: number;
  catalogPriceHT: number;
};

type ProductDoc = {
  document: { id: string; name: string; url: string; type: string };
};

type ProductFull = {
  id: string;
  name: string;
  description: string | null;
  category: { id: string; name: string; slug: string; color: string } | null;
  brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
  image: { url: string; alt: string } | null;
  variants: Variant[];
  documents: ProductDoc[];
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product: ProductFull | null = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      variants: { where: { active: true }, orderBy: [{ powerKw: "asc" }, { capacity: "asc" }] },
      image: true,
      documents: { include: { document: true } },
    },
  });

  if (!product) notFound();

  const user = await getAuthUser();
  const canSeePrices = user?.status === "ACTIVE";
  const categoryColor = product.category?.color || "#283084";

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-white/60">
          <Link href="/catalogue" className="hover:text-white transition-colors">
            Catalogue
          </Link>
          <ChevronRight />
          {product.category && (
            <>
              <Link
                href={`/catalogue?category=${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight />
            </>
          )}
          <span className="text-white font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 lg:flex gap-10">
        {/* ── Image ── */}
        <div className="lg:w-1/2 mb-8 lg:mb-0">
          <div className="bg-white rounded-2xl shadow-sm border border-border aspect-square flex items-center justify-center p-10 sticky top-24">
            {product.image ? (
              <img
                src={product.image.url}
                alt={product.image.alt}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-8xl opacity-20">📦</span>
            )}
          </div>
        </div>

        {/* ── Infos ── */}
        <div className="lg:w-1/2">
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4">
            {product.category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white border border-border text-text-primary">
                {product.brand.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-text-primary mb-3">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-text-secondary leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* ── Variantes ── */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-border bg-surface">
              <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                {product.variants.length > 1
                  ? `Choisir une variante (${product.variants.length})`
                  : "Référence"}
              </h3>
            </div>

            <div className="divide-y divide-border">
              {product.variants.map((v: Variant) => (
                <div key={v.id} className="px-5 py-4 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary">
                        {v.powerKw
                          ? `${v.powerKw} kW`
                          : v.capacity
                          ? `${v.capacity} L`
                          : v.designation}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        SKU : {v.sku}
                      </div>
                      {v.realStock > 0 ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-2 h-2 rounded-full bg-solar-green" />
                          <span className="text-xs font-medium text-solar-green">
                            En stock ({v.realStock.toFixed(0)})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-2 h-2 rounded-full bg-heatpump-red" />
                          <span className="text-xs font-medium text-heatpump-red">
                            Rupture
                          </span>
                        </div>
                      )}
                    </div>

                    {!canSeePrices ? (
                      <Link
                        href="/auth/login"
                        className="shrink-0 px-4 py-2.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        Connectez-vous pour voir les prix
                      </Link>
                    ) : v.catalogPriceHT === 0 ? (
                      <span className="shrink-0 px-4 py-2.5 text-xs font-semibold text-text-secondary">
                        Prix sur demande
                      </span>
                    ) : (
                      <>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-primary">
                            {v.catalogPriceHT.toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}
                            &nbsp;€
                          </div>
                          <div className="text-[10px] text-text-secondary uppercase">HT</div>
                        </div>

                        <AddToCartButton variantId={v.id} stock={v.realStock} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Documents ── */}
          {product.documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-surface">
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                  Documents techniques
                </h3>
              </div>
              <div className="divide-y divide-border">
                {product.documents.map(({ document }: ProductDoc) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface transition-colors"
                  >
                    <PdfIcon />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary truncate">
                        {document.name}
                      </div>
                      <div className="text-xs text-text-secondary">{document.type}</div>
                    </div>
                    <DownloadIcon />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Helpers & Icons ===== */

function ChevronRight() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <div className="w-9 h-9 rounded-lg bg-heatpump-red/10 flex items-center justify-center text-heatpump-red shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>
  );
}
function DownloadIcon() {
  return (
    <svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

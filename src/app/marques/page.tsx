import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 120; // ISR: revalider toutes les 2 min

export const metadata = {
  title: "Nos marques | Francilienne Energy",
  description: "Découvrez les marques de référence en photovoltaïque, pompes à chaleur et solutions énergétiques.",
};

// Descriptions des marques
const BRAND_DESC: Record<string, string> = {
  "Enphase": "Leader mondial des micro-onduleurs pour installations solaires.",
  "Hoymiles": "Micro-onduleurs et solutions de stockage innovantes.",
  "Huawei": "Onduleurs intelligents et systèmes de stockage haute performance.",
  "K2 Systems": "Systèmes de montage et structures pour panneaux solaires.",
  "GSE": "Solutions d'intégration toiture et fixation photovoltaïque.",
  "Panasonic": "Pompes à chaleur haute efficacité et climatisation.",
  "Airwell": "PAC air-air et air-eau pour chauffage et climatisation.",
  "Ariston": "Systèmes de chauffage et production d'eau chaude sanitaire.",
  "Atlantic": "Solutions de chauffage et eau chaude sanitaire.",
  "Solplanet": "Onduleurs photovoltaïques fiables et performants.",
  "Keba": "Bornes de recharge pour véhicules électriques.",
  "AP Systems": "Micro-onduleurs intelligents pour le photovoltaïque.",
  "Domusa": "Chaudières à granulés et solutions de chauffage biomasse.",
  "Eaton": "Protection électrique et gestion de l'énergie.",
  "Chaffoteaux": "Solutions de chauffage et eau chaude sanitaire.",
  "LG": "Solutions thermodynamiques et climatisation.",
  "Francilienne": "Panneaux solaires et systèmes d'intégration.",
};

export default async function MarquesPage() {
  const brands = await prisma.brand.findMany({
    where: { active: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const brandsWithProducts = brands.filter(b => b._count.products > 0);
  const brandsWithLogos = brandsWithProducts.filter(b => b.logoUrl);
  const brandsWithoutLogos = brandsWithProducts.filter(b => !b.logoUrl);

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Nos marques partenaires</h1>
          <p className="text-white/70 text-sm">
            {brandsWithProducts.length} marques · {brands.reduce((sum, b) => sum + b._count.products, 0)} produits
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Marques avec logos */}
        {brandsWithLogos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-6">Marques phares</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brandsWithLogos.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/catalogue?brand=${brand.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-[3/2] relative mb-4 flex items-center justify-center bg-surface rounded-lg p-4">
                    <Image
                      src={brand.logoUrl!}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {brand._count.products} produit{brand._count.products > 1 ? "s" : ""}
                    </p>
                    {BRAND_DESC[brand.name] && (
                      <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                        {BRAND_DESC[brand.name]}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Autres marques */}
        {brandsWithoutLogos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-6">Toutes nos marques</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandsWithoutLogos.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/catalogue?brand=${brand.slug}`}
                  className="bg-white rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all hover:border-primary group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors text-sm">
                        {brand.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {brand._count.products} produit{brand._count.products > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

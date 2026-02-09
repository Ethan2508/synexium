import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import Image from "next/image";

export const dynamic = "force-dynamic";

/* =========================================================================
   HOME – Francilienne Energy B2B
   ========================================================================= */

export default async function Home() {
  // Charger les produits du moment
  const user = await getAuthUser();
  const canSeePrices = user?.status === "ACTIVE";
  
  const featuredProducts = await prisma.product.findMany({
    where: { active: true },
    take: 8,
    include: {
      brand: true,
      category: true,
      variants: {
        where: { active: true },
        orderBy: { catalogPriceHT: 'asc' },
        take: 1,
      },
      image: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Espace professionnel B2B
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Votre distributeur<br />
                <span className="text-green-300">solutions énergétiques</span>
              </h1>
              <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-lg">
                Plus de 650 références en solaire, pompes à chaleur et climatisation.
                Stock réel, prix négociés, livraison rapide en Île-de-France.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/catalogue"
                  className="px-8 py-4 text-base font-bold bg-solar-green text-white rounded-xl hover:bg-solar-green/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Parcourir le catalogue
                </Link>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 text-base font-bold bg-white/10 border-2 border-white rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-white"
                >
                  Créer un compte pro
                </Link>
              </div>
            </div>

            {/* Right: Stats cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <StatCard value="650+" label="Références produits" />
              <StatCard value="24h" label="Livraison IDF" />
              <StatCard value="100%" label="Stock temps réel" />
              <StatCard value="15+" label="Marques partenaires" />
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45.8C96 41.7 192 33.3 288 35.8C384 38.3 480 51.7 576 55.8C672 60 768 55 864 48.3C960 41.7 1056 33.3 1152 35.8C1248 38.3 1344 51.7 1392 58.3L1440 65V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Nos univers produits
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Matériel professionnel disponible sur stock, accompagnement technique sur vos projets
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Photovoltaïque"
              description="Panneaux, onduleurs, micro-onduleurs, batteries et accessoires"
              color="#7fb727"
              href="/catalogue?category=photovoltaique"
              icon={<SolarIcon />}
            />
            <CategoryCard
              title="Intégration"
              description="Structures K2, GSE, surimposition et intégration toiture"
              color="#555"
              href="/catalogue?category=integration"
              icon={<StructureIcon />}
            />
            <CategoryCard
              title="Chauffage"
              description="PAC air-eau, air-air, ballons thermodynamiques, accessoires"
              color="#e6332a"
              href="/catalogue?category=chauffage"
              icon={<HeatIcon />}
            />
            <CategoryCard
              title="Accessoires"
              description="Câbles, protections, connectiques, boîtiers AC/DC"
              color="#009fe3"
              href="/catalogue?category=accessoires"
              icon={<AccessoryIcon />}
            />
          </div>
        </div>
      </section>

      {/* ── Produits du moment ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Produits du moment
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Sélection de produits disponibles en stock
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const variant = product.variants[0];
              const price = canSeePrices && variant?.catalogPriceHT 
                ? `${variant.catalogPriceHT.toFixed(2)} € HT` 
                : null;

              return (
                <Link
                  key={product.id}
                  href={`/produits/${product.slug}`}
                  className="group bg-surface rounded-xl border border-border hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.image?.url ? (
                      <Image
                        src={product.image.url}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-primary mb-1">
                      {product.brand?.name}
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    {price ? (
                      <div className="text-lg font-bold text-primary">
                        {price}
                      </div>
                    ) : (
                      <div className="text-sm text-text-secondary italic">
                        Connectez-vous pour voir les prix
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-solar-green text-white rounded-xl hover:bg-solar-green/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Voir tout le catalogue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marques ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            Nos marques partenaires
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-70">
            {["Enphase", "Hoymiles", "Huawei", "K2 Systems", "GSE", "Panasonic", "Airwell", "Solplanet"].map((brand) => (
              <span key={brand} className="text-lg font-semibold text-gray-500">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Points forts ── */}
      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Pourquoi Francilienne Energy
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Un partenaire de confiance pour les professionnels de l'énergie
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              icon={<BoxIcon />}
              title="+650 références"
              text="Catalogue complet multi-marques pour tous vos chantiers"
            />
            <Feature
              icon={<TruckIcon />}
              title="Stock réel"
              text="Disponibilité en temps réel, livraison rapide Île-de-France"
            />
            <Feature
              icon={<TagIcon />}
              title="Prix pros"
              text="Tarifs personnalisés selon votre volume et partenariat"
            />
            <Feature
              icon={<ShieldIcon />}
              title="Support dédié"
              text="Équipe technique pour accompagner vos projets"
            />
          </div>
        </div>
      </section>

      {/* ── CTA inscription ── */}
      <section className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Professionnel ? Accédez aux prix et au stock
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto text-lg">
            Créez votre compte en 2 minutes. Après validation de votre KBIS,
            accédez aux prix négociés et commandez en ligne.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-10 py-4 text-base font-bold bg-solar-green text-white rounded-xl hover:bg-solar-green/90 transition-all shadow-lg"
            >
              Demander un accès professionnel
            </Link>
            <Link
              href="/auth/login"
              className="px-10 py-4 text-base font-bold bg-white/10 border-2 border-white rounded-xl hover:bg-white/20 transition-all text-white"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ===================================================================
   SUB-COMPONENTS
   =================================================================== */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
      <div className="text-3xl font-extrabold mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  color,
  href,
  icon,
}: {
  title: string;
  description: string;
  color: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>
      <span
        className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color }}
      >
        Voir les produits
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}

/* ===== SVG Icons ===== */
function SolarIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}
function StructureIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function HeatIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  );
}
function AccessoryIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

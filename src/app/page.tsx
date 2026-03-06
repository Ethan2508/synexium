import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";

export const revalidate = 60;

/* =========================================================================
   HOME – Francilienne Energy B2B
   ========================================================================= */

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { active: true },
    take: 4,
    include: {
      brand: true,
      category: true,
      variants: {
        where: { active: true },
        orderBy: { catalogPriceHT: "asc" },
        take: 1,
        select: { id: true, catalogPriceHT: true, powerKw: true, supplierReference: true },
      },
      image: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* ── Hero Carrousel ── */}
      <HeroCarousel />

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
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produits/${product.slug}`}
                className="group bg-surface rounded-xl border border-border hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {product.image?.url ? (
                    <Image
                      src={product.image.url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold text-primary mb-1">
                    {product.brand?.name}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  {product.variants[0]?.supplierReference && (
                    <p className="text-[11px] text-text-secondary mb-1 font-mono">
                      Réf. {product.variants[0].supplierReference}
                    </p>
                  )}
                  <div className="text-sm text-text-secondary italic">
                    Connectez-vous pour voir les prix
                  </div>
                </div>
              </Link>
            ))}
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

      {/* ── Nos univers produits ── */}
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <CategoryCard
              title="Panneaux"
              description="Panneaux solaires Francilienne et partenaires"
              color="#7fb727"
              href="/catalogue?family=PANNEAUX+FRANCILIENNE"
              icon={<SolarIcon />}
            />
            <CategoryCard
              title="Onduleurs"
              description="Huawei, Solplanet et solutions string"
              color="#7fb727"
              href="/catalogue?family=ONDULEURS+HUAWEI"
              icon={<InverterIcon />}
            />
            <CategoryCard
              title="Micro-onduleurs"
              description="Enphase, Hoymiles, AP Systems"
              color="#7fb727"
              href="/catalogue?search=micro-onduleur"
              icon={<MicroInverterIcon />}
            />
            <CategoryCard
              title="Systèmes de fixation"
              description="K2 Systems, GSE, intégration toiture et sol"
              color="#555"
              href="/catalogue?category=systeme-de-fixation"
              icon={<StructureIcon />}
            />
            <CategoryCard
              title="Stockage"
              description="Batteries Huawei, Hoymiles, Solplanet"
              color="#eea400"
              href="/catalogue?category=stockage"
              icon={<BatteryIcon />}
            />
            <CategoryCard
              title="Pompes à chaleur"
              description="PAC air-eau, air-air, ballons"
              color="#e6332a"
              href="/catalogue?category=chauffage"
              icon={<HeatIcon />}
            />
          </div>
        </div>
      </section>

      {/* ── Vidéo ── */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Découvrez Francilienne Energy
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto">
            Notre savoir-faire depuis 2009 au service des professionnels de l&apos;énergie
          </p>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Francilienne Energy - Présentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ── Marques partenaires (logos défilants) ── */}
      <section className="bg-surface py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            Nos marques partenaires
          </h2>
        </div>
        <div className="relative space-y-8">
          <div className="flex animate-scroll gap-12 items-center">
            {[
              { name: "Airwell", logo: "/brands/airwell.png" },
              { name: "AP Systems", logo: "/brands/apsystems.png" },
              { name: "Ariston", logo: "/brands/ariston.png" },
              { name: "Atlantic", logo: "/brands/atlantic.png" },
              { name: "Axelair", logo: "/brands/axelair.png" },
              { name: "Chaffoteaux", logo: "/brands/chaffoteaux.png" },
              { name: "Domusa", logo: "/brands/domusa.png" },
              { name: "Eaton", logo: "/brands/eaton.png" },
              { name: "Airwell", logo: "/brands/airwell.png" },
              { name: "AP Systems", logo: "/brands/apsystems.png" },
              { name: "Ariston", logo: "/brands/ariston.png" },
              { name: "Atlantic", logo: "/brands/atlantic.png" },
              { name: "Axelair", logo: "/brands/axelair.png" },
              { name: "Chaffoteaux", logo: "/brands/chaffoteaux.png" },
              { name: "Domusa", logo: "/brands/domusa.png" },
              { name: "Eaton", logo: "/brands/eaton.png" },
            ].map((brand, i) => (
              <div key={`row1-${brand.name}-${i}`} className="shrink-0">
                <div className="bg-white rounded-xl border border-border shadow-sm px-6 py-4 flex items-center justify-center h-20 w-36">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={120}
                    height={60}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex animate-scroll-reverse gap-12 items-center">
            {[
              { name: "Eaton", logo: "/brands/eaton.png" },
              { name: "Domusa", logo: "/brands/domusa.png" },
              { name: "Chaffoteaux", logo: "/brands/chaffoteaux.png" },
              { name: "Axelair", logo: "/brands/axelair.png" },
              { name: "Atlantic", logo: "/brands/atlantic.png" },
              { name: "Ariston", logo: "/brands/ariston.png" },
              { name: "AP Systems", logo: "/brands/apsystems.png" },
              { name: "Airwell", logo: "/brands/airwell.png" },
              { name: "Eaton", logo: "/brands/eaton.png" },
              { name: "Domusa", logo: "/brands/domusa.png" },
              { name: "Chaffoteaux", logo: "/brands/chaffoteaux.png" },
              { name: "Axelair", logo: "/brands/axelair.png" },
              { name: "Atlantic", logo: "/brands/atlantic.png" },
              { name: "Ariston", logo: "/brands/ariston.png" },
              { name: "AP Systems", logo: "/brands/apsystems.png" },
              { name: "Airwell", logo: "/brands/airwell.png" },
            ].map((brand, i) => (
              <div key={`row2-${brand.name}-${i}`} className="shrink-0">
                <div className="bg-white rounded-xl border border-border shadow-sm px-6 py-4 flex items-center justify-center h-20 w-36">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={120}
                    height={60}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi Francilienne Energy ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Pourquoi choisir notre marque Francilienne ?
            </h2>
          </div>

          {/* NOS SOLUTIONS */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Nos solutions</span>
              <p className="text-text-secondary text-lg leading-relaxed">
                Francilienne Energy offre des solutions solaires sur mesure, combinant panneaux solaires
                performants et structures de montage, pour une énergie verte et efficace.
              </p>
            </div>
            <div className="bg-solar-green/5 rounded-2xl p-8 border border-solar-green/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-solar-green/10 flex items-center justify-center">
                  <SolarIcon />
                </div>
                <span className="text-2xl font-extrabold text-solar-green">Depuis 2009</span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                Francilienne Energy a pour objectif de s&apos;adapter en permanence aux évolutions technologiques
                des cellules solaires, ce qui nous permet de vous proposer les solutions les plus performantes.
                Près d&apos;un million de panneaux déjà distribués sur le marché français et plus encore sur l&apos;Europe.
              </p>
            </div>
          </div>

          {/* NOS DISPONIBILITÉS + NOS ENGAGEMENTS */}
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Nos disponibilités</span>
              <p className="text-4xl font-extrabold text-primary mb-3">+10 MW</p>
              <p className="text-text-secondary leading-relaxed">
                Francilienne Energy dispose de plus de 10 Méga Watt en stock permanent de panneaux
                solaires (tous produits confondus) et structures de montage à travers nos
                différentes plateformes logistiques.
              </p>
            </div>
            <div className="bg-surface rounded-2xl p-8 border border-border">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Nos engagements</span>
              <p className="text-text-secondary leading-relaxed mb-4">
                Francilienne Energy, c&apos;est avant tout, des produits de qualité, avec un savoir-faire
                reconnu pour l&apos;ensemble de nos solutions. Mais aussi, une équipe de professionnels
                soucieux de répondre aux exigences du marché français.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <ShieldIcon />
                Qualité · Réactivité · Proximité
              </div>
            </div>
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
      className="group relative bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all text-center"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
        style={{ backgroundColor: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{description}</p>
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors mx-auto"
        style={{ color }}
      >
        Voir
        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

/* ===== SVG Icons ===== */
function SolarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}
function InverterIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function MicroInverterIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function StructureIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
    </svg>
  );
}
function HeatIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

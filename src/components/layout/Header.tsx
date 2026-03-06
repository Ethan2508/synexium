"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import CartIcon from "@/components/CartIcon";
import UserGreeting from "@/components/UserGreeting";

/* ==========================================================================
   PRODUCT TABS – Basés sur les catégories réelles du CSV
   ========================================================================== */

const PRODUCT_TABS = [
  {
    label: "Photovoltaïque",
    href: "/catalogue?category=photovoltaique",
    color: "#7fb727",
    brands: [
      { label: "Panneaux Francilienne", href: "/catalogue?family=PANNEAUX+FRANCILIENNE" },
      { label: "Huawei", href: "/catalogue?family=ONDULEURS+HUAWEI" },
      { label: "Solplanet", href: "/catalogue?family=SOLPLANET" },
      { label: "Enphase", href: "/catalogue?family=ENPHASE" },
      { label: "Hoymiles", href: "/catalogue?family=HOYMILES" },
      { label: "AP Systems", href: "/catalogue?family=AP+SYSTEM" },
    ],
  },
  {
    label: "Stockage",
    href: "/catalogue?category=stockage",
    color: "#eea400",
    brands: [
      { label: "Huawei", href: "/catalogue?family=STOCKAGE+HUAWEI" },
      { label: "Hoymiles", href: "/catalogue?family=STOCKAGE+HOYMILES" },
    ],
  },
  {
    label: "Système de fixation",
    href: "/catalogue?category=systeme-de-fixation",
    color: "#555555",
    brands: [
      { label: "K2 Systems", href: "/catalogue?family=K2+ET+ACIER" },
      { label: "GSE", href: "/catalogue?search=gse" },
      { label: "Francilienne", href: "/catalogue?family=INTEGRATION+FRANCILIENNE" },
      { label: "Carport", href: "/catalogue?family=CARPORT" },
    ],
  },
  {
    label: "Pompes à chaleur",
    href: "/catalogue?category=pompes-a-chaleur",
    color: "#e6332a",
    brands: [
      { label: "Airwell", href: "/catalogue?search=airwell" },
      { label: "Ariston", href: "/catalogue?search=ariston" },
      { label: "Panasonic", href: "/catalogue?search=panasonic" },
      { label: "Ballons", href: "/catalogue?family=BALLONS" },
    ],
  },
  {
    label: "Chauffage",
    href: "/catalogue?category=chauffage",
    color: "#e6332a",
    brands: [
      { label: "Chaudière à granulé", href: "/catalogue?family=CHAUDIERE+A+GRANULE" },
    ],
  },
  {
    label: "Accessoires",
    href: "/catalogue?category=accessoires",
    color: "#009fe3",
    brands: [
      { label: "Boîtiers AC/DC", href: "/catalogue?family=BOITIERS+AC+ET+DC" },
      { label: "Câbles", href: "/catalogue?family=CABLES+ELECTRIQUES" },
      { label: "Protections", href: "/catalogue?family=PROTECTIONS+ELEC" },
      { label: "Domotique", href: "/catalogue?family=DOMOTIQUE" },
    ],
  },
  {
    label: "Mobilité électrique",
    href: "/catalogue?category=mobilite-electrique",
    color: "#00a651",
    brands: [
      { label: "Keba", href: "/catalogue?family=EV+CHARGER+KEBA" },
    ],
  },
  {
    label: "Déstockage",
    href: "/catalogue?search=destockage",
    color: "#e6332a",
    brands: [],
  },
];

/* ==========================================================================
   MOBILE NAV DATA
   ========================================================================== */

const MOBILE_CATEGORIES = PRODUCT_TABS.map((t) => ({
  title: t.label,
  href: t.href,
  color: t.color,
}));

/* ==========================================================================
   HEADER – 2 lignes desktop, même fond partout
   ========================================================================== */

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleTabEnter(index: number) {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveTab(index);
  }

  function handleNavLeave() {
    closeTimeout.current = setTimeout(() => setActiveTab(null), 200);
  }

  function handleDropdownEnter() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }

  function closeAll() {
    setActiveTab(null);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      {/* ── Ligne 1 : Logo · Search · Contact · Blog · Compte ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Francilienne Energy"
              width={180}
              height={48}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {/* Search bar (desktop) */}
          <form
            action="/catalogue"
            method="GET"
            className="hidden lg:flex items-center bg-white/10 rounded-lg px-3 py-2 focus-within:bg-white/20 transition-colors flex-1 max-w-md mx-6"
          >
            <SearchIcon />
            <input
              type="text"
              name="search"
              placeholder="Rechercher un produit, une référence..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder-white/50 ml-2 w-full"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Rechercher"
            >
              <SearchIcon />
            </button>

            <Link
              href="/contact"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors"
            >
              <PhoneIcon />
              <span>Contact</span>
            </Link>

            <Link
              href="/blog"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors"
            >
              <BlogIcon />
              <span>Blog</span>
            </Link>

            <UserGreeting />
            <CartIcon />

            <Link
              href="/compte"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Mon compte"
            >
              <UserIcon />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Ligne 2 : Onglets catégories (desktop) — même fond primary ── */}
      <div
        className="hidden lg:block border-t border-white/15 relative"
        ref={navRef}
        onMouseLeave={handleNavLeave}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {PRODUCT_TABS.map((tab, index) => (
              <div key={tab.label} className="relative">
                <Link
                  href={tab.href}
                  className={`block px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === index
                      ? "text-white border-solar-green bg-white/10"
                      : "text-white/75 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                  onMouseEnter={() => handleTabEnter(index)}
                  onClick={closeAll}
                >
                  {tab.label}
                </Link>
              </div>
            ))}
            <Link
              href="/catalogue"
              className="block px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-wide whitespace-nowrap text-solar-green border-b-2 border-transparent hover:border-solar-green/40 transition-colors ml-auto"
              onClick={closeAll}
            >
              Tout voir →
            </Link>
          </div>
        </div>

        {/* Dropdown marques */}
        {activeTab !== null && PRODUCT_TABS[activeTab].brands.length > 0 && (
          <div
            className="absolute left-0 right-0 bg-primary border-t border-white/10 shadow-lg z-50"
            onMouseEnter={handleDropdownEnter}
          >
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {PRODUCT_TABS[activeTab].brands.map((brand) => (
                  <Link
                    key={brand.href}
                    href={brand.href}
                    className="px-4 py-1.5 text-sm font-medium text-white/80 bg-white/10 rounded-lg hover:bg-solar-green hover:text-white transition-colors border border-white/15 hover:border-solar-green"
                    onClick={closeAll}
                  >
                    {brand.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="lg:hidden px-6 py-3 border-t border-white/10">
          <form
            action="/catalogue"
            method="GET"
            className="flex items-center bg-white/10 rounded-lg px-3 py-2"
          >
            <SearchIcon />
            <input
              type="text"
              name="search"
              placeholder="Rechercher un produit, SKU..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder-white/50 ml-2 w-full"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Nos produits</p>
              {MOBILE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  onClick={closeAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.title}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
              <MobileNavLink href="/catalogue" onClick={closeAll}>
                Tout le catalogue
              </MobileNavLink>
              <MobileNavLink href="/marques" onClick={closeAll}>
                Nos marques
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={closeAll}>
                Contact
              </MobileNavLink>
              <MobileNavLink href="/blog" onClick={closeAll}>
                Blog
              </MobileNavLink>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ===== Sub-components ===== */

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
    >
      {children}
    </Link>
  );
}

/* ===== Icons ===== */
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}
function BlogIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V8.625c0-.621.504-1.125 1.125-1.125H7.5" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

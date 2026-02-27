"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import CartIcon from "@/components/CartIcon";
import UserGreeting from "@/components/UserGreeting";

/* ==========================================================================
   MEGA MENU DATA - Catégories de produits
   ========================================================================== */

const MENU_CATEGORIES = [
  {
    title: "Solaire",
    slug: "photovoltaique",
    color: "#7fb727",
    sections: [
      {
        title: "Panneaux solaires",
        links: [
          { label: "Panneaux Francilienne", href: "/catalogue?family=PANNEAUX+FRANCILIENNE" },
        ],
      },
      {
        title: "Onduleurs & Micro-onduleurs",
        links: [
          { label: "Micro-onduleurs Enphase", href: "/catalogue?family=ENPHASE" },
          { label: "Micro-onduleurs Hoymiles", href: "/catalogue?family=HOYMILES" },
          { label: "Micro-onduleurs AP System", href: "/catalogue?family=AP+SYSTEM" },
          { label: "Onduleurs Huawei", href: "/catalogue?family=ONDULEURS+HUAWEI" },
          { label: "Onduleurs Solplanet", href: "/catalogue?family=SOLPLANET" },
        ],
      },
      {
        title: "Stockage",
        links: [
          { label: "Huawei", href: "/catalogue?family=STOCKAGE+HUAWEI" },
          { label: "Hoymiles", href: "/catalogue?family=STOCKAGE+HOYMILES" },
          { label: "Solplanet", href: "/catalogue?search=stockage+solplanet" },
        ],
      },
      {
        title: "Intégration & Fixation",
        links: [
          { label: "Structures K2 Systems", href: "/catalogue?family=K2+ET+ACIER" },
          { label: "Intégration Francilienne", href: "/catalogue?family=INTEGRATION+FRANCILIENNE" },
          { label: "GSE In-Roof", href: "/catalogue?family=COMPOSANTS+GSE+INROOF" },
          { label: "Carports solaires", href: "/catalogue?family=CARPORT" },
          { label: "Boîtiers AC/DC", href: "/catalogue?family=BOITIERS+AC+ET+DC" },
        ],
      },
    ],
  },
  {
    title: "ECS",
    slug: "ecs",
    color: "#009fe3",
    sections: [
      {
        title: "Eau Chaude Sanitaire",
        links: [
          { label: "Ballons thermodynamiques", href: "/catalogue?family=BALLONS" },
        ],
      },
    ],
  },
  {
    title: "Pompes à chaleur",
    slug: "chauffage",
    color: "#e6332a",
    sections: [
      {
        title: "PAC Air-Eau",
        links: [
          { label: "Airwell Wellea", href: "/catalogue?search=airwell+wellea" },
          { label: "Ariston Nimbus", href: "/catalogue?search=ariston+nimbus" },
          { label: "Panasonic Aquarea", href: "/catalogue?search=panasonic+aquarea" },
        ],
      },
      {
        title: "PAC Air-Air",
        links: [
          { label: "Airwell HDL", href: "/catalogue?search=airwell+hdl" },
        ],
      },
    ],
  },
  {
    title: "Accessoires & Câblage",
    slug: "accessoires",
    color: "#555",
    sections: [
      {
        title: "Câbles",
        links: [
          { label: "Câbles solaires", href: "/catalogue?family=CABLES+ELECTRIQUES" },
          { label: "Connectiques MC4", href: "/catalogue?search=mc4" },
        ],
      },
      {
        title: "Protection électrique",
        links: [
          { label: "Disjoncteurs", href: "/catalogue?family=PROTECTIONS+ELEC" },
          { label: "Parafoudres", href: "/catalogue?search=parafoudre" },
        ],
      },
      {
        title: "Autres",
        links: [
          { label: "Accessoires PAC", href: "/catalogue?family=PAC+ACCESSOIRES" },
          { label: "Bornes de recharge", href: "/catalogue?family=EV+CHARGER+KEBA" },
          { label: "Domotique", href: "/catalogue?family=DOMOTIQUE" },
          { label: "GSE Ground System", href: "/catalogue?family=COMPOSANTS+GSE+GROUNDSYSTEM" },
        ],
      },
    ],
  },
];

/* ==========================================================================
   MEGA MENU DATA - Marques
   ========================================================================== */

const BRAND_CATEGORIES = [
  {
    title: "Photovoltaïque",
    brands: [
      { label: "Enphase", href: "/catalogue?family=ENPHASE" },
      { label: "Hoymiles", href: "/catalogue?family=HOYMILES" },
      { label: "AP Systems", href: "/catalogue?family=AP+SYSTEM" },
      { label: "Huawei", href: "/catalogue?family=ONDULEURS+HUAWEI" },
      { label: "Solplanet", href: "/catalogue?family=SOLPLANET" },
    ],
  },
  {
    title: "Chauffage & Climatisation",
    brands: [
      { label: "Airwell", href: "/catalogue?search=airwell" },
      { label: "Ariston", href: "/catalogue?search=ariston" },
      { label: "Atlantic", href: "/catalogue?search=atlantic" },
      { label: "Chaffoteaux", href: "/catalogue?search=chaffoteaux" },
      { label: "Domusa", href: "/catalogue?search=domusa" },
    ],
  },
  {
    title: "Intégration & Structure",
    brands: [
      { label: "K2 Systems", href: "/catalogue?family=K2+ET+ACIER" },
      { label: "GSE", href: "/catalogue?search=gse" },
    ],
  },
  {
    title: "Électrique & Domotique",
    brands: [
      { label: "Eaton", href: "/catalogue?search=eaton" },
      { label: "Keba", href: "/catalogue?family=EV+CHARGER+KEBA" },
    ],
  },
];

/* ==========================================================================
   MEGA MENU DATA - Kits
   ========================================================================== */

const KIT_SECTIONS = [
  {
    title: "Kits solaires",
    links: [
      { label: "Kit autoconsommation", href: "/catalogue?search=kit+autoconsommation" },
      { label: "Kit résidentiel", href: "/catalogue?search=kit+residentiel" },
      { label: "Kit professionnel", href: "/catalogue?search=kit+professionnel" },
    ],
  },
  {
    title: "Kits PAC",
    links: [
      { label: "Kit pompe à chaleur", href: "/catalogue?search=kit+pac" },
      { label: "Kit ballon thermodynamique", href: "/catalogue?search=kit+ballon" },
    ],
  },
  {
    title: "Sur mesure",
    links: [
      { label: "Kit sur mesure", href: "/contact" },
    ],
  },
];

/* ==========================================================================
   Types
   ========================================================================== */

type MenuType = "catalogue" | "marques" | "kits" | null;

/* ==========================================================================
   HEADER
   ========================================================================== */

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMouseEnterCategory(index: number) {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setActiveCategory(index);
  }

  function handleMouseLeaveMenu() {
    megaMenuTimeout.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveCategory(null);
    }, 200);
  }

  function handleMouseEnterDropdown() {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
  }

  function openMenu(menu: MenuType) {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setActiveMenu(menu);
    setActiveCategory(menu === "catalogue" ? 0 : null);
  }

  function closeAllMenus() {
    setActiveMenu(null);
    setActiveCategory(null);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt="Francilienne Energy"
              width={180}
              height={48}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1 text-sm font-medium relative"
            ref={megaMenuRef}
            onMouseLeave={handleMouseLeaveMenu}
          >
            {/* Catalogue trigger */}
            <button
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeMenu === "catalogue" ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onMouseEnter={() => openMenu("catalogue")}
            >
              Catalogue
              <ChevronDownIcon />
            </button>

            {/* Marques trigger */}
            <button
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeMenu === "marques" ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onMouseEnter={() => openMenu("marques")}
            >
              Nos marques
              <ChevronDownIcon />
            </button>

            {/* Kits trigger */}
            <button
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeMenu === "kits" ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onMouseEnter={() => openMenu("kits")}
            >
              Nos kits
              <ChevronDownIcon />
            </button>

            <NavLink href="/contact">Contact</NavLink>

            {/* ===== MEGA MENU: Catalogue ===== */}
            {activeMenu === "catalogue" && (
              <div
                className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 flex"
                style={{ minWidth: "900px" }}
                onMouseEnter={handleMouseEnterDropdown}
              >
                {/* Category sidebar */}
                <div className="w-56 bg-gray-50 rounded-l-xl py-3 border-r border-gray-200">
                  {MENU_CATEGORIES.map((cat, index) => (
                    <button
                      key={cat.title}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between group ${
                        activeCategory === index
                          ? "bg-white text-primary"
                          : "text-gray-700 hover:bg-white hover:text-primary"
                      }`}
                      onMouseEnter={() => handleMouseEnterCategory(index)}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.title}
                      </span>
                      <ChevronRightIcon />
                    </button>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      href="/catalogue"
                      className="block px-5 py-3 text-sm font-semibold text-primary hover:bg-white transition-colors rounded-md mx-2"
                      onClick={closeAllMenus}
                    >
                      Voir tout le catalogue
                    </Link>
                  </div>
                </div>

                {/* Sections content */}
                <div className="flex-1 p-6">
                  {activeCategory !== null && (
                    <div className="grid grid-cols-3 gap-8">
                      {MENU_CATEGORIES[activeCategory].sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {section.title}
                          </h4>
                          <ul className="space-y-1">
                            {section.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md px-2 py-1.5 transition-colors"
                                  onClick={closeAllMenus}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeCategory === null && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Survolez une catégorie pour voir les produits</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== MEGA MENU: Marques ===== */}
            {activeMenu === "marques" && (
              <div
                className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 p-6"
                style={{ minWidth: "700px" }}
                onMouseEnter={handleMouseEnterDropdown}
              >
                <div className="grid grid-cols-2 gap-8">
                  {BRAND_CATEGORIES.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {group.title}
                      </h4>
                      <ul className="space-y-1">
                        {group.brands.map((brand) => (
                          <li key={brand.href}>
                            <Link
                              href={brand.href}
                              className="block text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md px-2 py-1.5 transition-colors"
                              onClick={closeAllMenus}
                            >
                              {brand.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-3">
                  <Link
                    href="/marques"
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    onClick={closeAllMenus}
                  >
                    Voir toutes les marques &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* ===== MEGA MENU: Kits ===== */}
            {activeMenu === "kits" && (
              <div
                className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 p-6"
                style={{ minWidth: "600px" }}
                onMouseEnter={handleMouseEnterDropdown}
              >
                <div className="grid grid-cols-3 gap-8">
                  {KIT_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {section.title}
                      </h4>
                      <ul className="space-y-1">
                        {section.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md px-2 py-1.5 transition-colors"
                              onClick={closeAllMenus}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Search + actions */}
          <div className="flex items-center gap-2">
            {/* Search bar (desktop) */}
            <form
              action="/catalogue"
              method="GET"
              className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-2 focus-within:bg-white/20 transition-colors"
            >
              <SearchIcon />
              <input
                type="text"
                name="search"
                placeholder="Rechercher un produit, SKU..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/50 ml-2 w-48 focus:w-64 transition-all"
              />
            </form>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Rechercher"
            >
              <SearchIcon />
            </button>

            {/* Greeting */}
            <UserGreeting />

            {/* Cart */}
            <CartIcon />

            {/* Account */}
            <Link
              href="/compte"
              className="hidden sm:flex px-4 py-2 text-sm font-semibold bg-solar-green text-white rounded-lg hover:bg-solar-green/90 transition-colors"
            >
              Mon compte
            </Link>
            <Link
              href="/compte"
              className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Mon compte"
            >
              <UserIcon />
            </Link>

            {/* Mobile burger */}
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

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden bg-primary-dark px-6 py-3">
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
        <nav className="lg:hidden bg-primary-dark border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Mobile categories */}
            <div className="mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Catalogue</p>
              {MENU_CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={`/catalogue?category=${cat.slug}`}
                  onClick={closeAllMenus}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
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
              <MobileNavLink href="/catalogue" onClick={closeAllMenus}>
                Tout le catalogue
              </MobileNavLink>
              <MobileNavLink href="/marques" onClick={closeAllMenus}>
                Nos marques
              </MobileNavLink>
              <MobileNavLink href="/catalogue?search=kit" onClick={closeAllMenus}>
                Nos kits
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={closeAllMenus}>
                Contact
              </MobileNavLink>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ===== Sub-components ===== */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  );
}

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
function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import CartIcon from "@/components/CartIcon";

/* ==========================================================================
   MEGA MENU - Catégories de produits
   ========================================================================== */

const MENU_CATEGORIES = [
  {
    title: "Photovoltaïque",
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
          { label: "Batteries Huawei", href: "/catalogue?family=STOCKAGE+HUAWEI" },
          { label: "Batteries Hoymiles", href: "/catalogue?family=STOCKAGE+HOYMILES" },
          { label: "Batteries Solplanet", href: "/catalogue?search=batterie+solplanet" },
        ],
      },
    ],
  },
  {
    title: "Intégration & Fixation",
    color: "#555",
    sections: [
      {
        title: "Surimposition",
        links: [
          { label: "Structures K2 Systems", href: "/catalogue?family=K2+ET+ACIER" },
          { label: "Intégration Francilienne", href: "/catalogue?family=INTEGRATION+FRANCILIENNE" },
        ],
      },
      {
        title: "Intégration toiture",
        links: [
          { label: "GSE In-Roof", href: "/catalogue?family=COMPOSANTS+GSE+INROOF" },
          { label: "GSE Ground System", href: "/catalogue?family=COMPOSANTS+GSE+GROUNDSYSTEM" },
        ],
      },
      {
        title: "Autres",
        links: [
          { label: "Carports solaires", href: "/catalogue?family=CARPORT" },
          { label: "Boîtiers AC/DC", href: "/catalogue?family=BOITIERS+AC+ET+DC" },
        ],
      },
    ],
  },
  {
    title: "Pompes à chaleur",
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
      {
        title: "Eau chaude sanitaire",
        links: [
          { label: "Ballons thermodynamiques", href: "/catalogue?family=BALLONS" },
        ],
      },
    ],
  },
  {
    title: "Accessoires & Câblage",
    color: "#009fe3",
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
        ],
      },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fermer le mega menu si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
        setActiveCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMouseEnterCategory(index: number) {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
    setActiveCategory(index);
  }

  function handleMouseLeaveMenu() {
    megaMenuTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveCategory(null);
    }, 150);
  }

  function handleMouseEnterDropdown() {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      {/* Top bar */}
      <div className="bg-primary-dark text-xs text-white/70 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between">
          <span>Distributeur B2B - Installateurs et bureaux d'études</span>
          <span>Lun-Ven 8h30-18h | 04 72 68 72 38</span>
        </div>
      </div>

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
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop nav with Mega Menu */}
          <nav
            className="hidden lg:flex items-center gap-1 text-sm font-medium relative"
            ref={megaMenuRef}
            onMouseLeave={handleMouseLeaveMenu}
          >
            {/* Catalogue dropdown trigger */}
            <div className="relative">
              <button
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
                onMouseEnter={() => setMegaMenuOpen(true)}
              >
                Catalogue
                <ChevronDownIcon />
              </button>
            </div>

            <NavLink href="/marques">Marques</NavLink>
            <NavLink href="/documents">Documents</NavLink>
            <NavLink href="/support">Support</NavLink>

            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 flex"
                style={{ minWidth: "800px" }}
                onMouseEnter={handleMouseEnterDropdown}
              >
                {/* Categories sidebar */}
                <div className="w-56 bg-gray-50 rounded-l-xl py-3 border-r border-gray-200">
                  {MENU_CATEGORIES.map((cat, index) => (
                    <button
                      key={cat.title}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                        activeCategory === index
                          ? "bg-white text-primary"
                          : "text-gray-700 hover:bg-white hover:text-primary"
                      }`}
                      onMouseEnter={() => handleMouseEnterCategory(index)}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
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
                      className="block px-5 py-3 text-sm font-semibold text-primary hover:bg-white transition-colors"
                      onClick={() => setMegaMenuOpen(false)}
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
                          <ul className="space-y-2">
                            {section.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="text-sm text-gray-700 hover:text-primary transition-colors"
                                  onClick={() => setMegaMenuOpen(false)}
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
          </nav>

          {/* Search + actions */}
          <div className="flex items-center gap-2">
            {/* Search bar (desktop) */}
            <form action="/catalogue" method="GET" className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-2 focus-within:bg-white/20 transition-colors">
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

            {/* Cart */}
            <CartIcon />

            {/* Account */}
            <Link
              href="/auth/login"
              className="hidden sm:flex px-4 py-2 text-sm font-semibold bg-solar-green text-white rounded-lg hover:bg-solar-green/90 transition-colors"
            >
              Mon compte
            </Link>
            <Link
              href="/auth/login"
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
          <form action="/catalogue" method="GET" className="flex items-center bg-white/10 rounded-lg px-3 py-2">
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
                  href={`/catalogue?category=${encodeURIComponent(cat.title)}`}
                  onClick={() => setMenuOpen(false)}
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
              <MobileNavLink href="/catalogue" onClick={() => setMenuOpen(false)}>
                Tout le catalogue
              </MobileNavLink>
              <MobileNavLink href="/marques" onClick={() => setMenuOpen(false)}>
                Marques
              </MobileNavLink>
              <MobileNavLink href="/documents" onClick={() => setMenuOpen(false)}>
                Documents
              </MobileNavLink>
              <MobileNavLink href="/support" onClick={() => setMenuOpen(false)}>
                Support
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const total = data.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
          setCartCount(total);
        }
        // 401 = non connecté, pas d'erreur à afficher
      } catch {
        // Erreur réseau ignorée silencieusement
      }
    }

    fetchCartCount();

    // Rafraîchir le compteur toutes les 30s
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/panier"
      className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Panier"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-solar-yellow text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </Link>
  );
}

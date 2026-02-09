"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const isAuthenticated = useRef<boolean | null>(null);

  const fetchCartCount = useCallback(async () => {
    // Si on sait déjà que l'utilisateur n'est pas connecté, ne pas appeler l'API
    if (isAuthenticated.current === false) return;

    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        isAuthenticated.current = true;
        const data = await res.json();
        const total = data.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
        setCartCount(total);
      } else if (res.status === 401 || res.status === 403) {
        // Non connecté ou pas ACTIVE — arrêter le polling
        isAuthenticated.current = false;
        setCartCount(0);
      }
    } catch {
      // Erreur réseau ignorée silencieusement
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    // Écouter les mises à jour du panier (force un re-fetch même si non-auth)
    const handleCartUpdate = () => {
      isAuthenticated.current = null; // reset pour permettre un nouvel appel
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Rafraîchir toutes les 60s uniquement si authentifié
    const interval = setInterval(() => {
      if (isAuthenticated.current === true) {
        fetchCartCount();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [fetchCartCount]);

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

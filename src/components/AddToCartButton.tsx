"use client";

import { useState } from "react";

interface AddToCartButtonProps {
  variantId: string;
  stock: number;
}

export default function AddToCartButton({ variantId, stock }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = stock <= 0;

  async function handleAddToCart() {
    if (outOfStock || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'ajout au panier");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (outOfStock) {
    return (
      <span className="shrink-0 px-4 py-2.5 text-xs font-semibold text-heatpump-red border border-heatpump-red/30 rounded-lg">
        Rupture de stock
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Sélecteur de quantité */}
      <div className="flex items-center border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-2.5 py-2 text-sm font-bold text-text-secondary hover:bg-surface transition-colors"
          disabled={loading}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={Math.floor(stock)}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= Math.floor(stock)) {
              setQuantity(val);
            }
          }}
          className="w-12 text-center text-sm font-semibold border-x border-border py-2 focus:outline-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(Math.floor(stock), q + 1))}
          className="px-2.5 py-2 text-sm font-bold text-text-secondary hover:bg-surface transition-colors"
          disabled={loading}
        >
          +
        </button>
      </div>

      {/* Bouton ajouter */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${
          success
            ? "bg-solar-green text-white"
            : "bg-primary text-white hover:bg-primary-dark"
        } disabled:opacity-50`}
      >
        {loading ? "…" : success ? "✓ Ajouté" : "+ Panier"}
      </button>

      {error && (
        <span className="text-xs text-heatpump-red max-w-[140px] leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}

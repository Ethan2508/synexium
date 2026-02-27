"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  variantId: string;
  stock: number;
}

export default function AddToCartButton({ variantId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stock alert state
  const [hasAlert, setHasAlert] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const outOfStock = stock <= 0;

  // Vérifier si une alerte existe déjà pour cette variante
  useEffect(() => {
    if (!outOfStock) return;
    fetch(`/api/stock-alerts?variantId=${variantId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hasAlert) setHasAlert(true);
      })
      .catch(() => {});
  }, [variantId, outOfStock]);

  async function handleStockAlert() {
    setAlertLoading(true);
    setAlertMsg(null);
    try {
      if (hasAlert) {
        await fetch(`/api/stock-alerts?variantId=${variantId}`, { method: "DELETE" });
        setHasAlert(false);
        setAlertMsg("Alerte désactivée.");
      } else {
        const res = await fetch("/api/stock-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId }),
        });
        if (res.status === 401) {
          router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        setHasAlert(true);
        setAlertMsg("Vous serez prévenu par email !");
      }
    } catch {
      setAlertMsg("Erreur, réessayez.");
    } finally {
      setAlertLoading(false);
    }
  }

  async function handleAddToCart() {
    if (outOfStock || loading) return;
    setLoading(true);
    setError(null);

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

      setShowModal(true);
      
      // Forcer le rechargement du compteur panier dans le header
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (outOfStock) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="px-4 py-2.5 text-xs font-semibold text-heatpump-red border border-heatpump-red/30 rounded-lg">
          Rupture de stock
        </span>
        <button
          type="button"
          onClick={handleStockAlert}
          disabled={alertLoading}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
            hasAlert
              ? "bg-solar-green/10 text-solar-green border border-solar-green/30 hover:bg-heatpump-red/10 hover:text-heatpump-red hover:border-heatpump-red/30"
              : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
          } disabled:opacity-50`}
        >
          {alertLoading ? "…" : hasAlert ? "✓ Alerte activée" : "🔔 M'alerter"}
        </button>
        {alertMsg && <span className="text-xs text-text-secondary">{alertMsg}</span>}
      </div>
    );
  }

  return (
    <>
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
          className="px-4 py-2.5 text-sm font-bold rounded-lg transition-colors bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "…" : "+ Panier"}
        </button>

        {error && (
          <span className="text-xs text-heatpump-red max-w-[140px] leading-tight">
            {error}
          </span>
        )}
      </div>

      {/* Modale de confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-solar-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-solar-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Produit ajouté au panier
              </h3>
              <p className="text-text-secondary text-sm">
                {quantity} article{quantity > 1 ? "s" : ""} ajouté{quantity > 1 ? "s" : ""} avec succès
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all"
              >
                Continuer mes achats
              </button>
              <button
                onClick={() => router.push("/panier")}
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg"
              >
                Voir le panier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

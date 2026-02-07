"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    designation: string;
    powerKw: number | null;
    capacity: number | null;
    realStock: number;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    family: string;
    image: { url: string; alt: string } | null;
  };
  unitPriceHT: number;
  totalHT: number;
};

type CartData = {
  items: CartItem[];
  itemCount: number;
  totalHT: number;
  totalTTC: number;
};

export default function PanierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/auth/login?redirect=/panier");
        return;
      }
      if (res.status === 403) {
        setError("Votre compte doit être validé pour accéder au panier.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCart(data);
    } catch {
      setError("Erreur lors du chargement du panier.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (variantId: string, quantity: number) => {
    setUpdating(variantId);
    try {
      if (quantity < 1) {
        await fetch(`/api/cart?variantId=${variantId}`, { method: "DELETE" });
      } else {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity }),
        });
      }
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (variantId: string) => {
    setUpdating(variantId);
    try {
      await fetch(`/api/cart?variantId=${variantId}`, { method: "DELETE" });
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const placeOrder = async () => {
    setOrdering(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push(`/compte/commandes/${data.order.id}?success=1`);
    } catch {
      setError("Erreur lors de la commande.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{error}</h1>
          <Link href="/compte" className="text-primary hover:underline">
            Voir mon compte →
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Votre panier est vide</h1>
          <p className="text-text-secondary mb-6">Découvrez notre catalogue de produits</p>
          <Link
            href="/catalogue"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold">Mon panier</h1>
          <p className="text-white/60 mt-1">{cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-heatpump-red/10 border border-heatpump-red/20 rounded-lg text-heatpump-red text-sm">
            {error}
          </div>
        )}

        <div className="lg:flex gap-8">
          {/* Articles */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-border p-4 flex gap-4"
              >
                {/* Image */}
                <Link href={`/produits/${item.product.slug}`} className="shrink-0">
                  <div className="w-20 h-20 bg-surface rounded-lg flex items-center justify-center">
                    {item.product.image ? (
                      <img
                        src={item.product.image.url}
                        alt={item.product.image.alt}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl opacity-30">📦</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/produits/${item.product.slug}`}>
                    <h3 className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-text-secondary">
                    {item.variant.powerKw
                      ? `${item.variant.powerKw} kW`
                      : item.variant.capacity
                      ? `${item.variant.capacity} L`
                      : item.variant.designation}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">SKU : {item.variant.sku}</p>

                  {/* Quantité */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      disabled={updating === item.variant.id}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      disabled={updating === item.variant.id}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.variant.id)}
                      disabled={updating === item.variant.id}
                      className="ml-4 text-xs text-heatpump-red hover:underline disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Prix */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-primary">
                    {item.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </div>
                  <div className="text-xs text-text-secondary">HT</div>
                  <div className="text-xs text-text-secondary mt-1">
                    {item.unitPriceHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € / unité
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif */}
          <div className="lg:w-80 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h3 className="font-bold text-text-primary mb-4">Récapitulatif</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Sous-total HT</span>
                  <span className="font-medium">
                    {cart.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">TVA (20%)</span>
                  <span className="font-medium">
                    {(cart.totalTTC - cart.totalHT).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-border flex justify-between">
                  <span className="font-bold text-text-primary">Total TTC</span>
                  <span className="font-bold text-lg text-primary">
                    {cart.totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={ordering}
                className="w-full mt-6 px-6 py-3 bg-solar-green text-white font-bold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {ordering ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Validation...
                  </>
                ) : (
                  "Valider la commande"
                )}
              </button>

              <p className="text-xs text-text-secondary text-center mt-4">
                En validant, vous acceptez nos conditions générales de vente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

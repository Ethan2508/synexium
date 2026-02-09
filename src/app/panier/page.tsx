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
  
  // Delivery options
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [pickupLocation, setPickupLocation] = useState<"LYON" | "PARIS">("LYON");
  const [deliveryCompany, setDeliveryCompany] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryPostal, setDeliveryPostal] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

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
    
    // Validation
    if (deliveryMethod === "DELIVERY") {
      if (!deliveryCompany.trim() || !deliveryStreet.trim() || !deliveryPostal.trim() || !deliveryCity.trim()) {
        setError("Veuillez remplir tous les champs de l'adresse de livraison.");
        setOrdering(false);
        return;
      }
      
      // Validation format code postal français
      const postalRegex = /^\d{5}$/;
      if (!postalRegex.test(deliveryPostal)) {
        setError("Le code postal doit contenir 5 chiffres.");
        setOrdering(false);
        return;
      }
    }
    
    const deliveryAddress = deliveryMethod === "DELIVERY" 
      ? `${deliveryCompany}\n${deliveryStreet}\n${deliveryPostal} ${deliveryCity}`
      : null;
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          pickupLocation: deliveryMethod === "PICKUP" ? pickupLocation : null,
          deliveryAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Une erreur est survenue lors de la validation de votre commande.");
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
          <div className="lg:w-80 mt-6 lg:mt-0 space-y-4">
            {/* Mode de livraison */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-text-primary mb-4">Mode de récupération</h3>
              
              <div className="space-y-3">
                {/* Livraison */}
                <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  deliveryMethod === "DELIVERY" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                }`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="DELIVERY"
                    checked={deliveryMethod === "DELIVERY"}
                    onChange={(e) => setDeliveryMethod(e.target.value as "DELIVERY" | "PICKUP")}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      Livraison
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Livraison en Île-de-France sous 24-48h
                    </div>
                  </div>
                </label>

                {/* Pickup */}
                <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  deliveryMethod === "PICKUP" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30"
                }`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="PICKUP"
                    checked={deliveryMethod === "PICKUP"}
                    onChange={(e) => setDeliveryMethod(e.target.value as "DELIVERY" | "PICKUP")}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Retrait en magasin
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Retrait gratuit sous 24h
                    </div>
                  </div>
                </label>
              </div>

              {/* Adresse livraison */}
              {deliveryMethod === "DELIVERY" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={deliveryCompany}
                      onChange={(e) => setDeliveryCompany(e.target.value)}
                      placeholder="Synexium SARL"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Rue et numéro *
                    </label>
                    <input
                      type="text"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      placeholder="218 Avenue Franklin Roosevelt"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        value={deliveryPostal}
                        onChange={(e) => setDeliveryPostal(e.target.value)}
                        placeholder="69120"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="Vaulx-en-Velin"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Choix magasin pickup */}
              {deliveryMethod === "PICKUP" && (
                <div className="mt-4 space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    pickupLocation === "LYON" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/30"
                  }`}>
                    <input
                      type="radio"
                      name="pickupLocation"
                      value="LYON"
                      checked={pickupLocation === "LYON"}
                      onChange={(e) => setPickupLocation(e.target.value as "LYON" | "PARIS")}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-text-primary">Synexium Lyon</div>
                      <div className="text-text-secondary text-xs mt-0.5">
                        218 Av. Franklin Roosevelt<br />
                        69120 Vaulx-en-Velin
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    pickupLocation === "PARIS" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/30"
                  }`}>
                    <input
                      type="radio"
                      name="pickupLocation"
                      value="PARIS"
                      checked={pickupLocation === "PARIS"}
                      onChange={(e) => setPickupLocation(e.target.value as "LYON" | "PARIS")}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-text-primary">Synexium Paris</div>
                      <div className="text-text-secondary text-xs mt-0.5">
                        16 Av. du Valquiou, Bât. C<br />
                        93290 Tremblay
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Totaux */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
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

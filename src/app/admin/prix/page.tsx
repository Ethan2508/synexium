"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  company: string;
}

interface Variant {
  id: string;
  sku: string;
  designation: string;
  catalogPriceHT: number | null;
  product: { name: string; family: string };
}

interface CustomerPrice {
  id: string;
  priceType: "FIXED" | "PERCENTAGE";
  value: number;
  startDate: string | null;
  endDate: string | null;
  customer: User;
  variant: Variant;
}

export default function AdminPrixPage() {
  const [prices, setPrices] = useState<CustomerPrice[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [selectedClient, setSelectedClient] = useState("");
  const [searchVariant, setSearchVariant] = useState("");

  // Formulaire ajout
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    variantId: "",
    priceType: "FIXED" as "FIXED" | "PERCENTAGE",
    value: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  // Charger les clients ACTIVE
  useEffect(() => {
    fetch("/api/admin/clients?status=ACTIVE")
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .catch(() => {});
  }, []);

  // Charger les variantes
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const allVariants: Variant[] = [];
        for (const p of d.products || []) {
          for (const v of p.variants || []) {
            allVariants.push({
              id: v.id,
              sku: v.sku,
              designation: v.designation,
              catalogPriceHT: v.catalogPriceHT,
              product: { name: p.name, family: p.family },
            });
          }
        }
        setVariants(allVariants);
      })
      .catch(() => {});
  }, []);

  // Charger les prix
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedClient) params.set("clientId", selectedClient);

    fetch(`/api/admin/prices?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPrices(d.prices || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur de chargement");
        setLoading(false);
      });
  }, [selectedClient]);

  // Filtrer variantes pour la recherche
  const filteredVariants = variants.filter(
    (v) =>
      v.sku.toLowerCase().includes(searchVariant.toLowerCase()) ||
      v.designation.toLowerCase().includes(searchVariant.toLowerCase()) ||
      v.product.name.toLowerCase().includes(searchVariant.toLowerCase())
  );

  // Créer un prix
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          variantId: formData.variantId,
          type: formData.priceType,
          value: parseFloat(formData.value),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }

      // Recharger
      const pricesRes = await fetch(
        `/api/admin/prices${selectedClient ? `?clientId=${selectedClient}` : ""}`
      );
      const pricesData = await pricesRes.json();
      setPrices(pricesData.prices || []);

      setFormData({
        customerId: "",
        variantId: "",
        priceType: "FIXED",
        value: "",
        startDate: "",
        endDate: "",
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  // Supprimer un prix
  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce prix personnalisé ?")) return;

    try {
      const res = await fetch(`/api/admin/prices?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");

      setPrices((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Erreur lors de la suppression");
    }
  }

  // Prix affiché
  function formatPrice(price: CustomerPrice) {
    if (price.priceType === "FIXED") {
      return `${price.value.toFixed(2)} € HT`;
    }
    const basePrice = price.variant.catalogPriceHT || 0;
    const finalPrice = basePrice * (1 - price.value / 100);
    return `${finalPrice.toFixed(2)} € HT (-${price.value}%)`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse text-center py-20">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:underline text-sm">
              ← Retour admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Gestion des Prix Clients
            </h1>
            <p className="text-gray-600 text-sm">
              Configurez des prix personnalisés par client et produit
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? "Annuler" : "+ Ajouter un prix"}
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Formulaire ajout */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">
              Nouveau prix personnalisé
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produit / Variante *
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher SKU, nom..."
                    value={searchVariant}
                    onChange={(e) => setSearchVariant(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                  />
                  <select
                    value={formData.variantId}
                    onChange={(e) =>
                      setFormData({ ...formData, variantId: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 max-h-40"
                  >
                    <option value="">Sélectionner une variante</option>
                    {filteredVariants.slice(0, 50).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.sku} - {v.designation} ({v.catalogPriceHT?.toFixed(2) || "N/A"} €)
                      </option>
                    ))}
                  </select>
                  {filteredVariants.length > 50 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredVariants.length - 50} autres résultats...
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de prix
                  </label>
                  <select
                    value={formData.priceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceType: e.target.value as "FIXED" | "PERCENTAGE",
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="FIXED">Prix fixe (€)</option>
                    <option value="PERCENTAGE">Remise (%)</option>
                  </select>
                </div>

                {/* Valeur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.priceType === "FIXED" ? "Prix HT (€)" : "Remise (%)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder={formData.priceType === "FIXED" ? "99.90" : "10"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Date début */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valide à partir de
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Date fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Créer le prix"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Tous les clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Client
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Produit
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    SKU
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Prix catalogue
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Prix client
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Validité
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      Aucun prix personnalisé configuré
                    </td>
                  </tr>
                ) : (
                  prices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {price.customer.company}
                        </div>
                        <div className="text-xs text-gray-500">
                          {price.customer.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {price.variant.product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {price.variant.designation}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {price.variant.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {price.variant.catalogPriceHT?.toFixed(2) || "-"} € HT
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-green-700">
                          {formatPrice(price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {price.startDate || price.endDate ? (
                          <>
                            {price.startDate &&
                              new Date(price.startDate).toLocaleDateString("fr-FR")}
                            {" → "}
                            {price.endDate
                              ? new Date(price.endDate).toLocaleDateString("fr-FR")
                              : "∞"}
                          </>
                        ) : (
                          <span className="text-gray-400">Permanent</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          {prices.length} prix personnalisé{prices.length > 1 ? "s" : ""} configuré
          {prices.length > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Brouillon", color: "text-gray-600", bg: "bg-gray-100" },
  SUBMITTED: { label: "Soumise", color: "text-blue-600", bg: "bg-blue-100" },
  CONFIRMED: { label: "Confirmée", color: "text-purple-600", bg: "bg-purple-100" },
  SHIPPED: { label: "Expédiée", color: "text-orange-600", bg: "bg-orange-100" },
  DELIVERED: { label: "Livrée", color: "text-green-600", bg: "bg-green-100" },
  CANCELLED: { label: "Annulée", color: "text-red-600", bg: "bg-red-100" },
};

const STATUS_FLOW = ["SUBMITTED", "CONFIRMED", "SHIPPED", "DELIVERED"];

type Order = {
  id: string;
  reference: string;
  status: string;
  totalHT: number;
  totalTTC: number;
  notes: string | null;
  createdAt: string;
  deliveryMethod: string | null;
  deliveryAddress: string | null;
  pickupLocation: string | null;
  trackingNumber: string | null;
  invoiceUrl: string | null;
  customer: { company: string; email: string; firstName: string; lastName: string; phone: string | null; address: string | null };
  items: Array<{
    id: string;
    quantity: number;
    unitPriceHT: number;
    totalHT: number;
    variant: { sku: string; designation: string; powerKw: number | null };
  }>;
};

const PICKUP_ADDRESSES: Record<string, string> = {
  LYON: "218 Av. Franklin Roosevelt, 69120 Vaulx-en-Velin",
  PARIS: "16 Avenue du Valquiou, Bâtiment C, 93290 Tremblay-en-France",
};

export default function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  // Tracking & Invoice editing
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [invoiceUrl, setInvoiceUrl] = useState(order.invoiceUrl || "");
  const [savingFields, setSavingFields] = useState(false);
  const [fieldsSaved, setFieldsSaved] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveFields = async () => {
    setSavingFields(true);
    setFieldsSaved(false);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          trackingNumber: trackingNumber || null,
          invoiceUrl: invoiceUrl || null,
        }),
      });
      if (res.ok) {
        setFieldsSaved(true);
        setTimeout(() => setFieldsSaved(false), 3000);
      }
    } finally {
      setSavingFields(false);
    }
  };

  const statusConfig = STATUS_LABELS[status] || STATUS_LABELS.DRAFT;

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Commande {order.reference}</h1>
              <p className="text-white/60 mt-1">
                {order.customer.company} – {order.customer.email}
              </p>
            </div>
            <Link
              href="/admin/commandes"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Statut et actions */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Statut actuel</p>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => {
                const config = STATUS_LABELS[s];
                const isActive = s === status;
                const isPast = STATUS_FLOW.indexOf(s) < STATUS_FLOW.indexOf(status);
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? `${config.bg} ${config.color}`
                        : isPast
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {config.label}
                  </button>
                );
              })}
              <button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={updating || status === "CANCELLED" || status === "DELIVERED"}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        {/* Infos client + Livraison */}
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Infos client */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="font-bold text-text-primary mb-4">Informations client</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary">Société</p>
                <p className="font-medium">{order.customer.company}</p>
              </div>
              <div>
                <p className="text-text-secondary">Contact</p>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
              </div>
              <div>
                <p className="text-text-secondary">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              {order.customer.phone && (
                <div>
                  <p className="text-text-secondary">Téléphone</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
              )}
              <div>
                <p className="text-text-secondary">Date de commande</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-text-secondary text-sm">Notes client</p>
                <p className="text-sm mt-1">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Livraison + Suivi + Facture */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="font-bold text-text-primary mb-4">Livraison</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary">Mode</p>
                <p className="font-medium">
                  {order.deliveryMethod === "PICKUP" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Retrait en magasin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Livraison
                    </span>
                  )}
                </p>
              </div>

              {order.deliveryMethod === "PICKUP" && order.pickupLocation && (
                <div>
                  <p className="text-text-secondary">Magasin de retrait</p>
                  <p className="font-medium">{order.pickupLocation}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {PICKUP_ADDRESSES[order.pickupLocation] || ""}
                  </p>
                </div>
              )}

              {order.deliveryMethod === "DELIVERY" && (
                <div>
                  <p className="text-text-secondary">Adresse de livraison</p>
                  <p className="font-medium">{order.deliveryAddress || order.customer.address || "Non renseignée"}</p>
                </div>
              )}
            </div>

            {/* Suivi & Facture */}
            <div className="mt-6 pt-4 border-t border-border space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Numéro de suivi
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ex: 1Z999AA10123456784"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Lien facture (URL)
                </label>
                <input
                  type="url"
                  value={invoiceUrl}
                  onChange={(e) => setInvoiceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={handleSaveFields}
                disabled={savingFields}
                className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {savingFields ? "Enregistrement..." : fieldsSaved ? "✓ Enregistré" : "Enregistrer suivi & facture"}
              </button>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-text-primary">Articles commandés ({order.items.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-3 text-left">Produit</th>
                  <th className="px-6 py-3 text-left">SKU</th>
                  <th className="px-6 py-3 text-right">Qté</th>
                  <th className="px-6 py-3 text-right">Prix unit. HT</th>
                  <th className="px-6 py-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.variant.designation}</div>
                      {item.variant.powerKw && (
                        <div className="text-xs text-text-secondary">{item.variant.powerKw} kW</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-text-secondary">{item.variant.sku}</td>
                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">
                      {item.unitPriceHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {item.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">Total HT</td>
                  <td className="px-6 py-4 text-right font-bold text-lg">
                    {order.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">Total TTC (TVA 20%)</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-primary">
                    {order.totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

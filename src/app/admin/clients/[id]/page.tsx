"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ClientDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string | null;
  address: string | null;
  kbisUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  role: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  rejectedReason: string | null;
  cgvAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number; customerPrices: number };
  orders: {
    id: string;
    reference: string;
    status: string;
    totalHT: number;
    totalTTC: number;
    createdAt: string;
  }[];
};

export default function AdminClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch(`/api/admin/clients/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setClient(data.client);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAction = async (action: "approve" | "reject") => {
    setActionLoading(true);
    await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client?.id,
        action,
        reason: action === "reject" ? rejectReason : undefined,
      }),
    });
    // Recharger
    const res = await fetch(`/api/admin/clients/${params.id}`);
    const data = await res.json();
    setClient(data.client);
    setActionLoading(false);
    setRejectMode(false);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    PENDING: { label: "En attente de validation", class: "bg-solar-yellow/10 text-solar-yellow border-solar-yellow/30" },
    ACTIVE: { label: "Compte actif", class: "bg-solar-green/10 text-solar-green border-solar-green/30" },
    REJECTED: { label: "Compte refusé", class: "bg-heatpump-red/10 text-heatpump-red border-heatpump-red/30" },
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Chargement…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Client introuvable.</p>
          <Link href="/admin/clients" className="text-primary font-semibold hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/admin/clients" className="text-white/60 text-sm hover:text-white">
            ← Retour à la liste clients
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-2xl font-bold">{client.company}</h1>
              <p className="text-white/70 text-sm">
                {client.firstName} {client.lastName} · {client.email}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold border ${statusConfig[client.status].class}`}
            >
              {statusConfig[client.status].label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Actions admin pour PENDING */}
        {client.status === "PENDING" && (
          <div className="bg-solar-yellow/5 border border-solar-yellow/30 rounded-xl p-6">
            <h3 className="font-bold text-text-primary mb-3">⏳ Ce compte est en attente de validation</h3>
            <p className="text-sm text-text-secondary mb-4">
              Vérifiez les informations et documents ci-dessous avant de valider ou refuser ce compte.
            </p>
            {!rejectMode ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-solar-green text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  ✓ Valider le compte
                </button>
                <button
                  onClick={() => setRejectMode(true)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-heatpump-red text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  ✗ Refuser le compte
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motif du refus (ex: documents illisibles, SIRET invalide…)"
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-heatpump-red/30"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-heatpump-red text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    Confirmer le refus
                  </button>
                  <button
                    onClick={() => setRejectMode(false)}
                    className="px-4 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-white"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Motif de refus */}
        {client.status === "REJECTED" && client.rejectedReason && (
          <div className="bg-heatpump-red/5 border border-heatpump-red/30 rounded-xl p-6">
            <h3 className="font-bold text-heatpump-red mb-2">Motif du refus</h3>
            <p className="text-sm text-text-primary">{client.rejectedReason}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations société */}
          <Section title="Informations société">
            <InfoRow label="Raison sociale" value={client.company} />
            <InfoRow label="SIRET" value={client.siret} mono />
            <InfoRow label="Adresse" value={client.address || "Non renseignée"} />
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <InfoRow label="Prénom" value={client.firstName} />
            <InfoRow label="Nom" value={client.lastName} />
            <InfoRow label="Email" value={client.email} link={`mailto:${client.email}`} />
            <InfoRow label="Téléphone" value={client.phone || "Non renseigné"} link={client.phone ? `tel:${client.phone}` : undefined} />
          </Section>

          {/* Documents justificatifs */}
          <Section title="Documents justificatifs">
            <DocRow label="Extrait KBIS" url={client.kbisUrl} />
            <DocRow label="Pièce d'identité (recto)" url={client.idCardFrontUrl} />
            <DocRow label="Pièce d'identité (verso)" url={client.idCardBackUrl} />
          </Section>

          {/* Informations compte */}
          <Section title="Informations compte">
            <InfoRow label="Date d'inscription" value={fmt(client.createdAt)} />
            <InfoRow label="Dernière mise à jour" value={fmt(client.updatedAt)} />
            <InfoRow
              label="CGV acceptées"
              value={client.cgvAcceptedAt ? `Oui — ${fmt(client.cgvAcceptedAt)}` : "Non acceptées"}
              highlight={!client.cgvAcceptedAt}
            />
            <InfoRow label="Commandes passées" value={String(client._count.orders)} />
            <InfoRow label="Prix personnalisés" value={String(client._count.customerPrices)} />
          </Section>
        </div>

        {/* Historique des commandes */}
        {client.orders.length > 0 && (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Dernières commandes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-text-secondary text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Référence</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-right">Total HT</th>
                    <th className="px-4 py-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {client.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/commandes/${o.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {o.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <OrderBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {Number(o.totalHT).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {Number(o.totalTTC).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        {client.status === "ACTIVE" && (
          <div className="flex gap-3">
            <Link
              href={`/admin/prix?client=${client.id}`}
              className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition"
            >
              Gérer les prix personnalisés
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      </div>
      <div className="px-6 py-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  link,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
  highlight?: boolean;
}) {
  const val = link ? (
    <a href={link} className="text-primary hover:underline">
      {value}
    </a>
  ) : (
    <span className={`${mono ? "font-mono" : ""} ${highlight ? "text-heatpump-red font-semibold" : ""}`}>
      {value}
    </span>
  );
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-text-secondary shrink-0">{label}</span>
      <span className="text-sm text-text-primary text-right">{val}</span>
    </div>
  );
}

function DocRow({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-secondary">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <span className="w-6 h-6 rounded-full bg-solar-green/10 flex items-center justify-center text-solar-green text-xs">✓</span>
          Voir le document
        </a>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-text-secondary">
          <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-text-secondary text-xs">–</span>
          Non fourni
        </span>
      )}
    </div>
  );
}

function OrderBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    DRAFT: { label: "Brouillon", class: "bg-border text-text-secondary" },
    PENDING: { label: "En attente", class: "bg-solar-yellow/10 text-solar-yellow" },
    CONFIRMED: { label: "Confirmée", class: "bg-primary/10 text-primary" },
    PROCESSING: { label: "En cours", class: "bg-ev-blue/10 text-ev-blue" },
    SHIPPED: { label: "Expédiée", class: "bg-solar-green/10 text-solar-green" },
    DELIVERED: { label: "Livrée", class: "bg-solar-green/10 text-solar-green" },
    CANCELLED: { label: "Annulée", class: "bg-heatpump-red/10 text-heatpump-red" },
  };
  const c = config[status] || { label: status, class: "bg-border text-text-secondary" };
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.class}`}>{c.label}</span>;
}

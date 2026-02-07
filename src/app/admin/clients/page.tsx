"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Client = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  kbisUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  rejectedReason: string | null;
  createdAt: string;
  _count: { orders: number; customerPrices: number };
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<Client | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/clients?${params}`);
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleApprove = async (clientId: string) => {
    setActionLoading(clientId);
    await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, action: "approve" }),
    });
    setActionLoading(null);
    fetchClients();
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: rejectModal.id, action: "reject", reason: rejectReason }),
    });
    setActionLoading(null);
    setRejectModal(null);
    setRejectReason("");
    fetchClients();
  };

  const statusBadge: Record<string, { label: string; class: string }> = {
    PENDING: { label: "En attente", class: "bg-solar-yellow/10 text-solar-yellow" },
    ACTIVE: { label: "Actif", class: "bg-solar-green/10 text-solar-green" },
    REJECTED: { label: "Refusé", class: "bg-heatpump-red/10 text-heatpump-red" },
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-white/60 text-sm hover:text-white">
              ← Administration
            </Link>
            <h1 className="text-2xl font-bold mt-1">Gestion des clients</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-border">
            {[
              { value: "", label: "Tous" },
              { value: "PENDING", label: "En attente" },
              { value: "ACTIVE", label: "Actifs" },
              { value: "REJECTED", label: "Refusés" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  filter === f.value ? "bg-primary text-white" : "text-text-secondary hover:bg-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher email, société, SIRET…"
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition"
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-text-secondary">Chargement…</div>
          ) : clients.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">Aucun client trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-text-secondary text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Société</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">SIRET</th>
                    <th className="px-4 py-3 text-center">Docs</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">{c.company}</div>
                        <div className="text-xs text-text-secondary">{c.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {c.firstName} {c.lastName}
                        {c.phone && <div className="text-xs text-text-secondary">{c.phone}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.siret}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <DocIndicator label="KBIS" ok={!!c.kbisUrl} url={c.kbisUrl} />
                          <DocIndicator label="ID" ok={!!c.idCardFrontUrl} url={c.idCardFrontUrl} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge[c.status].class}`}>
                          {statusBadge[c.status].label}
                        </span>
                        {c.status === "REJECTED" && c.rejectedReason && (
                          <div className="text-[10px] text-text-secondary mt-1 max-w-[100px] truncate" title={c.rejectedReason}>
                            {c.rejectedReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="px-3 py-1.5 border border-border text-text-primary text-xs font-medium rounded hover:bg-surface transition"
                          >
                            Voir fiche
                          </Link>
                          {c.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(c.id)}
                                disabled={actionLoading === c.id}
                                className="px-3 py-1.5 bg-solar-green text-white text-xs font-bold rounded hover:opacity-90 disabled:opacity-50"
                              >
                                ✓ Valider
                              </button>
                              <button
                                onClick={() => setRejectModal(c)}
                                disabled={actionLoading === c.id}
                                className="px-3 py-1.5 bg-heatpump-red text-white text-xs font-bold rounded hover:opacity-90 disabled:opacity-50"
                              >
                                ✗ Refuser
                              </button>
                            </>
                          )}
                          {c.status === "ACTIVE" && (
                            <Link
                              href={`/admin/prix?client=${c.id}`}
                              className="text-xs text-primary font-medium hover:underline"
                            >
                              Gérer prix →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">Refuser ce compte ?</h3>
            <p className="text-sm text-text-secondary mb-4">
              {rejectModal.company} – {rejectModal.email}
            </p>
            <label className="block text-sm font-medium text-text-primary mb-1">Motif du refus</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Documents illisibles, SIRET invalide…"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-heatpump-red/30 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.id}
                className="flex-1 py-2.5 bg-heatpump-red text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                Confirmer le refus
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-surface"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocIndicator({ label, ok, url }: { label: string; ok: boolean; url: string | null }) {
  return ok && url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full bg-solar-green/10 flex items-center justify-center text-[10px] font-bold text-solar-green hover:bg-solar-green/20 transition"
      title={`Voir ${label}`}
    >
      {label}
    </a>
  ) : (
    <span
      className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-[10px] font-bold text-text-secondary"
      title={`${label} manquant`}
    >
      {label}
    </span>
  );
}

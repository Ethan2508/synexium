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

type NewClientForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string;
  status: "ACTIVE" | "PENDING";
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<Client | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Modal création client
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newClient, setNewClient] = useState<NewClientForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
    siret: "",
    phone: "",
    status: "ACTIVE",
  });

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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Erreur lors de la création");
        setCreateLoading(false);
        return;
      }

      // Succès - fermer modal et rafraîchir
      setCreateModal(false);
      setNewClient({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        company: "",
        siret: "",
        phone: "",
        status: "ACTIVE",
      });
      fetchClients();
    } catch {
      setCreateError("Erreur de connexion");
    }
    setCreateLoading(false);
  };

  const statusBadge: Record<string, { label: string; class: string }> = {
    PENDING: { label: "En attente", class: "bg-solar-yellow/10 text-solar-yellow" },
    ACTIVE: { label: "Actif", class: "bg-solar-green/10 text-solar-green" },
    REJECTED: { label: "Refusé", class: "bg-heatpump-red/10 text-heatpump-red" },
  };

  const pendingCount = clients.filter(c => c.status === "PENDING").length;

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
          <button
            onClick={() => setCreateModal(true)}
            className="px-5 py-2.5 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Créer un client
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Alerte clients en attente */}
        {pendingCount > 0 && (
          <div className="bg-solar-yellow/10 border border-solar-yellow/30 rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">⏳</span>
            <div>
              <span className="font-bold text-solar-yellow">{pendingCount} client{pendingCount > 1 ? "s" : ""} en attente</span>
              <span className="text-sm text-text-secondary ml-2">de validation</span>
            </div>
          </div>
        )}

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

      {/* Modal création client */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Créer un compte client</h3>
              <button
                onClick={() => setCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-text-secondary"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-heatpump-red/10 border border-heatpump-red/30 rounded-lg text-sm text-heatpump-red">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Raison sociale *</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">SIRET *</label>
                <input
                  type="text"
                  value={newClient.siret}
                  onChange={(e) => setNewClient({ ...newClient, siret: e.target.value })}
                  placeholder="12345678901234"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Statut initial</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newClient.status === "ACTIVE"}
                      onChange={() => setNewClient({ ...newClient, status: "ACTIVE" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Actif immédiatement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newClient.status === "PENDING"}
                      onChange={() => setNewClient({ ...newClient, status: "PENDING" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">En attente</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition"
                >
                  {createLoading ? "Création en cours…" : "Créer le compte"}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-6 py-3 border border-border text-text-secondary rounded-lg hover:bg-surface transition"
                >
                  Annuler
                </button>
              </div>
            </form>
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

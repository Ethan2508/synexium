import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  CLIENT_APPROVED: { label: "Client validé", color: "text-green-600 bg-green-50", icon: "✓" },
  CLIENT_REJECTED: { label: "Client refusé", color: "text-red-600 bg-red-50", icon: "✗" },
  PRICE_SET: { label: "Prix défini", color: "text-blue-600 bg-blue-50", icon: "$" },
  PRICE_DELETED: { label: "Prix supprimé", color: "text-orange-600 bg-orange-50", icon: "-" },
  ORDER_STATUS_CHANGED: { label: "Commande modifiée", color: "text-purple-600 bg-purple-50", icon: "→" },
  IMPORT_CSV: { label: "Import CSV", color: "text-cyan-600 bg-cyan-50", icon: "↑" },
};

export default async function AdminLogsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Stats par action
  const stats = await prisma.adminLog.groupBy({
    by: ["action"],
    _count: { _all: true },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Historique des actions</h1>
              <p className="text-white/60 mt-1">Journal d'audit des opérations administratives</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ACTION_LABELS).map(([key, { label, color }]) => {
            const stat = stats.find((s) => s.action === key);
            return (
              <div key={key} className={`rounded-xl p-4 ${color.split(" ")[1]}`}>
                <div className={`text-2xl font-bold ${color.split(" ")[0]}`}>{stat?._count._all || 0}</div>
                <div className="text-xs text-gray-600 mt-1">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Liste logs */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-text-primary">Dernières actions ({logs.length})</h2>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-secondary">
              <p>Aucune action enregistrée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Action</th>
                    <th className="px-6 py-3 text-left">Cible</th>
                    <th className="px-6 py-3 text-left">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const actionConfig = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: "text-gray-600 bg-gray-50",
                      icon: "•",
                    };
                    return (
                      <tr key={log.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${actionConfig.color}`}>
                            <span>{actionConfig.icon}</span>
                            {actionConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-text-secondary">{log.targetType}</span>
                          {log.targetId && (
                            <span className="ml-1 font-mono text-xs text-text-secondary/60">
                              #{log.targetId.slice(0, 8)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">
                          {log.details || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Brouillon", color: "text-gray-600", bg: "bg-gray-100" },
  SUBMITTED: { label: "Soumise", color: "text-blue-600", bg: "bg-blue-100" },
  CONFIRMED: { label: "Confirmée", color: "text-purple-600", bg: "bg-purple-100" },
  SHIPPED: { label: "Expédiée", color: "text-orange-600", bg: "bg-orange-100" },
  DELIVERED: { label: "Livrée", color: "text-green-600", bg: "bg-green-100" },
  CANCELLED: { label: "Annulée", color: "text-red-600", bg: "bg-red-100" },
};

export default async function AdminOrdersPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    include: {
      customer: {
        select: { id: true, company: true, email: true, firstName: true, lastName: true },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { totalHT: true },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestion des commandes</h1>
              <p className="text-white/60 mt-1">Suivez et gérez toutes les commandes clients</p>
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
          {Object.entries(STATUS_LABELS).map(([key, { label, color, bg }]) => {
            const stat = stats.find((s) => s.status === key);
            return (
              <div key={key} className={`${bg} rounded-xl p-4`}>
                <div className={`text-2xl font-bold ${color}`}>{stat?._count._all || 0}</div>
                <div className="text-xs text-gray-600 mt-1">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Liste commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-text-primary">Toutes les commandes</h2>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-secondary">
              <p>Aucune commande pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left">Référence</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Statut</th>
                    <th className="px-6 py-3 text-right">Articles</th>
                    <th className="px-6 py-3 text-right">Total HT</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const status = STATUS_LABELS[order.status] || STATUS_LABELS.DRAFT;
                    return (
                      <tr key={order.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-primary">{order.reference}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary">{order.customer.company}</div>
                          <div className="text-xs text-text-secondary">{order.customer.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-text-secondary">{order._count.items}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {order.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/commandes/${order.id}`}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            Détails
                          </Link>
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

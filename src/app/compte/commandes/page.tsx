import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Brouillon", color: "text-gray-600", bg: "bg-gray-100" },
  SUBMITTED: { label: "Soumise", color: "text-blue-600", bg: "bg-blue-100" },
  CONFIRMED: { label: "Confirmée", color: "text-purple-600", bg: "bg-purple-100" },
  SHIPPED: { label: "Expédiée", color: "text-orange-600", bg: "bg-orange-100" },
  DELIVERED: { label: "Livrée", color: "text-green-600", bg: "bg-green-100" },
  CANCELLED: { label: "Annulée", color: "text-red-600", bg: "bg-red-100" },
};

export default async function MesCommandesPage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login?redirect=/compte/commandes");

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mes commandes</h1>
              <p className="text-white/60 mt-1">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
            </div>
            <Link
              href="/compte"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              ← Mon compte
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Aucune commande</h2>
            <p className="text-text-secondary mb-6">Vous n'avez pas encore passé de commande.</p>
            <Link
              href="/catalogue"
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.DRAFT;
              return (
                <Link
                  key={order.id}
                  href={`/compte/commandes/${order.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-primary">{order.reference}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {order._count.items} article{order._count.items > 1 ? "s" : ""} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-text-primary">
                        {order.totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </div>
                      <div className="text-xs text-text-secondary">TTC</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

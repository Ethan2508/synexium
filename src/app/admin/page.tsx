import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  // Stats complètes
  const [
    pendingClients,
    activeClients,
    totalProducts,
    totalVariants,
    recentOrders,
    lowStockVariants,
    todayOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT", status: "PENDING" } }),
    prisma.user.count({ where: { role: "CLIENT", status: "ACTIVE" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.productVariant.count({ where: { active: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { company: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: { realStock: { lte: 5 }, active: true },
      take: 10,
      select: { sku: true, designation: true, realStock: true },
      orderBy: { realStock: "asc" },
    }),
    prisma.order.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.order.aggregate({
      _sum: { totalHT: true },
      where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-gradient-to-r from-primary to-climate-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Administration</h1>
          <p className="text-white/80 mt-1">Bonjour {user.firstName}, voici votre tableau de bord</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard value={todayOrders} label="Commandes aujourd'hui" icon="📦" color="text-solar-yellow" />
          <StatCard 
            value={pendingClients} 
            label="Clients en attente" 
            icon="⏳" 
            color="text-orange-600" 
            urgent={pendingClients > 0} 
          />
          <StatCard value={activeClients} label="Clients actifs" icon="✓" color="text-solar-green" />
          <StatCard 
            value={`${((totalRevenue._sum.totalHT || 0) / 1000).toFixed(1)}k€`} 
            label="CA total HT" 
            icon="💰" 
            color="text-primary" 
          />
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Commandes récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">📋 Commandes récentes</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-secondary">Aucune commande récente</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/commandes/${order.id}`}
                    className="block p-3 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-text-primary truncate">
                          {order.customer.company}
                        </p>
                        <p className="text-xs text-text-secondary truncate">{order.customer.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{order.totalTTC.toFixed(2)}€</p>
                        <p className="text-xs text-text-secondary">{order._count.items} article(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/admin/commandes"
              className="block mt-4 text-sm font-medium text-primary hover:underline"
            >
              Voir toutes les commandes →
            </Link>
          </div>

          {/* Stock faible */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">⚠️ Alertes stock</h2>
            {lowStockVariants.length === 0 ? (
              <p className="text-sm text-text-secondary">Tous les stocks sont corrects</p>
            ) : (
              <div className="space-y-2">
                {lowStockVariants.map((variant) => (
                  <div
                    key={variant.sku}
                    className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{variant.designation}</p>
                      <p className="text-xs text-text-secondary">{variant.sku}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-600 text-white text-xs font-bold">
                        {variant.realStock} unités
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats catalogue */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">📦 Catalogue</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">{totalProducts}</div>
              <div className="text-sm text-text-secondary">Gammes produits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-climate-blue">{totalVariants}</div>
              <div className="text-sm text-text-secondary">Variantes (SKU)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-solar-green">{activeClients}</div>
              <div className="text-sm text-text-secondary">Clients actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{lowStockVariants.length}</div>
              <div className="text-sm text-text-secondary">Stocks ≤ 5</div>
            </div>
          </div>
        </div>

        {/* Navigation admin */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">⚙️ Actions rapides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminLink
              href="/admin/clients"
              title="👥 Gestion clients"
              desc="Valider/refuser les comptes professionnels"
              badge={pendingClients > 0 ? `${pendingClients} en attente` : undefined}
            />
            <AdminLink
              href="/admin/prix"
              title="💶 Prix clients"
              desc="Gérer les tarifs personnalisés par client"
            />
            <AdminLink
              href="/admin/commandes"
              title="📦 Commandes"
              desc="Suivre et gérer toutes les commandes"
            />
            <AdminLink
              href="/admin/import"
              title="📤 Import CSV"
              desc="Importer le catalogue depuis un fichier CSV"
            />
            <AdminLink
              href="/admin/logs"
              title="📜 Historique"
              desc="Journal d'audit des actions administratives"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  value, 
  label, 
  icon, 
  color, 
  urgent 
}: { 
  value: number | string; 
  label: string; 
  icon?: string; 
  color: string; 
  urgent?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-5 ${urgent ? "border-orange-500 border-2" : "border-border"}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs sm:text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    DRAFT: { label: "Brouillon", bg: "bg-gray-100", text: "text-gray-600" },
    SUBMITTED: { label: "Soumise", bg: "bg-blue-100", text: "text-blue-700" },
    CONFIRMED: { label: "Confirmée", bg: "bg-green-100", text: "text-green-700" },
    SHIPPED: { label: "Expédiée", bg: "bg-purple-100", text: "text-purple-700" },
    DELIVERED: { label: "Livrée", bg: "bg-emerald-100", text: "text-emerald-700" },
    CANCELLED: { label: "Annulée", bg: "bg-red-100", text: "text-red-700" },
  };
  const { label, bg, text } = config[status] || config.DRAFT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function AdminLink({ href, title, desc, badge }: { href: string; title: string; desc: string; badge?: string }) {
  return (
    <Link
      href={href}
      className="group bg-gradient-to-br from-white to-surface rounded-xl shadow-sm border border-border p-4 sm:p-5 hover:shadow-md hover:-translate-y-1 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm sm:text-base text-text-primary group-hover:text-primary transition-colors">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full whitespace-nowrap ml-2">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs sm:text-sm text-text-secondary">{desc}</p>
      <span className="text-xs font-medium text-primary mt-3 block opacity-0 group-hover:opacity-100 transition-opacity">
        Ouvrir →
      </span>
    </Link>
  );
}

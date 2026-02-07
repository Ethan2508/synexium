import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  // Stats rapides
  const [pendingClients, activeClients, totalProducts, totalVariants] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT", status: "PENDING" } }),
    prisma.user.count({ where: { role: "CLIENT", status: "ACTIVE" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.productVariant.count({ where: { active: true } }),
  ]);

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-white/60 mt-1">Tableau de bord Francilienne Energy</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={pendingClients} label="Clients en attente" color="text-solar-yellow" urgent={pendingClients > 0} />
          <StatCard value={activeClients} label="Clients actifs" color="text-solar-green" />
          <StatCard value={totalProducts} label="Gammes produits" color="text-primary" />
          <StatCard value={totalVariants} label="Variantes (SKU)" color="text-climate-blue" />
        </div>

        {/* Navigation admin */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminLink
            href="/admin/clients"
            title="Gestion clients"
            desc="Valider/refuser les comptes professionnels"
            badge={pendingClients > 0 ? `${pendingClients} en attente` : undefined}
          />
          <AdminLink
            href="/admin/prix"
            title="Prix clients"
            desc="Gérer les tarifs personnalisés par client"
          />
          <AdminLink
            href="/admin/commandes"
            title="Commandes"
            desc="Suivre et gérer toutes les commandes"
          />
          <AdminLink
            href="/admin/import"
            title="Import CSV"
            desc="Importer le catalogue depuis un fichier CSV"
          />
          <AdminLink
            href="/admin/logs"
            title="Historique"
            desc="Journal d'audit des actions administratives"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color, urgent }: { value: number; label: string; color: string; urgent?: boolean }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${urgent ? "border-solar-yellow border-2" : "border-border"}`}>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}

function AdminLink({ href, title, desc, badge }: { href: string; title: string; desc: string; badge?: string }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-solar-yellow/10 text-solar-yellow text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary">{desc}</p>
      <span className="text-xs font-medium text-primary mt-3 block opacity-0 group-hover:opacity-100 transition-opacity">
        Ouvrir →
      </span>
    </Link>
  );
}

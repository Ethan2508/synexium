import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}

export default async function MaCommandePage({ params, searchParams }: Props) {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id, customerId: user.id },
    include: {
      items: {
        include: {
          variant: {
            select: { sku: true, designation: true, powerKw: true, capacity: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.DRAFT;

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Commande {order.reference}</h1>
              <p className="text-white/60 mt-1">
                Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Link
              href="/compte/commandes"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              ← Mes commandes
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {success && (
          <div className="p-4 bg-solar-green/10 border border-solar-green/20 rounded-xl text-solar-green flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-bold">Commande validée avec succès !</p>
              <p className="text-sm opacity-80 mt-1">
                Vous recevrez un email de confirmation. Notre équipe traitera votre commande dans les meilleurs délais.
              </p>
            </div>
          </div>
        )}

        {/* Statut */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-5">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-bold ${status.bg} ${status.color}`}>
              {status.label}
            </div>
            <div className="text-sm text-text-secondary">
              {order.status === "SUBMITTED" && "Votre commande a été transmise à notre équipe."}
              {order.status === "CONFIRMED" && "Votre commande est en cours de préparation."}
              {order.status === "SHIPPED" && "Votre commande a été expédiée."}
              {order.status === "DELIVERED" && "Votre commande a été livrée."}
              {order.status === "CANCELLED" && "Cette commande a été annulée."}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-text-primary">Articles ({order.items.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{item.variant.designation}</div>
                  {(item.variant.powerKw || item.variant.capacity) && (
                    <div className="text-sm text-text-secondary">
                      {item.variant.powerKw ? `${item.variant.powerKw} kW` : `${item.variant.capacity} L`}
                    </div>
                  )}
                  <div className="text-xs text-text-secondary mt-0.5">SKU : {item.variant.sku}</div>
                </div>
                <div className="text-sm text-text-secondary">x{item.quantity}</div>
                <div className="text-right">
                  <div className="font-semibold">
                    {item.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </div>
                  <div className="text-xs text-text-secondary">HT</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border bg-surface">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Total HT</span>
              <span className="font-medium">
                {order.totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">TVA (20%)</span>
              <span className="font-medium">
                {(order.totalTTC - order.totalHT).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-bold text-text-primary">Total TTC</span>
              <span className="font-bold text-lg text-primary">
                {order.totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-text-primary mb-2">Notes</h3>
            <p className="text-sm text-text-secondary">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

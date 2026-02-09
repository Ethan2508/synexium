import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
          
          {/* Tracking */}
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <div>
                <div className="font-semibold text-blue-900 text-sm">Numéro de suivi</div>
                <div className="text-sm text-blue-700 font-mono mt-1">{order.trackingNumber}</div>
              </div>
            </div>
          )}
        </div>

        {/* Livraison / Pickup */}
        {order.deliveryMethod && (
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              {order.deliveryMethod === "PICKUP" ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Retrait en magasin
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Livraison
                </>
              )}
            </h3>
            
            {order.deliveryMethod === "PICKUP" && order.pickupLocation && (
              <div className="text-sm text-text-secondary">
                {order.pickupLocation === "LYON" && (
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Synexium Lyon</div>
                    <div>218 Avenue Franklin Roosevelt</div>
                    <div>69120 Vaulx-en-Velin</div>
                  </div>
                )}
                {order.pickupLocation === "PARIS" && (
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Synexium Paris</div>
                    <div>16 Avenue du Valquiou, Bâtiment C</div>
                    <div>93290 Tremblay</div>
                  </div>
                )}
              </div>
            )}
            
            {order.deliveryMethod === "DELIVERY" && order.deliveryAddress && (
              <div className="text-sm text-text-secondary whitespace-pre-line">
                {order.deliveryAddress}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {order.invoiceUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-text-primary">Documents</h3>
            </div>
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 hover:bg-surface transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-primary">Facture</div>
                <div className="text-xs text-text-secondary">Commande {order.reference}</div>
              </div>
              <svg className="w-5 h-5 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </div>
        )}

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

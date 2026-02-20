import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";

export default async function ComptePage() {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    PENDING: {
      label: "En attente de validation",
      color: "text-solar-yellow",
      bg: "bg-solar-yellow/10 border-solar-yellow",
      icon: "⏳",
    },
    ACTIVE: {
      label: "Compte actif",
      color: "text-solar-green",
      bg: "bg-solar-green/10 border-solar-green",
      icon: "✓",
    },
    REJECTED: {
      label: "Compte refusé",
      color: "text-heatpump-red",
      bg: "bg-heatpump-red/10 border-heatpump-red",
      icon: "✗",
    },
  };

  const status = statusConfig[user.status] || statusConfig.PENDING;

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold">Mon espace professionnel</h1>
          <p className="text-white/60 mt-1">
            {user.company} – {user.firstName} {user.lastName}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Status banner */}
        <div className={`rounded-xl border-2 p-5 flex items-start gap-4 ${status.bg}`}>
          <span className="text-2xl">{status.icon}</span>
          <div>
            <h2 className={`font-bold text-lg ${status.color}`}>{status.label}</h2>
            {user.status === "PENDING" && (
              <p className="text-sm text-text-secondary mt-1">
                Notre équipe examine votre dossier. Vous recevrez un email dès que votre compte sera activé.
                Les prix et la commande sont accessibles uniquement aux comptes validés.
              </p>
            )}
            {user.status === "REJECTED" && user.rejectedReason && (
              <p className="text-sm text-text-secondary mt-1">
                Motif : {user.rejectedReason}
              </p>
            )}
            {user.status === "ACTIVE" && (
              <p className="text-sm text-text-secondary mt-1">
                Vous avez accès aux tarifs professionnels et à la commande en ligne.
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Infos société */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-text-primary mb-4">Informations société</h3>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Raison sociale" value={user.company} />
              <InfoRow label="SIRET" value={user.siret} />
              <InfoRow label="Nom Prénom" value={`${user.firstName} ${user.lastName}`} />
              <InfoRow label="Email" value={user.email} />
              {user.phone && <InfoRow label="Téléphone" value={user.phone} />}
            </dl>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-text-primary mb-4">Documents justificatifs</h3>
            <div className="space-y-3">
              <DocStatus label="Extrait KBIS" uploaded={!!user.kbisUrl} />
              <DocStatus label="Pièce d'identité recto" uploaded={!!user.idCardFrontUrl} />
              <DocStatus label="Pièce d'identité verso" uploaded={!!user.idCardBackUrl} />
              <DocStatus label="CGV signées" uploaded={!!user.cgvAcceptedAt} />
            </div>
            {(!user.kbisUrl || !user.idCardFrontUrl) && (
              <p className="text-xs text-text-secondary mt-4">
                Documents manquants ? Contactez-nous à contact@francilienne-energy.fr
              </p>
            )}
          </div>
        </div>

        {/* Contact Synexium */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="font-bold text-text-primary mb-4">Votre contact chez nous</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-text-primary text-sm mb-2">Synexium — Île-de-France</h4>
              <p className="text-sm text-text-secondary">📍 6-8 Rue des Lilas, 93160 Noisy-le-Grand</p>
              <p className="text-sm text-text-secondary">📞 <a href="tel:+33148159200" className="text-primary hover:underline">01 48 15 92 00</a></p>
              <p className="text-sm text-text-secondary">✉️ <a href="mailto:contact@synexium.fr" className="text-primary hover:underline">contact@synexium.fr</a></p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm mb-2">Francilienne Energy — Lyon</h4>
              <p className="text-sm text-text-secondary">📍 218 Av. Franklin Roosevelt, 69120 Vaulx-en-Velin</p>
              <p className="text-sm text-text-secondary">📞 <a href="tel:+33472687238" className="text-primary hover:underline">04 72 68 72 38</a></p>
              <p className="text-sm text-text-secondary">✉️ <a href="mailto:contact@francilienne-energy.fr" className="text-primary hover:underline">contact@francilienne-energy.fr</a></p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        {user.status === "ACTIVE" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/compte/commandes"
              className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow group"
            >
              <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                Mes commandes
              </h3>
              <p className="text-sm text-text-secondary mt-1">Suivre l'historique de vos commandes</p>
            </Link>
            <Link
              href="/panier"
              className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow group"
            >
              <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                Mon panier
              </h3>
              <p className="text-sm text-text-secondary mt-1">Voir et gérer votre panier</p>
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition text-sm"
            >
              Administration
            </Link>
          )}
          <Link
            href="/auth/logout"
            className="px-5 py-2.5 border border-border text-text-secondary font-medium rounded-lg hover:bg-surface transition text-sm"
          >
            Déconnexion
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function DocStatus({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${uploaded ? "bg-solar-green" : "bg-border"}`} />
      <span className={uploaded ? "text-text-primary" : "text-text-secondary"}>{label}</span>
      <span className="ml-auto text-xs">
        {uploaded ? (
          <span className="text-solar-green font-medium">Fourni</span>
        ) : (
          <span className="text-text-secondary">Manquant</span>
        )}
      </span>
    </div>
  );
}

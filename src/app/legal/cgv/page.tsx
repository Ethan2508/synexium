import Link from "next/link";

export const metadata = {
  title: "Conditions Générales de Vente | Francilienne Energy",
  description: "Conditions générales de vente pour les professionnels",
};

export default function CGVPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Conditions Générales de Vente</h1>
          <p className="text-white/80 mt-2">Réservées aux professionnels</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 1 - Champ d'application</h2>
            <p className="text-text-secondary mb-3">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
              Francilienne Energy SAS (ci-après « le Vendeur ») et tout professionnel (ci-après « l'Acheteur ») 
              effectuant un achat de produits sur le site francilienne-energy.fr.
            </p>
            <p className="text-text-secondary">
              Ces CGV s'appliquent à l'exclusion de toutes autres conditions, notamment celles de l'Acheteur, 
              sauf accord écrit préalable du Vendeur. Toute commande implique l'acceptation sans réserve des 
              présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 2 - Inscription et validation du compte</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                L'accès au catalogue et aux prix nécessite la création d'un compte professionnel. L'Acheteur 
                s'engage à fournir des informations exactes et à jour (SIRET, KBIS, pièce d'identité du 
                représentant légal).
              </p>
              <p>
                Le Vendeur se réserve le droit de valider ou refuser toute demande d'inscription, notamment en 
                cas de dossier incomplet ou d'informations frauduleuses. La validation du compte est un 
                prérequis pour passer commande.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 3 - Commandes</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les commandes peuvent être passées en ligne via le compte client. Toute commande vaut acceptation 
                des prix, descriptions et disponibilités des produits affichés au moment de la validation.
              </p>
              <p>
                Une confirmation de commande est envoyée par email récapitulant les produits commandés, 
                les quantités, le prix total HT et TTC. La commande n'est considérée comme définitive qu'après 
                validation par le Vendeur et vérification de la disponibilité des produits.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 4 - Prix</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les prix sont indiqués en euros (€) hors taxes (HT) et toutes taxes comprises (TTC). La TVA 
                applicable est de 20% (sauf mention contraire pour certains produits).
              </p>
              <p>
                Les prix affichés sont réservés aux professionnels et peuvent être personnalisés selon le profil 
                de l'Acheteur (volume d'achat, accord commercial préalable). Les prix sont révisables à tout 
                moment mais le Vendeur s'engage à facturer les commandes validées au tarif en vigueur au moment 
                de la passation de commande.
              </p>
              <p>
                Les prix ne comprennent pas les frais de livraison, facturés en supplément selon le mode de 
                transport choisi et la destination.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 5 - Paiement</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Le paiement s'effectue selon les modalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Virement bancaire :</strong> à réception de facture proforma (entreprises avec historique)</li>
                <li><strong>Carte bancaire :</strong> paiement sécurisé en ligne (nouveaux clients)</li>
              </ul>
              <p>
                Les factures sont émises à la confirmation de l'expédition et envoyées par email. Le Vendeur 
                se réserve le droit de suspendre toute livraison en cas de retard ou défaut de paiement d'une 
                facture antérieure.
              </p>
              <p>
                En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront 
                automatiquement appliquées, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 6 - Livraison</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les livraisons sont effectuées à l'adresse indiquée dans le bon de commande. Les délais de 
                livraison mentionnés sont indicatifs et courent à compter de la validation de la commande.
              </p>
              <p>
                <strong>Zone de livraison :</strong> France métropolitaine. Île-de-France : livraison express 
                sous 24-48h (selon stock).
              </p>
              <p>
                L'Acheteur est tenu de vérifier l'état du colis à la réception. Toute réserve doit être notée 
                sur le bon de livraison et confirmée par lettre recommandée au transporteur dans les 48h. 
                À défaut, aucune réclamation ne pourra être acceptée.
              </p>
              <p>
                En cas de retard de livraison supérieur à 15 jours ouvrés, l'Acheteur peut annuler sa commande 
                et obtenir le remboursement des sommes versées, sans autre indemnité.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 7 - Disponibilité et stocks</h2>
            <p className="text-text-secondary">
              Les stocks affichés sur le site sont mis à jour en temps réel mais ne constituent pas une garantie 
              absolue de disponibilité. En cas de rupture de stock après validation d'une commande, le Vendeur 
              s'engage à en informer l'Acheteur dans les meilleurs délais et à proposer un produit de substitution 
              ou le remboursement des articles indisponibles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 8 - Retours et garanties</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                <strong>Droit de rétractation :</strong> Non applicable aux ventes B2B (article L.221-3 du Code 
                de la consommation).
              </p>
              <p>
                <strong>Retour pour erreur ou défaut :</strong> Tout produit présentant un défaut de conformité 
                ou un vice caché peut être retourné dans un délai de 30 jours suivant la livraison, dans son 
                emballage d'origine, accompagné de la facture. Les frais de retour sont à la charge du Vendeur 
                après accord préalable du service commercial.
              </p>
              <p>
                <strong>Garanties fabricant :</strong> Les produits bénéficient des garanties légales (conformité, 
                vices cachés) et des garanties constructeurs selon les conditions propres à chaque fabricant. 
                Les certificats de garantie sont fournis avec les produits.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 9 - Responsabilité</h2>
            <p className="text-text-secondary">
              Le Vendeur ne saurait être tenu responsable de l'inexécution du contrat en cas de force majeure, 
              rupture d'approvisionnement, grève, incendie, ou tout autre événement échappant à son contrôle.
              La responsabilité du Vendeur est limitée au montant de la commande concernée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 10 - Propriété intellectuelle</h2>
            <p className="text-text-secondary">
              Tous les éléments du site (logos, textes, images, fiches produits) sont protégés par le droit 
              d'auteur et les droits de propriété intellectuelle. Toute reproduction ou utilisation sans 
              autorisation expresse est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 11 - Données personnelles</h2>
            <p className="text-text-secondary">
              Les données collectées sont traitées conformément à notre{" "}
              <Link href="/legal/confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </Link>{" "}
              et à la réglementation RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 12 - Litiges</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera 
                recherchée en priorité. À défaut d'accord, le litige sera porté devant les tribunaux compétents 
                du ressort du siège social du Vendeur.
              </p>
              <p>
                <strong>Médiation :</strong> Conformément à l'article L.612-1 du Code de la consommation, 
                l'Acheteur peut recourir gratuitement à un médiateur de la consommation en cas de litige. 
                Coordonnées disponibles sur demande.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Article 13 - Modification des CGV</h2>
            <p className="text-text-secondary">
              Le Vendeur se réserve le droit de modifier les présentes CGV à tout moment. Les nouvelles 
              conditions s'appliqueront aux commandes passées après leur mise en ligne. Il est conseillé de 
              consulter régulièrement cette page.
            </p>
            <p className="text-text-secondary mt-4 text-sm">
              <strong>Date de dernière mise à jour :</strong> 7 février 2026
            </p>
          </section>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-text-secondary">
            Pour toute question sur ces CGV, contactez-nous à{" "}
            <a href="mailto:contact@francilienne-energy.fr" className="text-primary hover:underline">
              contact@francilienne-energy.fr
            </a>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

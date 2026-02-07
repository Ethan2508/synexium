import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité | Francilienne Energy",
  description: "Politique de confidentialité et protection des données personnelles",
};

export default function ConfidentialitePage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Politique de confidentialité</h1>
          <p className="text-white/80 mt-2">Protection de vos données personnelles</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">1. Responsable du traitement</h2>
            <p className="text-text-secondary">
              Francilienne Energy SAS, immatriculée au RCS de Paris sous le numéro B 123 456 789, 
              dont le siège social est situé 123 Avenue de la République, 75011 Paris, est responsable 
              du traitement de vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">2. Données collectées</h2>
            <div className="text-text-secondary space-y-4">
              <p>Nous collectons les données suivantes lors de la création de votre compte professionnel :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Informations d'identification : nom, prénom, email, téléphone</li>
                <li>Informations professionnelles : raison sociale, SIRET, adresse de l'entreprise</li>
                <li>Justificatifs : KBIS, pièce d'identité du représentant légal</li>
                <li>Données de navigation : logs de connexion, adresses IP</li>
                <li>Données commerciales : historique de commandes, préférences tarifaires</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">3. Finalités du traitement</h2>
            <div className="text-text-secondary space-y-4">
              <p>Vos données sont collectées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gestion de votre compte client professionnel</li>
                <li>Validation de votre inscription (vérification des justificatifs)</li>
                <li>Traitement et suivi de vos commandes</li>
                <li>Application de tarifs personnalisés selon votre profil</li>
                <li>Communication commerciale et technique</li>
                <li>Respect des obligations légales et comptables</li>
                <li>Statistiques et amélioration de nos services</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">4. Base légale</h2>
            <div className="text-text-secondary space-y-3">
              <p>Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Exécution du contrat :</strong> gestion de votre compte et de vos commandes</li>
                <li><strong>Obligation légale :</strong> conservation des factures, lutte contre la fraude</li>
                <li><strong>Intérêt légitime :</strong> amélioration de nos services, sécurité du site</li>
                <li><strong>Consentement :</strong> communication marketing (opt-in)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">5. Destinataires des données</h2>
            <p className="text-text-secondary mb-3">Vos données peuvent être transmises aux destinataires suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-text-secondary">
              <li>Personnel habilité de Francilienne Energy (service commercial, comptabilité)</li>
              <li>Prestataires techniques : hébergement (Vercel), paiement, CRM</li>
              <li>Transporteurs pour la livraison de vos commandes</li>
              <li>Autorités judiciaires ou administratives sur réquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">6. Durée de conservation</h2>
            <div className="text-text-secondary space-y-3">
              <p>Nous conservons vos données pendant les durées suivantes :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Données de compte :</strong> pendant toute la durée de la relation commerciale + 3 ans</li>
                <li><strong>Justificatifs (KBIS, CNI) :</strong> 5 ans après la fin de la relation</li>
                <li><strong>Factures et commandes :</strong> 10 ans (obligation légale comptable)</li>
                <li><strong>Données marketing :</strong> 3 ans à compter du dernier contact</li>
                <li><strong>Logs de connexion :</strong> 1 an (obligation de sécurité)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">7. Vos droits</h2>
            <div className="text-text-secondary space-y-4">
              <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données (sous conditions)</li>
                <li><strong>Droit à la limitation :</strong> restreindre l'utilisation de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> refuser le traitement de vos données (marketing)</li>
                <li><strong>Droit de retrait du consentement :</strong> à tout moment pour les traitements optionnels</li>
              </ul>
              <p className="mt-4">
                Pour exercer vos droits, contactez-nous à{" "}
                <a href="mailto:rgpd@francilienne-energy.fr" className="text-primary hover:underline">
                  rgpd@francilienne-energy.fr
                </a>{" "}
                en joignant une copie de votre pièce d'identité.
              </p>
              <p>
                Vous disposez également du droit d'introduire une réclamation auprès de la{" "}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  CNIL
                </a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">8. Sécurité</h2>
            <p className="text-text-secondary">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
              vos données contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, 
              l'altération ou la destruction. Les données sensibles (justificatifs) sont stockées sur des 
              serveurs sécurisés avec chiffrement et accès restreint.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">9. Cookies</h2>
            <p className="text-text-secondary">
              Notre site utilise des cookies techniques nécessaires au fonctionnement (authentification, panier). 
              Aucun cookie publicitaire ou de tracking n'est déposé sans votre consentement préalable. 
              Vous pouvez paramétrer votre navigateur pour refuser les cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">10. Modifications</h2>
            <p className="text-text-secondary">
              Cette politique peut être mise à jour. La date de dernière modification est indiquée ci-dessous. 
              Nous vous informerons de tout changement substantiel par email ou via un bandeau sur le site.
            </p>
            <p className="text-text-secondary mt-4 text-sm">
              <strong>Dernière mise à jour :</strong> 7 février 2026
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

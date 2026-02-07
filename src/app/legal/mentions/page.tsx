import Link from "next/link";

export const metadata = {
  title: "Mentions légales | Francilienne Energy",
  description: "Mentions légales et informations sur la société Francilienne Energy",
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Mentions légales</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Éditeur du site</h2>
            <div className="space-y-2 text-text-secondary">
              <p><strong>Raison sociale :</strong> Francilienne Energy</p>
              <p><strong>Forme juridique :</strong> SAS</p>
              <p><strong>Capital social :</strong> 10 000 €</p>
              <p><strong>Siège social :</strong> 123 Avenue de la République, 75011 Paris</p>
              <p><strong>SIRET :</strong> 123 456 789 00012</p>
              <p><strong>RCS :</strong> Paris B 123 456 789</p>
              <p><strong>TVA intracommunautaire :</strong> FR12345678900</p>
              <p><strong>Téléphone :</strong> 04 72 68 72 38</p>
              <p><strong>Email :</strong> contact@francilienne-energy.fr</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Directeur de la publication</h2>
            <p className="text-text-secondary">
              M. Jean Dupont, Président de Francilienne Energy SAS
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Hébergement</h2>
            <div className="space-y-2 text-text-secondary">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Propriété intellectuelle</h2>
            <p className="text-text-secondary">
              L'ensemble des contenus présents sur ce site (textes, images, illustrations, logos, photographies) 
              sont la propriété exclusive de Francilienne Energy ou de ses partenaires. Toute reproduction, 
              distribution, modification, adaptation, retransmission ou publication de ces différents éléments 
              est strictement interdite sans l'accord exprès par écrit de Francilienne Energy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Données personnelles</h2>
            <p className="text-text-secondary mb-4">
              Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion 
              des commandes et à l'amélioration de nos services. Conformément à la loi « informatique et 
              libertés » du 6 janvier 1978 modifiée et au RGPD, vous bénéficiez d'un droit d'accès et de 
              rectification aux informations qui vous concernent.
            </p>
            <p className="text-text-secondary">
              Pour plus d'informations, consultez notre{" "}
              <Link href="/legal/confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Responsabilité</h2>
            <p className="text-text-secondary">
              Francilienne Energy s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées 
              sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des 
              informations mises à disposition sur ce site. En conséquence, nous déclinons toute responsabilité 
              pour les imprécisions, inexactitudes ou omissions portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Litiges</h2>
            <p className="text-text-secondary">
              Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut 
              d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de 
              compétence en vigueur.
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

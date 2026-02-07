import Link from "next/link";

/* =========================================================================
   SUPPORT – Page contact et aide
   ========================================================================= */

export default function SupportPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Support & Contact</h1>
          <p className="text-white/70">
            Notre équipe est à votre disposition pour toute question
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Contact cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <ContactCard
            icon={<PhoneIcon />}
            title="Par téléphone"
            description="Du lundi au vendredi, 8h30 - 18h00"
            action={{ label: "04 72 68 72 38", href: "tel:+33472687238" }}
          />
          <ContactCard
            icon={<EmailIcon />}
            title="Par email"
            description="Réponse sous 24h ouvrées"
            action={{ label: "contact@francilienne-energy.fr", href: "mailto:contact@francilienne-energy.fr" }}
          />
          <ContactCard
            icon={<LocationIcon />}
            title="Nos locaux"
            description="Du lundi au vendredi, sur rendez-vous"
            action={{ label: "Voir l'adresse", href: "#adresse" }}
          />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface">
            <h2 className="font-bold text-text-primary">Questions fréquentes</h2>
          </div>
          <div className="divide-y divide-border">
            <FAQItem
              question="Comment créer un compte professionnel ?"
              answer="Rendez-vous sur la page d'inscription et remplissez le formulaire avec vos informations professionnelles (SIRET, KBIS, pièce d'identité). Notre équipe validera votre compte sous 24-48h."
            />
            <FAQItem
              question="Quels sont les délais de livraison ?"
              answer="Les produits en stock sont expédiés sous 24h. La livraison est effectuée sous 2-5 jours ouvrés selon votre localisation. Un suivi de colis vous est envoyé par email."
            />
            <FAQItem
              question="Puis-je bénéficier de tarifs préférentiels ?"
              answer="Oui, en fonction de vos volumes d'achat, nous pouvons vous proposer des tarifs personnalisés. Contactez notre équipe commerciale pour en discuter."
            />
            <FAQItem
              question="Comment accéder à la documentation technique ?"
              answer="Tous les documents techniques sont disponibles dans la section Documents. Vous pouvez également les télécharger depuis les fiches produits."
            />
            <FAQItem
              question="Proposez-vous des formations ?"
              answer="Oui, nous organisons régulièrement des formations techniques sur nos produits. Contactez-nous pour connaître le calendrier des prochaines sessions."
            />
          </div>
        </div>

        {/* Formulaire contact */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6" id="contact-form">
          <h2 className="font-bold text-text-primary text-xl mb-6">Nous contacter</h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nom</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Société</label>
              <input
                type="text"
                name="company"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Sujet</label>
              <select
                name="subject"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="commercial">Question commerciale</option>
                <option value="technique">Support technique</option>
                <option value="commande">Suivi de commande</option>
                <option value="compte">Problème de compte</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Envoyer le message
            </button>
          </form>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6" id="adresse">
          <h2 className="font-bold text-text-primary text-xl mb-4">Notre adresse</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-text-primary font-medium">Francilienne Energy</p>
              <p className="text-text-secondary mt-2">
                218 Av. Franklin Roosevelt<br />
                69120 Vaulx-en-Velin<br />
                France
              </p>
              <p className="text-text-secondary mt-4">
                <strong>Horaires d'ouverture :</strong><br />
                Lundi - Vendredi : 8h30 - 18h00<br />
                Samedi - Dimanche : Fermé
              </p>
            </div>
            <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2782.8!2d4.9183!3d45.7705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4c1b8b8b8b8b8%3A0x0!2s218%20Av.%20Franklin%20Roosevelt%2C%2069120%20Vaulx-en-Velin!5e0!3m2!1sfr!2sfr!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "200px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      <a
        href={action.href}
        className="text-primary font-medium hover:underline text-sm"
      >
        {action.label}
      </a>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-surface transition-colors">
        <span className="font-medium text-text-primary pr-4">{question}</span>
        <ChevronIcon />
      </summary>
      <div className="px-6 pb-4 text-text-secondary text-sm">{answer}</div>
    </details>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

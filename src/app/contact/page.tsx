export const metadata = {
  title: "Contact | Francilienne Energy",
  description: "Contactez Synexium - Francilienne Energy. Nos équipes à Paris et Lyon sont à votre disposition.",
};

/* =========================================================================
   CONTACT – Page contact avec 2 sites
   ========================================================================= */

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Contactez-nous</h1>
          <p className="text-white/70">
            Synexium – Francilienne Energy · Notre équipe est à votre disposition
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Horaires */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-bold text-text-primary text-xl mb-4 flex items-center gap-2">
            <ClockIcon />
            Horaires d&apos;ouverture
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Jours ouvrés</h3>
              <p className="text-text-secondary">Lundi – Vendredi : <span className="font-medium text-text-primary">8h30 – 18h00</span></p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Week-end & jours fériés</h3>
              <p className="text-text-secondary">Samedi – Dimanche : <span className="font-medium text-heatpump-red">Fermé</span></p>
            </div>
          </div>
        </div>

        {/* 2 Sites */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Site Paris / Île-de-France – Synexium */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LocationIcon />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Synexium</h3>
                <p className="text-xs text-text-secondary">Île-de-France</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPinIcon />
                <p className="text-text-secondary">
                  6-8 Rue des Lilas<br />
                  93160 Noisy-le-Grand<br />
                  France
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon />
                <a href="tel:+33148159200" className="text-primary font-medium hover:underline">
                  01 48 15 92 00
                </a>
              </div>
              <div className="flex items-center gap-2">
                <EmailIcon />
                <a href="mailto:contact@synexium.fr" className="text-primary font-medium hover:underline">
                  contact@synexium.fr
                </a>
              </div>
            </div>
          </div>

          {/* Site Lyon – Francilienne Energy */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LocationIcon />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Francilienne Energy</h3>
                <p className="text-xs text-text-secondary">Rhône-Alpes</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPinIcon />
                <p className="text-text-secondary">
                  218 Av. Franklin Roosevelt<br />
                  69120 Vaulx-en-Velin<br />
                  France
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon />
                <a href="tel:+33472687238" className="text-primary font-medium hover:underline">
                  04 72 68 72 38
                </a>
              </div>
              <div className="flex items-center gap-2">
                <EmailIcon />
                <a href="mailto:contact@francilienne-energy.fr" className="text-primary font-medium hover:underline">
                  contact@francilienne-energy.fr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact rapide */}
        <div className="grid md:grid-cols-3 gap-6">
          <QuickContact
            icon={<PhoneIcon />}
            title="Commercial"
            description="Questions produits, devis, tarifs"
            action={{ label: "04 72 68 72 38", href: "tel:+33472687238" }}
          />
          <QuickContact
            icon={<ToolIcon />}
            title="Support technique"
            description="Accompagnement projets, SAV"
            action={{ label: "contact@francilienne-energy.fr", href: "mailto:contact@francilienne-energy.fr" }}
          />
          <QuickContact
            icon={<TruckIcon />}
            title="Logistique"
            description="Suivi livraison, retrait sur site"
            action={{ label: "04 72 68 72 38", href: "tel:+33472687238" }}
          />
        </div>

        {/* Formulaire contact */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6" id="contact-form">
          <h2 className="font-bold text-text-primary text-xl mb-6">Nous écrire</h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nom *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Société</label>
                <input
                  type="text"
                  name="company"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Sujet *</label>
              <select
                name="subject"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="commercial">Question commerciale</option>
                <option value="technique">Support technique</option>
                <option value="commande">Suivi de commande</option>
                <option value="kit">Kit sur mesure</option>
                <option value="compte">Problème de compte</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message *</label>
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
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function QuickContact({
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

/* ===== Icons ===== */

function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-5 h-5 text-text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

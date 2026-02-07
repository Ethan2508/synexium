import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/logo.png"
              alt="Francilienne Energy"
              width={150}
              height={40}
              style={{ width: 'auto', height: '40px' }}
            />
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Distributeur B2B de solutions énergétiques&nbsp;: solaire, pompes à
            chaleur et climatisation pour installateurs et bureaux d'études.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
            Catalogue
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/catalogue" className="text-white/60 hover:text-white transition-colors">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link href="/catalogue?family=SOLAIRE" className="text-white/60 hover:text-white transition-colors">
                <span className="inline-block w-2 h-2 rounded-full bg-solar-green mr-2" />
                Solaire
              </Link>
            </li>
            <li>
              <Link href="/catalogue?family=PAC" className="text-white/60 hover:text-white transition-colors">
                <span className="inline-block w-2 h-2 rounded-full bg-heatpump-red mr-2" />
                Pompes à chaleur
              </Link>
            </li>
            <li>
              <Link href="/catalogue?family=CLIMATISATION" className="text-white/60 hover:text-white transition-colors">
                <span className="inline-block w-2 h-2 rounded-full bg-climate-blue mr-2" />
                Climatisation
              </Link>
            </li>
          </ul>
        </div>

        {/* Espace pro */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
            Espace Pro
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/auth/register" className="text-white/60 hover:text-white transition-colors">
                Créer un compte
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="text-white/60 hover:text-white transition-colors">
                Se connecter
              </Link>
            </li>
            <li>
              <Link href="/documents" className="text-white/60 hover:text-white transition-colors">
                Fiches techniques
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-white/60 hover:text-white transition-colors">
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MailIcon />
              <span>contact@francilienne-energy.fr</span>
            </li>
            <li className="flex items-start gap-2">
              <PhoneIcon />
              <span>04 72 68 72 38</span>
            </li>
            <li className="flex items-start gap-2">
              <ClockIcon />
              <span>Lun – Ven, 9h – 18h</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Francilienne Energy – Tous droits réservés</p>
          <div className="flex gap-6">
            <Link href="/legal/cgv" className="hover:text-white transition-colors">
              CGV
            </Link>
            <Link href="/legal/mentions" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ===== Icons ===== */
function MailIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

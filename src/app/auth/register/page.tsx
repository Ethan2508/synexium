"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiretAutocomplete from "@/components/ui/SiretAutocomplete";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1 fields
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
    company: "",
    siret: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    tvaNumber: "",
    codeApe: "",
    activity: "",
    contactFunction: "",
    accountingContactName: "",
    accountingContactEmail: "",
    iban: "",
    bic: "",
  });
  const [cgvAccepted, setCgvAccepted] = useState(false);

  // Step 2 files
  const [kbis, setKbis] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [capacityCert, setCapacityCert] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!cgvAccepted) {
      setError("Vous devez accepter les Conditions Générales de Vente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cgvAccepted }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setUserId(data.userId);

      // Auto-login pour que le Step 2 (upload docs) fonctionne
      const supabase = createSupabaseBrowser();
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

      setStep(2);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbis) {
      setError("Le KBIS est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("kbis", kbis);
      if (idFront) fd.append("idFront", idFront);
      if (idBack) fd.append("idBack", idBack);
      if (capacityCert) fd.append("capacityCert", capacityCert);

      const res = await fetch("/api/auth/upload-docs", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  const skipDocs = () => setSuccess(true);

  if (success) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-solar-green/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-solar-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">Inscription envoyée !</h1>
          <p className="text-text-secondary mb-6">
            Votre demande de compte professionnel est en cours de validation par notre équipe.
            Vous recevrez un email dès que votre compte sera activé.
          </p>
          <p className="text-sm text-text-secondary mb-8">
            Délai habituel : 24 à 48h ouvrées.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Inscription professionnelle
          </h1>
          <p className="text-text-secondary">
            Créez votre compte pour accéder aux tarifs et passer commande.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <StepIndicator num={1} label="Informations" active={step === 1} done={step > 1} />
          <div className={`h-0.5 w-12 ${step > 1 ? "bg-solar-green" : "bg-border"}`} />
          <StepIndicator num={2} label="Documents" active={step === 2} done={false} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-heatpump-red/10 border border-heatpump-red rounded-xl text-sm text-heatpump-red font-medium">
            {error}
          </div>
        )}

        {/* ── Step 1 : Informations société ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-6">
            <h2 className="text-lg font-bold text-text-primary">Informations société</h2>

            {/* Recherche entreprise par SIRET/Nom */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Rechercher votre entreprise *
              </label>
              <SiretAutocomplete
                onSelect={(company) => {
                  setForm({
                    ...form,
                    company: company.name,
                    siret: company.siret,
                    address: company.address || "",
                    postalCode: company.postalCode || "",
                    city: company.city || "",
                    codeApe: company.naf || "",
                    activity: company.nafLabel || "",
                    tvaNumber: company.tvaNumber || "",
                  });
                }}
                placeholder="Tapez le nom ou le SIRET de votre entreprise..."
              />
              <p className="text-xs text-text-secondary mt-1">
                Les informations seront pré-remplies automatiquement
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Prénom *" name="firstName" value={form.firstName} onChange={handleChange} required />
              <InputField label="Nom *" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>

            <InputField 
              label="Raison sociale *" 
              name="company" 
              value={form.company} 
              onChange={handleChange} 
              required 
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField 
                label="SIRET (14 chiffres) *" 
                name="siret" 
                value={form.siret} 
                onChange={handleChange} 
                required 
                placeholder="123 456 789 00012" 
              />
              <InputField label="N° TVA intracommunautaire *" name="tvaNumber" value={form.tvaNumber} onChange={handleChange} required placeholder="FR 12 345678901" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Code APE *" name="codeApe" value={form.codeApe} onChange={handleChange} required placeholder="4321A" />
              <InputField label="Activité *" name="activity" value={form.activity} onChange={handleChange} required placeholder="Installation d'équipements thermiques" />
            </div>

            <InputField 
              label="Adresse *" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              required
              placeholder="12 rue de la Paix" 
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Code postal *" name="postalCode" value={form.postalCode} onChange={handleChange} required placeholder="75002" />
              <InputField label="Ville *" name="city" value={form.city} onChange={handleChange} required placeholder="Paris" />
            </div>

            <InputField label="Téléphone *" name="phone" value={form.phone} onChange={handleChange} type="tel" required placeholder="06 12 34 56 78" />

            <hr className="border-border" />
            <h2 className="text-lg font-bold text-text-primary">Contact principal</h2>

            <InputField label="Fonction *" name="contactFunction" value={form.contactFunction} onChange={handleChange} required placeholder="Gérant, Directeur achat…" />

            <hr className="border-border" />
            <h2 className="text-lg font-bold text-text-primary">Contact comptable</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Nom du contact comptable *" name="accountingContactName" value={form.accountingContactName} onChange={handleChange} required placeholder="Nom et prénom" />
              <InputField label="Email comptable *" name="accountingContactEmail" value={form.accountingContactEmail} onChange={handleChange} type="email" required placeholder="compta@entreprise.fr" />
            </div>

            <hr className="border-border" />
            <h2 className="text-lg font-bold text-text-primary">Coordonnées bancaires</h2>
            <p className="text-sm text-text-secondary -mt-2">Pour le paiement par virement</p>

            <InputField label="IBAN *" name="iban" value={form.iban} onChange={handleChange} required placeholder="FR76 1234 5678 9012 3456 7890 123" />
            <InputField label="BIC *" name="bic" value={form.bic} onChange={handleChange} required placeholder="BNPAFRPP" />

            <hr className="border-border" />
            <h2 className="text-lg font-bold text-text-primary">Identifiants de connexion</h2>

            <InputField label="Email professionnel *" name="email" value={form.email} onChange={handleChange} type="email" required placeholder="contact@entreprise.fr" />

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Mot de passe *" name="password" value={form.password} onChange={handleChange} type="password" required minLength={8} placeholder="Min. 8 caractères" />
              <InputField label="Confirmer *" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} type="password" required minLength={8} />
            </div>

            {/* Acceptation CGV */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="cgv"
                checked={cgvAccepted}
                onChange={(e) => { setCgvAccepted(e.target.checked); setError(null); }}
                className="mt-1 w-4 h-4 accent-primary rounded border-border"
              />
              <label htmlFor="cgv" className="text-sm text-text-secondary">
                J'accepte les{" "}
                <Link href="/legal/cgv" target="_blank" className="text-primary font-semibold hover:underline">
                  Conditions Générales de Vente
                </Link>{" "}
                et la{" "}
                <Link href="/legal/confidentialite" target="_blank" className="text-primary font-semibold hover:underline">
                  Politique de Confidentialité
                </Link>{" "}
                de Francilienne Energy. *
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !cgvAccepted}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? "Création en cours…" : "Continuer →"}
            </button>

            <p className="text-center text-sm text-text-secondary">
              Déjà inscrit ?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        )}

        {/* ── Step 2 : Upload documents ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-6">
            <h2 className="text-lg font-bold text-text-primary">Documents justificatifs</h2>
            <p className="text-sm text-text-secondary">
              Pour valider votre statut professionnel, merci de fournir votre extrait KBIS
              et une pièce d'identité du gérant.
            </p>

            <FileUpload
              label="Extrait KBIS (obligatoire) *"
              accept=".pdf,.jpg,.jpeg,.png"
              file={kbis}
              onChange={setKbis}
            />

            <FileUpload
              label="Attestation de capacité (obligatoire si PAC)"
              accept=".pdf,.jpg,.jpeg,.png"
              file={capacityCert}
              onChange={setCapacityCert}
            />

            <FileUpload
              label="Pièce d'identité – Recto"
              accept=".pdf,.jpg,.jpeg,.png"
              file={idFront}
              onChange={setIdFront}
            />

            <FileUpload
              label="Pièce d'identité – Verso"
              accept=".pdf,.jpg,.jpeg,.png"
              file={idBack}
              onChange={setIdBack}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {loading ? "Upload en cours…" : "Envoyer les documents"}
              </button>
              <button
                type="button"
                onClick={skipDocs}
                className="px-6 py-3.5 text-text-secondary font-medium border border-border rounded-lg hover:bg-surface transition"
              >
                Plus tard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function StepIndicator({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          done
            ? "bg-solar-green text-white"
            : active
            ? "bg-primary text-white"
            : "bg-border text-text-secondary"
        }`}
      >
        {done ? "✓" : num}
      </div>
      <span className={`text-sm font-medium ${active ? "text-text-primary" : "text-text-secondary"}`}>
        {label}
      </span>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full px-4 py-2.5 border border-border rounded-lg text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
      />
    </div>
  );
}

function FileUpload({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="hidden"
          id={`file-${label}`}
        />
        <label htmlFor={`file-${label}`} className="cursor-pointer">
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm">
              <svg className="w-5 h-5 text-solar-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-text-primary">{file.name}</span>
              <span className="text-text-secondary">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : (
            <div>
              <svg className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-text-secondary">Cliquer pour sélectionner un fichier</span>
              <span className="block text-xs text-text-secondary/60 mt-1">PDF, JPG ou PNG</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

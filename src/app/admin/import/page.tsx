'use client';

import { useState } from 'react';

/* =========================================================================
   ADMIN – Import CSV du catalogue
   ========================================================================= */

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'import");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Header admin */}
      <div className="bg-primary">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-extrabold text-white">
            Administration — Import CSV
          </h1>
          <p className="text-white/60 mt-1">
            Importez votre catalogue produits depuis un fichier CSV
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* ── Dropzone ── */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Télécharger un fichier CSV
          </h2>

          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors">
            <UploadIcon />

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />

            <label
              htmlFor="csv-upload"
              className="mt-4 inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dark transition"
            >
              Choisir un fichier CSV
            </label>

            {file && (
              <div className="mt-4 text-text-primary">
                <p className="font-medium">{file.name}</p>
                <p className="text-text-secondary text-sm">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full mt-6 px-6 py-4 bg-solar-green text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <SpinnerIcon />
                  Import en cours…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Lancer l'import
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Résultat ── */}
        {result && (
          <div
            className={`rounded-xl p-6 border-2 ${
              result.success
                ? 'bg-solar-green/10 border-solar-green'
                : 'bg-heatpump-red/10 border-heatpump-red'
            }`}
          >
            <div className="flex items-start gap-4">
              {result.success ? <SuccessIcon /> : <ErrorIcon />}

              <div className="flex-1">
                <h3 className="font-bold text-xl text-text-primary mb-4">
                  {result.success ? 'Import réussi ✓' : 'Import avec erreurs'}
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <StatBox value={result.stats.rowsProcessed} label="Lignes traitées" />
                  <StatBox value={result.stats.productsCreated} label="Gammes créées" />
                  <StatBox value={result.stats.variantsCreated} label="Variantes créées" />
                </div>

                {result.errors && result.errors.length > 0 && (
                  <details className="bg-white rounded-lg border border-border p-4 mt-4">
                    <summary className="cursor-pointer font-semibold text-text-primary">
                      Voir les erreurs ({result.errors.length})
                    </summary>
                    <div className="mt-4 space-y-2 text-sm text-text-secondary">
                      {result.errors.map((err: string, i: number) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-heatpump-red/10 border-2 border-heatpump-red rounded-xl p-6 flex items-center gap-3">
            <ErrorIcon />
            <div className="text-text-primary font-semibold">{error}</div>
          </div>
        )}

        {/* ── Instructions ── */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Format CSV attendu
          </h3>

          <div className="text-text-secondary text-sm space-y-3">
            <p>Le fichier CSV doit contenir les colonnes suivantes :</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Libellé Famille</li>
              <li>Référence Article</li>
              <li>Désignation Article</li>
              <li>Référence Fournisseurs</li>
              <li>Fournisseur principal</li>
              <li>Stock réel</li>
              <li>Prix de Vente</li>
            </ul>

            <p className="mt-4">Le système détectera automatiquement :</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Les gammes de produits (désignation sans puissance)</li>
              <li>Les puissances en kW</li>
              <li>Les capacités en L (ballons)</li>
              <li>Les variantes par gamme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Sub-components & Icons ===== */

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-text-secondary text-sm">{label}</div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-16 h-16 text-text-secondary/40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-8 h-8 text-solar-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-8 h-8 text-heatpump-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/siret?q=...
 * Recherche d'entreprises via l'API Recherche Entreprises (data.gouv.fr)
 * Gratuit, sans authentification, jusqu'à 7 requêtes/seconde
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    // API Recherche Entreprises - https://recherche-entreprises.api.gouv.fr/
    const apiUrl = new URL("https://recherche-entreprises.api.gouv.fr/search");
    apiUrl.searchParams.set("q", query);
    apiUrl.searchParams.set("per_page", "10");
    apiUrl.searchParams.set("page", "1");

    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Accept": "application/json",
      },
      // Cache pendant 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("API Entreprise error:", response.status);
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();

    // Formater les résultats
    const results = (data.results || []).map((company: any) => {
      const siege = company.siege || {};
      const address = [
        siege.numero_voie,
        siege.type_voie,
        siege.libelle_voie,
        siege.code_postal,
        siege.libelle_commune,
      ]
        .filter(Boolean)
        .join(" ");

      // Calcul du numéro de TVA intracommunautaire français
      // Formule : FR + clé + SIREN, où clé = (12 + 3 × (SIREN % 97)) % 97
      const siren = company.siren;
      let tvaNumber: string | null = null;
      if (siren && /^\d{9}$/.test(siren)) {
        const sirenNum = parseInt(siren, 10);
        const key = (12 + 3 * (sirenNum % 97)) % 97;
        tvaNumber = `FR${String(key).padStart(2, "0")}${siren}`;
      }

      return {
        siret: siege.siret || company.siren + "00000",
        siren: company.siren,
        name: company.nom_complet || company.nom_raison_sociale,
        address: address || null,
        postalCode: siege.code_postal || null,
        city: siege.libelle_commune || null,
        naf: company.activite_principale || null,
        nafLabel: company.libelle_activite_principale || null,
        tvaNumber,
        legalForm: company.nature_juridique || null,
        createdAt: company.date_creation || null,
        isActive: company.etat_administratif === "A",
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erreur API SIRET:", error);
    return NextResponse.json({ results: [] });
  }
}

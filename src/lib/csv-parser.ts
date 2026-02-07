/**
 * CSV Parser – Import normalisé des produits Francilienne Energy
 *
 * Système UNIQUE d'import (API). Logique identique à import-grouped.ts.
 *
 * Logique :
 * 1. Parse CSV fournisseur (PapaParse)
 * 2. Regroupe les variantes par produit (productGroupKey)
 * 3. Résout ou crée Catégories, Marques, Fournisseurs
 * 4. Upsert Produits + Variantes + Attributs techniques
 */

import Papa from "papaparse";
import { prisma } from "./prisma";

// ═══════════════════════════════════════════════════════════════════════════
// MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

const FAMILY_TO_CATEGORY: Record<string, string> = {
  "AP SYSTEM": "Solaire",
  ENPHASE: "Solaire",
  HOYMILES: "Solaire",
  "ONDULEURS HOYMILES": "Solaire",
  "ONDULEURS HUAWEI": "Solaire",
  SOLPLANET: "Solaire",
  "PANNEAUX FRANCILIENNE": "Solaire",
  "DIVERS SOLAIRES": "Solaire",
  "STOCKAGE HUAWEI": "Stockage",
  "STOCKAGE HOYMILES": "Stockage",
  "K2 ET ACIER": "Intégration",
  "COMPOSANTS GSE INROOF": "Intégration",
  "COMPOSANTS GSE GROUNDSYSTEM": "Intégration",
  "GSE GROUND SYSTEM EVOLUTION": "Intégration",
  "INTEGRATION FRANCILIENNE": "Intégration",
  CARPORT: "Intégration",
  "PAC AIR EAU PANASONIC": "Pompes à chaleur",
  "PAC AIR EAU ARISTON": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL WELLEA SPLIT": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL MONOBLOC R290": "Pompes à chaleur",
  "PAC AIR AIR AIRWELL HDLW/YDZB": "Pompes à chaleur",
  "PAC ACCESSOIRES": "Pompes à chaleur",
  BALLONS: "Pompes à chaleur",
  "CHAUDIERE A GRANULE": "Chauffage",
  "BOITIERS AC ET DC": "Accessoires",
  "CABLES ELECTRIQUES": "Accessoires",
  "PROTECTIONS ELEC": "Accessoires",
  DOMOTIQUE: "Accessoires",
  DESTRATIFICATEUR: "Accessoires",
  "EV CHARGER KEBA": "Mobilité électrique",
};

const SUPPLIER_CODE_TO_NAME: Record<string, string> = {
  SYAPSYSTEMS: "AP Systems",
  SYSVHENERGIE: "SVH Energie",
  SYINNOV8: "Innov8",
  SYMADEP: "Madep",
  SYIENERGY: "IEnergy",
  PERLIGHT: "Perlight",
  SOLARTISANS: "Solartisans",
  SYAMTRADE: "AM Trade",
};

const CATEGORY_COLORS: Record<string, string> = {
  Solaire: "#7fb727",
  Stockage: "#eea400",
  Intégration: "#555555",
  "Pompes à chaleur": "#e6332a",
  Chauffage: "#e6332a",
  Accessoires: "#009fe3",
  "Mobilité électrique": "#00a651",
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CSVRow {
  "Libellé Famille": string;
  "Référence Article": string;
  "Désignation Article": string;
  "Référence Fournisseurs": string;
  "Réf Fournisseurs": string;
  "Fournisseur principal": string;
  "Stock réel": string;
  "Prix de Vente": string;
}

interface ParsedVariant {
  family: string;
  sku: string;
  designation: string;
  supplierRef: string;
  supplierCode: string;
  powerKw: number | null;
  capacity: number | null;
  stock: number;
  price: number;
}

interface ProductGroup {
  baseName: string;
  productGroupKey: string;
  family: string;
  brandName: string | null;
  categoryName: string;
  variants: ParsedVariant[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function parsePrice(raw: string): number {
  if (!raw) return 0;
  return parseFloat(raw.replace(/"/g, "").replace(/\s/g, "").replace(",", ".")) || 0;
}

function parseStock(raw: string): number {
  if (!raw) return 0;
  return Math.max(0, parseFloat(raw.replace(/"/g, "").replace(/\s/g, "").replace(",", ".")) || 0);
}

function extractPower(designation: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*KW\b/i,
    /(\d+(?:\.\d+)?)\s*KTL/i,
    /-(\d+(?:\.\d+)?)K(?:TL)?(?:-|$)/i,
    /SUN2000-(\d+)K/i,
  ];
  for (const pattern of patterns) {
    const match = designation.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractCapacity(designation: string): number | null {
  const matchL = designation.match(/(\d+)\s*L(?:\s|$)/i);
  if (matchL) return parseFloat(matchL[1]);
  const matchKwh = designation.match(/(\d+(?:\.\d+)?)\s*KWH/i);
  if (matchKwh) return parseFloat(matchKwh[1]);
  return null;
}

function extractBrand(designation: string, family: string): string | null {
  const brandPatterns: { pattern: RegExp; brand: string }[] = [
    { pattern: /\bENPHASE\b/i, brand: "Enphase" },
    { pattern: /\bHUAWEI\b/i, brand: "Huawei" },
    { pattern: /\bHOYMILES\b/i, brand: "Hoymiles" },
    { pattern: /\bSOLPLANET\b/i, brand: "Solplanet" },
    { pattern: /\bAPS\b/i, brand: "AP Systems" },
    { pattern: /\bK2\b/i, brand: "K2 Systems" },
    { pattern: /\bGSE\b/i, brand: "GSE" },
    { pattern: /\bPANASONIC\b|AQUAREA/i, brand: "Panasonic" },
    { pattern: /\bAIRWELL\b/i, brand: "Airwell" },
    { pattern: /\bARISTON\b|NIMBUS|NUOS/i, brand: "Ariston" },
    { pattern: /\bKEBA\b/i, brand: "Keba" },
    { pattern: /\bNOARK\b/i, brand: "Noark" },
    { pattern: /\bEATON\b/i, brand: "Eaton" },
    { pattern: /\bFRANCILIENNE\b/i, brand: "Francilienne" },
    { pattern: /\bATLANTIC\b/i, brand: "Atlantic" },
    { pattern: /\bCHAFFOTEAUX\b/i, brand: "Chaffoteaux" },
    { pattern: /\bALTECH\b/i, brand: "Altech" },
    { pattern: /\bLG\b/i, brand: "LG" },
    { pattern: /\bDOMUSA\b/i, brand: "Domusa" },
  ];
  const text = `${designation} ${family}`;
  for (const { pattern, brand } of brandPatterns) {
    if (pattern.test(text)) return brand;
  }
  return null;
}

function getProductBaseName(designation: string): string {
  let name = designation
    .toUpperCase()
    .replace(/\s*\d+\s*L\b/gi, "")
    .replace(/\s*\d+(?:\.\d+)?\s*KWH/gi, "")
    .replace(/\s*\d+(?:\.\d+)?\s*KW\b/gi, "")
    .replace(/\s*\d+(?:\.\d+)?\s*KVA\b/gi, "")
    .replace(/\s*\d+(?:\.\d+)?\s*KTL\b/gi, "")
    .replace(/-\d+(?:\.\d+)?K\b/gi, "")
    .replace(/\s*\d+KWC\b/gi, "")
    .replace(/\s*\(\d+A\)/gi, "")
    .replace(/\s+\d+A\b/gi, "")
    .replace(/-\s*DPR\d+/gi, "")
    .replace(/\s*-\s*[A-Z0-9]{7,}\b/gi, "")
    .replace(/\bCO?AC\d?INJ\d+[A-Z]?\b/gi, "")
    .replace(/\b[A-Z]?\d{6,}[A-Z]?\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+\d+(?:\.\d+)?M\b/gi, "")
    .replace(/\s*\d+(?:\.\d+)?MM²?/gi, "")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^-+|-+$/g, "")
    .trim();
  if (name.length < 5) {
    name = designation.toUpperCase().replace(/-\s*DPR\d+/gi, "").trim();
  }
  return name;
}

function generateProductGroupKey(baseName: string, brandName: string | null): string {
  let key = baseName
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 60);
  if (brandName) {
    const brandKey = brandName.toUpperCase().replace(/\s+/g, "_");
    if (!key.startsWith(brandKey)) key = `${brandKey}_${key}`;
  }
  return key;
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHES (per-import session)
// ═══════════════════════════════════════════════════════════════════════════

const categoryCache = new Map<string, string>();
const brandCache = new Map<string, string>();
const supplierCache = new Map<string, string>();

async function getOrCreateCategory(name: string): Promise<string> {
  if (categoryCache.has(name)) return categoryCache.get(name)!;
  const cat = await prisma.category.upsert({
    where: { name },
    create: { name, slug: createSlug(name), color: CATEGORY_COLORS[name] || "#283084" },
    update: {},
  });
  categoryCache.set(name, cat.id);
  return cat.id;
}

async function getOrCreateBrand(name: string): Promise<string> {
  if (brandCache.has(name)) return brandCache.get(name)!;
  const brand = await prisma.brand.upsert({
    where: { name },
    create: { name, slug: createSlug(name) },
    update: {},
  });
  brandCache.set(name, brand.id);
  return brand.id;
}

async function getOrCreateSupplier(name: string): Promise<string> {
  if (supplierCache.has(name)) return supplierCache.get(name)!;
  const supplier = await prisma.supplier.upsert({
    where: { name },
    create: { name, slug: createSlug(name) },
    update: {},
  });
  supplierCache.set(name, supplier.id);
  return supplier.id;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export async function importCSV(fileContent: string): Promise<{
  success: boolean;
  rowsProcessed: number;
  productsCreated: number;
  variantsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let rowsProcessed = 0;
  let productsCreated = 0;
  let variantsCreated = 0;

  // Reset caches
  categoryCache.clear();
  brandCache.clear();
  supplierCache.clear();

  // Pré-charger caches
  const [cats, brands, suppliers] = await Promise.all([
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.supplier.findMany(),
  ]);
  cats.forEach((c) => categoryCache.set(c.name, c.id));
  brands.forEach((b) => brandCache.set(b.name, b.id));
  suppliers.forEach((s) => supplierCache.set(s.name, s.id));

  return new Promise((resolve) => {
    Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // ── Phase 1 : Parser ──
          const parsed: ParsedVariant[] = [];
          for (const row of results.data) {
            if (!row["Désignation Article"] || row["Libellé Famille"] === "#NAME?") continue;
            const designation = row["Désignation Article"].trim();
            const family = row["Libellé Famille"].trim();
            const sku = row["Référence Article"]?.trim();
            if (!sku) continue;

            parsed.push({
              family,
              sku,
              designation,
              supplierRef: row["Référence Fournisseurs"]?.trim() || row["Réf Fournisseurs"]?.trim() || "",
              supplierCode: row["Fournisseur principal"]?.trim() || "",
              powerKw: extractPower(designation),
              capacity: extractCapacity(designation),
              stock: parseStock(row["Stock réel"]),
              price: parsePrice(row["Prix de Vente"]),
            });
            rowsProcessed++;
          }

          // ── Phase 2 : Regrouper par produit ──
          const groups = new Map<string, ProductGroup>();
          for (const v of parsed) {
            const baseName = getProductBaseName(v.designation);
            const brandName = extractBrand(v.designation, v.family);
            const categoryName = FAMILY_TO_CATEGORY[v.family] || "Autres";
            const productGroupKey = generateProductGroupKey(baseName, brandName);
            const key = `${productGroupKey}|${categoryName}`;

            if (!groups.has(key)) {
              groups.set(key, {
                baseName,
                productGroupKey,
                family: v.family,
                brandName,
                categoryName,
                variants: [],
              });
            }
            groups.get(key)!.variants.push(v);
          }

          // ── Phase 3 : Upsert produits + variantes ──
          const usedSlugs = new Set<string>();
          const existingSlugs = await prisma.product.findMany({ select: { slug: true } });
          existingSlugs.forEach((p) => usedSlugs.add(p.slug));

          for (const [, group] of groups) {
            try {
              const categoryId = await getOrCreateCategory(group.categoryName);
              const brandId = group.brandName ? await getOrCreateBrand(group.brandName) : null;

              // Chercher produit existant via productGroupKey
              let product = await prisma.product.findFirst({
                where: { productGroupKey: group.productGroupKey },
              });

              if (product) {
                product = await prisma.product.update({
                  where: { id: product.id },
                  data: { family: group.family, categoryId, brandId },
                });
              } else {
                let slug = createSlug(group.baseName);
                let counter = 1;
                while (usedSlugs.has(slug)) {
                  slug = `${createSlug(group.baseName)}-${counter++}`;
                }
                usedSlugs.add(slug);

                product = await prisma.product.create({
                  data: {
                    name: group.baseName,
                    slug,
                    productGroupKey: group.productGroupKey,
                    family: group.family,
                    categoryId,
                    brandId,
                    active: true,
                  },
                });
              }
              productsCreated++;

              // Upsert variantes
              for (const v of group.variants) {
                try {
                  const supplierName = SUPPLIER_CODE_TO_NAME[v.supplierCode] || v.supplierCode;
                  const supplierId =
                    supplierName && supplierName.length > 1
                      ? await getOrCreateSupplier(supplierName)
                      : null;

                  const variantData = {
                    designation: v.designation,
                    powerKw: v.powerKw,
                    capacity: v.capacity,
                    supplierReference: v.supplierRef,
                    supplierId,
                    realStock: v.stock,
                    catalogPriceHT: v.price,
                    active: v.stock > 0 || v.price > 0,
                  };

                  const createdVariant = await prisma.productVariant.upsert({
                    where: { sku: v.sku },
                    create: { sku: v.sku, productId: product.id, ...variantData },
                    update: variantData,
                  });

                  // Upsert VariantAttributes
                  const attrs: { name: string; value: string; unit: string | null }[] = [];
                  if (v.powerKw !== null)
                    attrs.push({ name: "Puissance", value: String(v.powerKw), unit: "kW" });
                  if (v.capacity !== null) {
                    const unit = v.designation.toUpperCase().includes("KWH") ? "kWh" : "L";
                    attrs.push({ name: "Capacité", value: String(v.capacity), unit });
                  }
                  if (/\bMONO(?:PHASE)?\b/i.test(v.designation))
                    attrs.push({ name: "Phase", value: "Monophasé", unit: null });
                  else if (/\bTRI(?:PHASE)?\b/i.test(v.designation))
                    attrs.push({ name: "Phase", value: "Triphasé", unit: null });
                  const ampMatch = v.designation.match(/\((\d+)A\)/);
                  if (ampMatch)
                    attrs.push({ name: "Intensité", value: ampMatch[1], unit: "A" });

                  if (attrs.length > 0) {
                    await prisma.variantAttribute.deleteMany({ where: { variantId: createdVariant.id } });
                    await prisma.variantAttribute.createMany({
                      data: attrs.map((a) => ({ variantId: createdVariant.id, ...a })),
                    });
                  }

                  variantsCreated++;
                } catch (err) {
                  errors.push(`Erreur variante ${v.sku}: ${err}`);
                }
              }
            } catch (err) {
              errors.push(`Erreur produit ${group.baseName}: ${err}`);
            }
          }

          resolve({ success: errors.length === 0, rowsProcessed, productsCreated, variantsCreated, errors });
        } catch (globalErr) {
          resolve({
            success: false,
            rowsProcessed,
            productsCreated,
            variantsCreated,
            errors: [...errors, `Erreur globale: ${globalErr}`],
          });
        }
      },
      error: (error: Error) => {
        resolve({
          success: false,
          rowsProcessed: 0,
          productsCreated: 0,
          variantsCreated: 0,
          errors: [error.message],
        });
      },
    });
  });
}

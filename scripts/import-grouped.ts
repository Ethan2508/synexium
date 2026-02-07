import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Import CSV avec REGROUPEMENT des variantes
 * 
 * Un produit = plusieurs variantes (même image, descriptions différentes)
 * Regroupement basé sur le NOM NETTOYÉ (sans puissance/capacité/suffixes)
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

const FAMILY_TO_CATEGORY: Record<string, string> = {
  "AP SYSTEM": "Solaire",
  "ENPHASE": "Solaire",
  "HOYMILES": "Solaire",
  "ONDULEURS HOYMILES": "Solaire",
  "ONDULEURS HUAWEI": "Solaire",
  "SOLPLANET": "Solaire",
  "PANNEAUX FRANCILIENNE": "Solaire",
  "DIVERS SOLAIRES": "Solaire",
  "STOCKAGE HUAWEI": "Stockage",
  "STOCKAGE HOYMILES": "Stockage",
  "K2 ET ACIER": "Intégration",
  "COMPOSANTS GSE INROOF": "Intégration",
  "COMPOSANTS GSE GROUNDSYSTEM": "Intégration",
  "GSE GROUND SYSTEM EVOLUTION": "Intégration",
  "INTEGRATION FRANCILIENNE": "Intégration",
  "CARPORT": "Intégration",
  "PAC AIR EAU PANASONIC": "Pompes à chaleur",
  "PAC AIR EAU ARISTON": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL WELLEA SPLIT": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL MONOBLOC R290": "Pompes à chaleur",
  "PAC AIR AIR AIRWELL HDLW/YDZB": "Pompes à chaleur",
  "PAC ACCESSOIRES": "Pompes à chaleur",
  "BALLONS": "Pompes à chaleur",
  "CHAUDIERE A GRANULE": "Chauffage",
  "BOITIERS AC ET DC": "Accessoires",
  "CABLES ELECTRIQUES": "Accessoires",
  "PROTECTIONS ELEC": "Accessoires",
  "DOMOTIQUE": "Accessoires",
  "DESTRATIFICATEUR": "Accessoires",
  "EV CHARGER KEBA": "Mobilité électrique",
};

const SUPPLIER_CODE_TO_NAME: Record<string, string> = {
  "SYAPSYSTEMS": "AP Systems",
  "SYSVHENERGIE": "SVH Energie",
  "SYINNOV8": "Innov8",
  "SYMADEP": "Madep",
  "SYIENERGY": "IEnergy",
  "PERLIGHT": "Perlight",
  "SOLARTISANS": "Solartisans",
  "SYAMTRADE": "AM Trade",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Solaire": "#7fb727",
  "Stockage": "#eea400",
  "Intégration": "#555555",
  "Pompes à chaleur": "#e6332a",
  "Chauffage": "#e6332a",
  "Accessoires": "#009fe3",
  "Mobilité électrique": "#00a651",
};

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

/**
 * Génère une clé de regroupement STABLE pour un produit
 * Format: MARQUE_GAMME_TYPE (ex: HUAWEI_SUN2000, BOITIER_MONO_SANS_OPTION)
 * 
 * Cette clé est :
 * - Stable dans le temps (ne change pas si le wording CSV change)
 * - Invisible côté frontend
 * - Utilisée comme clé principale de regroupement
 */
function generateProductGroupKey(baseName: string, brandName: string | null): string {
  let key = baseName
    .toUpperCase()
    // Normaliser les accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remplacer espaces et tirets par underscore
    .replace(/[\s-]+/g, "_")
    // Garder uniquement lettres, chiffres et underscores
    .replace(/[^A-Z0-9_]/g, "")
    // Supprimer underscores multiples
    .replace(/_+/g, "_")
    // Supprimer underscores en début/fin
    .replace(/^_|_$/g, "")
    // Limiter la longueur
    .substring(0, 60);

  // Si une marque est identifiée et n'est pas déjà dans la clé, la préfixer
  if (brandName) {
    const brandKey = brandName.toUpperCase().replace(/\s+/g, "_");
    if (!key.startsWith(brandKey)) {
      key = `${brandKey}_${key}`;
    }
  }

  return key;
}

/**
 * Nettoie le nom pour obtenir le NOM DE BASE du produit
 * Enlève les puissances, capacités, suffixes techniques pour grouper les variantes
 */
function getProductBaseName(designation: string): string {
  let name = designation.toUpperCase()
    // ─────────────────────────────────────────────────────────────────────
    // VOLUMES/CAPACITÉS (ballons, etc.)
    // ─────────────────────────────────────────────────────────────────────
    // "200L", "270 L", "280L"
    .replace(/\s*\d+\s*L\b/gi, "")
    // "5.0KWH", "10 KWH"
    .replace(/\s*\d+(?:\.\d+)?\s*KWH/gi, "")
    
    // ─────────────────────────────────────────────────────────────────────
    // PUISSANCES (onduleurs, PAC, etc.)
    // ─────────────────────────────────────────────────────────────────────
    // "5KW", "10 KW", "3.5KW"
    .replace(/\s*\d+(?:\.\d+)?\s*KW\b/gi, "")
    // "5KVA", "10 KVA"
    .replace(/\s*\d+(?:\.\d+)?\s*KVA\b/gi, "")
    // "10KTL", "5 KTL"
    .replace(/\s*\d+(?:\.\d+)?\s*KTL\b/gi, "")
    // "SUN2000-10K", "-5K-"
    .replace(/-\d+(?:\.\d+)?K\b/gi, "")
    // "3KWC", "6KWC"
    .replace(/\s*\d+KWC\b/gi, "")
    
    // ─────────────────────────────────────────────────────────────────────
    // AMPÉRAGES
    // ─────────────────────────────────────────────────────────────────────
    // "(15A)", "30A", "80A"
    .replace(/\s*\(\d+A\)/gi, "")
    .replace(/\s+\d+A\b/gi, "")
    
    // ─────────────────────────────────────────────────────────────────────
    // RÉFÉRENCES TECHNIQUES - Important pour les boîtiers
    // ─────────────────────────────────────────────────────────────────────
    // "-DPR145"
    .replace(/-\s*DPR\d+/gi, "")
    // "- 71000030N -", "- COACINJ200N" (références après tiret)
    .replace(/\s*-\s*[A-Z0-9]{7,}\b/gi, "")
    // "COACINJ200N", "COAC3INJ001" (références codes produit Madep)
    .replace(/\bCO?AC\d?INJ\d+[A-Z]?\b/gi, "")
    // "3069796", "7HP030016" (références longues)
    .replace(/\b[A-Z]?\d{6,}[A-Z]?\b/gi, "")
    // Références entre parenthèses
    .replace(/\([^)]*\)/g, "")
    
    // ─────────────────────────────────────────────────────────────────────
    // DIMENSIONS (câbles, etc.)
    // ─────────────────────────────────────────────────────────────────────
    // "2M", "5M", "10M" (longueurs)
    .replace(/\s+\d+(?:\.\d+)?M\b/gi, "")
    // "1.5MM²", "2.5mm²"
    .replace(/\s*\d+(?:\.\d+)?MM²?/gi, "")
    
    // ─────────────────────────────────────────────────────────────────────
    // NETTOYAGE FINAL
    // ─────────────────────────────────────────────────────────────────────
    // Tirets multiples → simple
    .replace(/-+/g, "-")
    // Espaces multiples → simple
    .replace(/\s+/g, " ")
    // Tirets en début/fin
    .replace(/^-+|-+$/g, "")
    // Espaces en début/fin
    .trim();

  // Si le nom est trop court après nettoyage, garder l'original simplifié
  if (name.length < 5) {
    name = designation.toUpperCase().replace(/-\s*DPR\d+/gi, "").trim();
  }

  return name;
}

function extractPower(designation: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*KW/i,
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
  // Capacité en litres (ballons)
  const matchL = designation.match(/(\d+)\s*L(?:\s|$)/i);
  if (matchL) return parseFloat(matchL[1]);
  
  // Capacité en kWh (batteries)
  const matchKwh = designation.match(/(\d+(?:\.\d+)?)\s*KWH/i);
  if (matchKwh) return parseFloat(matchKwh[1]);
  
  return null;
}

function extractBrand(designation: string, family: string): string | null {
  const brandPatterns = [
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

interface CSVRow {
  family: string;
  sku: string;
  designation: string;
  supplierRef: string;
  supplierCode: string;
  stock: number;
  price: number;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.split("\n");
  const results: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length < 8) continue;
    
    const [family, sku, designation, supplierRef1, , supplierCode, stockStr, priceStr] = values;
    
    if (!family || !sku || !designation || family === "#NAME?" || family === "Libellé Famille") continue;
    
    const stock = parseFloat(stockStr.replace(/\s/g, "").replace(",", ".")) || 0;
    const price = parseFloat(priceStr.replace(/\s/g, "").replace(",", ".")) || 0;
    
    results.push({
      family,
      sku,
      designation,
      supplierRef: supplierRef1,
      supplierCode,
      stock: Math.max(0, stock),
      price,
    });
  }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// CACHES
// ════════════════════════════════════════════════════════════════════════════

const categoryCache = new Map<string, string>();
const brandCache = new Map<string, string>();
const supplierCache = new Map<string, string>();

async function getOrCreateCategory(name: string): Promise<string> {
  if (categoryCache.has(name)) return categoryCache.get(name)!;
  
  let category = await prisma.category.findUnique({ where: { name } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        slug: createSlug(name),
        color: CATEGORY_COLORS[name] || "#283084",
      },
    });
    console.log(`   📁 Nouvelle catégorie: ${name}`);
  }
  
  categoryCache.set(name, category.id);
  return category.id;
}

async function getOrCreateBrand(name: string): Promise<string> {
  if (brandCache.has(name)) return brandCache.get(name)!;
  
  let brand = await prisma.brand.findUnique({ where: { name } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: { name, slug: createSlug(name) },
    });
    console.log(`   🏷️  Nouvelle marque: ${name}`);
  }
  
  brandCache.set(name, brand.id);
  return brand.id;
}

async function getOrCreateSupplier(name: string): Promise<string> {
  if (supplierCache.has(name)) return supplierCache.get(name)!;
  
  let supplier = await prisma.supplier.findUnique({ where: { name } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: { name, slug: createSlug(name) },
    });
    console.log(`   🏭 Nouveau fournisseur: ${name}`);
  }
  
  supplierCache.set(name, supplier.id);
  return supplier.id;
}

// ════════════════════════════════════════════════════════════════════════════
// REGROUPEMENT DES VARIANTES
// ════════════════════════════════════════════════════════════════════════════

interface ProductGroup {
  baseName: string;
  productGroupKey: string;  // Clé stable de regroupement
  family: string;
  brandName: string | null;
  categoryName: string;
  variants: CSVRow[];
}

function groupVariants(rows: CSVRow[]): Map<string, ProductGroup> {
  const groups = new Map<string, ProductGroup>();
  
  for (const row of rows) {
    const baseName = getProductBaseName(row.designation);
    const brandName = extractBrand(row.designation, row.family);
    const categoryName = FAMILY_TO_CATEGORY[row.family] || "Autres";
    
    // Générer la clé de regroupement stable
    const productGroupKey = generateProductGroupKey(baseName, brandName);
    
    // Clé unique = productGroupKey + catégorie (pour éviter collision entre catégories)
    const key = `${productGroupKey}|${categoryName}`;
    
    if (!groups.has(key)) {
      groups.set(key, {
        baseName,
        productGroupKey,
        family: row.family,
        brandName,
        categoryName,
        variants: [],
      });
    }
    
    groups.get(key)!.variants.push(row);
  }
  
  return groups;
}

// ════════════════════════════════════════════════════════════════════════════
// IMPORT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════

async function importProducts() {
  const csvPath = path.join(process.cwd(), "..", "BI liste article + stock réel.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Fichier CSV introuvable:", csvPath);
    return;
  }
  
  // 1. Supprimer toutes les données existantes
  console.log("🗑️  Nettoyage de la base...");
  await prisma.variantAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  console.log("   ✓ Produits, variantes et attributs supprimés\n");
  
  // 2. Parser le CSV
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  console.log(`📄 ${rows.length} lignes trouvées dans le CSV\n`);
  
  // 3. Pré-charger les caches
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach(c => categoryCache.set(c.name, c.id));
  
  const existingBrands = await prisma.brand.findMany();
  existingBrands.forEach(b => brandCache.set(b.name, b.id));
  
  const existingSuppliers = await prisma.supplier.findMany();
  existingSuppliers.forEach(s => supplierCache.set(s.name, s.id));
  
  // 4. Regrouper les variantes
  console.log("🔄 Regroupement des variantes...");
  const groups = groupVariants(rows);
  console.log(`   ✓ ${groups.size} produits distincts identifiés (pour ${rows.length} références)\n`);
  
  // 5. Importer
  console.log("📦 Import des produits...\n");
  
  const usedSlugs = new Set<string>();
  let productsCreated = 0;
  let variantsCreated = 0;
  
  for (const [key, group] of groups) {
    try {
      // Résoudre catégorie et marque
      const categoryId = await getOrCreateCategory(group.categoryName);
      const brandId = group.brandName ? await getOrCreateBrand(group.brandName) : null;
      
      // Générer un slug unique
      let baseSlug = createSlug(group.baseName);
      let slug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }
      usedSlugs.add(slug);
      
      // Créer le produit avec sa clé de regroupement stable
      const product = await prisma.product.create({
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
      productsCreated++;
      
      // Créer toutes les variantes avec leurs attributs techniques
      for (const variant of group.variants) {
        const supplierName = SUPPLIER_CODE_TO_NAME[variant.supplierCode] || variant.supplierCode;
        const supplierId = supplierName && supplierName.length > 1 
          ? await getOrCreateSupplier(supplierName) 
          : null;
        
        const powerKw = extractPower(variant.designation);
        const capacity = extractCapacity(variant.designation);
        
        const createdVariant = await prisma.productVariant.create({
          data: {
            sku: variant.sku,
            designation: variant.designation,
            powerKw,
            capacity,
            supplierReference: variant.supplierRef,
            supplierId,
            realStock: variant.stock,
            catalogPriceHT: variant.price,
            active: variant.stock > 0 || variant.price > 0,
            productId: product.id,
          },
        });
        
        // Créer les VariantAttribute pour les attributs techniques détectés
        const attributesToCreate: { name: string; value: string; unit: string }[] = [];
        
        if (powerKw !== null) {
          attributesToCreate.push({ name: "Puissance", value: String(powerKw), unit: "kW" });
        }
        if (capacity !== null) {
          // Déterminer l'unité (litres ou kWh)
          const unit = variant.designation.toUpperCase().includes("KWH") ? "kWh" : "L";
          attributesToCreate.push({ name: "Capacité", value: String(capacity), unit });
        }
        
        // Détecter mono/tri
        if (/\bMONO(?:PHASE)?\b/i.test(variant.designation)) {
          attributesToCreate.push({ name: "Phase", value: "Monophasé", unit: "" });
        } else if (/\bTRI(?:PHASE)?\b/i.test(variant.designation)) {
          attributesToCreate.push({ name: "Phase", value: "Triphasé", unit: "" });
        }
        
        // Détecter ampérage
        const ampMatch = variant.designation.match(/\((\d+)A\)/);
        if (ampMatch) {
          attributesToCreate.push({ name: "Intensité", value: ampMatch[1], unit: "A" });
        }
        
        // Créer les attributs en base
        if (attributesToCreate.length > 0) {
          await prisma.variantAttribute.createMany({
            data: attributesToCreate.map(attr => ({
              variantId: createdVariant.id,
              name: attr.name,
              value: attr.value,
              unit: attr.unit || null,
            })),
          });
        }
        
        variantsCreated++;
      }
      
      // Afficher progression
      if (productsCreated % 50 === 0) {
        process.stdout.write(`\r   ✓ ${productsCreated} produits, ${variantsCreated} variantes...`);
      }
      
    } catch (error: any) {
      console.error(`\n❌ Erreur sur "${group.baseName}":`, error.message);
    }
  }
  
  console.log(`\r   ✓ ${productsCreated} produits, ${variantsCreated} variantes créés\n`);
  
  // 6. Résumé final
  console.log("✅ Import terminé !\n");
  console.log("📊 Statistiques:");
  console.log(`   - ${productsCreated} produits (au lieu de ${rows.length} si 1 par ligne)`);
  console.log(`   - ${variantsCreated} variantes`);
  console.log(`   - Ratio: ${(variantsCreated / productsCreated).toFixed(1)} variantes/produit en moyenne`);
  
  // Exemples de produits avec plusieurs variantes
  const multiVariantProducts = await prisma.product.findMany({
    include: { _count: { select: { variants: true } } },
    orderBy: { variants: { _count: "desc" } },
    take: 10,
  });
  
  console.log("\n🏆 Top 10 produits avec le plus de variantes:");
  for (const p of multiVariantProducts) {
    console.log(`   - ${p.name}: ${p._count.variants} variantes`);
  }
  
  // Stats par catégorie
  console.log("\n📁 Par catégorie:");
  const categories = await prisma.category.findMany({
    include: { 
      _count: { select: { products: true } },
      products: { include: { _count: { select: { variants: true } } } }
    },
  });
  for (const cat of categories) {
    const totalVariants = cat.products.reduce((sum, p) => sum + p._count.variants, 0);
    console.log(`   - ${cat.name}: ${cat._count.products} produits, ${totalVariants} variantes`);
  }
  
  // Stats sur les attributs techniques
  const attributeStats = await prisma.variantAttribute.groupBy({
    by: ["name"],
    _count: { name: true },
  });
  console.log("\n🔧 Attributs techniques créés:");
  for (const stat of attributeStats) {
    console.log(`   - ${stat.name}: ${stat._count.name} valeurs`);
  }
  
  // Exemples de productGroupKey
  const groupKeyExamples = await prisma.product.findMany({
    select: { name: true, productGroupKey: true },
    take: 10,
  });
  console.log("\n🔑 Exemples de productGroupKey:");
  for (const p of groupKeyExamples) {
    console.log(`   - ${p.productGroupKey}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXÉCUTION
// ════════════════════════════════════════════════════════════════════════════

importProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

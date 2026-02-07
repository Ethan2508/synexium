import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Import CSV vers schéma normalisé (Brand, Category, Supplier)
 * 
 * Structure CSV:
 * Famille | Référence Article | Désignation Article | Réf Fournisseurs | Réf Fournisseurs | Fournisseur | Stock réel | Prix de Vente
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

// Mapping des familles CSV vers catégories
const FAMILY_TO_CATEGORY: Record<string, string> = {
  // Solaire
  "AP SYSTEM": "Solaire",
  "ENPHASE": "Solaire",
  "HOYMILES": "Solaire",
  "ONDULEURS HOYMILES": "Solaire",
  "ONDULEURS HUAWEI": "Solaire",
  "SOLPLANET": "Solaire",
  "PANNEAUX FRANCILIENNE": "Solaire",
  "DIVERS SOLAIRES": "Solaire",
  
  // Stockage
  "STOCKAGE HUAWEI": "Stockage",
  "STOCKAGE HOYMILES": "Stockage",
  
  // Intégration
  "K2 ET ACIER": "Intégration",
  "COMPOSANTS GSE INROOF": "Intégration",
  "COMPOSANTS GSE GROUNDSYSTEM": "Intégration",
  "GSE GROUND SYSTEM EVOLUTION": "Intégration",
  "INTEGRATION FRANCILIENNE": "Intégration",
  "CARPORT": "Intégration",
  
  // Pompes à chaleur
  "PAC AIR EAU PANASONIC": "Pompes à chaleur",
  "PAC AIR EAU ARISTON": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL WELLEA SPLIT": "Pompes à chaleur",
  "PAC AIR EAU AIRWELL MONOBLOC R290": "Pompes à chaleur",
  "PAC AIR AIR AIRWELL HDLW/YDZB": "Pompes à chaleur",
  "PAC ACCESSOIRES": "Pompes à chaleur",
  "BALLONS": "Pompes à chaleur",
  "CHAUDIERE A GRANULE": "Chauffage",
  
  // Accessoires
  "BOITIERS AC ET DC": "Accessoires",
  "CABLES ELECTRIQUES": "Accessoires",
  "PROTECTIONS ELEC": "Accessoires",
  "DOMOTIQUE": "Accessoires",
  "DESTRATIFICATEUR": "Accessoires",
  
  // Mobilité
  "EV CHARGER KEBA": "Mobilité électrique",
};

// Mapping des codes fournisseurs vers noms normalisés
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

// Couleurs par défaut pour les nouvelles catégories
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

function extractPower(designation: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*KW/i,
    /(\d+(?:\.\d+)?)\s*KTL/i,
    /-(\d+(?:\.\d+)?)K(?:TL)?/i,
    /SUN2000-(\d+)K/i,
  ];
  
  for (const pattern of patterns) {
    const match = designation.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return null;
}

function extractCapacity(designation: string): number | null {
  const match = designation.match(/(\d+(?:\.\d+)?)\s*KWH/i);
  return match ? parseFloat(match[1]) : null;
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
    { pattern: /\bARISTON\b|NIMBUS/i, brand: "Ariston" },
    { pattern: /\bKEBA\b/i, brand: "Keba" },
    { pattern: /\bNOARK\b/i, brand: "Noark" },
    { pattern: /\bEATON\b/i, brand: "Eaton" },
    { pattern: /\bFRANCILIENNE\b/i, brand: "Francilienne" },
  ];
  
  const text = `${designation} ${family}`;
  for (const { pattern, brand } of brandPatterns) {
    if (pattern.test(text)) return brand;
  }
  
  return null;
}

function parseCSV(content: string): Array<{
  family: string;
  sku: string;
  designation: string;
  supplierRef: string;
  supplierCode: string;
  stock: number;
  price: number;
}> {
  const lines = content.split("\n");
  const results: any[] = [];
  
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
// IMPORT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════

async function importProducts(limit?: number) {
  const csvPath = path.join(process.cwd(), "..", "BI liste article + stock réel.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Fichier CSV introuvable:", csvPath);
    return;
  }
  
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  
  console.log(`\n📦 Import de ${limit || rows.length} produits (schéma normalisé)...\n`);
  console.log(`📄 ${rows.length} lignes trouvées dans le CSV\n`);
  
  // Pré-charger les caches
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach(c => categoryCache.set(c.name, c.id));
  
  const existingBrands = await prisma.brand.findMany();
  existingBrands.forEach(b => brandCache.set(b.name, b.id));
  
  const existingSuppliers = await prisma.supplier.findMany();
  existingSuppliers.forEach(s => supplierCache.set(s.name, s.id));
  
  const existingSlugs = new Set((await prisma.product.findMany({ select: { slug: true } })).map(p => p.slug));
  const existingSkus = new Set((await prisma.productVariant.findMany({ select: { sku: true } })).map(v => v.sku));
  
  let imported = 0;
  let productsCreated = 0;
  let variantsCreated = 0;
  let skipped = 0;
  
  const toProcess = limit ? rows.slice(0, limit) : rows;
  
  for (const row of toProcess) {
    // Skip si SKU existe déjà
    if (existingSkus.has(row.sku)) {
      skipped++;
      continue;
    }
    
    try {
      // 1. Résoudre catégorie
      const categoryName = FAMILY_TO_CATEGORY[row.family] || "Autres";
      const categoryId = await getOrCreateCategory(categoryName);
      
      // 2. Résoudre marque
      const brandName = extractBrand(row.designation, row.family);
      let brandId: string | null = null;
      if (brandName) {
        brandId = await getOrCreateBrand(brandName);
      }
      
      // 3. Résoudre fournisseur
      const supplierName = SUPPLIER_CODE_TO_NAME[row.supplierCode] || row.supplierCode;
      let supplierId: string | null = null;
      if (supplierName && supplierName.length > 1) {
        supplierId = await getOrCreateSupplier(supplierName);
      }
      
      // 4. Créer le produit
      let baseSlug = createSlug(row.designation);
      let slug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }
      existingSlugs.add(slug);
      
      const product = await prisma.product.create({
        data: {
          name: row.designation.replace(/-\s*DPR\d+/gi, "").trim(),
          slug,
          family: row.family, // Gardé pour rétrocompatibilité
          categoryId,
          brandId,
          active: true,
        },
      });
      productsCreated++;
      
      // 5. Créer la variante
      await prisma.productVariant.create({
        data: {
          sku: row.sku,
          designation: row.designation,
          powerKw: extractPower(row.designation),
          capacity: extractCapacity(row.designation),
          supplierReference: row.supplierRef,
          supplierId,
          realStock: row.stock,
          catalogPriceHT: row.price,
          active: row.stock > 0 || row.price > 0,
          productId: product.id,
        },
      });
      variantsCreated++;
      existingSkus.add(row.sku);
      
      imported++;
      process.stdout.write(`\r✓ Importé: ${imported} | Créés: ${productsCreated} produits, ${variantsCreated} variantes | Skipped: ${skipped}`);
      
    } catch (error: any) {
      if (!error.message.includes("Unique constraint")) {
        console.error(`\n❌ Erreur sur ${row.sku}:`, error.message);
      }
      skipped++;
    }
  }
  
  console.log(`\n\n✅ Import terminé !`);
  console.log(`   - ${productsCreated} produits créés`);
  console.log(`   - ${variantsCreated} variantes créées`);
  console.log(`   - ${skipped} lignes ignorées (déjà existantes)`);
  
  // Résumé final
  console.log("\n📊 État de la base:");
  console.log(`   - ${await prisma.category.count()} catégories`);
  console.log(`   - ${await prisma.brand.count()} marques`);
  console.log(`   - ${await prisma.supplier.count()} fournisseurs`);
  console.log(`   - ${await prisma.product.count()} produits`);
  console.log(`   - ${await prisma.productVariant.count()} variantes`);
}

// ════════════════════════════════════════════════════════════════════════════
// EXÉCUTION
// ════════════════════════════════════════════════════════════════════════════

const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;
importProducts(limit)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

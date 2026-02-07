import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script de migration des données existantes vers le nouveau schéma normalisé
 * - Crée les Brands depuis les noms de produits
 * - Crée les Categories depuis les anciennes familles
 * - Crée les Suppliers depuis les données de variantes
 */

// Mapping des familles vers catégories normalisées
const CATEGORY_MAP: Record<string, { name: string; color: string }> = {
  // Solaire
  "AP SYSTEM": { name: "Solaire", color: "#7fb727" },
  "ENPHASE": { name: "Solaire", color: "#7fb727" },
  "HOYMILES": { name: "Solaire", color: "#7fb727" },
  "ONDULEURS HOYMILES": { name: "Solaire", color: "#7fb727" },
  "ONDULEURS HUAWEI": { name: "Solaire", color: "#7fb727" },
  "SOLPLANET": { name: "Solaire", color: "#7fb727" },
  "PANNEAUX FRANCILIENNE": { name: "Solaire", color: "#7fb727" },
  "DIVERS SOLAIRES": { name: "Solaire", color: "#7fb727" },
  
  // Stockage
  "STOCKAGE HUAWEI": { name: "Stockage", color: "#eea400" },
  "STOCKAGE HOYMILES": { name: "Stockage", color: "#eea400" },
  
  // Intégration
  "K2 ET ACIER": { name: "Intégration", color: "#555555" },
  "COMPOSANTS GSE INROOF": { name: "Intégration", color: "#555555" },
  "COMPOSANTS GSE GROUNDSYSTEM": { name: "Intégration", color: "#555555" },
  "GSE GROUND SYSTEM EVOLUTION": { name: "Intégration", color: "#555555" },
  "INTEGRATION FRANCILIENNE": { name: "Intégration", color: "#555555" },
  "CARPORT": { name: "Intégration", color: "#555555" },
  
  // Pompes à chaleur
  "PAC AIR EAU PANASONIC": { name: "Pompes à chaleur", color: "#e6332a" },
  "PAC AIR EAU ARISTON": { name: "Pompes à chaleur", color: "#e6332a" },
  "PAC AIR EAU AIRWELL WELLEA SPLIT": { name: "Pompes à chaleur", color: "#e6332a" },
  "PAC AIR EAU AIRWELL MONOBLOC R290": { name: "Pompes à chaleur", color: "#e6332a" },
  "PAC AIR AIR AIRWELL HDLW/YDZB": { name: "Pompes à chaleur", color: "#e6332a" },
  "PAC ACCESSOIRES": { name: "Pompes à chaleur", color: "#e6332a" },
  "BALLONS": { name: "Pompes à chaleur", color: "#e6332a" },
  "CHAUDIERE A GRANULE": { name: "Chauffage", color: "#e6332a" },
  
  // Accessoires électriques
  "BOITIERS AC ET DC": { name: "Accessoires", color: "#009fe3" },
  "CABLES ELECTRIQUES": { name: "Accessoires", color: "#009fe3" },
  "PROTECTIONS ELEC": { name: "Accessoires", color: "#009fe3" },
  "DOMOTIQUE": { name: "Accessoires", color: "#009fe3" },
  "DESTRATIFICATEUR": { name: "Accessoires", color: "#009fe3" },
  
  // Mobilité
  "EV CHARGER KEBA": { name: "Mobilité électrique", color: "#00a651" },
};

// Mapping des fournisseurs
const SUPPLIER_MAP: Record<string, string> = {
  "SYAPSYSTEMS": "AP Systems",
  "SYSVHENERGIE": "SVH Energie",
  "SYINNOV8": "Innov8",
  "SYMADEP": "Madep",
  "SYIENERGY": "IEnergy",
  "PERLIGHT": "Perlight",
  "SOLARTISANS": "Solartisans",
};

// Extraire la marque depuis le nom du produit
function extractBrand(productName: string, family: string): string | null {
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
  
  for (const { pattern, brand } of brandPatterns) {
    if (pattern.test(productName) || pattern.test(family)) {
      return brand;
    }
  }
  
  // Déduire depuis la famille
  if (family.includes("ENPHASE")) return "Enphase";
  if (family.includes("HUAWEI")) return "Huawei";
  if (family.includes("HOYMILES")) return "Hoymiles";
  if (family.includes("SOLPLANET")) return "Solplanet";
  if (family.includes("AP SYSTEM")) return "AP Systems";
  if (family.includes("PANASONIC")) return "Panasonic";
  if (family.includes("AIRWELL")) return "Airwell";
  if (family.includes("ARISTON")) return "Ariston";
  if (family.includes("K2")) return "K2 Systems";
  if (family.includes("GSE")) return "GSE";
  if (family.includes("FRANCILIENNE")) return "Francilienne";
  
  return null;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function migrate() {
  console.log("🔄 Migration des données vers le schéma normalisé...\n");
  
  // 1. Créer les catégories
  console.log("📁 Création des catégories...");
  const categoryNames = new Set<string>();
  Object.values(CATEGORY_MAP).forEach(c => categoryNames.add(c.name));
  
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const color = Object.values(CATEGORY_MAP).find(c => c.name === name)?.color || "#283084";
    const existing = await prisma.category.findUnique({ where: { name } });
    if (!existing) {
      const cat = await prisma.category.create({
        data: { name, slug: createSlug(name), color },
      });
      categories[name] = cat.id;
      console.log(`   ✓ ${name}`);
    } else {
      categories[name] = existing.id;
    }
  }
  
  // 2. Créer les marques
  console.log("\n🏷️  Création des marques...");
  const brandNames = new Set<string>();
  const products = await prisma.product.findMany({ select: { name: true, family: true } });
  
  for (const p of products) {
    const brand = extractBrand(p.name, p.family || "");
    if (brand) brandNames.add(brand);
  }
  
  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const existing = await prisma.brand.findUnique({ where: { name } });
    if (!existing) {
      const brand = await prisma.brand.create({
        data: { name, slug: createSlug(name) },
      });
      brands[name] = brand.id;
      console.log(`   ✓ ${name}`);
    } else {
      brands[name] = existing.id;
    }
  }
  
  // 3. Créer les fournisseurs
  console.log("\n🏭 Création des fournisseurs...");
  const supplierNames = new Set<string>(Object.values(SUPPLIER_MAP));
  
  const suppliers: Record<string, string> = {};
  for (const name of supplierNames) {
    const existing = await prisma.supplier.findUnique({ where: { name } });
    if (!existing) {
      const supplier = await prisma.supplier.create({
        data: { name, slug: createSlug(name) },
      });
      suppliers[name] = supplier.id;
      console.log(`   ✓ ${name}`);
    } else {
      suppliers[name] = existing.id;
    }
  }
  
  // 4. Mettre à jour les produits
  console.log("\n📦 Mise à jour des produits...");
  const allProducts = await prisma.product.findMany();
  let updated = 0;
  
  for (const product of allProducts) {
    const brandName = extractBrand(product.name, product.family || "");
    const categoryInfo = CATEGORY_MAP[product.family || ""];
    
    const updateData: any = {};
    
    if (brandName && brands[brandName]) {
      updateData.brandId = brands[brandName];
    }
    
    if (categoryInfo && categories[categoryInfo.name]) {
      updateData.categoryId = categories[categoryInfo.name];
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
      updated++;
    }
  }
  console.log(`   ✓ ${updated} produits mis à jour`);
  
  // 5. Résumé
  console.log("\n✅ Migration terminée !");
  
  const catCount = await prisma.category.count();
  const brandCount = await prisma.brand.count();
  const supplierCount = await prisma.supplier.count();
  
  console.log(`\n📊 Résumé:`);
  console.log(`   - ${catCount} catégories`);
  console.log(`   - ${brandCount} marques`);
  console.log(`   - ${supplierCount} fournisseurs`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Import limité de 50 produits avec regroupement en variantes
 * 
 * Structure CSV:
 * Famille | Référence Article | Désignation Article | Réf Fournisseurs | Réf Fournisseurs | Fournisseur | Stock réel | Prix de Vente
 */

// Fonction pour extraire la puissance depuis la désignation
function extractPower(designation: string): number | null {
  // Patterns: 5KW, 5KTL, 5K, 5 KW, 50KTL-M3, 100KTL-M2
  const patterns = [
    /(\d+(?:\.\d+)?)\s*KW/i,
    /(\d+(?:\.\d+)?)\s*KTL/i,
    /-(\d+(?:\.\d+)?)K(?:TL)?/i,
    /SUN2000-(\d+)K/i,
    /(\d+(?:\.\d+)?)\s*W\b/i, // Watts
  ];
  
  for (const pattern of patterns) {
    const match = designation.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      // Si c'est en watts, convertir en kW
      if (designation.match(/\d+\s*W\b/i) && value > 100) {
        value = value / 1000;
      }
      return value;
    }
  }
  return null;
}

// Fonction pour extraire la capacité (batteries)
function extractCapacity(designation: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*KWH/i,
    /(\d+(?:\.\d+)?)\s*AH/i,
    /(\d+(?:\.\d+)?)\s*MAH/i,
  ];
  
  for (const pattern of patterns) {
    const match = designation.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return null;
}

// Fonction pour créer un nom de produit parent à partir de la désignation
function createParentName(designation: string, family: string): string {
  // Nettoyer et simplifier le nom
  let name = designation
    // Supprimer les codes produits
    .replace(/\s*-\s*DPR\d+/gi, "")
    .replace(/\s*-\s*[A-Z]{2,}\d{4,}/gi, "")
    // Supprimer les références entre parenthèses
    .replace(/\s*\([^)]*\)\s*/g, " ")
    // Normaliser les espaces
    .replace(/\s+/g, " ")
    .trim();
  
  return name || `Produit ${family}`;
}

// Fonction pour créer un slug unique
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

// Parser le CSV
function parseCSV(content: string): Array<{
  family: string;
  sku: string;
  designation: string;
  supplierRef: string;
  supplier: string;
  stock: number;
  price: number;
}> {
  const lines = content.split("\n");
  const results: Array<{
    family: string;
    sku: string;
    designation: string;
    supplierRef: string;
    supplier: string;
    stock: number;
    price: number;
  }> = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV avec virgules et guillemets
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
    
    const [family, sku, designation, supplierRef1, _supplierRef2, supplier, stockStr, priceStr] = values;
    
    // Skip si données invalides
    if (!family || !sku || !designation || family === "#NAME?") continue;
    
    // Parser stock et prix (format français: "1 234,56")
    const stock = parseFloat(stockStr.replace(/\s/g, "").replace(",", ".")) || 0;
    const price = parseFloat(priceStr.replace(/\s/g, "").replace(",", ".")) || 0;
    
    results.push({
      family,
      sku,
      designation,
      supplierRef: supplierRef1,
      supplier,
      stock: Math.max(0, stock), // Pas de stock négatif
      price,
    });
  }
  
  return results;
}

async function importProducts(limit: number = 50) {
  console.log(`\n📦 Import de ${limit} produits max...\n`);
  
  // Lire le CSV
  const csvPath = path.join(process.cwd(), "..", "BI liste article + stock réel.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Fichier CSV introuvable:", csvPath);
    return;
  }
  
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  
  console.log(`📄 ${rows.length} lignes trouvées dans le CSV`);
  
  // Regrouper par produit parent (basé sur la famille + nom simplifié)
  const productGroups = new Map<string, typeof rows>();
  
  for (const row of rows) {
    // Créer une clé de regroupement basée sur famille + marque
    const key = `${row.family}`;
    
    if (!productGroups.has(key)) {
      productGroups.set(key, []);
    }
    productGroups.get(key)!.push(row);
  }
  
  console.log(`📁 ${productGroups.size} familles de produits\n`);
  
  // Limiter le nombre de variantes à importer
  let imported = 0;
  let productsCreated = 0;
  let variantsCreated = 0;
  const slugs = new Set<string>();
  
  // Sélectionner les premières familles avec leurs variantes
  for (const [family, variants] of productGroups) {
    if (imported >= limit) break;
    
    // Prendre max 10 variantes par famille pour commencer
    const toImport = variants.slice(0, Math.min(10, limit - imported));
    
    for (const row of toImport) {
      if (imported >= limit) break;
      
      try {
        // Créer un slug unique
        let baseSlug = createSlug(row.designation);
        let slug = baseSlug;
        let counter = 1;
        while (slugs.has(slug)) {
          slug = `${baseSlug}-${counter++}`;
        }
        slugs.add(slug);
        
        // Extraire puissance et capacité
        const powerKw = extractPower(row.designation);
        const capacity = extractCapacity(row.designation);
        
        // Vérifier si le produit existe déjà
        let product = await prisma.product.findUnique({
          where: { slug },
        });
        
        if (!product) {
          product = await prisma.product.create({
            data: {
              name: createParentName(row.designation, row.family),
              slug,
              family: row.family,
              description: `${row.designation} - Fournisseur: ${row.supplier}`,
              active: true,
            },
          });
          productsCreated++;
        }
        
        // Vérifier si la variante existe déjà
        const existingVariant = await prisma.productVariant.findUnique({
          where: { sku: row.sku },
        });
        
        if (!existingVariant) {
          await prisma.productVariant.create({
            data: {
              sku: row.sku,
              designation: row.designation,
              powerKw,
              capacity,
              supplierRef: row.supplierRef,
              supplier: row.supplier,
              realStock: row.stock,
              catalogPriceHT: row.price,
              active: row.stock > 0 || row.price > 0,
              productId: product.id,
            },
          });
          variantsCreated++;
        }
        
        imported++;
        process.stdout.write(`\r✓ Importé: ${imported}/${limit}`);
        
      } catch (error: any) {
        console.error(`\n❌ Erreur sur ${row.sku}:`, error.message);
      }
    }
  }
  
  console.log(`\n\n✅ Import terminé !`);
  console.log(`   - ${productsCreated} produits créés`);
  console.log(`   - ${variantsCreated} variantes créées`);
  
  // Afficher un résumé par famille
  console.log("\n📊 Résumé par famille:");
  const summary = await prisma.product.groupBy({
    by: ["family"],
    _count: true,
  });
  
  for (const s of summary) {
    console.log(`   - ${s.family}: ${s._count} produits`);
  }
}

// Run
importProducts(50)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showSummary() {
  console.log("📊 État de la base de données normalisée:\n");
  
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  console.log("📁 Catégories:");
  for (const c of categories) {
    const count = await prisma.product.count({ where: { categoryId: c.id } });
    console.log(`   - ${c.name} (${c.color}) → ${count} produits`);
  }
  
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  console.log("\n🏷️  Marques:");
  for (const b of brands) {
    const count = await prisma.product.count({ where: { brandId: b.id } });
    console.log(`   - ${b.name} → ${count} produits`);
  }
  
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  console.log("\n🏭 Fournisseurs:");
  for (const s of suppliers) {
    const count = await prisma.productVariant.count({ where: { supplierId: s.id } });
    console.log(`   - ${s.name} → ${count} variantes`);
  }
  
  console.log("\n📦 Totaux:");
  console.log(`   - ${await prisma.product.count()} produits`);
  console.log(`   - ${await prisma.productVariant.count()} variantes`);
}

showSummary().finally(() => prisma.$disconnect());

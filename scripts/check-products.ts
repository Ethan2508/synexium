import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log("Total products:", count);
  const withImg = await prisma.product.count({ where: { imageId: { not: null } } });
  console.log("With image:", withImg);

  const products = await prisma.product.findMany({
    take: 40,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      productGroupKey: true,
      imageId: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: {
        take: 2,
        select: { sku: true, designation: true, supplierReference: true },
      },
    },
  });

  for (const p of products) {
    console.log("---");
    console.log("Name:", p.name);
    console.log(
      "Brand:",
      p.brand?.name,
      "| Cat:",
      p.category?.name,
      "| Key:",
      p.productGroupKey,
      "| ImgId:",
      p.imageId
    );
    for (const v of p.variants) {
      console.log("  SKU:", v.sku, "| Desig:", v.designation, "| SupRef:", v.supplierReference);
    }
  }

  await prisma.$disconnect();
}

main();

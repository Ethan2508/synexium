/**
 * Script d'import des images produits vers Supabase Storage
 * 
 * 1. Scanne le dossier images-ref
 * 2. Matche chaque image avec un produit en DB (par nom normalisé)
 * 3. Upload vers Supabase Storage bucket "product-images"
 * 4. Crée l'enregistrement Image + lie au Product
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = "product-images";
const IMAGES_DIR = "/Users/ethanharfi/Desktop/Website/synexium/Produits/images-ref";

// Extensions images acceptées
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function normalize(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^A-Z0-9]/g, " ")     // non-alnum → space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim();
}

function getAllImages(dir: string): string[] {
  const results: string[] = [];
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMG_EXTS.has(ext) && entry.name !== "Thumbs.db") {
          results.push(full);
        }
      }
    }
  }
  walk(dir);
  return results;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error) throw new Error(`Bucket creation failed: ${error.message}`);
    console.log(`✅ Bucket "${BUCKET}" created`);
  } else {
    console.log(`✅ Bucket "${BUCKET}" already exists`);
  }
}

async function main() {
  console.log("=== Import images produits ===\n");

  // 1. Ensure bucket exists
  await ensureBucket();

  // 2. Load all products (name → id mapping)
  const products = await prisma.product.findMany({
    select: { id: true, name: true, imageId: true },
  });
  console.log(`📦 ${products.length} produits en DB`);

  // Build normalized name → product map
  const productMap = new Map<string, { id: string; name: string; imageId: string | null }>();
  for (const p of products) {
    productMap.set(normalize(p.name), p);
  }

  // 3. Scan images
  const imageFiles = getAllImages(IMAGES_DIR);
  console.log(`🖼️  ${imageFiles.length} images trouvées\n`);

  let matched = 0;
  let uploaded = 0;
  let skipped = 0;
  let notFound = 0;
  const notFoundList: string[] = [];

  for (const imgPath of imageFiles) {
    const filename = path.basename(imgPath);
    const nameWithoutExt = path.basename(imgPath, path.extname(imgPath));
    const normalizedImgName = normalize(nameWithoutExt);

    // Find matching product
    const product = productMap.get(normalizedImgName);

    if (!product) {
      notFound++;
      notFoundList.push(filename);
      continue;
    }

    matched++;

    // Skip if product already has an image
    if (product.imageId) {
      skipped++;
      continue;
    }

    // Upload to Supabase Storage
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    const contentType = mimeMap[ext] || "image/jpeg";

    // Use a clean filename for storage
    const storagePath = `products/${product.id}${ext}`;
    const fileBuffer = fs.readFileSync(imgPath);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed for ${filename}: ${uploadError.message}`);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Create Image record + link to Product
    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        alt: product.name,
        product: { connect: { id: product.id } },
      },
    });

    uploaded++;
    if (uploaded % 20 === 0) {
      console.log(`  ⬆️  ${uploaded} images uploadées...`);
    }
  }

  console.log("\n=== Résultats ===");
  console.log(`✅ Matchés: ${matched}`);
  console.log(`⬆️  Uploadés: ${uploaded}`);
  console.log(`⏭️  Déjà existants (skip): ${skipped}`);
  console.log(`❌ Non trouvés en DB: ${notFound}`);

  if (notFoundList.length > 0) {
    console.log("\n📋 Images sans produit correspondant:");
    notFoundList.forEach((f) => console.log(`  - ${f}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'product-images';
const IMG_DIR = '/Users/ethanharfi/Desktop/Website/synexium/Produits/images-ref/solplanet';

// Compact normalize: remove ALL non-alphanumeric, uppercase
function compact(s: string): string {
  return s.replace(/\.[^.]+$/, '') // remove extension
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

async function main() {
  const products = await prisma.product.findMany({
    where: { 
      brand: { name: { contains: 'olplanet', mode: 'insensitive' } },
      imageId: null
    },
    select: { id: true, name: true }
  });

  console.log(`${products.length} Solplanet products without image\n`);

  const files = fs.readdirSync(IMG_DIR).filter(f => 
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );

  const fileMap = new Map<string, string>();
  for (const f of files) {
    fileMap.set(compact(f), f);
  }

  let uploaded = 0;
  let notFound = 0;

  for (const product of products) {
    const pCompact = compact(product.name);
    
    let matchedFile: string | undefined;
    
    // Try exact compact match
    for (const [fCompact, fileName] of fileMap) {
      if (pCompact === fCompact) {
        matchedFile = fileName;
        break;
      }
    }

    // Special case: CONTROLLER -> use GALLERY image
    if (!matchedFile && product.name.includes('CONTROLLER')) {
      matchedFile = 'GALLERY-SOLPLANET-Ai-HB-G2-Front.png';
    }

    // Try model number matching (extract ASWxxxxx pattern)
    if (!matchedFile) {
      const modelMatch = product.name.match(/ASW\w+/);
      if (modelMatch) {
        const model = modelMatch[0];
        for (const [, fileName] of fileMap) {
          if (fileName.includes(model)) {
            matchedFile = fileName;
            break;
          }
        }
      }
    }

    if (!matchedFile) {
      console.log(`NOT FOUND: ${product.name}`);
      console.log(`   Compact: ${pCompact}`);
      notFound++;
      continue;
    }

    const filePath = path.join(IMG_DIR, matchedFile);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(matchedFile).toLowerCase();
    const storagePath = `products/${product.id}${ext}`;
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType, upsert: true });

    if (uploadError) {
      console.log(`UPLOAD ERROR: ${product.name} -> ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    const image = await prisma.image.create({
      data: { url: publicUrl, alt: product.name }
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { imageId: image.id }
    });

    console.log(`OK: ${product.name} -> ${matchedFile}`);
    uploaded++;
  }

  console.log(`\nDone: ${uploaded} uploaded, ${notFound} not found`);
}

main().then(() => prisma.$disconnect());

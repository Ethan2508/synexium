import { NextRequest, NextResponse } from 'next/server';
import { importCSV } from '@/lib/csv-parser';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

/**
 * API d'import CSV
 * POST /api/admin/import
 * 
 * ⛔ ADMIN uniquement
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Fichier CSV manquant' },
        { status: 400 }
      );
    }
    
    // Validation extension
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Format invalide. Seuls les fichiers CSV sont acceptés' },
        { status: 400 }
      );
    }
    
    // Lecture du fichier
    const fileContent = await file.text();
    
    // Création de l'entrée d'import
    const csvImport = await prisma.csvImport.create({
      data: {
        filename: file.name,
        rowsProcessed: 0,
        productsCreated: 0,
        variantsCreated: 0,
        status: 'PROCESSING',
      },
    });
    
    // Import en arrière-plan
    const result = await importCSV(fileContent);
    
    // Mise à jour du statut
    await prisma.csvImport.update({
      where: { id: csvImport.id },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        rowsProcessed: result.rowsProcessed,
        productsCreated: result.productsCreated,
        variantsCreated: result.variantsCreated,
        errors: result.errors.join('\n'),
        completedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: result.success,
      importId: csvImport.id,
      stats: {
        rowsProcessed: result.rowsProcessed,
        productsCreated: result.productsCreated,
        variantsCreated: result.variantsCreated,
      },
      errors: result.errors,
    });
    
  } catch (error) {
    console.error('Erreur import CSV:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'import' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/import
 * Récupère l'historique des imports
 */
export async function GET() {
  try {
    await requireAdmin();

    const imports = await prisma.csvImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    return NextResponse.json({ imports });
  } catch (error) {
    console.error('Erreur récupération imports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

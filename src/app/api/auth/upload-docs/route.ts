import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/auth/upload-docs
 * Upload KBIS + pièce d'identité vers Supabase Storage.
 * Requiert un utilisateur connecté.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const formData = await request.formData();
    const kbis = formData.get("kbis") as File | null;
    const idFront = formData.get("idFront") as File | null;
    const idBack = formData.get("idBack") as File | null;
    const capacityCert = formData.get("capacityCert") as File | null;

    if (!kbis && !idFront) {
      return NextResponse.json(
        { error: "Au moins le KBIS ou la pièce d'identité est requis." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();
    const updates: Record<string, string> = {};

    // Upload KBIS
    if (kbis) {
      const ext = kbis.name.split(".").pop();
      const path = `kbis/${user.id}/kbis.${ext}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, kbis, { upsert: true });
      if (error) throw new Error(`Upload KBIS échoué: ${error.message}`);
      
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      updates.kbisUrl = urlData.publicUrl;
    }

    // Upload ID recto
    if (idFront) {
      const ext = idFront.name.split(".").pop();
      const path = `id/${user.id}/front.${ext}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, idFront, { upsert: true });
      if (error) throw new Error(`Upload ID recto échoué: ${error.message}`);

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      updates.idCardFrontUrl = urlData.publicUrl;
    }

    // Upload ID verso
    if (idBack) {
      const ext = idBack.name.split(".").pop();
      const path = `id/${user.id}/back.${ext}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, idBack, { upsert: true });
      if (error) throw new Error(`Upload ID verso échoué: ${error.message}`);

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      updates.idCardBackUrl = urlData.publicUrl;
    }

    // Upload attestation de capacité
    if (capacityCert) {
      const ext = capacityCert.name.split(".").pop();
      const path = `capacity/${user.id}/attestation.${ext}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, capacityCert, { upsert: true });
      if (error) throw new Error(`Upload attestation échoué: ${error.message}`);

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      updates.capacityCertificateUrl = urlData.publicUrl;
    }

    // Mise à jour Prisma
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: "Documents uploadés avec succès.",
      urls: updates,
    });
  } catch (error: unknown) {
    console.error("Erreur upload docs:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

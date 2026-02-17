import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail, sendNewClientNotification } from "@/lib/email";

/**
 * POST /api/auth/register
 * Inscription professionnelle : crée le compte Supabase + profil Prisma (PENDING).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email, password, firstName, lastName, company, siret,
      phone, address, postalCode, city, tvaNumber, codeApe,
      activity, contactFunction, accountingContactName,
      accountingContactEmail, iban, bic, cgvAccepted
    } = body;

    // ── Validation ──
    if (!email || !password || !firstName || !lastName || !company || !siret) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (!cgvAccepted) {
      return NextResponse.json(
        { error: "Vous devez accepter les Conditions Générales de Vente." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    // Vérifier SIRET format (14 chiffres)
    const siretClean = siret.replace(/\s/g, "");
    if (!/^\d{14}$/.test(siretClean)) {
      return NextResponse.json(
        { error: "Le SIRET doit contenir exactement 14 chiffres." },
        { status: 400 }
      );
    }

    // Vérifier unicité email dans notre base
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    // ── Créer le compte Supabase ──
    const supabase = await createSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Erreur lors de la création du compte." },
        { status: 400 }
      );
    }

    // ── Créer le profil Prisma ──
    const user = await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email,
        firstName,
        lastName,
        company,
        siret: siretClean,
        phone: phone || null,
        address: address || null,
        postalCode: postalCode || null,
        city: city || null,
        tvaNumber: tvaNumber || null,
        codeApe: codeApe || null,
        activity: activity || null,
        contactFunction: contactFunction || null,
        accountingContactName: accountingContactName || null,
        accountingContactEmail: accountingContactEmail || null,
        iban: iban || null,
        bic: bic || null,
        role: "CLIENT",
        status: "PENDING",
        cgvAcceptedAt: new Date(),
      },
    });

    // Mettre à jour les metadata Supabase avec le rôle et status
    await supabase.auth.updateUser({
      data: { role: user.role, status: user.status },
    });

    // Emails transactionnels (non-bloquants)
    sendRegistrationEmail(email, firstName);
    sendNewClientNotification(company, email, siretClean);

    return NextResponse.json({
      success: true,
      message: "Compte créé. Votre demande est en attente de validation par notre équipe.",
      userId: user.id,
    });
  } catch (error: unknown) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/clients
 * Liste tous les clients avec leur statut. ADMIN uniquement.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");

    const where: Record<string, unknown> = { role: "CLIENT" };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { siret: { contains: search } },
      ];
    }

    const clients = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        siret: true,
        phone: true,
        status: true,
        kbisUrl: true,
        idCardFrontUrl: true,
        idCardBackUrl: true,
        rejectedReason: true,
        createdAt: true,
        _count: { select: { orders: true, customerPrices: true } },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur admin clients:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/clients
 * Valider ou refuser un client. ADMIN uniquement.
 * Body: { clientId, action: "approve" | "reject", reason? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { clientId, action, reason } = await request.json();

    if (!clientId || !action) {
      return NextResponse.json({ error: "clientId et action requis." }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'approve' ou 'reject'." },
        { status: 400 }
      );
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: clientId },
      data: {
        status: action === "approve" ? "ACTIVE" : "REJECTED",
        rejectedReason: action === "reject" ? reason || "Non spécifié" : null,
      },
    });

    // Mettre à jour les metadata Supabase avec le nouveau status
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await supabaseAdmin.auth.admin.updateUserById(updated.supabaseId, {
      user_metadata: { role: updated.role, status: updated.status },
    });

    // Log admin
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: action === "approve" ? "CLIENT_APPROVED" : "CLIENT_REJECTED",
        targetType: "User",
        targetId: clientId,
        details: action === "reject" ? `Motif: ${reason || "Non spécifié"}` : null,
      },
    });

    return NextResponse.json({
      success: true,
      client: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur validation client:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients
 * Créer un nouveau compte client. ADMIN uniquement.
 * Body: { email, password, firstName, lastName, company, siret, phone?, status? }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const { email, password, firstName, lastName, company, siret, phone, status = "ACTIVE" } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !company || !siret) {
      return NextResponse.json(
        { error: "Email, mot de passe, prénom, nom, société et SIRET sont requis." },
        { status: 400 }
      );
    }

    // Vérifier si email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà." }, { status: 400 });
    }

    // Créer le compte Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "CLIENT", status },
    });

    if (authError) {
      console.error("Erreur création Supabase:", authError);
      return NextResponse.json({ error: `Erreur Supabase: ${authError.message}` }, { status: 500 });
    }

    // Hasher le mot de passe pour notre DB (fallback)
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer le user dans notre DB
    const newClient = await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email,
        passwordHash,
        firstName,
        lastName,
        company,
        siret,
        phone: phone || null,
        role: "CLIENT",
        status: status === "ACTIVE" ? "ACTIVE" : "PENDING",
      },
    });

    // Log admin
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CLIENT_CREATED",
        targetType: "User",
        targetId: newClient.id,
        details: `Compte créé par admin: ${company} (${email})`,
      },
    });

    return NextResponse.json({
      success: true,
      client: {
        id: newClient.id,
        email: newClient.email,
        company: newClient.company,
        status: newClient.status,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès admin requis." }, { status: 403 });
    }
    console.error("Erreur création client:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

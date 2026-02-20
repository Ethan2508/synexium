import { createSupabaseServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string | null;
  address: string | null;
  role: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  kbisUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  rejectedReason: string | null;
  cgvAcceptedAt: Date | null;
};

/**
 * Récupère l'utilisateur Supabase + profil Prisma.
 * Retourne null si non connecté ou profil inexistant.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      supabaseId: dbUser.supabaseId,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      company: dbUser.company,
      siret: dbUser.siret,
      phone: dbUser.phone,
      address: dbUser.address,
      role: dbUser.role,
      status: dbUser.status as AuthUser["status"],
      kbisUrl: dbUser.kbisUrl,
      idCardFrontUrl: dbUser.idCardFrontUrl,
      idCardBackUrl: dbUser.idCardBackUrl,
      rejectedReason: dbUser.rejectedReason,
      cgvAcceptedAt: dbUser.cgvAcceptedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Vérifie que l'utilisateur est admin. Lève une erreur sinon.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Vérifie que l'utilisateur est connecté ET actif.
 */
export async function requireActiveUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (user.status !== "ACTIVE") throw new Error("ACCOUNT_NOT_ACTIVE");
  return user;
}

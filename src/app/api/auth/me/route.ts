import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Retourne le prénom + statut de l'utilisateur connecté.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    firstName: user.firstName,
  });
}

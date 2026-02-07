import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Callback Supabase Auth – Échange le code OAuth/magic-link contre une session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/compte";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si erreur, redirige vers login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}

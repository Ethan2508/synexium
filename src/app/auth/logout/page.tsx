import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Page de déconnexion – Server Component qui déconnecte et redirige.
 */
export default async function LogoutPage() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur (Client Components)
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

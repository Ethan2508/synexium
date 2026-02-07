import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function deleteUser(email: string) {
  // Lister les utilisateurs pour trouver l'ID
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Erreur:", error.message);
    return;
  }
  
  const user = data.users.find(u => u.email === email);
  if (!user) {
    console.log(`❌ Utilisateur ${email} non trouvé dans Supabase Auth`);
    return;
  }
  
  console.log(`🔍 Utilisateur trouvé: ${user.id}`);
  
  // Supprimer l'utilisateur
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Erreur suppression:", deleteError.message);
    return;
  }
  
  console.log(`✅ Utilisateur ${email} supprimé de Supabase Auth`);
}

deleteUser("ethanharfi@gmail.com");

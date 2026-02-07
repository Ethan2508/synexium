import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkUser(email: string) {
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
  
  console.log("🔍 Utilisateur trouvé:");
  console.log("  ID:", user.id);
  console.log("  Email:", user.email);
  console.log("  Email confirmé:", user.email_confirmed_at ? "✅ Oui" : "❌ Non");
  console.log("  Créé le:", user.created_at);
  
  // Si email non confirmé, on le confirme
  if (!user.email_confirmed_at) {
    console.log("\n🔧 Confirmation de l'email en cours...");
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    if (updateError) {
      console.error("Erreur confirmation:", updateError.message);
    } else {
      console.log("✅ Email confirmé avec succès !");
    }
  }
}

checkUser("ethanharfi@gmail.com");

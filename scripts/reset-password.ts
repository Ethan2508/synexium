import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetPassword(email: string, newPassword: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Erreur:", error.message);
    return;
  }
  
  const user = data.users.find(u => u.email === email);
  if (!user) {
    console.log(`❌ Utilisateur ${email} non trouvé`);
    return;
  }
  
  console.log(`🔍 Utilisateur trouvé: ${user.id}`);
  
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });
  
  if (updateError) {
    console.error("Erreur:", updateError.message);
  } else {
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
    console.log(`   Nouveau mot de passe: ${newPassword}`);
  }
}

// Remplace "newpassword123" par le mot de passe souhaité
const email = process.argv[2] || "ethanharfi@gmail.com";
const newPass = process.argv[3] || "Admin123!";

resetPassword(email, newPass);

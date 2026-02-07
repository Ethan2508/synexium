import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const emails = [
  'jean.dupont@entreprise-test.fr',
  'marie.martin@solaire-pro.fr'
];

async function main() {
  console.log('🗑️ Suppression des utilisateurs orphelins dans Supabase...');
  
  // Lister les utilisateurs Supabase
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  
  for (const email of emails) {
    const authUser = users?.find(u => u.email === email);
    if (authUser) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      console.log('✅ Supprimé:', email);
    } else {
      console.log('⚠️ Non trouvé:', email);
    }
  }
  
  console.log('');
  console.log('🔄 Recréation des comptes...');
  
  const clients = [
    { email: 'jean.dupont@entreprise-test.fr', company: 'Dupont Énergies', siret: '12345678901234', firstName: 'Jean', lastName: 'Dupont', phone: '06 12 34 56 78' },
    { email: 'marie.martin@solaire-pro.fr', company: 'Solaire Pro SARL', siret: '23456789012345', firstName: 'Marie', lastName: 'Martin', phone: '06 23 45 67 89' },
  ];
  
  const password = 'TestClient2026!';
  
  for (const client of clients) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: client.email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.log('❌', client.email, '-', authError.message);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        supabaseId: authData.user.id,
        email: client.email,
        company: client.company,
        siret: client.siret,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        address: '123 Rue du Test, 69000 Lyon',
        status: 'PENDING',
        role: 'CLIENT'
      }
    });

    console.log('✅', client.email, '-', client.company, '(en attente)');
  }
  
  console.log('');
  console.log('🎉 Terminé !');
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const clients = [
  { email: 'jean.dupont@entreprise-test.fr', company: 'Dupont Énergies', siret: '12345678901234', firstName: 'Jean', lastName: 'Dupont', phone: '06 12 34 56 78' },
  { email: 'marie.martin@solaire-pro.fr', company: 'Solaire Pro SARL', siret: '23456789012345', firstName: 'Marie', lastName: 'Martin', phone: '06 23 45 67 89' },
  { email: 'pierre.durand@ecoinstall.fr', company: 'Eco Install', siret: '34567890123456', firstName: 'Pierre', lastName: 'Durand', phone: '06 34 56 78 90' },
  { email: 'sophie.bernard@thermoplus.fr', company: 'ThermoPlus', siret: '45678901234567', firstName: 'Sophie', lastName: 'Bernard', phone: '06 45 67 89 01' },
  { email: 'lucas.petit@greentech.fr', company: 'GreenTech Solutions', siret: '56789012345678', firstName: 'Lucas', lastName: 'Petit', phone: '06 56 78 90 12' }
];

const password = 'TestClient2026!';

async function main() {
  console.log('🔐 Création de 5 comptes clients en attente...');
  console.log('📧 Mot de passe commun:', password);
  console.log('');

  for (const client of clients) {
    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: client.email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.log('❌', client.email, '-', authError.message);
      continue;
    }

    // Créer l'utilisateur dans Prisma avec statut pending
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

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const action = process.argv[2];
  const email = process.argv[3];

  if (action === "list") {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, status: true, company: true },
    });
    console.log("\n📋 Utilisateurs:");
    if (users.length === 0) {
      console.log("  Aucun utilisateur trouvé.");
    } else {
      users.forEach((u) => {
        console.log(`  - ${u.email} | ${u.role} | ${u.status} | ${u.company}`);
      });
    }
    return;
  }

  if (action === "make-admin" && email) {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", status: "ACTIVE" },
    });
    console.log(`\n✅ ${user.email} est maintenant ADMIN et ACTIVE`);
    return;
  }

  if (action === "activate" && email) {
    const user = await prisma.user.update({
      where: { email },
      data: { status: "ACTIVE" },
    });
    console.log(`\n✅ ${user.email} est maintenant ACTIVE`);
    return;
  }

  console.log(`
📦 Script de gestion utilisateurs Francilienne Energy

Usage:
  npx tsx scripts/manage-users.ts list                    - Liste tous les utilisateurs
  npx tsx scripts/manage-users.ts make-admin <email>      - Rendre un utilisateur ADMIN + ACTIVE
  npx tsx scripts/manage-users.ts activate <email>        - Activer un compte (PENDING -> ACTIVE)
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

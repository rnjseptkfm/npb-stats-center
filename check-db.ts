import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const standings = await prisma.standing.findMany({
    include: { team: true }
  });
  console.log(JSON.stringify(standings, null, 2));
}

check().catch(console.error);

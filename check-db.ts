const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const teams = await prisma.team.findMany({
    include: { standing: true }
  });
  console.log('Teams and Standings:');
  teams.forEach(t => {
    console.log(`${t.fullName} (${t.league}): Rank ${t.standing?.rank}, Wins ${t.standing?.wins}`);
  });

  const playerCount = await prisma.player.count();
  console.log(`Total players: ${playerCount}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());

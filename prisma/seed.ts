const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teams = [
    // Central League
    { name: 'Giants', fullName: 'Yomiuri Giants', league: 'Central' },
    { name: 'Tigers', fullName: 'Hanshin Tigers', league: 'Central' },
    { name: 'Dragons', fullName: 'Chunichi Dragons', league: 'Central' },
    { name: 'BayStars', fullName: 'Yokohama DeNA BayStars', league: 'Central' },
    { name: 'Carp', fullName: 'Hiroshima Toyo Carp', league: 'Central' },
    { name: 'Swallows', fullName: 'Tokyo Yakult Swallows', league: 'Central' },
    // Pacific League
    { name: 'Hawks', fullName: 'Fukuoka SoftBank Hawks', league: 'Pacific' },
    { name: 'Marines', fullName: 'Chiba Lotte Marines', league: 'Pacific' },
    { name: 'Lions', fullName: 'Saitama Seibu Lions', league: 'Pacific' },
    { name: 'Eagles', fullName: 'Tohoku Rakuten Golden Eagles', league: 'Pacific' },
    { name: 'Fighters', fullName: 'Hokkaido Nippon-Ham Fighters', league: 'Pacific' },
    { name: 'Buffaloes', fullName: 'Orix Buffaloes', league: 'Pacific' },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: team,
      create: team,
    });
  }

  console.log('Seeded NPB teams');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teams = [
    // Central League
    { name: 'Giants', fullName: '요미우리 자이언츠', league: 'Central' },
    { name: 'Tigers', fullName: '한신 타이거스', league: 'Central' },
    { name: 'Dragons', fullName: '주니치 드래곤즈', league: 'Central' },
    { name: 'BayStars', fullName: '요코하마 DeNA 베이스타즈', league: 'Central' },
    { name: 'Carp', fullName: '히로시마 도요 카프', league: 'Central' },
    { name: 'Swallows', fullName: '도쿄 야쿠르트 스왈로즈', league: 'Central' },
    // Pacific League
    { name: 'Hawks', fullName: '후쿠오카 소프트뱅크 호크스', league: 'Pacific' },
    { name: 'Marines', fullName: '치바 롯데 마린즈', league: 'Pacific' },
    { name: 'Lions', fullName: '사이타마 세이부 라이온즈', league: 'Pacific' },
    { name: 'Eagles', fullName: '도호쿠 라쿠텐 골든이글스', league: 'Pacific' },
    { name: 'Fighters', fullName: '홋카이도 닛폰햄 파이터즈', league: 'Pacific' },
    { name: 'Buffaloes', fullName: '오릭스 버팔로즈', league: 'Pacific' },
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

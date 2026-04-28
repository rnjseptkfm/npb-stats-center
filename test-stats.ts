import { updatePlayerStats } from './src/lib/scraper';
import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  const player = await prisma.player.findFirst();
  if (player) {
    console.log(`Updating stats for ${player.name} (${player.externalId})...`);
    await updatePlayerStats(player.externalId!);
    const stats = await prisma.battingStats.findFirst({ where: { playerId: player.id } }) 
                || await prisma.pitchingStats.findFirst({ where: { playerId: player.id } });
    console.log('Stats:', JSON.stringify(stats, null, 2));
  } else {
    console.log('No player found. Run player scraper first.');
  }
}

test().catch(console.error);

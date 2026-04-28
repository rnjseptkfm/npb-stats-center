import { fullUpdate, updatePlayerStats } from '../src/lib/scraper';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting daily NPB update...');
  try {
    // 1. Update Standings and Team Lists
    await fullUpdate();
    
    // 2. Update Stats for all players in the database
    // To avoid overloading, we can do this in batches
    const players = await prisma.player.findMany();
    console.log(`Updating stats for ${players.length} players...`);
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      try {
        await updatePlayerStats(player.externalId!);
        if (i % 20 === 0) console.log(`Progress: ${i}/${players.length}`);
        // Add a small delay to be polite
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to update stats for player ${player.name}:`, err);
      }
    }
    
    console.log('Daily NPB update completed successfully.');
  } catch (error) {
    console.error('Daily NPB update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

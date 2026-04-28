import { updateStandings, updatePlayersForTeam } from './src/lib/scraper';

async function test() {
  await updateStandings();
  await updatePlayersForTeam(1); // Giants
}

test().catch(console.error);

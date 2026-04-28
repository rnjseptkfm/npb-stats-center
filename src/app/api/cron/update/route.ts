import { fullUpdate, updatePlayerStats } from '@/lib/scraper';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('Starting daily NPB update via CRON...');
  try {
    await fullUpdate();
    
    const players = await prisma.player.findMany();
    for (const player of players) {
      try {
        await updatePlayerStats(player.externalId!);
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      } catch (err) {
        console.error(`Failed player ${player.name}:`, err);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const standings = await prisma.standing.findMany({
    include: {
      team: true,
    },
    orderBy: [
      { team: { league: 'asc' } },
      { rank: 'asc' },
    ],
  });

  const central = standings.filter((s) => s.team.league === 'Central');
  const pacific = standings.filter((s) => s.team.league === 'Pacific');

  return NextResponse.json({ central, pacific });
}

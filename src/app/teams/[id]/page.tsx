import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getTeam(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      standing: true,
      players: true,
    },
  });

  if (team) {
    // Sort players by number numerically
    team.players.sort((a, b) => {
      const numA = parseInt(a.number) || 999;
      const numB = parseInt(b.number) || 999;
      return numA - numB;
    });
  }

  return team;
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);

  if (!team) return <div className="p-8">팀을 찾을 수 없습니다.</div>;

  const pitchers = team.players.filter(p => p.position === '投手');
  const batters = team.players.filter(p => p.position !== '投手');

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">← 순위표로 돌아가기</Link>
        
        <header className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-4xl font-bold text-white">
            {team.fullName[0]}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">{team.fullName}</h1>
            <p className="text-xl text-gray-600">{team.league === 'Central' ? '센트럴' : '퍼시픽'} 리그</p>
            <div className="mt-2 flex gap-4 text-sm font-medium">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">순위: {team.standing?.rank}위</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">승: {team.standing?.wins}</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">패: {team.standing?.losses}</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">무: {team.standing?.draws}</span>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <PlayerSection title="투수" players={pitchers} color="blue" />
          <PlayerSection title="타자" players={batters} color="orange" />
        </div>
      </div>
    </main>
  );
}

function PlayerSection({ title, players, color }: { title: string, players: any[], color: 'blue' | 'orange' }) {
  const bgBadge = color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  const borderHover = color === 'blue' ? 'hover:border-blue-500' : 'hover:border-orange-500';
  const textTitle = color === 'blue' ? 'text-blue-900' : 'text-orange-900';

  return (
    <section className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`${color === 'blue' ? 'bg-blue-900' : 'bg-orange-800'} p-4`}>
        <h2 className="text-xl font-bold text-white">{title} ({players.length}명)</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {players.map((p: any) => (
          <Link 
            key={p.id} 
            href={`/players/${p.id}`}
            className={`flex items-center p-3 border rounded-lg ${borderHover} hover:bg-gray-50 transition-all group`}
          >
            <div className={`w-10 text-xl font-bold text-gray-400 group-hover:${textTitle} transition-colors`}>
              {p.number}
            </div>
            <div>
              <div className={`font-bold text-gray-900 group-hover:${textTitle}`}>{p.name}</div>
              <div className="text-xs text-gray-500">{p.position}</div>
            </div>
          </Link>
        ))}
        {players.length === 0 && <p className="col-span-full text-center py-8 text-gray-400">등록된 선수가 없습니다.</p>}
      </div>
    </section>
  );
}

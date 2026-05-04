import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getStandings() {
  const standings = await prisma.standing.findMany({
    include: {
      team: true,
    },
    orderBy: [
      { rank: 'asc' },
    ],
  });

  const central = standings.filter((s: any) => s.team?.league === 'Central');
  const pacific = standings.filter((s: any) => s.team?.league === 'Pacific');

  return { central, pacific };
}

export default async function Home() {
  const { central, pacific } = await getStandings();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">NPB Stats Center</h1>
          <div className="text-sm text-gray-500">
            마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LeagueTable title="Central League" standings={central} />
          <LeagueTable title="Pacific League" standings={pacific} />
        </div>
      </div>
    </main>
  );
}

async function getLeaders() {
  const battingLeaders = await prisma.battingStats.findMany({
    take: 5,
    orderBy: { avg: 'desc' },
    include: { player: { include: { team: true } } },
  });

  const hrLeaders = await prisma.battingStats.findMany({
    take: 5,
    orderBy: { hr: 'desc' },
    include: { player: { include: { team: true } } },
  });

  const eraLeaders = await prisma.pitchingStats.findMany({
    where: { games: { gt: 0 } },
    take: 5,
    orderBy: { era: 'asc' },
    include: { player: { include: { team: true } } },
  });

  const winLeaders = await prisma.pitchingStats.findMany({
    take: 5,
    orderBy: { wins: 'desc' },
    include: { player: { include: { team: true } } },
  });

  return { battingLeaders, hrLeaders, eraLeaders, winLeaders };
}

export default async function Home() {
  const { central, pacific } = await getStandings();
  const { battingLeaders, hrLeaders, eraLeaders, winLeaders } = await getLeaders();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-black text-blue-900 tracking-tighter">NPB Stats Center</h1>
          <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">
            마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <LeagueTable title="센트럴 리그" standings={central} />
          <LeagueTable title="퍼시픽 리그" standings={pacific} />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          주요 부문별 순위
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LeaderCard title="타율" data={battingLeaders} field="avg" format={(v: number) => v.toFixed(3)} />
          <LeaderCard title="홈런" data={hrLeaders} field="hr" />
          <LeaderCard title="평균자책점" data={eraLeaders} field="era" format={(v: number) => v.toFixed(2)} />
          <LeaderCard title="다승" data={winLeaders} field="wins" />
        </div>
      </div>
    </main>
  );
}

function LeaderCard({ title, data, field, format }: { title: string, data: any[], field: string, format?: (v: any) => string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-800 p-3">
        <h3 className="text-sm font-bold text-white text-center">{title} TOP 5</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.map((item, i) => (
          <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </span>
              <div className="flex flex-col">
                <Link href={`/players/${item.player.id}`} className="text-sm font-bold text-blue-700 hover:underline">
                  {item.player.name}
                </Link>
                <span className="text-[10px] text-gray-400">{item.player.team.fullName}</span>
              </div>
            </div>
            <div className="text-sm font-black text-gray-700">
              {format ? format(item[field]) : item[field]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeagueTable({ title, standings }: { title: string, standings: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-blue-900 p-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b">
            <tr>
              <th className="px-4 py-3 text-center">순위</th>
              <th className="px-4 py-3">팀</th>
              <th className="px-4 py-3 text-center">경기</th>
              <th className="px-4 py-3 text-center">승</th>
              <th className="px-4 py-3 text-center">패</th>
              <th className="px-4 py-3 text-center">무</th>
              <th className="px-4 py-3 text-center">승률</th>
              <th className="px-4 py-3 text-center">차</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {standings.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 text-center font-black text-gray-400">{s.rank}</td>
                <td className="px-4 py-3 font-bold text-blue-800">
                  <Link href={`/teams/${s.team.id}`} className="hover:underline">{s.team.fullName}</Link>
                </td>
                <td className="px-4 py-3 text-center font-medium">{s.played}</td>
                <td className="px-4 py-3 text-center font-bold text-green-700">{s.wins}</td>
                <td className="px-4 py-3 text-center font-bold text-red-600">{s.losses}</td>
                <td className="px-4 py-3 text-center text-gray-500">{s.draws}</td>
                <td className="px-4 py-3 text-center font-mono">{s.winRate.toFixed(3)}</td>
                <td className="px-4 py-3 text-center font-medium text-gray-400">{s.gamesBehind === 0 ? '-' : s.gamesBehind}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">데이터가 없습니다. 업데이트 중...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

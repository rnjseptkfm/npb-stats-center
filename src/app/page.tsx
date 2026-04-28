import Link from 'next/link';

async function getStandings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://' + process.env.VERCEL_URL}/api/standings`, { cache: 'no-store' });
  if (!res.ok) return { central: [], pacific: [] };
  return res.json();
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

function LeagueTable({ title, standings }: { title: string, standings: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-blue-900 p-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3">순위</th>
              <th className="px-4 py-3">팀</th>
              <th className="px-4 py-3">경기</th>
              <th className="px-4 py-3">승</th>
              <th className="px-4 py-3">패</th>
              <th className="px-4 py-3">무</th>
              <th className="px-4 py-3">승률</th>
              <th className="px-4 py-3">차</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {standings.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 font-bold text-lg">{s.rank}</td>
                <td className="px-4 py-3 font-semibold text-blue-700">
                  <Link href={`/teams/${s.team.id}`}>{s.team.fullName}</Link>
                </td>
                <td className="px-4 py-3">{s.played}</td>
                <td className="px-4 py-3">{s.wins}</td>
                <td className="px-4 py-3">{s.losses}</td>
                <td className="px-4 py-3">{s.draws}</td>
                <td className="px-4 py-3">{s.winRate.toFixed(3)}</td>
                <td className="px-4 py-3">{s.gamesBehind === 0 ? '-' : s.gamesBehind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

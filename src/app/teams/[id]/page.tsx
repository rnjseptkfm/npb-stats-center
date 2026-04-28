import Link from 'next/link';

async function getTeam(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/teams/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);

  if (!team) return <div className="p-8">팀을 찾을 수 없습니다.</div>;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">← 순위표로 돌아가기</Link>
        
        <header className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
            {team.name[0]}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">{team.fullName}</h1>
            <p className="text-xl text-gray-600">{team.league} League</p>
            <div className="mt-2 flex gap-4 text-sm font-medium">
              <span>순위: {team.standing?.rank}위</span>
              <span>승: {team.standing?.wins}</span>
              <span>패: {team.standing?.losses}</span>
              <span>무: {team.standing?.draws}</span>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-800 p-4">
            <h2 className="text-xl font-bold text-white">선수 명단</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {team.players.map((p: any) => (
              <Link 
                key={p.id} 
                href={`/players/${p.id}`}
                className="flex items-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 text-xl font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                  {p.number}
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-700">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.position}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

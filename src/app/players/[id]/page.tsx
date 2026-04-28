import Link from 'next/link';

async function getPlayer(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${baseUrl}/api/players/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) return <div className="p-8">선수를 찾을 수 없습니다.</div>;

  const isPitcher = player.position === '投手';

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link href={`/teams/${player.teamId}`} className="text-blue-600 hover:underline mb-4 inline-block">← 팀 명단으로 돌아가기</Link>

        <header className="bg-white p-8 rounded-xl shadow-md mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full flex items-center justify-center -mr-8 -mt-8 opacity-50">
            <span className="text-6xl font-bold text-blue-100">{player.number}</span>
          </div>
          
          <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl font-bold text-gray-300 shadow-inner">
            {player.name[0]}
          </div>

          <div className="z-10 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-blue-900 mb-2">{player.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                #{player.number}
              </span>
              <span className="text-xl font-semibold text-gray-700">{player.team.fullName}</span>
              <span className="text-gray-400">|</span>
              <span className="text-lg text-gray-600">{player.position}</span>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-900 p-4">
            <h2 className="text-xl font-bold text-white">시즌 기록 (2026)</h2>
          </div>
          <div className="p-0">
            {isPitcher ? (
              <PitchingStatsTable stats={player.pitchingStats[0]} />
            ) : (
              <BattingStatsTable stats={player.battingStats[0]} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PitchingStatsTable({ stats }: { stats: any }) {
  if (!stats) return <div className="p-8 text-center text-gray-500">기록이 없습니다.</div>;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-200">
      <StatBox label="방어율" value={stats.era.toFixed(2)} highlighted />
      <StatBox label="경기" value={stats.games} />
      <StatBox label="승리" value={stats.wins} />
      <StatBox label="패전" value={stats.losses} />
      <StatBox label="세이브" value={stats.saves} />
      <StatBox label="홀드" value={stats.holds} />
      <StatBox label="이닝" value={stats.ip.toFixed(1)} />
      <StatBox label="탈삼진" value={stats.so} />
      <StatBox label="피안타" value={stats.hits} />
      <StatBox label="피홈런" value={stats.hr} />
      <StatBox label="볼넷" value={stats.walks} />
    </div>
  );
}

function BattingStatsTable({ stats }: { stats: any }) {
  if (!stats) return <div className="p-8 text-center text-gray-500">기록이 없습니다.</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-200">
      <StatBox label="타율" value={stats.avg.toFixed(3)} highlighted />
      <StatBox label="경기" value={stats.games} />
      <StatBox label="타석" value={stats.pa} />
      <StatBox label="안타" value={stats.hits} />
      <StatBox label="홈런" value={stats.hr} />
      <StatBox label="타점" value={stats.rbi} />
      <StatBox label="득점" value={stats.runs} />
      <StatBox label="도루" value={stats.steals} />
      <StatBox label="볼넷" value={stats.walks} />
      <StatBox label="삼진" value={stats.so} />
      <StatBox label="OPS" value={stats.ops.toFixed(3)} highlighted />
    </div>
  );
}

function StatBox({ label, value, highlighted = false }: { label: string, value: any, highlighted?: boolean }) {
  return (
    <div className={`bg-white p-6 flex flex-col items-center justify-center ${highlighted ? 'bg-blue-50' : ''}`}>
      <span className="text-xs text-gray-500 uppercase font-bold mb-1">{label}</span>
      <span className={`text-2xl font-black ${highlighted ? 'text-blue-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
} 

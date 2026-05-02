import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEAM_NAME_MAP: Record<string, string> = {
  '巨人': 'Giants',
  '阪神': 'Tigers',
  '中日': 'Dragons',
  'DeNA': 'BayStars',
  '広島': 'Carp',
  'ヤクルト': 'Swallows',
  'ソフトバンク': 'Hawks',
  'ロッテ': 'Marines',
  '西武': 'Lions',
  '楽天': 'Eagles',
  '日本ハム': 'Fighters',
  'オリックス': 'Buffaloes',
};

const TEAM_ID_MAP: Record<number, string> = {
  1: 'Giants',
  2: 'Tigers',
  3: 'Dragons',
  4: 'BayStars',
  5: 'Carp',
  6: 'Swallows',
  7: 'Hawks',
  8: 'Marines',
  9: 'Lions',
  10: 'Eagles',
  11: 'Fighters',
  12: 'Buffaloes',
};

export async function updateStandings() {
  console.log('Updating standings...');
  const url = 'https://baseball.yahoo.co.jp/npb/standings/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const standingRows: any[] = [];

  // Specifically target the regular season tables
  // These are usually the first two tables with class .bb-rankTable
  // Or we can find them by the headers
  $('h2').each((_, header) => {
    const title = $(header).text().trim();
    // Only pick "Central League" or "Pacific League", exclude "Open Game" (Preseason)
    if (title === 'セ・リーグ' || title === 'パ・リーグ') {
      const table = $(header).nextAll('.bb-rankTable').first();
      
      table.find('tbody tr').each((_, el) => {
        const cells = $(el).find('td');
        if (cells.length < 8) return;

        const rank = parseInt($(cells[0]).text().trim());
        const teamNameJapanese = $(cells[1]).find('a').text().trim() || $(cells[1]).text().trim();
        const played = parseInt($(cells[2]).text().trim());
        const wins = parseInt($(cells[3]).text().trim());
        const losses = parseInt($(cells[4]).text().trim());
        const draws = parseInt($(cells[5]).text().trim());
        const winRate = parseFloat($(cells[6]).text().trim());
        const gamesBehindText = $(cells[7]).text().trim();
        const gamesBehind = gamesBehindText === '-' ? 0 : parseFloat(gamesBehindText);

        const teamName = TEAM_NAME_MAP[teamNameJapanese];
        if (teamName) {
          standingRows.push({
            teamName,
            rank,
            played,
            wins,
            losses,
            draws,
            winRate,
            gamesBehind,
          });
        }
      });
    }
  });

  // Clear and update
  await prisma.standing.deleteMany({});
  
  for (const row of standingRows) {
    const team = await prisma.team.findUnique({ where: { name: row.teamName } });
    if (!team) continue;

    await prisma.standing.create({
      data: {
        teamId: team.id,
        rank: row.rank,
        played: row.played,
        wins: row.wins,
        losses: row.losses,
        draws: row.draws,
        winRate: row.winRate,
        gamesBehind: row.gamesBehind,
      },
    });
  }
  console.log('Standings updated.');
}

export async function updatePlayersForTeam(yahooTeamId: number) {
  const teamName = TEAM_ID_MAP[yahooTeamId];
  if (!teamName) return;

  const team = await prisma.team.findUnique({ where: { name: teamName } });
  if (!team) return;

  console.log(`Updating players for ${teamName}...`);
  // We should fetch both pitchers and batters to be sure
  const types = ['pitchingstats', 'battingstats'];
  const playerIds = new Set<string>();

  for (const type of types) {
    const url = `https://baseball.yahoo.co.jp/npb/teams/${yahooTeamId}/${type}`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Support multiple table structures as Yahoo often changes them
      const playerRows = $('.bb-playerTable__row, .bb-table__row');
      
      playerRows.each((_, el) => {
        const row = $(el);
        if (row.hasClass('bb-playerTable__row--head') || row.hasClass('bb-table__row--head')) return;

        const cells = row.find('td');
        if (cells.length < 2) return;

        const number = $(cells[0]).text().trim();
        const nameLink = $(cells[1]).find('a');
        const nameJapanese = nameLink.text().trim();
        const href = nameLink.attr('href') || '';
        
        const externalIdMatch = href.match(/\/npb\/player\/([0-9]+)/);
        const externalId = externalIdMatch ? externalIdMatch[1] : null;

        if (externalId && nameJapanese) {
          playerIds.add(externalId);
          const position = type === 'pitchingstats' ? '投手' : '野手';

          // Ensure name is translated to Korean before saving
          // We'll get the kana in updatePlayerStats, but let's do a basic translation if possible or just use Japanese for now until detail update
          prisma.player.upsert({
            where: { externalId },
            update: {
              number,
              position,
              teamId: team.id,
            },
            create: {
              externalId,
              name: nameJapanese,
              number,
              position,
              teamId: team.id,
            },
          }).catch(e => console.error(`Failed to upsert player ${nameJapanese}:`, e));
        }
      });
    } catch (error: any) {
      console.warn(`Could not fetch ${type} for team ${yahooTeamId}: ${error.message}`);
    }
  }
  
  console.log(`Found ${playerIds.size} unique players for ${teamName}.`);
  return Array.from(playerIds);
}

import { translateNameToKorean } from './translator';

export async function updatePlayerStats(externalId: string) {
  const url = `https://baseball.yahoo.co.jp/npb/player/${externalId}/`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const player = await prisma.player.findUnique({ where: { externalId } });
  if (!player) return;

  // Update name to Korean if not already done or just update it
  const titleText = $('.bb-profile__name').text().trim(); // e.g. "田中 将大 （タナカ マサヒロ）"
  const kanaMatch = titleText.match(/（(.+)）/);
  if (kanaMatch) {
    const kanaName = kanaMatch[1];
    const koreanName = translateNameToKorean(kanaName);
    await prisma.player.update({
      where: { id: player.id },
      data: { 
        name: koreanName,
        nameKanji: titleText.split('（')[0].trim()
      }
    });
  }
  const isPitcher = player.position === '投手';
  const currentYear = new Date().getFullYear();

  const statsTables = $('.bb-playerStatsTable');
  if (statsTables.length === 0) return;

  if (isPitcher) {
    // Pitcher Summary Tables
    const table1 = statsTables.eq(0);
    const table2 = statsTables.eq(1);
    
    const getData = (table: any, label: string) => {
      const index = table.find('th').toArray().findIndex((th: any) => $(th).text().trim() === label);
      return index !== -1 ? table.find('td').eq(index).text().trim() : null;
    };

    const era = parseFloat(getData(table1, '防御率') || '0');
    const games = parseInt(getData(table1, '登板') || '0');
    const wins = parseInt(getData(table1, '勝利') || '0');
    const losses = parseInt(getData(table1, '敗戦') || '0');
    const saves = parseInt(getData(table1, 'セーブ') || '0');
    const holds = parseInt(getData(table1, 'ホールド') || '0');
    const ip = parseFloat(getData(table1, '投球回') || '0');

    const hits = parseInt(getData(table2, '被安打') || '0');
    const hr = parseInt(getData(table2, '被本塁打') || '0');
    const so = parseInt(getData(table2, '奪三振') || '0');
    const walks = parseInt(getData(table2, '与四球') || '0');

    await prisma.pitchingStats.upsert({
      where: { playerId_year: { playerId: player.id, year: currentYear } },
      update: { games, wins, losses, saves, holds, ip, hits, hr, so, walks, era },
      create: { playerId: player.id, year: currentYear, games, wins, losses, saves, holds, ip, hits, hr, so, walks, era },
    });
  } else {
    // Batter Summary Tables
    const table1 = statsTables.eq(0);
    const table2 = statsTables.eq(1);

    const getData = (table: any, label: string) => {
      const index = table.find('th').toArray().findIndex((th: any) => $(th).text().trim() === label);
      return index !== -1 ? table.find('td').eq(index).text().trim() : null;
    };

    const avg = parseFloat(getData(table1, '打率') || '0');
    const games = parseInt(getData(table1, '試合') || '0');
    const pa = parseInt(getData(table1, '打席') || '0');
    const ab = parseInt(getData(table1, '打数') || '0');
    const hits = parseInt(getData(table1, '安打') || '0');
    const hr = parseInt(getData(table1, '本塁打') || '0');
    const rbi = parseInt(getData(table1, '打点') || '0');

    const runs = parseInt(getData(table2, '得点') || '0');
    const steals = parseInt(getData(table2, '盗塁') || '0');
    const walks = parseInt(getData(table2, '四球') || '0');
    const so = parseInt(getData(table2, '三振') || '0');
    const ops = parseFloat(getData(table2, 'OPS') || '0');

    await prisma.battingStats.upsert({
      where: { playerId_year: { playerId: player.id, year: currentYear } },
      update: { games, pa, ab, hits, hr, rbi, runs, steals, walks, so, avg, ops },
      create: { playerId: player.id, year: currentYear, games, pa, ab, hits, hr, rbi, runs, steals, walks, so, avg, ops },
    });
  }
}

// Main update function
export async function fullUpdate() {
  await updateStandings();
  for (let id = 1; id <= 12; id++) {
    await updatePlayersForTeam(id);
    // Ideally update all player stats here, but it might be too many requests at once.
    // We could batch them or just update active ones.
  }
}

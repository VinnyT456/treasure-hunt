'use client';

import { LEVELS } from '@/lib/levels';
import StarRating from './StarRating';

const DEMO_PLAYERS = [
  { name: 'LegendLily', totalStars: 12, totalMoves: 28 },
  { name: 'HalvingHero', totalStars: 11, totalMoves: 31 },
  { name: 'BraveFox', totalStars: 10, totalMoves: 35 },
];

export default function CampaignLeaderboard({ progress, playerName, playerMoves }) {
  const playerStars = LEVELS.reduce((s, l) => s + (progress[l.id] || 0), 0);
  const playerTotalMoves = playerMoves ?? LEVELS.reduce((s, l) => {
    // approximate from stars only if moves not passed
    return s + (progress[l.id] ? 5 : 0);
  }, 0);

  const rows = [
    ...DEMO_PLAYERS,
    {
      name: playerName || 'You',
      totalStars: playerStars,
      totalMoves: playerTotalMoves,
      isYou: true,
    },
  ].sort((a, b) => {
    if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
    return a.totalMoves - b.totalMoves;
  });

  return (
    <section className="campaign-board" aria-label="Campaign rank board">
      <h3 className="campaign-board__title">Campaign Rank Board</h3>
      <p className="campaign-board__sub">Total stars across all five levels — fewer total moves ranks higher.</p>
      <div className="campaign-board__rows">
        {rows.slice(0, 8).map((row, i) => (
          <div
            key={row.name + i}
            className={'campaign-board__row' + (row.isYou ? ' campaign-board__row--you' : '')}
          >
            <span className="campaign-board__rank">#{i + 1}</span>
            <span className="campaign-board__name">{row.isYou ? `You (${row.name})` : row.name}</span>
            <StarRating count={row.totalStars} max={12} size="sm" />
            <span className="campaign-board__moves">{row.totalMoves} moves</span>
          </div>
        ))}
      </div>
    </section>
  );
}

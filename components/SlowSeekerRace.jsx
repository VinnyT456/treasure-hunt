'use client';

export default function SlowSeekerRace({ playerMoves, linearMoves, doorCount, gap }) {
  const playerPct = Math.min(100, (playerMoves / Math.max(1, doorCount)) * 100);
  const pennyPct = Math.min(100, (Math.min(linearMoves, playerMoves * 3) / Math.max(1, doorCount)) * 100);

  return (
    <div className="race">
      <div className="race__header">
        <span className="race__title">Beat Penny the Linear Seeker</span>
        <span className="race__gap">{gap > 0 ? `saving ${gap} checks` : 'race begins now'}</span>
      </div>
      <RaceLane label="You" value={`${playerMoves} move${playerMoves !== 1 ? 's' : ''}`} pct={playerPct} />
      <RaceLane label="Penny" value={`${linearMoves} checks so far`} pct={pennyPct} muted />
    </div>
  );
}

function RaceLane({ label, value, pct, muted }) {
  return (
    <div className={'race__lane' + (muted ? ' race__lane--muted' : '')}>
      <div className="race__lane-meta">
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <div className="race__track">
        <div className="race__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

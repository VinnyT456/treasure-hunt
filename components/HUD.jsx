'use client';

export default function HUD({ level, moves, searchBounds, pulseZone, difficulty, onBack, onJournalOpen, journalCount }) {
  const remaining = level.moveLimit ? level.moveLimit - moves : null;
  const warn = remaining !== null && remaining <= 2;
  const doorsLeft = searchBounds ? searchBounds.right - searchBounds.left + 1 : null;
  const doorsGone = searchBounds ? level.doorCount - doorsLeft : null;

  return (
    <div className="hud">
      <button className="hud__back" onClick={onBack} aria-label="Back to menu">← Menu</button>

      <div className="hud__title">
        <span>LEVEL {level.id === 'custom' ? '6' : level.id}</span>{level.name}
        {difficulty === 'expert' && (
          <span className="hud__expert-badge">Expert — No hints</span>
        )}
      </div>

      <div className="hud__stats">
        <div className="hud__stat">
          <div className="hud__stat-label">Moves</div>
          <div className="hud__stat-value">{moves}</div>
        </div>
        {level.moveLimit && (
          <div className={'hud__stat' + (warn ? ' hud__stat--warn' : '')}>
            <div className="hud__stat-label">Left</div>
            <div className="hud__stat-value">{Math.max(0, remaining)}</div>
          </div>
        )}
        {doorsLeft !== null && (
          <div className={'hud__stat hud__stat--zone' + (pulseZone ? ' hud__stat--pulse' : '')}>
            <div className="hud__stat-label">Doors left</div>
            <div className="hud__stat-value">{doorsLeft}</div>
          </div>
        )}
        {doorsGone > 0 && (
          <div className="hud__stat">
            <div className="hud__stat-label">Ruled out</div>
            <div className="hud__stat-value">{doorsGone}</div>
          </div>
        )}
        {onJournalOpen && (
          <button
            className="hud__journal-btn"
            onClick={onJournalOpen}
            aria-label={`Open strategy journal${journalCount ? ` (${journalCount} entries)` : ''}`}
          >
            📓
            {journalCount > 0 && (
              <span className="hud__journal-badge">{journalCount}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

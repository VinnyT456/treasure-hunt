'use client';

// Visual indicator of the current search space for direction-based levels.
// Shows a progress bar narrowing as the player eliminates halves.
export default function SearchBracket({ bounds, doorCount, pulse }) {
  if (!bounds) return null;

  const remaining = bounds.right - bounds.left + 1;
  const leftPct = (bounds.left / doorCount) * 100;
  const widthPct = (remaining / doorCount) * 100;

  return (
    <div className={'bracket' + (pulse ? ' bracket--pulse' : '')}>
      <div className="bracket__info">
        <span className="bracket__label">Search zone</span>
        <span className="bracket__range">
          door {bounds.left + 1} — door {bounds.right + 1}
        </span>
        <span className="bracket__count">{remaining} door{remaining !== 1 ? 's' : ''} left</span>
      </div>
      <div className="bracket__track">
        <div
          className="bracket__fill"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

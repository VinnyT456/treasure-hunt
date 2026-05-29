'use client';

import StarRating from './StarRating';

export default function ClassChallengeBoard({ code, scores }) {
  if (!scores?.length) {
    return (
      <div className="class-board">
        <p className="class-board__empty">Be the first on the board for code <strong>{code}</strong>!</p>
      </div>
    );
  }

  return (
    <section className="class-board" aria-label={`Class challenge board for ${code}`}>
      <h3 className="class-board__title">Room {code} — Rankings</h3>
      <div className="class-board__rows">
        {scores.map((entry, i) => (
          <div key={`${entry.name}-${entry.at}-${i}`} className="class-board__row">
            <span className="class-board__rank">#{i + 1}</span>
            <span className="class-board__name">{entry.name}</span>
            <StarRating count={entry.stars} max={3} size="sm" />
            <span>{entry.moves} moves</span>
          </div>
        ))}
      </div>
    </section>
  );
}

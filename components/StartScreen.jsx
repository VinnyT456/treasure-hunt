'use client';

import { LEVELS } from '@/lib/levels';

function Stars({ count, max = 3 }) {
  return (
    <div className="level-card__stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={'level-card__star' + (i < count ? '' : ' level-card__star--off')}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function StartScreen({ onStart, progress, difficulty, onDifficultyChange, badgesEarned, onLevel6, onClassChallenge }) {
  const level5Done = (progress[5] || 0) > 0;

  return (
    <div className="start">
      <div className="start__eyebrow">~ a tiny adventure ~</div>
      <h1 className="start__title">Treasure Hunt</h1>

      <div className="start__map" aria-hidden="true">
        <div className="start__map-door" />
        <div className="start__map-door" />
        <div className="start__map-door" />
        <div className="start__map-door" />
        <div className="start__map-door" />
      </div>

      <p className="start__sub">
        Somewhere in this maze, a treasure is hidden. Pick a door, listen to the clues,
        and try to find it in as few moves as you can.
      </p>

      <div className="difficulty" aria-label="Choose difficulty">
        {[
          { id: 'easy', label: 'Easy', note: 'More hints' },
          { id: 'standard', label: 'Standard', note: 'Balanced' },
          { id: 'expert', label: 'Expert', note: 'Fewer hints' },
        ].map((option) => (
          <button
            key={option.id}
            className={'difficulty__pill' + (difficulty === option.id ? ' difficulty__pill--active' : '')}
            onClick={() => onDifficultyChange(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.note}</span>
          </button>
        ))}
      </div>

      {badgesEarned?.length > 0 && (
        <div className="start__badges">
          Badges this visit: {badgesEarned.map((badge) => badge.label).join(', ')}
        </div>
      )}

      <div className="level-grid">
        {LEVELS.map((level, i) => {
          const earned = progress[level.id] || 0;
          const previous = i === 0 ? 3 : (progress[LEVELS[i - 1].id] || 0);
          const locked = i > 0 && previous === 0;
          return (
            <button
              key={level.id}
              className="level-card"
              disabled={locked}
              onClick={() => !locked && onStart(level.id)}
              aria-label={`Start level ${level.id}: ${level.name}`}
            >
              <div className="level-card__num">LEVEL {level.id}</div>
              <div className="level-card__name">{level.name}</div>
              <div className="level-card__sub">{level.subtitle}</div>
              {locked
                ? <div className="level-card__lock" aria-label="Locked">🔒</div>
                : <Stars count={earned} max={level.maxStars ?? 3} />}
            </button>
          );
        })}

        {/* Level 6 — Maker Mode, unlocked after Level 5 */}
        <button
          className={'level-card level-card--maker' + (level5Done ? '' : ' level-card--maker-locked')}
          disabled={!level5Done}
          onClick={() => level5Done && onLevel6()}
          aria-label="Level 6: Maker Mode"
        >
          <div className="level-card__num">LEVEL 6</div>
          <div className="level-card__name">Maker Mode</div>
          <div className="level-card__sub">Build your own maze or join a friend's.</div>
          {level5Done
            ? <div className="level-card__lock" aria-label="Unlocked" style={{ fontSize: '1.2rem' }}>✏️</div>
            : <div className="level-card__lock" aria-label="Locked">🔒</div>}
        </button>

        <button
          className="level-card level-card--challenge"
          onClick={onClassChallenge}
          aria-label="Class challenge"
        >
          <div className="level-card__num">CLASS CHALLENGE</div>
          <div className="level-card__name">Room Code Race</div>
          <div className="level-card__sub">Join a teacher or friend code. Fewest moves wins on the board.</div>
          <div className="level-card__lock" aria-label="Unlocked">🏁</div>
        </button>
      </div>
    </div>
  );
}

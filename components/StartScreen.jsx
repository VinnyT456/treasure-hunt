'use client';

import { LEVELS } from '@/lib/levels';
import StarRating from './StarRating';

export default function StartScreen({
  onStart,
  progress,
  difficulty,
  onDifficultyChange,
  badgesEarned,
  onLevel6,
  onClassChallenge,
  onBadges,
}) {
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
          { id: 'easy', label: 'Easy', note: 'Hints after every try' },
          { id: 'standard', label: 'Standard', note: 'One starting hint' },
          { id: 'expert', label: 'Expert', note: 'No hints' },
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

      <div className="start__links">
        {onBadges && (
          <button className="btn btn--ghost start__badges-btn" type="button" onClick={onBadges}>
            🪙 My Coin Collection ({badgesEarned?.length || 0})
          </button>
        )}
      </div>

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
                : <StarRating count={earned} max={level.maxStars ?? 3} size="sm" className="level-card__stars" />}
            </button>
          );
        })}

        <button
          className={'level-card level-card--maker' + (level5Done ? '' : ' level-card--maker-locked')}
          disabled={!level5Done}
          onClick={() => level5Done && onLevel6()}
          aria-label="Level 6: Maker Mode"
        >
          <div className="level-card__num">LEVEL 6</div>
          <div className="level-card__name">Maker Mode</div>
          <div className="level-card__sub">
            {level5Done
              ? 'Build your own maze — you have learned linear search, hot/cold clues, and splitting the search.'
              : 'Complete Level 5 to unlock.'}
          </div>
          {level5Done
            ? <div className="level-card__lock" aria-label="Unlocked" style={{ fontSize: '1.2rem' }}>✏️</div>
            : <div className="level-card__lock" aria-label="Locked">🔒</div>}
        </button>

        <button
          className={'level-card level-card--challenge' + (level5Done ? '' : ' level-card--challenge-locked')}
          disabled={!level5Done}
          onClick={() => level5Done && onClassChallenge()}
          aria-label="Class challenge"
        >
          <div className="level-card__num">CLASS CHALLENGE</div>
          <div className="level-card__name">Room Code Race</div>
          <div className="level-card__sub">
            {level5Done
              ? 'Join a teacher or friend code. Fewest moves wins on the board.'
              : 'Complete Level 5 to unlock.'}
          </div>
          {level5Done
            ? <div className="level-card__lock" aria-label="Unlocked">🏁</div>
            : <div className="level-card__lock" aria-label="Locked">🔒</div>}
        </button>
      </div>
    </div>
  );
}

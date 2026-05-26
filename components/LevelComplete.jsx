'use client';

import { computeStarsAdvanced } from '@/lib/gameLogic';
import { computeEarnedBadges } from '@/lib/badges';
import StrategyBuilder from './StrategyBuilder';
import LevelLeaderboard from './LevelLeaderboard';
import PathStepper from './PathStepper';
import SearchTypeQuiz from './SearchTypeQuiz';
import EarnedBadges from './EarnedBadges';
import SearchCompareDemo from './SearchCompareDemo';

function CriteriaStars({ criteria, maxStars, earned }) {
  return (
    <div className="criteria">
      <div className="criteria__total">
        {Array.from({ length: maxStars }).map((_, i) => (
          <span key={i} className={'criteria__star' + (i < earned ? '' : ' criteria__star--off')}>★</span>
        ))}
      </div>
      <div className="criteria__rows">
        {criteria.map((c, i) => (
          <div key={i} className={'criteria__row' + (c.earned ? ' criteria__row--earned' : ' criteria__row--missed')}>
            <span className="criteria__icon" aria-hidden="true">{c.earned ? '⭐' : '☆'}</span>
            <div className="criteria__text">
              <span className="criteria__label">{c.label}</span>
              {c.note && <span className="criteria__note">{c.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LevelComplete({ result, hasNext, isCustom, onNext, onReplay, onMenu, onJournalAdd, onJournalOpen, journalCount }) {
  const { level, attempts, treasureIndex, status } = result;
  const { stars, maxStars, criteria } = computeStarsAdvanced(attempts, level, status);
  const won = status === 'won';
  const showLeaderboard = won && !isCustom;
  const badges = result.badges || computeEarnedBadges(result);

  return (
    <div className="complete">
      <header className="complete__header">
        <div className="complete__banner">{won ? '~ level complete ~' : '~ out of moves ~'}</div>
        <h2 className="complete__title">{won ? 'You found it!' : 'So close!'}</h2>
      </header>

      <div className={'complete__body' + (showLeaderboard ? '' : ' complete__body--single')}>
        <div className="complete__main complete__column-card">
          <CriteriaStars criteria={criteria} maxStars={maxStars} earned={stars} />

          <div className="summary">
            {isCustom && level.code && (
              <div className="summary__row">
                <span>Room code</span>
                <strong style={{ fontFamily: 'Caveat, cursive', fontSize: '1.3rem', letterSpacing: 1 }}>{level.code}</strong>
              </div>
            )}
            <div className="summary__row">
              <span>Moves used</span>
              <strong>{attempts.length}</strong>
            </div>
            <div className="summary__row">
              <span>Doors in maze</span>
              <strong>{level.doorCount}</strong>
            </div>
            {level.moveLimit && (
              <div className="summary__row">
                <span>Move limit</span>
                <strong>{level.moveLimit}</strong>
              </div>
            )}
            {result.difficulty && result.difficulty !== 'standard' && (
              <div className="summary__row">
                <span>Mode</span>
                <strong>{result.difficulty}</strong>
              </div>
            )}
            {won && result.race?.linearMoves && (
              <div className="summary__row">
                <span>Penny needed</span>
                <strong>{result.race.linearMoves} checks</strong>
              </div>
            )}
          </div>

          <PathStepper attempts={attempts} treasureIndex={treasureIndex} doorCount={level.doorCount} />

          {won && !isCustom && (
            <SearchTypeQuiz attempts={attempts} level={level} />
          )}

          {won && (
            <EarnedBadges badges={badges} />
          )}

          {won && level.id === 5 && (
            <SearchCompareDemo attempts={attempts} treasureIndex={treasureIndex} doorCount={level.doorCount} />
          )}

          {won && isCustom && level.code && (
            <div className="class-share">
              Tell friends: code <strong>{level.code}</strong> — fewest moves wins!
            </div>
          )}

          {won && !isCustom && (
            <StrategyBuilder
              levelId={level.id}
              levelName={level.name}
              onSave={onJournalAdd}
            />
          )}

          {journalCount > 0 && (
            <button className="btn btn--ghost complete__journal-btn" onClick={onJournalOpen}>
              📓 View Strategy Journal ({journalCount} {journalCount === 1 ? 'entry' : 'entries'})
            </button>
          )}
        </div>

        {showLeaderboard && (
          <aside className="complete__aside">
            <LevelLeaderboard
              levelId={level.id}
              levelName={level.name}
              stars={stars}
              moves={attempts.length}
            />
          </aside>
        )}
      </div>

      <div className="complete__actions">
        <button className="btn btn--ghost" onClick={onMenu}>Menu</button>
        <button className="btn btn--ghost" onClick={onReplay}>Try Again</button>
        {!isCustom && won && hasNext && (
          <button className="btn btn--gold" onClick={onNext}>Next Level →</button>
        )}
        {!isCustom && won && !hasNext && (
          <button className="btn btn--gold" onClick={onNext}>See Final Screen →</button>
        )}
      </div>
    </div>
  );
}

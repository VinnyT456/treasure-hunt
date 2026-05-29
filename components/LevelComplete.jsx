'use client';

import { computeStarsAdvanced } from '@/lib/gameLogic';
import { computeRunBadges } from '@/lib/badges';
import StrategyBuilder from './StrategyBuilder';
import LevelLeaderboard from './LevelLeaderboard';
import PathStepper from './PathStepper';
import SearchTypeQuiz from './SearchTypeQuiz';
import EarnedBadges from './EarnedBadges';
import SearchCompareDemo from './SearchCompareDemo';
import RoomLeaderboard from './RoomLeaderboard';
import StarRating, { StarIcon } from './StarRating';

function CriteriaStars({ criteria, maxStars, earned }) {
  return (
    <div className="criteria">
      <StarRating count={earned} max={maxStars} size="lg" className="criteria__total" />
      <div className="criteria__rows">
        {criteria.map((c, i) => (
          <div key={i} className={'criteria__row' + (c.earned ? ' criteria__row--earned' : ' criteria__row--missed')}>
            <StarIcon earned={c.earned} />
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

export default function LevelComplete({
  result,
  hasNext,
  isCustom,
  tutorialsSeen,
  leaderboard,
  classScores,
  playerName,
  onPlayerNameChange,
  onRecordRoomScore,
  onNext,
  onReplay,
  onMenu,
  onJournalAdd,
  onJournalOpen,
  journalCount,
  onBadges,
}) {
  const { level, attempts, treasureIndex, status } = result;
  const { stars, maxStars, criteria } = computeStarsAdvanced(attempts, level, status);
  const won = status === 'won';
  const showLeaderboard = won && !isCustom && level.id > 5;
  const showCustomLeaderboard = won && isCustom && !!level.code;
  const showTwoColumn = showLeaderboard || showCustomLeaderboard;
  const badges = result.badges || (won ? computeRunBadges(result) : []);
  const newBadgeIds = (result.newBadges || []).map((b) => b.id);
  const showSearchQuiz =
    won &&
    !isCustom &&
    (level.id === 4 || level.id === 5) &&
    tutorialsSeen?.binarySeen;
  const roomScores = isCustom && level.code ? classScores?.[String(level.code).toUpperCase()] : null;

  return (
    <div className="complete">
      <header className="complete__header">
        <div className="complete__banner">{won ? '~ level complete ~' : '~ out of moves ~'}</div>
        <h2 className="complete__title">{won ? 'You found it!' : 'So close!'}</h2>
      </header>

      <div className={'complete__body' + (showTwoColumn ? '' : ' complete__body--single')}>
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
                <strong style={{ textTransform: 'capitalize' }}>{result.difficulty}</strong>
              </div>
            )}
            {won && result.race?.warmMoves && (
              <div className="summary__row">
                <span>Blaze would need</span>
                <strong>{result.race.warmMoves} doors opened</strong>
              </div>
            )}
            {won && result.race?.linearMoves && (
              <div className="summary__row">
                <span>Penny would need</span>
                <strong>{result.race.linearMoves} doors opened</strong>
              </div>
            )}
          </div>

          <PathStepper attempts={attempts} treasureIndex={treasureIndex} doorCount={level.doorCount} />

          {showSearchQuiz && (
            <SearchTypeQuiz attempts={attempts} level={level} />
          )}

          {won && newBadgeIds.length > 0 && (
            <div className="new-coin-banner" role="status">
              <span className="new-coin-banner__sparkle" aria-hidden="true">🪙</span>
              New coin{newBadgeIds.length > 1 ? 's' : ''}! Check your collection.
            </div>
          )}

          {won && badges.length > 0 && (
            <EarnedBadges badges={badges} newBadgeIds={newBadgeIds} />
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

          {onBadges && (
            <button className="btn btn--ghost complete__journal-btn" type="button" onClick={onBadges}>
              🪙 My Coin Collection
            </button>
          )}
        </div>

        {showCustomLeaderboard && (
          <aside className="complete__aside">
            <RoomLeaderboard
              code={level.code}
              stars={stars}
              moves={attempts.length}
              maxStars={maxStars}
              scores={roomScores}
              onRecordScore={onRecordRoomScore}
            />
          </aside>
        )}

        {showLeaderboard && (
          <aside className="complete__aside">
            <LevelLeaderboard
              levelId={level.id}
              levelName={level.name}
              stars={stars}
              moves={attempts.length}
              maxStars={maxStars}
              savedEntry={leaderboard?.[String(level.id)]}
              playerName={playerName}
              onPlayerNameChange={onPlayerNameChange}
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

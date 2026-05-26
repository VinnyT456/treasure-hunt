'use client';

import { useEffect, useMemo, useReducer } from 'react';
import HUD from './HUD';
import Door from './Door';
import FeedbackPanel from './FeedbackPanel';
import ClueHistory from './ClueHistory';
import SearchBracket from './SearchBracket';
import PredictionBar from './PredictionBar';
import MiddleDoorHint from './MiddleDoorHint';
import SlowSeekerRace from './SlowSeekerRace';
import { getLevel } from '@/lib/levels';
import { computeFeedback, chooseTreasureIndex, relocateTreasureIfNeeded, computeStarsAdvanced } from '@/lib/gameLogic';
import { getLinearSeekerPath } from '@/lib/linearSeekerSim';
import { getDoorWindowSize, getSuggestedMiddle, isNearMiddle } from '@/lib/searchHints';

function applyDifficulty(level, difficulty = 'standard') {
  if (level.id === 'custom') return { ...level, difficulty };
  if (difficulty === 'easy' && level.moveLimit) {
    return {
      ...level,
      moveLimit: level.moveLimit + 1,
      efficiencyMoves: (level.efficiencyMoves ?? level.moveLimit) + 1,
      difficulty,
      difficultyNote: 'Easy mode gives one bonus move.',
    };
  }
  return { ...level, difficulty };
}

function init({ level }) {
  const treasureIndex =
    level.treasureOverride !== undefined && level.treasureOverride !== null
      ? level.treasureOverride
      : chooseTreasureIndex(level);
  return {
    level,
    treasureIndex,
    attempts: [],
    tried: {},
    lastFeedback: null,
    lastPredictionResult: null,
    pendingPrediction: null,
    predictionStats: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    middleHintDismissed: false,
    zonePulseToken: 0,
    status: 'playing',
    searchBounds: level.feedbackType === 'direction'
      ? { left: 0, right: level.doorCount - 1 }
      : null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN': {
      if (state.status !== 'playing') return state;
      const { doorIndex } = action;
      if (state.tried[doorIndex]) return state;
      if (state.searchBounds && state.pendingPrediction === null) return state;

      const triedSet = new Set(Object.keys(state.tried).map(Number));
      const previousBounds = state.searchBounds;
      const treasureIndex = relocateTreasureIfNeeded(
        state.level, doorIndex, state.treasureIndex, triedSet,
        state.attempts.length, state.searchBounds, state.attempts
      );
      const feedback = computeFeedback(state.level, doorIndex, treasureIndex);
      const prediction = state.pendingPrediction;
      const predictionResult =
        feedback.kind === 'direction' && (prediction === 'left' || prediction === 'right')
          ? prediction === feedback.key ? 'correct' : 'wrong'
          : null;
      const attempt = { doorIndex, feedback, prediction, predictionResult, boundsBefore: previousBounds };
      const attempts = [...state.attempts, attempt];
      const tried = { ...state.tried, [doorIndex]: attempt };

      let status = state.status;
      if (feedback.kind === 'found') status = 'won';
      else if (state.level.moveLimit && attempts.length >= state.level.moveLimit) status = 'lost';

      let searchBounds = state.searchBounds;
      let zonePulseToken = state.zonePulseToken;
      if (searchBounds && feedback.kind === 'direction') {
        if (feedback.key === 'right') searchBounds = { left: doorIndex + 1, right: searchBounds.right };
        else if (feedback.key === 'left') searchBounds = { left: searchBounds.left, right: doorIndex - 1 };
        if (searchBounds !== previousBounds) {
          const before = getDoorWindowSize(previousBounds);
          const after = getDoorWindowSize(searchBounds);
          if (before > 0 && after <= Math.ceil(before / 2)) zonePulseToken += 1;
        }
      }

      const predictionStats = updatePredictionStats(state.predictionStats, predictionResult);
      const middleHintDismissed =
        state.middleHintDismissed ||
        (previousBounds && isNearMiddle(doorIndex, previousBounds));

      return {
        ...state,
        treasureIndex,
        attempts,
        tried,
        lastFeedback: feedback,
        lastPredictionResult: predictionResult,
        pendingPrediction: null,
        predictionStats,
        middleHintDismissed,
        status,
        searchBounds,
        zonePulseToken,
      };
    }
    case 'SET_PREDICTION':
      if (state.status !== 'playing') return state;
      return { ...state, pendingPrediction: action.prediction };
    case 'SKIP_PREDICTION':
      if (state.status !== 'playing') return state;
      return { ...state, pendingPrediction: 'skip' };
    case 'DISMISS_MIDDLE_HINT':
      return { ...state, middleHintDismissed: true };
    case 'CLEAR_ZONE_PULSE':
      if (action.token !== state.zonePulseToken) return state;
      return { ...state, zonePulseToken: 0 };
    case 'RESET':
      return init({ level: state.level });
    default:
      return state;
  }
}

function updatePredictionStats(stats, result) {
  if (!result) return stats;
  const total = stats.total + 1;
  if (result !== 'correct') return { ...stats, total, streak: 0 };
  const streak = stats.streak + 1;
  return {
    correct: stats.correct + 1,
    total,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
  };
}

// levelConfig overrides levelId — pass a full level object for custom mazes.
export default function GameBoard({ levelId, levelConfig, difficulty = 'standard', onComplete, onBack, onJournalOpen, journalCount }) {
  const baseLevel = levelConfig || getLevel(levelId);
  const level = useMemo(() => applyDifficulty(baseLevel, difficulty), [baseLevel, difficulty]);
  const [state, dispatch] = useReducer(reducer, { level }, init);
  const linearPath = useMemo(
    () => getLinearSeekerPath(state.treasureIndex, state.level.doorCount),
    [state.treasureIndex, state.level.doorCount]
  );

  useEffect(() => {
    if (state.status === 'won' || state.status === 'lost') {
      const { stars } = computeStarsAdvanced(state.attempts, state.level, state.status);
      const t = setTimeout(() => {
        onComplete({
          level: state.level,
          attempts: state.attempts,
          treasureIndex: state.treasureIndex,
          status: state.status,
          stars,
          predictions: state.predictionStats,
          race: buildRaceResult(state, linearPath),
          difficulty,
        });
      }, state.status === 'won' ? 1100 : 1400);
      return () => clearTimeout(t);
    }
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!state.zonePulseToken) return undefined;
    const t = setTimeout(() => {
      dispatch({ type: 'CLEAR_ZONE_PULSE', token: state.zonePulseToken });
    }, 850);
    return () => clearTimeout(t);
  }, [state.zonePulseToken]);

  const handleOpen = (idx) => dispatch({ type: 'OPEN', doorIndex: idx });
  const isLarge = level.doorCount > 20;
  const isDirection = level.feedbackType === 'direction';
  const suggestedMiddle = getSuggestedMiddle(state.searchBounds);
  const showMiddleHint = shouldShowMiddleHint(state, difficulty);
  const showRace = isDirection && (level.id === 4 || level.id === 5 || level.slowSeekerRace);
  const livePennyChecks = Math.min(level.doorCount, state.attempts.length * 3);
  const liveRaceSavings = Math.max(0, livePennyChecks - state.attempts.length);
  const doorsNeedPrediction = isDirection && state.status === 'playing' && state.pendingPrediction === null;

  return (
    <>
      <HUD
        level={level}
        moves={state.attempts.length}
        searchBounds={state.searchBounds}
        pulseZone={!!state.zonePulseToken}
        onBack={onBack}
        onJournalOpen={onJournalOpen}
        journalCount={journalCount}
      />

      <FeedbackPanel feedback={state.lastFeedback} level={level} predictionResult={state.lastPredictionResult} />

      {showRace && (
        <SlowSeekerRace
          playerMoves={state.attempts.length}
          linearMoves={livePennyChecks}
          doorCount={level.doorCount}
          gap={liveRaceSavings}
        />
      )}

      <SearchBracket bounds={state.searchBounds} doorCount={level.doorCount} pulse={!!state.zonePulseToken} />

      {isDirection && (
        <PredictionBar
          value={state.pendingPrediction}
          disabled={state.status !== 'playing'}
          onChoose={(prediction) => dispatch({ type: 'SET_PREDICTION', prediction })}
          onSkip={() => dispatch({ type: 'SKIP_PREDICTION' })}
        />
      )}

      <MiddleDoorHint
        doorNumber={suggestedMiddle === null ? null : suggestedMiddle + 1}
        visible={showMiddleHint}
        difficulty={difficulty}
      />

      <div
        className={`hallway${isLarge ? ' hallway--large' : ''}`}
        role="group"
        aria-label={`${level.doorCount} doors`}
      >
        {Array.from({ length: level.doorCount }).map((_, i) => {
          const inBounds = !state.searchBounds ||
            (i >= state.searchBounds.left && i <= state.searchBounds.right);
          const eliminated = state.searchBounds !== null && !state.tried[i] && !inBounds;
          const isReveal = state.status === 'lost' && i === state.treasureIndex;
          return (
            <Door
              key={i}
              index={i}
              displayNumber={i + 1}
              attempt={state.tried[i]}
              disabled={state.status !== 'playing' || doorsNeedPrediction}
              eliminated={eliminated}
              isReveal={isReveal}
              suggested={showMiddleHint && suggestedMiddle === i}
              onOpen={handleOpen}
            />
          );
        })}
      </div>

      <ClueHistory attempts={state.attempts} />
      {doorsNeedPrediction && (
        <div className="prediction__nudge">Choose Left, Right, or Skip Guess to open a door.</div>
      )}
    </>
  );
}

function shouldShowMiddleHint(state, difficulty) {
  if (!state.searchBounds || state.middleHintDismissed || state.status !== 'playing') return false;
  if (difficulty === 'expert') return false;
  if (difficulty === 'easy') return true;

  const remaining = getDoorWindowSize(state.searchBounds);
  const missedMiddles = state.attempts.filter((attempt) => !isNearMiddle(attempt.doorIndex, attempt.boundsBefore || state.searchBounds)).length;
  const hasNearMiddle = state.attempts.some((attempt) => isNearMiddle(attempt.doorIndex, attempt.boundsBefore || state.searchBounds));
  return missedMiddles >= 2 || (remaining > 8 && !hasNearMiddle);
}

function buildRaceResult(state, linearPath) {
  const linearMoves = linearPath.length;
  const gap = Math.max(0, linearMoves - state.attempts.length);
  return {
    linearMoves,
    gap,
    beatSlowSeeker: state.status === 'won' && gap > 0,
  };
}

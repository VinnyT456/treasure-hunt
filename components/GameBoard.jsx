'use client';

import { useEffect, useMemo, useReducer } from 'react';
import HUD from './HUD';
import Door from './Door';
import FeedbackPanel from './FeedbackPanel';
import ClueHistory from './ClueHistory';
import SearchBracket from './SearchBracket';
import PredictionBar from './PredictionBar';
import ContextualHint from './ContextualHint';
import SlowSeekerRace from './SlowSeekerRace';
import { getLevel } from '@/lib/levels';
import { computeFeedback, chooseTreasureIndex, relocateTreasureIfNeeded, computeStarsAdvanced } from '@/lib/gameLogic';
import { getLinearSeekerPath } from '@/lib/linearSeekerSim';
import { getWarmSeekerPath } from '@/lib/warmSeekerSim';
import { getSuggestedMiddle, getDoorWindowSize, isNearMiddle } from '@/lib/searchHints';
import { getHintPolicy } from '@/lib/hintPolicy';
import { getLevelIntro } from '@/lib/tutorials';

function applyDifficulty(level, difficulty = 'standard') {
  if (level.id === 'custom') return { ...level, difficulty };
  return { ...level, difficulty };
}

function init({ level, tutorialsSeen }) {
  const treasureIndex =
    level.treasureOverride !== undefined && level.treasureOverride !== null
      ? level.treasureOverride
      : chooseTreasureIndex(level);
  return {
    level: {
      ...level,
      intro: getLevelIntro(level, tutorialsSeen),
    },
    treasureIndex,
    attempts: [],
    tried: {},
    lastFeedback: null,
    lastPredictionResult: null,
    pendingPrediction: null,
    predictionEnabled: false,
    predictionStats: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    middleHintDismissed: false,
    openingHintShown: false,
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

      const needsPrediction = state.predictionEnabled && state.pendingPrediction === null;
      if (needsPrediction) return state;

      const triedSet = new Set(Object.keys(state.tried).map(Number));
      const previousBounds = state.searchBounds;
      const treasureIndex = relocateTreasureIfNeeded(
        state.level, doorIndex, state.treasureIndex, triedSet,
        state.attempts.length, state.searchBounds, state.attempts
      );
      const feedback = computeFeedback(state.level, doorIndex, treasureIndex);
      const prediction = state.predictionEnabled ? state.pendingPrediction : null;
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
        openingHintShown: true,
        status,
        searchBounds,
        zonePulseToken,
      };
    }
    case 'SET_PREDICTION':
      if (state.status !== 'playing') return state;
      return { ...state, pendingPrediction: action.prediction };
    case 'ENABLE_PREDICTION':
      return { ...state, predictionEnabled: true };
    case 'DISMISS_MIDDLE_HINT':
      return { ...state, middleHintDismissed: true };
    case 'MARK_OPENING_HINT':
      return { ...state, openingHintShown: true };
    case 'CLEAR_ZONE_PULSE':
      if (action.token !== state.zonePulseToken) return state;
      return { ...state, zonePulseToken: 0 };
    case 'RESET':
      return init({ level: state.level, tutorialsSeen: action.tutorialsSeen });
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

export default function GameBoard({
  levelId,
  levelConfig,
  difficulty = 'standard',
  tutorialsSeen = { linearSeen: false, binarySeen: false },
  onComplete,
  onBack,
  onJournalOpen,
  journalCount,
}) {
  const baseLevel = levelConfig || getLevel(levelId);
  const level = useMemo(() => applyDifficulty(baseLevel, difficulty), [baseLevel, difficulty]);
  const [state, dispatch] = useReducer(
    reducer,
    { level, tutorialsSeen },
    init
  );

  const linearPath = useMemo(
    () => getLinearSeekerPath(state.treasureIndex, state.level.doorCount),
    [state.treasureIndex, state.level.doorCount]
  );

  const warmPath = useMemo(
    () => (level.warmSeekerRace ? getWarmSeekerPath(state.treasureIndex, state.level.doorCount) : []),
    [level.warmSeekerRace, state.treasureIndex, state.level.doorCount]
  );

  const showWarmRace = !!level.warmSeekerRace;
  const showPennyRace = level.feedbackType === 'direction' && (level.id === 4 || level.id === 5 || level.slowSeekerRace);
  const rivalPath = showWarmRace ? warmPath : linearPath;
  const rivalKind = showWarmRace ? 'warm' : 'linear';

  const rivalDoorsOpened = useMemo(() => {
    const playerMoves = state.attempts.length;
    if (playerMoves === 0) return 0;
    return Math.min(rivalPath.length, playerMoves);
  }, [state.attempts.length, rivalPath]);

  const rivalDoorIndex = rivalDoorsOpened > 0 ? rivalPath[rivalDoorsOpened - 1] : null;

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
          race: buildRaceResult(state, rivalPath, rivalKind),
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

  const hintPolicy = getHintPolicy({
    level,
    difficulty,
    attemptCount: state.attempts.length,
    searchBounds: state.searchBounds,
    middleHintDismissed: state.middleHintDismissed,
    status: state.status,
    lastFeedback: state.lastFeedback,
    openingHintShown: state.openingHintShown,
  });

  const showMiddleHighlight =
    level.showMiddleHint &&
    isDirection &&
    state.status === 'playing' &&
    suggestedMiddle !== null;

  const showRace = showWarmRace || showPennyRace;
  const liveRaceSavings = Math.max(0, rivalDoorsOpened - state.attempts.length);
  const optionalPredictionLevel = level.id === 4 || level.id === 5;
  const showPredictionBar = isDirection && optionalPredictionLevel && state.predictionEnabled;

  return (
    <>
      <HUD
        level={level}
        moves={state.attempts.length}
        searchBounds={state.searchBounds}
        pulseZone={!!state.zonePulseToken}
        difficulty={difficulty}
        onBack={onBack}
        onJournalOpen={onJournalOpen}
        journalCount={journalCount}
      />

      <FeedbackPanel
        feedback={state.lastFeedback}
        level={state.level}
        predictionResult={state.lastPredictionResult}
      />

      {showRace && (
        <SlowSeekerRace
          playerMoves={state.attempts.length}
          linearMoves={rivalDoorsOpened}
          doorCount={level.doorCount}
          gap={liveRaceSavings}
          rivalName={showWarmRace ? 'Blaze the Warm Seeker' : 'Penny the Linear Seeker'}
          rivalShortName={showWarmRace ? 'Blaze' : 'Penny'}
        />
      )}

      <SearchBracket bounds={state.searchBounds} doorCount={level.doorCount} pulse={!!state.zonePulseToken} />

      {isDirection && optionalPredictionLevel && !state.predictionEnabled && state.status === 'playing' && (
        <div className="prediction-optional">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => dispatch({ type: 'ENABLE_PREDICTION' })}
          >
            Optional: predict Left/Right before each door
          </button>
        </div>
      )}

      {showPredictionBar && (
        <PredictionBar
          value={state.pendingPrediction}
          disabled={state.status !== 'playing'}
          optional
          onChoose={(prediction) => dispatch({ type: 'SET_PREDICTION', prediction })}
          onSkip={() => dispatch({ type: 'SET_PREDICTION', prediction: 'skip' })}
        />
      )}

      <ContextualHint
        policy={hintPolicy}
        difficulty={difficulty}
        binarySeen={tutorialsSeen.binarySeen}
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
          const isPennyHere = showPennyRace && rivalDoorIndex === i && state.status === 'playing';
          const isBlazeHere = showWarmRace && rivalDoorIndex === i && state.status === 'playing';
          return (
            <Door
              key={i}
              index={i}
              displayNumber={i + 1}
              attempt={state.tried[i]}
              disabled={
                state.status !== 'playing' ||
                (state.predictionEnabled && state.pendingPrediction === null)
              }
              eliminated={eliminated}
              isReveal={isReveal}
              suggested={showMiddleHighlight && suggestedMiddle === i}
              pennyHere={isPennyHere}
              blazeHere={isBlazeHere}
              onOpen={handleOpen}
            />
          );
        })}
      </div>

      <ClueHistory attempts={state.attempts} />
    </>
  );
}

function buildRaceResult(state, rivalPath, rivalKind) {
  const rivalMoves = rivalPath.length;
  const gap = Math.max(0, rivalMoves - state.attempts.length);
  return {
    linearMoves: rivalKind === 'linear' ? rivalMoves : undefined,
    warmMoves: rivalKind === 'warm' ? rivalMoves : undefined,
    rivalKind,
    gap,
    beatSlowSeeker: state.status === 'won' && gap > 0,
  };
}

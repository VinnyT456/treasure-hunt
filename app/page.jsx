'use client';

import { useState, useCallback, useEffect } from 'react';
import StartScreen from '@/components/StartScreen';
import GameBoard from '@/components/GameBoard';
import LevelComplete from '@/components/LevelComplete';
import GameComplete from '@/components/GameComplete';
import Level6Choice from '@/components/Level6Choice';
import MakerFlow from '@/components/MakerFlow';
import JoinFlow from '@/components/JoinFlow';
import StrategyJournal from '@/components/StrategyJournal';
import TutorialOverlay from '@/components/TutorialOverlay';
import PennyIntroOverlay from '@/components/PennyIntroOverlay';
import BlazeIntroOverlay from '@/components/BlazeIntroOverlay';
import BadgesPage from '@/components/BadgesPage';
import { LEVELS } from '@/lib/levels';
import { BADGES, computeAllBadges, mergeNewBadges } from '@/lib/badges';
import {
  loadProgressState,
  saveProgressState,
  mergeProgressState,
  recordLevelScore,
  recordClassScore,
} from '@/lib/progressStorage';

const SCREENS = {
  START: 'start',
  BADGES: 'badges',
  LEVEL6: 'level6',
  MAKER: 'maker',
  JOIN: 'join',
  GAME: 'game',
  COMPLETE: 'complete',
  FINISHED: 'finished',
};

function tutorialBadges(tutorialsSeen) {
  if (tutorialsSeen.linearSeen && tutorialsSeen.binarySeen) {
    return [BADGES.mapReader];
  }
  return [];
}

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState(SCREENS.START);
  const [activeLevelId, setActiveLevelId] = useState(1);
  const [customLevel, setCustomLevel] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [progress, setProgress] = useState({});
  const [tutorialsSeen, setTutorialsSeen] = useState({ linearSeen: false, binarySeen: false });
  const [badgesEarned, setBadgesEarned] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState({});
  const [classScores, setClassScores] = useState({});
  const [journal, setJournal] = useState([]);
  const [journalOpen, setJournalOpen] = useState(false);
  const [difficulty, setDifficulty] = useState('standard');
  const [pendingTutorial, setPendingTutorial] = useState(null);
  const [pendingLevelId, setPendingLevelId] = useState(null);
  const [postWinTutorial, setPostWinTutorial] = useState(null);
  const [postWinPennyIntro, setPostWinPennyIntro] = useState(false);
  const [pennyIntroSeen, setPennyIntroSeen] = useState(false);
  const [blazeIntroSeen, setBlazeIntroSeen] = useState(false);
  const [showBlazeIntro, setShowBlazeIntro] = useState(false);
  const [sessionLostLevels, setSessionLostLevels] = useState({});

  useEffect(() => {
    const stored = loadProgressState();
    setProgress(stored.progress);
    setTutorialsSeen(stored.tutorialsSeen);
    setPennyIntroSeen(stored.pennyIntroSeen);
    setBlazeIntroSeen(stored.blazeIntroSeen);
    setBadgesEarned(stored.badgesEarned);
    setPlayerName(stored.playerName);
    setLeaderboard(stored.leaderboard);
    setClassScores(stored.classScores);
    setHydrated(true);
  }, []);

  const persist = useCallback((patch) => {
    const next = mergeProgressState(
      {
        progress,
        tutorialsSeen,
        pennyIntroSeen,
        blazeIntroSeen,
        badgesEarned,
        playerName,
        leaderboard,
        classScores,
      },
      patch
    );
    if (patch.progress !== undefined) setProgress(patch.progress);
    if (patch.tutorialsSeen !== undefined) setTutorialsSeen(patch.tutorialsSeen);
    if (patch.pennyIntroSeen !== undefined) setPennyIntroSeen(patch.pennyIntroSeen);
    if (patch.blazeIntroSeen !== undefined) setBlazeIntroSeen(patch.blazeIntroSeen);
    if (patch.badgesEarned !== undefined) setBadgesEarned(patch.badgesEarned);
    if (patch.playerName !== undefined) setPlayerName(patch.playerName);
    if (patch.leaderboard !== undefined) setLeaderboard(patch.leaderboard);
    if (patch.classScores !== undefined) setClassScores(patch.classScores);
    saveProgressState(next);
  }, [progress, tutorialsSeen, pennyIntroSeen, blazeIntroSeen, badgesEarned, playerName, leaderboard, classScores]);

  const applyBadgeAwards = useCallback((incoming, currentBadges) => {
    let { merged, newBadges } = mergeNewBadges(currentBadges, incoming);
    const totalUnique = new Set(merged.map((b) => b.id));
    if (totalUnique.size >= 8 && !totalUnique.has('treasureFleet')) {
      const fleet = { ...BADGES.treasureFleet, earnedAt: Date.now() };
      merged = [...merged, fleet];
      newBadges = [...newBadges, fleet];
    }
    persist({ badgesEarned: merged });
    return { merged, newBadges };
  }, [persist]);

  const launchGame = useCallback((id, custom = null) => {
    setCustomLevel(custom);
    setActiveLevelId(id);
    setScreen(SCREENS.GAME);
  }, []);

  const beginLevel = useCallback((id) => {
    if (id === 2 && !blazeIntroSeen) {
      setPendingLevelId(id);
      setShowBlazeIntro(true);
      return;
    }
    if (id === 4 && !tutorialsSeen.binarySeen) {
      setPendingLevelId(id);
      setPendingTutorial('binary');
      setPostWinTutorial(null);
      return;
    }
    launchGame(id, null);
  }, [blazeIntroSeen, tutorialsSeen.binarySeen, launchGame]);

  const handleStart = useCallback((id) => {
    beginLevel(id);
  }, [beginLevel]);

  const handlePlayCustom = useCallback((levelConfig) => {
    launchGame(levelConfig.id, levelConfig);
  }, [launchGame]);

  const handleLevelDone = useCallback((result) => {
    if (result.status === 'lost' && result.level.id !== 'custom') {
      setSessionLostLevels((prev) => ({ ...prev, [result.level.id]: true }));
    }

    const priorProgress = { ...progress };
    const incoming = computeAllBadges(result, {
      progress,
      priorProgress,
      tutorialsSeen,
      badgesEarned,
      sessionLostLevels,
    });
    const { merged, newBadges } = applyBadgeAwards(incoming, badgesEarned);

    if (result.status === 'won' && result.level.id !== 'custom') {
      setSessionLostLevels((prev) => {
        const next = { ...prev };
        delete next[result.level.id];
        return next;
      });
    }

    const enriched = { ...result, badges: incoming, newBadges };
    setLastResult(enriched);

    let nextProgress = progress;
    let nextLeaderboard = leaderboard;
    let nextClassScores = classScores;

    if (result.level.id !== 'custom') {
      const prior = priorProgress[result.level.id] || 0;
      if (result.stars > prior) {
        nextProgress = { ...progress, [result.level.id]: result.stars };
      }
      nextLeaderboard = recordLevelScore(leaderboard, result.level.id, {
        stars: result.stars,
        moves: result.attempts.length,
        name: playerName || 'Player',
      });
    }

    persist({
      progress: nextProgress,
      badgesEarned: merged,
      leaderboard: nextLeaderboard,
      classScores: nextClassScores,
    });

    if (result.status === 'won' && result.level.id === 1) {
      if (!pennyIntroSeen) {
        setPostWinPennyIntro(true);
        setPostWinTutorial(null);
        setPendingTutorial(null);
      } else if (!tutorialsSeen.linearSeen) {
        setPostWinPennyIntro(false);
        setPostWinTutorial('linear');
        setPendingTutorial(null);
      } else {
        setPostWinPennyIntro(false);
        setPostWinTutorial(null);
      }
    } else if (result.status === 'won' && result.level.id === 3 && !tutorialsSeen.binarySeen) {
      setPostWinPennyIntro(false);
      setPostWinTutorial('binary');
      setPendingTutorial(null);
      setPendingLevelId(null);
    } else {
      setPostWinPennyIntro(false);
      setPostWinTutorial(null);
    }

    setScreen(SCREENS.COMPLETE);
  }, [
    progress,
    tutorialsSeen,
    pennyIntroSeen,
    badgesEarned,
    sessionLostLevels,
    leaderboard,
    classScores,
    playerName,
    applyBadgeAwards,
    persist,
  ]);

  const handleBlazeIntroDismiss = useCallback(() => {
    setShowBlazeIntro(false);
    setBlazeIntroSeen(true);
    persist({ blazeIntroSeen: true });
    const levelToLaunch = pendingLevelId;
    setPendingLevelId(null);
    if (levelToLaunch) {
      launchGame(levelToLaunch, null);
    }
  }, [persist, pendingLevelId, launchGame]);

  const handlePennyIntroDismiss = useCallback(() => {
    setPostWinPennyIntro(false);
    setPennyIntroSeen(true);
    persist({ pennyIntroSeen: true });
    if (!tutorialsSeen.linearSeen) {
      setPostWinTutorial('linear');
    }
  }, [persist, tutorialsSeen.linearSeen]);

  const handleTutorialComplete = useCallback((tutorialId) => {
    if (tutorialId === 'linear') {
      const next = { ...tutorialsSeen, linearSeen: true };
      setTutorialsSeen(next);
      applyBadgeAwards(tutorialBadges(next), badgesEarned);
      persist({ tutorialsSeen: next });
      setPostWinTutorial(null);
      return;
    }
    if (tutorialId === 'binary') {
      const next = { ...tutorialsSeen, binarySeen: true };
      setTutorialsSeen(next);
      applyBadgeAwards(tutorialBadges(next), badgesEarned);
      persist({ tutorialsSeen: next });
      setPostWinTutorial(null);
      const levelToLaunch = pendingLevelId;
      setPendingTutorial(null);
      setPendingLevelId(null);
      if (levelToLaunch) {
        launchGame(levelToLaunch, null);
      }
    }
  }, [tutorialsSeen, pendingLevelId, launchGame, persist, badgesEarned, applyBadgeAwards]);

  const handleTutorialSkip = useCallback(() => {
    if (pendingTutorial !== 'binary' || postWinTutorial) return;
    const next = { ...tutorialsSeen, binarySeen: true };
    setTutorialsSeen(next);
    applyBadgeAwards(tutorialBadges(next), badgesEarned);
    persist({ tutorialsSeen: next });
    const levelToLaunch = pendingLevelId;
    setPendingTutorial(null);
    setPendingLevelId(null);
    if (levelToLaunch) {
      launchGame(levelToLaunch, null);
    }
  }, [pendingTutorial, postWinTutorial, tutorialsSeen, pendingLevelId, launchGame, persist, badgesEarned, applyBadgeAwards]);

  const handleNext = useCallback(() => {
    const idx = LEVELS.findIndex((l) => l.id === activeLevelId);
    if (idx < 0 || idx >= LEVELS.length - 1) {
      setScreen(SCREENS.FINISHED);
      return;
    }
    const nextId = LEVELS[idx + 1].id;
    setCustomLevel(null);
    setActiveLevelId(nextId);
    if (nextId === 2 && !blazeIntroSeen) {
      setPendingLevelId(2);
      setShowBlazeIntro(true);
      return;
    }
    setScreen(SCREENS.GAME);
  }, [activeLevelId, blazeIntroSeen]);

  const handleReplay = useCallback(() => setScreen(SCREENS.GAME), []);
  const handleBackToMenu = useCallback(() => {
    setCustomLevel(null);
    setPostWinTutorial(null);
    setPostWinPennyIntro(false);
    setShowBlazeIntro(false);
    setPendingTutorial(null);
    setPendingLevelId(null);
    setScreen(SCREENS.START);
  }, []);

  const handleJournalAdd = useCallback((entry) => {
    setJournal((prev) => [...prev, entry]);
  }, []);

  const handlePlayerNameChange = useCallback((name) => {
    setPlayerName(name);
    persist({ playerName: name });
  }, [persist]);

  const handleRecordRoomScore = useCallback(({ code, name, stars, moves }) => {
    const nextClassScores = recordClassScore(classScores, code, {
      name,
      stars,
      moves,
    });
    setClassScores(nextClassScores);
    setPlayerName(name);
    persist({ classScores: nextClassScores, playerName: name });
  }, [classScores, persist]);

  const isCustomGame = customLevel !== null;

  if (!hydrated) {
    return <main className="shell shell--loading">Loading adventure...</main>;
  }

  if (showBlazeIntro) {
    return (
      <main className="shell">
        <BlazeIntroOverlay
          onDismiss={handleBlazeIntroDismiss}
          onBack={handleBackToMenu}
        />
      </main>
    );
  }

  const activeTutorial = postWinTutorial || pendingTutorial;
  const showImmersiveTutorial =
    activeTutorial &&
    (pendingTutorial || (screen === SCREENS.COMPLETE && !postWinPennyIntro));

  if (showImmersiveTutorial) {
    return (
      <main className="shell">
        <TutorialOverlay
          tutorialId={activeTutorial}
          variant="warm"
          onComplete={() => handleTutorialComplete(activeTutorial)}
          onSkip={pendingTutorial && !postWinTutorial ? handleTutorialSkip : undefined}
          skipLabel={pendingTutorial ? 'Level 4 →' : undefined}
        />
      </main>
    );
  }

  return (
    <main className="shell">

      {postWinPennyIntro &&
        screen === SCREENS.COMPLETE &&
        lastResult?.status === 'won' &&
        lastResult?.level?.id === 1 && (
        <PennyIntroOverlay
          onDismiss={handlePennyIntroDismiss}
          onBack={handleBackToMenu}
          ctaLabel={
            tutorialsSeen.linearSeen
              ? 'See results →'
              : 'Linear search →'
          }
        />
      )}

      {screen === SCREENS.START && (
        <StartScreen
          onStart={handleStart}
          progress={progress}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          badgesEarned={badgesEarned}
          onLevel6={() => setScreen(SCREENS.LEVEL6)}
          onClassChallenge={() => setScreen(SCREENS.JOIN)}
          onBadges={() => setScreen(SCREENS.BADGES)}
        />
      )}

      {screen === SCREENS.BADGES && (
        <BadgesPage badgesEarned={badgesEarned} onBack={handleBackToMenu} />
      )}

      {screen === SCREENS.LEVEL6 && (
        <Level6Choice
          onMaker={() => setScreen(SCREENS.MAKER)}
          onJoin={() => setScreen(SCREENS.JOIN)}
          onBack={handleBackToMenu}
        />
      )}

      {screen === SCREENS.MAKER && (
        <MakerFlow
          onPlay={handlePlayCustom}
          onBack={() => setScreen(SCREENS.LEVEL6)}
          tutorialsSeen={tutorialsSeen}
        />
      )}

      {screen === SCREENS.JOIN && (
        <JoinFlow onPlay={handlePlayCustom} onBack={() => setScreen(SCREENS.LEVEL6)} />
      )}

      {screen === SCREENS.GAME && (
        <GameBoard
          key={isCustomGame ? `custom-${customLevel.code}-${Date.now()}` : `${activeLevelId}-${Date.now()}`}
          levelId={isCustomGame ? undefined : activeLevelId}
          levelConfig={isCustomGame ? customLevel : undefined}
          difficulty={difficulty}
          tutorialsSeen={tutorialsSeen}
          onComplete={handleLevelDone}
          onBack={handleBackToMenu}
          onJournalOpen={() => setJournalOpen(true)}
          journalCount={journal.length}
        />
      )}

      {screen === SCREENS.COMPLETE && lastResult && !postWinTutorial && !postWinPennyIntro && !showBlazeIntro && (
        <LevelComplete
          result={lastResult}
          hasNext={
            !isCustomGame &&
            LEVELS.findIndex((l) => l.id === activeLevelId) < LEVELS.length - 1
          }
          isCustom={isCustomGame}
          tutorialsSeen={tutorialsSeen}
          leaderboard={leaderboard}
          classScores={classScores}
          playerName={playerName}
          onPlayerNameChange={handlePlayerNameChange}
          onRecordRoomScore={handleRecordRoomScore}
          onNext={handleNext}
          onReplay={handleReplay}
          onMenu={handleBackToMenu}
          onJournalAdd={handleJournalAdd}
          onJournalOpen={() => setJournalOpen(true)}
          journalCount={journal.length}
          onBadges={() => setScreen(SCREENS.BADGES)}
        />
      )}

      {screen === SCREENS.FINISHED && (
        <GameComplete
          progress={progress}
          leaderboard={leaderboard}
          playerName={playerName}
          onMenu={handleBackToMenu}
          onMaker={() => setScreen(SCREENS.MAKER)}
          onBadges={() => setScreen(SCREENS.BADGES)}
          onRetry={(id) => { setCustomLevel(null); setActiveLevelId(id); setScreen(SCREENS.GAME); }}
        />
      )}

      {journalOpen && (
        <StrategyJournal entries={journal} onClose={() => setJournalOpen(false)} />
      )}
    </main>
  );
}

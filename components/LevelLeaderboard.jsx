'use client';

import { useEffect, useMemo, useState } from 'react';

const PLAYER_ROW_ID = '__you__';

const ADJECTIVES = ['Brave', 'Swift', 'Clever', 'Curious', 'Sunny', 'Mighty'];
const ANIMALS = ['Fox', 'Otter', 'Tiger', 'Falcon', 'Panda', 'Dolphin'];

function normalizeName(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

function suggestPlayerName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adjective}${animal}`;
}

function formatStars(count) {
  return count > 0 ? '★'.repeat(count) : '—';
}

function isBetterScore(next, previous) {
  if (!previous) return true;
  if (next.stars !== previous.stars) return next.stars > previous.stars;
  return next.moves < previous.moves;
}

/** Static demo entries — IDs never collide with PLAYER_ROW_ID. */
const MOCK_NPCS_BY_LEVEL = {
  1: [
    { id: 'mock-npc-1a', name: 'SwiftOtter', stars: 1, moves: 1 },
    { id: 'mock-npc-1b', name: 'CuriousPanda', stars: 1, moves: 2 },
    { id: 'mock-npc-1c', name: 'MightyFalcon', stars: 1, moves: 3 },
    { id: 'mock-npc-1d', name: 'SunnyTiger', stars: 1, moves: 4 },
    { id: 'mock-npc-1e', name: 'CleverFox', stars: 1, moves: 5 },
    { id: 'mock-npc-1f', name: 'BraveDolphin', stars: 1, moves: 6 },
  ],
  2: [
    { id: 'mock-npc-2a', name: 'HotIceTeam', stars: 2, moves: 3 },
    { id: 'mock-npc-2b', name: 'MapleBear', stars: 2, moves: 4 },
    { id: 'mock-npc-2c', name: 'GhostSnack', stars: 2, moves: 4 },
    { id: 'mock-npc-2d', name: 'WaffleKid', stars: 1, moves: 5 },
    { id: 'mock-npc-2e', name: 'StarSeeker', stars: 2, moves: 5 },
    { id: 'mock-npc-2f', name: 'ClueBuddy', stars: 1, moves: 6 },
  ],
  3: [
    { id: 'mock-npc-3a', name: 'GhostWhisper', stars: 2, moves: 4 },
    { id: 'mock-npc-3b', name: 'HallwayAce', stars: 2, moves: 4 },
    { id: 'mock-npc-3c', name: 'SplitKid', stars: 2, moves: 5 },
    { id: 'mock-npc-3d', name: 'LeftRightPro', stars: 2, moves: 5 },
    { id: 'mock-npc-3e', name: 'DoorDetective', stars: 2, moves: 6 },
    { id: 'mock-npc-3f', name: 'MazeMouse', stars: 1, moves: 7 },
  ],
  4: [
    { id: 'mock-npc-4a', name: 'FiveMoveZen', stars: 3, moves: 5 },
    { id: 'mock-npc-4b', name: 'BinaryNinja', stars: 3, moves: 5 },
    { id: 'mock-npc-4c', name: 'MasterSplit', stars: 2, moves: 5 },
    { id: 'mock-npc-4d', name: 'GhostTrain', stars: 3, moves: 5 },
    { id: 'mock-npc-4e', name: 'PixelHunter', stars: 2, moves: 5 },
    { id: 'mock-npc-4f', name: 'ClutchPlayer', stars: 2, moves: 5 },
    { id: 'mock-npc-4g', name: 'PracticeRun', stars: 1, moves: 5 },
  ],
  5: [
    { id: 'mock-npc-5a', name: 'LegendLily', stars: 3, moves: 7 },
    { id: 'mock-npc-5b', name: 'LogTwoBoss', stars: 3, moves: 7 },
    { id: 'mock-npc-5c', name: 'MiddleClick', stars: 3, moves: 7 },
    { id: 'mock-npc-5d', name: 'HalvingHero', stars: 3, moves: 7 },
    { id: 'mock-npc-5e', name: 'AlmostThere', stars: 2, moves: 7 },
    { id: 'mock-npc-5f', name: 'StillLearning', stars: 2, moves: 7 },
    { id: 'mock-npc-5g', name: 'BigMazeKid', stars: 3, moves: 7 },
  ],
};

function compareEntries(a, b) {
  if (b.stars !== a.stars) return b.stars - a.stars;
  if (a.moves !== b.moves) return a.moves - b.moves;
  return String(a.playerId).localeCompare(String(b.playerId));
}

function npcsForLevel(levelId) {
  return MOCK_NPCS_BY_LEVEL[levelId] ?? MOCK_NPCS_BY_LEVEL[1];
}

export default function LevelLeaderboard({ levelId, levelName, stars, moves }) {
  const [savedName, setSavedName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [sessionBest, setSessionBest] = useState(null);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const name = suggestPlayerName();
    setSavedName(name);
    setNameDraft(name);
  }, []);

  useEffect(() => {
    setSessionBest((prev) => {
      const next = { stars, moves };
      return isBetterScore(next, prev) ? next : prev;
    });
  }, [levelId, stars, moves]);

  const { rows, playerRank, isPlayerInTopList } = useMemo(() => {
    const displayName = savedName || 'You';

    const npcRows = npcsForLevel(levelId).map((n) => ({
      playerId: n.id,
      playerName: n.name,
      stars: n.stars,
      moves: n.moves,
    }));

    const you = {
      playerId: PLAYER_ROW_ID,
      playerName: displayName,
      stars,
      moves,
    };

    const merged = [...npcRows, you].sort(compareEntries);
    const rank = merged.findIndex((r) => r.playerId === PLAYER_ROW_ID) + 1;
    const top = merged.slice(0, 10);

    return {
      rows: top,
      playerRank: rank || null,
      isPlayerInTopList: top.some((e) => e.playerId === PLAYER_ROW_ID),
    };
  }, [levelId, stars, moves, savedName]);

  function handleSaveName(e) {
    e.preventDefault();
    const normalized = normalizeName(nameDraft);
    if (!normalized) {
      setNameError('Please enter a name before saving.');
      return;
    }
    setSavedName(normalized);
    setNameDraft(normalized);
    setNameError('');
  }

  function handleRandomName() {
    setNameDraft(suggestPlayerName());
    setNameError('');
  }

  return (
    <section className="leaderboard complete__column-card" aria-label={`Leaderboard for level ${levelId}`}>
      <h3 className="leaderboard__title">Level {levelId} — {levelName}</h3>

      <section className="leaderboard__section" aria-label="Your score details">
        <h4 className="leaderboard__panel-title">You</h4>

        <form className="leaderboard__name-form leaderboard__name-form--stack" onSubmit={handleSaveName}>
          <label className="leaderboard__label" htmlFor="leaderboard-name-input">Enter your name</label>
          <input
            id="leaderboard-name-input"
            className="leaderboard__name-input"
            maxLength={20}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Name"
          />
          <div className="leaderboard__name-actions">
            <button className="btn btn--gold" type="submit">Save Name</button>
            <button className="btn btn--ghost" type="button" onClick={handleRandomName}>Random Name</button>
          </div>
        </form>
        {nameError && <p className="leaderboard__state leaderboard__state--error">{nameError}</p>}

        <div className="leaderboard__facts">
          <div className="leaderboard__fact">
            <span>This run</span>
            <strong>{formatStars(stars)} · {moves} moves</strong>
          </div>
          <div className="leaderboard__fact">
            <span>Best this visit</span>
            <strong>
              {sessionBest ? `${formatStars(sessionBest.stars)} · ${sessionBest.moves} moves` : '—'}
            </strong>
          </div>
          <div className="leaderboard__fact">
            <span>Current rank</span>
            <strong>{playerRank ? `#${playerRank}` : '—'}</strong>
          </div>
        </div>
      </section>

      <section className="leaderboard__section leaderboard__section--grow" aria-label="Top scores">
        <h4 className="leaderboard__panel-title">Top scores</h4>
        <div className="leaderboard__rows">
          {rows.map((entry, i) => {
            const rank = i + 1;
            const isYou = entry.playerId === PLAYER_ROW_ID;
            const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const label = entry.playerName;
            return (
              <div
                key={entry.playerId}
                className={`leaderboard__row leaderboard__row--rank${rank}${isYou ? ' leaderboard__row--you' : ''}`}
              >
                <span className="leaderboard__rank">{rankBadge}</span>
                <span className="leaderboard__name">
                  {isYou ? `You — ${label}` : label}
                </span>
                <span className="leaderboard__stats">
                  <span className="leaderboard__stars">{formatStars(entry.stars)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.moves} moves</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {playerRank && !isPlayerInTopList && (
        <p className="leaderboard__outside-rank">
          You’d land at #{playerRank} overall — tighten your strategy to crack the top 10!
        </p>
      )}
    </section>
  );
}

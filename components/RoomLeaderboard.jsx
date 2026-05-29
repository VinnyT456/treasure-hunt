'use client';

import { useMemo, useState } from 'react';

function normalizeName(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

function formatStars(count) {
  return count > 0 ? '★'.repeat(count) : '—';
}

function compareEntries(a, b) {
  if (b.stars !== a.stars) return b.stars - a.stars;
  if (a.moves !== b.moves) return a.moves - b.moves;
  return (a.at || 0) - (b.at || 0);
}

export default function RoomLeaderboard({
  code,
  stars,
  moves,
  maxStars = 3,
  scores,
  onRecordScore,
}) {
  const [savedName, setSavedName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState('');
  const [scorePosted, setScorePosted] = useState(false);

  const { rows, playerRank, isPlayerInTopList } = useMemo(() => {
    const displayName = savedName.trim().toLowerCase();
    const list = (Array.isArray(scores) ? [...scores] : []).sort(compareEntries);

    const rank = displayName
      ? list.findIndex((e) => (e.name || '').toLowerCase() === displayName) + 1
      : 0;
    const top = list.slice(0, 10).map((entry, i) => ({
      ...entry,
      rowKey: `${entry.name}-${entry.at}-${i}`,
      isYou: displayName ? (entry.name || '').toLowerCase() === displayName : false,
    }));

    return {
      rows: top,
      playerRank: rank > 0 ? rank : null,
      isPlayerInTopList: top.some((e) => e.isYou),
    };
  }, [scores, savedName]);

  function handleSaveName(e) {
    e.preventDefault();
    const normalized = normalizeName(nameDraft);
    if (!normalized) {
      setNameError('Please enter a name to post your score.');
      return;
    }
    if (!scorePosted) {
      onRecordScore?.({ code, name: normalized, stars, moves });
      setScorePosted(true);
    }
    setSavedName(normalized);
    setNameDraft(normalized);
    setNameError('');
  }

  return (
    <section className="leaderboard complete__column-card" aria-label={`Leaderboard for room ${code}`}>
      <h3 className="leaderboard__title">Room {code}</h3>
      <p className="leaderboard__demo-note">
        {scorePosted
          ? 'Custom maze — fewest moves wins!'
          : 'Enter your name and save to add this run to the board.'}
      </p>

      <section className="leaderboard__section" aria-label="Your score details">
        <h4 className="leaderboard__panel-title">You</h4>

        <form className="leaderboard__name-form leaderboard__name-form--stack" onSubmit={handleSaveName}>
          <label className="leaderboard__label" htmlFor="room-leaderboard-name">Your name</label>
          <input
            id="room-leaderboard-name"
            className="leaderboard__name-input"
            maxLength={20}
            value={nameDraft}
            onChange={(e) => {
              setNameDraft(e.target.value);
              setNameError('');
            }}
            placeholder="Name"
            autoComplete="off"
            disabled={scorePosted}
          />
          <div className="leaderboard__name-actions">
            <button className="btn btn--gold" type="submit" disabled={scorePosted}>
              Save & Post Score
            </button>
          </div>
        </form>
        {nameError && <p className="leaderboard__state leaderboard__state--error">{nameError}</p>}
        {scorePosted && (
          <p className="leaderboard__state leaderboard__state--success">Score posted to the board!</p>
        )}

        <div className="leaderboard__facts">
          <div className="leaderboard__fact">
            <span>This run</span>
            <strong>{formatStars(stars)} · {moves} moves</strong>
          </div>
          <div className="leaderboard__fact">
            <span>Your rank</span>
            <strong>{playerRank ? `#${playerRank}` : scorePosted ? '—' : 'Save name first'}</strong>
          </div>
        </div>
      </section>

      <section className="leaderboard__section leaderboard__section--grow" aria-label="Top scores">
        <h4 className="leaderboard__panel-title">Top scores</h4>
        {!scorePosted && rows.length === 0 ? (
          <p className="leaderboard__empty">Save your name to be the first on this board!</p>
        ) : rows.length === 0 ? (
          <p className="leaderboard__empty">Be the first on this board!</p>
        ) : (
          <div className="leaderboard__rows">
            {rows.map((entry, i) => {
              const rank = i + 1;
              const isYou = entry.isYou;
              const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              return (
                <div
                  key={entry.rowKey}
                  className={`leaderboard__row leaderboard__row--rank${rank}${isYou ? ' leaderboard__row--you' : ''}`}
                >
                  <span className="leaderboard__rank">{rankBadge}</span>
                  <span className="leaderboard__name">{entry.name}</span>
                  <span className="leaderboard__stats">
                    <span className="leaderboard__stars">{formatStars(entry.stars)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.moves} moves</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {scorePosted && playerRank && !isPlayerInTopList && rows.length > 0 && (
        <p className="leaderboard__outside-rank">
          You’d land at #{playerRank} on this board — try again for a higher spot!
        </p>
      )}
    </section>
  );
}

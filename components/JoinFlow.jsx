'use client';

import { useState } from 'react';
import { loadLevel } from '@/lib/levelStorage';
import { buildCustomLevel } from '@/lib/makerLogic';

export default function JoinFlow({ onPlay, onBack }) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGo() {
    const code = raw.trim().toUpperCase();
    if (!code) {
      setError('Please enter a room code.');
      return;
    }
    setLoading(true);
    setError('');
    const config = await loadLevel(code);
    setLoading(false);
    if (!config) {
      setError(`No level found for "${code}". Check the code and try again.`);
      return;
    }
    const level = buildCustomLevel({ code, ...config });
    onPlay(level);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleGo();
  }

  return (
    <div className="join">
      <button className="hud__back" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← Menu</button>

      <div className="join__body">
        <div className="join__emoji" aria-hidden="true">🔑</div>
        <h2 className="join__title">Enter a Room Code</h2>
        <p className="join__sub">
          Your teacher or friend will share a code like <strong>BRAVE-TIGER</strong>.
          Type it below, race the maze, and compare fewest moves!
        </p>

        <input
          className={'join__input' + (error ? ' join__input--error' : '')}
          type="text"
          placeholder="BRAVE-TIGER"
          value={raw}
          onChange={(e) => { setRaw(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={handleKey}
          maxLength={30}
          autoFocus
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Room code"
        />

        {error && <p className="join__error">{error}</p>}

        <button
          className="btn btn--gold join__go"
          onClick={handleGo}
          disabled={loading}
        >
          {loading ? 'Looking up…' : 'Go! →'}
        </button>
      </div>
    </div>
  );
}

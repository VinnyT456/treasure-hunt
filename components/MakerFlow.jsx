'use client';

import { useState, useCallback } from 'react';
import { generateCode, minMoves, buildCustomLevel, encodeConfig } from '@/lib/makerLogic';
import { saveLevel } from '@/lib/levelStorage';

const STEPS = ['Scale', 'Treasure', 'Clues', 'Moves', 'Share'];

// ─── Step 1: how many doors ───────────────────────────────────────────────────
const DOOR_MIN = 5;
const DOOR_MAX = 500;

function StepScale({ doorCount, onChange }) {
  const [rawInput, setRawInput] = useState(String(doorCount));

  // Keep rawInput in sync when slider changes doorCount externally.
  function handleSlider(e) {
    const v = Number(e.target.value);
    onChange(v);
    setRawInput(String(v));
  }

  function handleInput(e) {
    const raw = e.target.value;
    setRawInput(raw);
    if (raw === '') return; // allow empty while typing
    const v = parseInt(raw, 10);
    if (!isNaN(v)) onChange(v);
  }

  // Clamp to valid range when the field loses focus.
  function handleBlur() {
    const v = parseInt(rawInput, 10);
    if (isNaN(v) || rawInput === '') {
      setRawInput(String(doorCount)); // revert to last valid value
    } else {
      const clamped = Math.max(DOOR_MIN, Math.min(DOOR_MAX, v));
      onChange(clamped);
      setRawInput(String(clamped));
    }
  }

  const parsed = parseInt(rawInput, 10);
  const isEmpty = rawInput === '';
  const overLimit = !isEmpty && !isNaN(parsed) && parsed > DOOR_MAX;
  const underLimit = !isEmpty && !isNaN(parsed) && parsed < DOOR_MIN;
  const invalid = isEmpty || isNaN(parsed) || overLimit || underLimit;
  const perfect = !invalid ? minMoves(parsed) : null;

  return (
    <div className="maker__step-body">
      <p className="maker__hint">How many doors should your maze have?</p>

      <div className="maker__slider-wrap">
        <input
          type="range"
          min={DOOR_MIN}
          max={DOOR_MAX}
          value={Math.min(Math.max(doorCount, DOOR_MIN), DOOR_MAX)}
          onChange={handleSlider}
          className="maker__slider"
          aria-label="Number of doors (slider, 5 to 500)"
        />
        <div className="maker__slider-labels">
          <span>{DOOR_MIN}</span><span>{DOOR_MAX}</span>
        </div>
      </div>

      <div className="maker__exact-row">
        <label className="maker__label" htmlFor="exact-doors">Exact number ({DOOR_MIN} – {DOOR_MAX}):</label>
        <input
          id="exact-doors"
          type="number"
          min={DOOR_MIN}
          max={DOOR_MAX}
          value={rawInput}
          onChange={handleInput}
          onBlur={handleBlur}
          className={'maker__number-input' + (invalid ? ' maker__number-input--error' : '')}
          aria-invalid={invalid}
        />
      </div>

      {overLimit && (
        <p className="maker__field-error">Maximum is {DOOR_MAX} doors.</p>
      )}
      {underLimit && (
        <p className="maker__field-error">Minimum is {DOOR_MIN} doors.</p>
      )}

      {!invalid && (
        <div className="maker__math-hint">
          💡 A master hunter needs at least <strong>{perfect} move{perfect !== 1 ? 's' : ''}</strong> for {parsed} door{parsed !== 1 ? 's' : ''} using binary search.
        </div>
      )}
    </div>
  );
}

// ─── Step 2: where to hide the treasure ──────────────────────────────────────
function StepTreasure({ doorCount, treasureMode, treasureDoor, onModeChange, onDoorChange }) {
  function handleDoor(e) {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) onDoorChange(Math.max(1, Math.min(doorCount, v)));
  }

  return (
    <div className="maker__step-body">
      <p className="maker__hint">Where should the treasure hide?</p>

      <label className="maker__radio">
        <input
          type="radio"
          name="treasure"
          value="random"
          checked={treasureMode === 'random'}
          onChange={() => onModeChange('random')}
        />
        <span className="maker__radio-label">
          🎲 <strong>Randomize</strong> — different door every game <span className="maker__badge">Recommended</span>
        </span>
      </label>

      <label className="maker__radio">
        <input
          type="radio"
          name="treasure"
          value="specific"
          checked={treasureMode === 'specific'}
          onChange={() => onModeChange('specific')}
        />
        <span className="maker__radio-label">
          📌 <strong>Specific door</strong> — you choose
        </span>
      </label>

      {treasureMode === 'specific' && (
        <div className="maker__exact-row maker__exact-row--indented">
          <label className="maker__label" htmlFor="treasure-door">Door number (1 – {doorCount}):</label>
          <input
            id="treasure-door"
            type="number"
            min={1}
            max={doorCount}
            value={treasureDoor}
            onChange={handleDoor}
            className="maker__number-input"
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 3: what clues the ghost gives ──────────────────────────────────────
const CLUE_OPTIONS = [
  {
    value: 'none',
    emoji: '🤫',
    label: 'Silent maze',
    desc: 'No clues — pure guessing (Level 1 style).',
  },
  {
    value: 'distance',
    emoji: '🌡️',
    label: 'Hot / Cold distance clues',
    desc: 'Each door tells how far the treasure is (Level 2 — linear-friendly).',
  },
  {
    value: 'direction',
    emoji: '👻',
    label: 'Left / Right split clues',
    desc: 'Eliminate half the maze each try (Level 3+ — binary-friendly).',
  },
];

function StepClues({ feedbackType, onChange, binarySeen }) {
  return (
    <div className="maker__step-body">
      <p className="maker__hint">What clues does the ghost give?</p>
      {!binarySeen && (
        <p className="maker__hint maker__hint--note">
          Left/Right clues work best after you have learned to split the search (Level 3+).
        </p>
      )}
      <div className="maker__clue-list">
        {CLUE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={'maker__clue-card' + (feedbackType === opt.value ? ' maker__clue-card--active' : '')}
            onClick={() => onChange(opt.value)}
          >
            <span className="maker__clue-emoji">{opt.emoji}</span>
            <span className="maker__clue-label">{opt.label}</span>
            <span className="maker__clue-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: move limit ───────────────────────────────────────────────────────
function StepMoves({ doorCount, hasLimit, moveLimit, onHasLimitChange, onMoveLimitChange }) {
  const perfect = minMoves(doorCount);

  function handleInput(e) {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) onMoveLimitChange(Math.max(1, Math.min(doorCount, v)));
  }

  return (
    <div className="maker__step-body">
      <p className="maker__hint">Should there be a move limit?</p>

      <label className="maker__radio">
        <input
          type="radio"
          name="limit"
          checked={!hasLimit}
          onChange={() => onHasLimitChange(false)}
        />
        <span className="maker__radio-label">
          ♾️ <strong>Unlimited</strong> — players can take as long as they need
        </span>
      </label>

      <label className="maker__radio">
        <input
          type="radio"
          name="limit"
          checked={hasLimit}
          onChange={() => onHasLimitChange(true)}
        />
        <span className="maker__radio-label">
          ⏱️ <strong>Strict limit</strong> — run out of moves and you lose
        </span>
      </label>

      {hasLimit && (
        <div className="maker__exact-row maker__exact-row--indented">
          <label className="maker__label" htmlFor="move-limit">Move limit:</label>
          <input
            id="move-limit"
            type="number"
            min={1}
            max={doorCount}
            value={moveLimit}
            onChange={handleInput}
            className="maker__number-input"
          />
        </div>
      )}

      <div className="maker__math-hint">
        💡 Binary search solves {doorCount} doors in <strong>{perfect} move{perfect !== 1 ? 's' : ''}</strong>.
        {hasLimit && moveLimit < perfect && (
          <span className="maker__math-warn"> ⚠️ That's fewer than the minimum — the level may be unwinnable!</span>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: the generated code ──────────────────────────────────────────────
function StepDone({ code, onPlay, onBack, savedLocally }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="maker__step-body maker__done">
      <p className="maker__hint">Your level is ready! Share this code:</p>

      <div className="maker__code-box">
        <span className="maker__code-text">{code}</span>
      </div>

      <p className="maker__done-sub">
        Friends go to the main menu and press <strong>Enter a Code</strong>, then type this in.
        {savedLocally && (
          <> Saved on <strong>this device</strong> — share the code with friends on the same computer, or set up Supabase to share online.</>
        )}
      </p>

      <div className="maker__done-actions">
        <button className="btn btn--ghost" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy Code'}
        </button>
        <button className="btn btn--gold" onClick={onPlay}>
          ▶ Play It Now
        </button>
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
export default function MakerFlow({ onPlay, onBack, tutorialsSeen }) {
  const [step, setStep] = useState(0);
  const [doorCount, setDoorCount] = useState(20);
  const [treasureMode, setTreasureMode] = useState('random');
  const [treasureDoor, setTreasureDoor] = useState(1);
  const [feedbackType, setFeedbackType] = useState('direction');
  const [hasLimit, setHasLimit] = useState(false);
  const [moveLimit, setMoveLimit] = useState(minMoves(20));
  const [code, setCode] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // When doorCount changes, keep moveLimit in sync with the new perfect value.
  function handleDoorCount(n) {
    setDoorCount(n);
    setMoveLimit(minMoves(n));
  }

  const handleNext = useCallback(async () => {
    if (step < STEPS.length - 2) {
      setStep((s) => s + 1);
      return;
    }
    // Last "Next" — save and reveal code.
    setSaving(true);
    setSaveError(null);
    const newCode = generateCode();
    const config = encodeConfig({ doorCount, treasureMode, treasureDoor, feedbackType, hasLimit, moveLimit });
    const result = await saveLevel(newCode, config);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error || 'Could not save your level. Please try again.');
      return;
    }
    setCode(newCode);
    setSavedLocally(result.storage === 'local');
    setStep(STEPS.length - 1);
  }, [step, doorCount, treasureMode, treasureDoor, feedbackType, hasLimit, moveLimit]);

  function handlePlay() {
    if (!code) return;
    const level = buildCustomLevel({ code, doorCount, treasureMode, treasureDoor, feedbackType, hasLimit, moveLimit });
    onPlay(level);
  }

  const lastDataStep = STEPS.length - 2; // step before "Done"

  return (
    <div className="maker">
      <button className="hud__back" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← Menu</button>

      <div className="maker__header">
        <h2 className="maker__title">Create a Level</h2>
        <div className="maker__steps">
          {STEPS.map((label, i) => (
            <div
              key={i}
              className={
                'maker__step-pip' +
                (i < step ? ' maker__step-pip--done' : '') +
                (i === step ? ' maker__step-pip--active' : '')
              }
              aria-label={label}
            >
              {i < step ? '✓' : i + 1}
            </div>
          ))}
        </div>
        <div className="maker__step-label">{STEPS[step]}</div>
      </div>

      {step === 0 && (
        <StepScale doorCount={doorCount} onChange={handleDoorCount} />
      )}
      {step === 1 && (
        <StepTreasure
          doorCount={doorCount}
          treasureMode={treasureMode}
          treasureDoor={treasureDoor}
          onModeChange={setTreasureMode}
          onDoorChange={setTreasureDoor}
        />
      )}
      {step === 2 && (
        <StepClues feedbackType={feedbackType} onChange={setFeedbackType} binarySeen={tutorialsSeen?.binarySeen} />
      )}
      {step === 3 && (
        <StepMoves
          doorCount={doorCount}
          hasLimit={hasLimit}
          moveLimit={moveLimit}
          onHasLimitChange={setHasLimit}
          onMoveLimitChange={setMoveLimit}
        />
      )}
      {step === 4 && code && (
        <StepDone code={code} onPlay={handlePlay} onBack={onBack} savedLocally={savedLocally} />
      )}

      {step < STEPS.length - 1 && (
        <div className="maker__nav">
          {step > 0 && (
            <button className="btn btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              ← Back
            </button>
          )}
          {saveError && <p className="maker__error">{saveError}</p>}
          <button
            className="btn btn--gold"
            onClick={handleNext}
            disabled={saving || (step === 0 && (doorCount < DOOR_MIN || doorCount > DOOR_MAX))}
          >
            {saving ? 'Saving…' : step === lastDataStep ? 'Generate Code →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

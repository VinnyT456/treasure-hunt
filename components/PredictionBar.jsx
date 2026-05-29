'use client';

const OPTIONS = [
  { key: 'left', label: 'Left', arrow: '←' },
  { key: 'right', label: 'Right', arrow: '→' },
];

export default function PredictionBar({ value, disabled, optional, onChoose, onSkip }) {
  return (
    <div className="prediction" aria-label="Predict where the treasure is">
      <div>
        <div className="prediction__title">{optional ? 'Optional challenge' : 'Make a ghost guess'}</div>
        <div className="prediction__sub">
          {optional
            ? 'Predict Left or Right before opening — or skip with no penalty.'
            : 'Before opening a door, predict which side the treasure will be on.'}
        </div>
      </div>
      <div className="prediction__actions">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            className={'prediction__btn' + (value === option.key ? ' prediction__btn--active' : '')}
            onClick={() => onChoose(option.key)}
            disabled={disabled}
            type="button"
          >
            <span>{option.arrow}</span> {option.label}
          </button>
        ))}
        <button
          className={'prediction__skip' + (value === 'skip' ? ' prediction__skip--active' : '')}
          onClick={onSkip}
          disabled={disabled}
          type="button"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

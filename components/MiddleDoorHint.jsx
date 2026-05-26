'use client';

export default function MiddleDoorHint({ doorNumber, visible, difficulty }) {
  if (!visible || !doorNumber) return null;

  return (
    <div className="middle-hint" role="status">
      <div className="middle-hint__ghost" aria-hidden="true">👻</div>
      <div>
        <div className="middle-hint__title">
          {difficulty === 'easy' ? 'Friendly hint' : 'The ghost whispers'}
        </div>
        <div className="middle-hint__text">
          Binary hunters check the middle of what is left. Try door <strong>#{doorNumber}</strong>.
        </div>
      </div>
    </div>
  );
}

'use client';

import GhostMascot from './GhostMascot';

export default function PennyIntroOverlay({
  onDismiss,
  onBack,
  ctaLabel = 'See results →',
}) {
  return (
    <div className="tutorial-overlay warm-intro-overlay" role="dialog" aria-modal="true" aria-labelledby="penny-intro-title">
      <div className="tutorial-overlay__card">
        <div className="tutorial-overlay__header">
          <div className="penny-intro-overlay__avatar" aria-hidden="true">P</div>
          <GhostMascot size={48} />
          <h2 id="penny-intro-title" className="tutorial-overlay__title">Meet Penny</h2>
        </div>

        <p className="tutorial-overlay__body">
          <strong>Penny the Linear Seeker</strong> is your friendly rival. She opens every door in order —
          door 1, then 2, then 3 — until she finds the treasure.
        </p>
        <p className="tutorial-overlay__body">
          On bigger hunts you can race her and try to win with <strong>fewer doors opened</strong>.
          First, let us learn the search strategy she uses every time.
        </p>

        <p className="tutorial-demo tutorial-demo--penny" aria-hidden="true">
          Penny always searches left to right, one door at a time.
        </p>

        <div className="tutorial-overlay__actions">
          {onBack && (
            <button className="btn btn--ghost" type="button" onClick={onBack}>
              Menu
            </button>
          )}
          <button className="btn btn--gold" type="button" onClick={onDismiss}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

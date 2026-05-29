'use client';

import GhostMascot from './GhostMascot';

export default function BlazeIntroOverlay({
  onDismiss,
  onBack,
  ctaLabel = 'Level 2 →',
}) {
  return (
    <div className="tutorial-overlay warm-intro-overlay" role="dialog" aria-modal="true" aria-labelledby="blaze-intro-title">
      <div className="tutorial-overlay__card">
        <div className="tutorial-overlay__header">
          <div className="blaze-intro-overlay__avatar" aria-hidden="true">B</div>
          <GhostMascot size={48} />
          <h2 id="blaze-intro-title" className="tutorial-overlay__title">Meet Blaze</h2>
        </div>

        <p className="tutorial-overlay__body">
          <strong>Blaze the Warm Seeker</strong> is another rival hunter. She reads the hot and cold
          clues — jumping away from cold doors and chasing the warm ones.
        </p>
        <p className="tutorial-overlay__body">
          On Level 2 you can race her and try to find the treasure with <strong>fewer doors opened</strong>.
          Watch how she follows the temperature, not just door order.
        </p>

        <p className="tutorial-demo tutorial-demo--blaze" aria-hidden="true">
          Cold? Blaze jumps far away. Warm? Blaze stays close and keeps searching nearby.
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

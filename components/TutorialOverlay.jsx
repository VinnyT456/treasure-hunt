'use client';

import { useState } from 'react';
import { TUTORIALS } from '@/lib/tutorials';
import GhostMascot from './GhostMascot';

export default function TutorialOverlay({ tutorialId, onComplete, onSkip, variant = 'default', skipLabel }) {
  const tutorial = TUTORIALS[tutorialId];
  const [stepIndex, setStepIndex] = useState(0);
  if (!tutorial) return null;

  const step = tutorial.steps[stepIndex];
  const isLast = stepIndex >= tutorial.steps.length - 1;
  const isWarm = variant === 'warm';

  return (
    <div
      className={'tutorial-overlay' + (isWarm ? ' warm-intro-overlay' : '')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="tutorial-overlay__card">
        <div className="tutorial-overlay__header">
          <GhostMascot size={48} />
          <h2 id="tutorial-title" className="tutorial-overlay__title">{tutorial.title}</h2>
          <p className="tutorial-overlay__step-label">Step {stepIndex + 1} of {tutorial.steps.length}</p>
        </div>

        <h3 className="tutorial-overlay__step-title">{step.title}</h3>
        <p className="tutorial-overlay__body">{step.body}</p>

        {step.visual === 'linear-demo' && <LinearDemo />}
        {step.visual === 'penny' && <PennyDemo />}
        {step.visual === 'binary-demo' && <BinaryDemo />}

        <div className="tutorial-overlay__actions">
          {onSkip && (
            <button className="btn btn--ghost" type="button" onClick={onSkip}>
              {skipLabel || (isWarm ? 'Menu' : 'Skip for now')}
            </button>
          )}
          <button
            className="btn btn--gold"
            type="button"
            onClick={() => (isLast ? onComplete() : setStepIndex((i) => i + 1))}
          >
            {isLast ? 'Got it!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LinearDemo() {
  return (
    <div className="tutorial-demo" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={'tutorial-demo__door' + (n <= 3 ? ' tutorial-demo__door--checked' : '')}>
          {n}
        </span>
      ))}
      <span className="tutorial-demo__arrow">→</span>
      <span className="tutorial-demo__label">Penny checks in order</span>
    </div>
  );
}

function PennyDemo() {
  return (
    <p className="tutorial-demo tutorial-demo--penny" aria-hidden="true">
      Penny opens every door from the start until the treasure appears.
    </p>
  );
}

function BinaryDemo() {
  const doors = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div className="tutorial-demo tutorial-demo--binary" aria-hidden="true">
      {doors.map((n) => (
        <span
          key={n}
          className={
            'tutorial-demo__door' +
            (n === 4 ? ' tutorial-demo__door--middle' : n > 4 ? ' tutorial-demo__door--dim' : ' tutorial-demo__door--dim')
          }
        >
          {n}
        </span>
      ))}
      <span className="tutorial-demo__label">Pick the middle, then half of what remains</span>
    </div>
  );
}

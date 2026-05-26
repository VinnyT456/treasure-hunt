'use client';

import { useMemo, useState } from 'react';
import { buildSearchTimeline } from '@/lib/searchHints';

export default function PathStepper({ attempts, treasureIndex, doorCount }) {
  const [active, setActive] = useState(0);
  const steps = useMemo(() => buildSearchTimeline(attempts, doorCount), [attempts, doorCount]);
  const step = steps[active] || attempts[0];

  if (!attempts.length || !step) return null;

  const miniDoors = Array.from({ length: Math.min(doorCount, 40) }, (_, i) => i);
  const scale = doorCount / miniDoors.length;
  const activeMini = Math.min(miniDoors.length - 1, Math.floor(step.doorIndex / scale));

  return (
    <div className="path path-stepper">
      <div className="path__title">Your path through the maze</div>
      <div className="path-stepper__stage">
        <button className="path-stepper__nav" onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>
          ←
        </button>
        <div className="path-stepper__card">
          <span className="path-stepper__move">Move {active + 1} of {attempts.length}</span>
          <strong>Door #{step.doorIndex + 1}</strong>
          <span>{step.feedback.emoji || '🚪'} {step.feedback.label}</span>
          {step.feedback.kind === 'direction' && step.feedback.key !== 'found' && (
            <em>
              Zone became doors {step.boundsAfter.left + 1}–{step.boundsAfter.right + 1}.
            </em>
          )}
        </div>
        <button className="path-stepper__nav" onClick={() => setActive(Math.min(attempts.length - 1, active + 1))} disabled={active === attempts.length - 1}>
          →
        </button>
      </div>

      <div className="path-stepper__mini" aria-label="Mini hallway replay">
        {miniDoors.map((i) => (
          <span
            key={i}
            className={
              'path-stepper__mini-door' +
              (i === activeMini ? ' path-stepper__mini-door--active' : '') +
              (Math.floor(treasureIndex / scale) === i ? ' path-stepper__mini-door--treasure' : '')
            }
          />
        ))}
      </div>
      <div className="path-stepper__treasure">
        Treasure was behind <strong>door #{treasureIndex + 1}</strong> · {doorCount} doors total
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { getLinearSeekerPath } from '@/lib/linearSeekerSim';

export default function SearchCompareDemo({ attempts, treasureIndex, doorCount }) {
  const [open, setOpen] = useState(true);
  const linear = useMemo(() => getLinearSeekerPath(treasureIndex, doorCount), [treasureIndex, doorCount]);

  return (
    <div className="compare">
      <button className="compare__toggle" onClick={() => setOpen((value) => !value)} type="button">
        <span>Linear vs binary replay</span>
        <strong>{open ? 'Hide' : 'Show'}</strong>
      </button>
      {open && (
        <div className="compare__body">
          <CompareLane
            title="Your run"
            count={attempts.length}
            steps={attempts.map((attempt) => attempt.doorIndex)}
            treasureIndex={treasureIndex}
          />
          <CompareLane
            title="Penny one-by-one"
            count={linear.length}
            steps={linear}
            treasureIndex={treasureIndex}
            muted
          />
          <p className="compare__lesson">
            Binary search feels like magic because every clue can remove half the hallway.
          </p>
        </div>
      )}
    </div>
  );
}

function CompareLane({ title, count, steps, treasureIndex, muted }) {
  const shown = steps.slice(0, 18);
  return (
    <div className={'compare__lane' + (muted ? ' compare__lane--muted' : '')}>
      <div className="compare__lane-head">
        <strong>{title}</strong>
        <span>{count} door{count !== 1 ? 's' : ''} checked</span>
      </div>
      <div className="compare__chips">
        {shown.map((door) => (
          <span key={door} className={'compare__chip' + (door === treasureIndex ? ' compare__chip--found' : '')}>
            {door + 1}
          </span>
        ))}
        {steps.length > shown.length && <span className="compare__chip compare__chip--more">+{steps.length - shown.length}</span>}
      </div>
    </div>
  );
}

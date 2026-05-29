'use client';

import GhostMascot from './GhostMascot';
import { getMiddleHintTitle, getMiddleHintBody } from '@/lib/hintPolicy';

export default function ContextualHint({ policy, difficulty, binarySeen }) {
  if (!policy?.show) return null;

  const title = getMiddleHintTitle(
    difficulty,
    policy.phase,
    binarySeen,
    policy.persistentMiddle
  );
  const body = getMiddleHintBody(policy, binarySeen);

  return (
    <div className="middle-hint" role="status">
      <GhostMascot size={36} className="middle-hint__ghost" />
      <div>
        <div className="middle-hint__title">{title}</div>
        <div className="middle-hint__text">{body}</div>
      </div>
    </div>
  );
}

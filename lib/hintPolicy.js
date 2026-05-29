import { getSuggestedMiddle } from './searchHints';

/**
 * Returns hint display policy for the current game moment.
 * @returns {{ show: boolean, phase: 'opening' | 'ongoing' | null, kind: string, message?: string, doorNumber?: number }}
 */
export function getHintPolicy({
  level,
  difficulty,
  attemptCount,
  searchBounds,
  middleHintDismissed,
  status,
  lastFeedback,
  openingHintShown,
}) {
  if (status !== 'playing') {
    return { show: false, phase: null, kind: 'none' };
  }

  const isDirection = level.feedbackType === 'direction';

  if (level.showMiddleHint && isDirection && searchBounds) {
    const mid = getSuggestedMiddle(searchBounds);
    if (mid !== null) {
      return {
        show: true,
        phase: 'ongoing',
        kind: 'middle',
        doorNumber: mid + 1,
        message: `Try door #${mid + 1} — the middle of what is left.`,
        persistentMiddle: true,
      };
    }
  }

  if (difficulty === 'expert') {
    return { show: false, phase: null, kind: 'none' };
  }

  const isDistance = level.feedbackType === 'distance';
  const isSilent = level.feedbackType === 'none';

  if (difficulty === 'standard') {
    if (openingHintShown) {
      return { show: false, phase: null, kind: 'none' };
    }
    return buildOpeningHint(level, searchBounds);
  }

  // Easy: hint after every non-winning attempt, or opening if no attempts yet
  if (attemptCount === 0) {
    return buildOpeningHint(level, searchBounds);
  }

  if (lastFeedback?.kind === 'found') {
    return { show: false, phase: null, kind: 'none' };
  }

  if (isDirection && searchBounds && (difficulty === 'easy' || !middleHintDismissed)) {
    const mid = getSuggestedMiddle(searchBounds);
    if (mid !== null) {
      return {
        show: true,
        phase: 'ongoing',
        kind: 'middle',
        doorNumber: mid + 1,
        message: `Try door #${mid + 1} — the middle of what is left.`,
      };
    }
  }

  if (isDistance) {
    const cold = lastFeedback?.key === 'cold' || lastFeedback?.key === 'cool';
    return {
      show: true,
      phase: 'ongoing',
      kind: 'temperature',
      message: cold
        ? 'That door was cold — jump farther away next time!'
        : 'Pick a door farther from the coldest clue you saw.',
    };
  }

  if (isSilent) {
    return {
      show: true,
      phase: 'ongoing',
      kind: 'explore',
      message: 'Try a door you have not opened yet.',
    };
  }

  return { show: false, phase: null, kind: 'none' };
}

function buildOpeningHint(level, searchBounds) {
  if (level.feedbackType === 'direction' && searchBounds) {
    const mid = getSuggestedMiddle(searchBounds);
    if (mid !== null) {
      return {
        show: true,
        phase: 'opening',
        kind: 'middle',
        doorNumber: mid + 1,
        message: `Start near the middle — try door #${mid + 1}.`,
      };
    }
  }

  if (level.feedbackType === 'distance') {
    return {
      show: true,
      phase: 'opening',
      kind: 'temperature',
      message: 'Hot doors are closer to the treasure. Cold doors are far — jump away from cold!',
    };
  }

  if (level.feedbackType === 'none') {
    return {
      show: true,
      phase: 'opening',
      kind: 'explore',
      message: 'No clues here — check doors one at a time until you get lucky.',
    };
  }

  return { show: false, phase: null, kind: 'none' };
}

export function getMiddleHintTitle(difficulty, phase, binarySeen, persistentMiddle = false) {
  if (persistentMiddle) return 'Middle door';
  if (difficulty === 'easy') return 'Friendly hint';
  if (phase === 'opening') return 'Starting hint';
  if (binarySeen) return 'The ghost whispers';
  return 'The ghost whispers';
}

export function getMiddleHintBody(policy, binarySeen) {
  if (policy.kind === 'middle' && policy.doorNumber) {
    if (binarySeen) {
      return `Binary hunters check the middle of what is left. Try door #${policy.doorNumber}.`;
    }
    return `Split what is left in half. Try door #${policy.doorNumber}.`;
  }
  return policy.message || '';
}

import { buildSearchTimeline, getDoorWindowSize, isNearMiddle } from './searchHints';

export const BADGES = {
  middleMaster: {
    id: 'middleMaster',
    label: 'Middle Master',
    detail: 'Picked the middle of the hunt zone.',
  },
  zoneShrinker: {
    id: 'zoneShrinker',
    label: 'Zone Shrinker',
    detail: 'Kept cutting the maze down fast.',
  },
  psychic: {
    id: 'psychic',
    label: 'Ghost Guesser',
    detail: 'Predicted the ghost clues correctly.',
  },
  speedDemon: {
    id: 'speedDemon',
    label: 'Speed Hunter',
    detail: 'Found treasure in the target number of moves.',
  },
  comebackKid: {
    id: 'comebackKid',
    label: 'Last-Move Legend',
    detail: 'Won on the final move.',
  },
  slowSeeker: {
    id: 'slowSeeker',
    label: 'Penny Beater',
    detail: 'Beat the slow linear seeker.',
  },
};

export function computeEarnedBadges(result) {
  if (!result || result.status !== 'won') return [];

  const { attempts, level, predictions, race } = result;
  const earned = [];
  const isDirection = level.feedbackType === 'direction';
  const timeline = isDirection ? buildSearchTimeline(attempts, level.doorCount) : [];

  if (
    isDirection &&
    attempts.length > 0 &&
    timeline.every((step) => isNearMiddle(step.doorIndex, step.boundsBefore))
  ) {
    earned.push(BADGES.middleMaster);
  }

  if (
    isDirection &&
    timeline.some((step) => {
      const before = getDoorWindowSize(step.boundsBefore);
      const after = getDoorWindowSize(step.boundsAfter);
      return step.feedback.key !== 'found' && before > 1 && after <= Math.ceil(before / 2);
    })
  ) {
    earned.push(BADGES.zoneShrinker);
  }

  if ((predictions?.bestStreak || 0) >= 3) {
    earned.push(BADGES.psychic);
  }

  const target = level.efficiencyMoves ?? level.optimalMoves ?? level.perfectMoves;
  if (target && attempts.length <= target) {
    earned.push(BADGES.speedDemon);
  }

  if (level.moveLimit && attempts.length === level.moveLimit) {
    earned.push(BADGES.comebackKid);
  }

  if (race?.beatSlowSeeker) {
    earned.push(BADGES.slowSeeker);
  }

  return earned;
}

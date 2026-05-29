import { buildSearchTimeline, getDoorWindowSize, isNearMiddle } from './searchHints';
import { computeStarsAdvanced, checkApproximateBinarySearch } from './gameLogic';
import { LEVELS } from './levels';

export const BADGES = {
  firstDoubloon: {
    id: 'firstDoubloon',
    label: 'First Doubloon',
    detail: 'You found your very first treasure. Welcome aboard!',
    icon: '🪙',
    group: 'starter',
  },
  luckyDoor: {
    id: 'luckyDoor',
    label: 'Lucky Door',
    detail: 'You found the treasure on your very first try!',
    icon: '🍀',
    group: 'starter',
  },
  warmTrail: {
    id: 'warmTrail',
    label: 'Warm Trail',
    detail: 'You followed the heat and got closer to the gold.',
    icon: '🔥',
    group: 'starter',
  },
  clueCaptain: {
    id: 'clueCaptain',
    label: 'Clue Captain',
    detail: 'You followed every hot and cold clue like a pro.',
    icon: '🌡️',
    group: 'starter',
  },
  ghostPal: {
    id: 'ghostPal',
    label: "Ghost's Pal",
    detail: 'You finished the Friendly Ghost level!',
    icon: '👻',
    group: 'starter',
  },
  tryAgainChampion: {
    id: 'tryAgainChampion',
    label: 'Try-Again Champion',
    detail: 'You did not quit after a tough run. That is captain energy!',
    icon: '💪',
    group: 'starter',
  },
  middleMaster: {
    id: 'middleMaster',
    label: 'Middle Master',
    detail: 'Picked the middle of the hunt zone.',
    icon: '⚓',
    group: 'skill',
  },
  zoneShrinker: {
    id: 'zoneShrinker',
    label: 'Zone Shrinker',
    detail: 'Kept cutting the maze down fast.',
    icon: '✂️',
    group: 'skill',
  },
  psychic: {
    id: 'psychic',
    label: 'Sharp Guesser',
    detail: 'Predicted three ghost clues in a row (optional challenge).',
    icon: '🎯',
    group: 'skill',
  },
  speedDemon: {
    id: 'speedDemon',
    label: 'Speed Hunter',
    detail: 'Found treasure in the target number of moves.',
    icon: '⚡',
    group: 'skill',
  },
  comebackKid: {
    id: 'comebackKid',
    label: 'Last-Move Legend',
    detail: 'Won on the final move.',
    icon: '🏁',
    group: 'skill',
  },
  slowSeeker: {
    id: 'slowSeeker',
    label: 'Penny Beater',
    detail: 'Beat Penny with fewer doors opened than she needs.',
    icon: '🏆',
    group: 'skill',
  },
  pennyRival: {
    id: 'pennyRival',
    label: "Penny's Rival",
    detail: 'You beat Penny by five whole doors. She is impressed!',
    icon: '⭐',
    group: 'skill',
  },
  halfHero: {
    id: 'halfHero',
    label: 'Half-and-Half Hero',
    detail: 'You split the search in half every move — that is binary search!',
    icon: '🗺️',
    group: 'skill',
  },
  mapReader: {
    id: 'mapReader',
    label: 'Map Reader',
    detail: 'You finished both treasure-hunting lessons. You know the map!',
    icon: '📖',
    group: 'captain',
  },
  captainCrew: {
    id: 'captainCrew',
    label: 'Captain of the Crew',
    detail: 'You won every campaign level at least once.',
    icon: '🏴‍☠️',
    group: 'captain',
  },
  treasureFleet: {
    id: 'treasureFleet',
    label: 'Treasure Fleet',
    detail: 'You collected eight different pirate coins!',
    icon: '🚢',
    group: 'captain',
  },
};

export const BADGE_GROUPS = [
  { id: 'starter', title: 'Starter coins' },
  { id: 'skill', title: 'Hunter coins' },
  { id: 'captain', title: 'Captain coins' },
];

const HOT_KEYS = new Set(['blazing', 'hot']);

function dedupeBadges(list) {
  const seen = new Set();
  return list.filter((badge) => {
    if (seen.has(badge.id)) return false;
    seen.add(badge.id);
    return true;
  });
}

export function computeRunBadges(result) {
  if (!result || result.status !== 'won') return [];

  const { attempts, level, predictions, race } = result;
  const earned = [];
  const isDirection = level.feedbackType === 'direction';
  const timeline = isDirection ? buildSearchTimeline(attempts, level.doorCount) : [];
  const starResult = computeStarsAdvanced(attempts, level, 'won');

  if (attempts.length === 1) {
    earned.push(BADGES.luckyDoor);
  }

  if (level.id === 2) {
    const followedClues = starResult.criteria.some(
      (c) => c.label === 'Followed the clues correctly' && c.earned
    );
    if (followedClues) earned.push(BADGES.clueCaptain);

    const feltHeat = attempts.some(
      (a) => a.feedback.kind === 'distance' && HOT_KEYS.has(a.feedback.key)
    );
    if (feltHeat) earned.push(BADGES.warmTrail);
  }

  if (level.id === 3) {
    earned.push(BADGES.ghostPal);
  }

  if (level.id === 5 && checkApproximateBinarySearch(attempts, level.doorCount)) {
    earned.push(BADGES.halfHero);
  }

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

  if ((race?.gap || 0) >= 5 && (level.id === 4 || level.id === 5)) {
    earned.push(BADGES.pennyRival);
  }

  return earned;
}

export function computeMetaBadges(result, context = {}) {
  const {
    progress = {},
    priorProgress,
    tutorialsSeen = {},
    badgesEarned = [],
    sessionLostLevels = {},
  } = context;

  const earned = [];
  const prog = priorProgress ?? progress;

  if (result?.status === 'won' && result.level?.id !== 'custom') {
    const levelId = result.level.id;
    const priorStars = prog[levelId] || 0;
    if (priorStars === 0) {
      earned.push(BADGES.firstDoubloon);
    }

    if (sessionLostLevels[levelId]) {
      earned.push(BADGES.tryAgainChampion);
    }

    const nextProgress = {
      ...progress,
      [levelId]: Math.max(prog[levelId] || 0, result.stars || 0),
    };
    const allCampaignWon = LEVELS.every((l) => (nextProgress[l.id] || 0) > 0);
    if (allCampaignWon) {
      earned.push(BADGES.captainCrew);
    }
  }

  if (tutorialsSeen.linearSeen && tutorialsSeen.binarySeen) {
    earned.push(BADGES.mapReader);
  }

  return earned;
}

/** Run + meta badges for a completed level. */
export function computeAllBadges(result, context = {}) {
  const run = result?.status === 'won' ? computeRunBadges(result) : [];
  const meta = computeMetaBadges(result, context);
  let all = dedupeBadges([...run, ...meta]);

  const totalUnique = new Set([
    ...(context.badgesEarned || []).map((b) => b.id),
    ...all.map((b) => b.id),
  ]);
  if (totalUnique.size >= 8) {
    all = dedupeBadges([...all, BADGES.treasureFleet]);
  }

  return all;
}

/** @deprecated Use computeAllBadges with context for meta badges. */
export function computeEarnedBadges(result) {
  return computeRunBadges(result);
}

export function mergeNewBadges(existing, incoming) {
  const seen = new Set((existing || []).map((b) => b.id));
  const fresh = (incoming || []).filter((b) => !seen.has(b.id));
  if (!fresh.length) return { merged: existing || [], newBadges: [] };
  const stamped = fresh.map((b) => ({ ...b, earnedAt: Date.now() }));
  return { merged: [...(existing || []), ...stamped], newBadges: stamped };
}

import { computeFeedback } from './gameLogic';

const TEMP_WARMTH_RANK = {
  cold: 0,
  cool: 1,
  warm: 2,
  hot: 3,
  blazing: 4,
};

function tempRank(key) {
  return TEMP_WARMTH_RANK[key] ?? -1;
}

export function getWarmSeekerPath(treasureIndex, doorCount) {
  const level = { feedbackType: 'distance', doorCount };
  const tried = new Set();
  const path = [];

  function chooseNext() {
    const untried = [];
    for (let i = 0; i < doorCount; i += 1) {
      if (!tried.has(i)) untried.push(i);
    }
    if (untried.length === 0) return null;

    if (path.length === 0) {
      return Math.floor((doorCount - 1) / 2);
    }

    let coldestDoor = path[0];
    let coldestRank = Infinity;
    let warmestDoor = path[0];
    let warmestRank = -1;

    for (const doorIndex of path) {
      const feedback = computeFeedback(level, doorIndex, treasureIndex);
      const rank = tempRank(feedback.key);
      if (rank < coldestRank) {
        coldestRank = rank;
        coldestDoor = doorIndex;
      }
      if (rank > warmestRank) {
        warmestRank = rank;
        warmestDoor = doorIndex;
      }
    }

    const lastFeedback = computeFeedback(level, path[path.length - 1], treasureIndex);
    const lastRank = tempRank(lastFeedback.key);

    if (lastRank <= tempRank('cool')) {
      return untried.reduce((best, doorIndex) =>
        (Math.abs(doorIndex - coldestDoor) > Math.abs(best - coldestDoor) ? doorIndex : best)
      );
    }

    return untried.reduce((best, doorIndex) =>
      (Math.abs(doorIndex - warmestDoor) < Math.abs(best - warmestDoor) ? doorIndex : best)
    );
  }

  while (!tried.has(treasureIndex) && path.length < doorCount) {
    const next = chooseNext();
    if (next === null) break;
    path.push(next);
    tried.add(next);
  }

  return path;
}

export function getWarmSeekerGap(treasureIndex, doorCount, playerMoves) {
  const warmMoves = getWarmSeekerPath(treasureIndex, doorCount).length;
  return Math.max(0, warmMoves - playerMoves);
}

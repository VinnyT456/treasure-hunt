export function getLinearSeekerPath(treasureIndex, doorCount) {
  const limit = Math.min(doorCount, Math.max(0, treasureIndex) + 1);
  return Array.from({ length: limit }, (_, i) => i);
}

export function getLinearSeekerGap(treasureIndex, doorCount, playerMoves) {
  const linearMoves = getLinearSeekerPath(treasureIndex, doorCount).length;
  return Math.max(0, linearMoves - playerMoves);
}

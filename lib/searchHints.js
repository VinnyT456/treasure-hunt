export function getDoorWindowSize(bounds) {
  if (!bounds) return 0;
  return Math.max(0, bounds.right - bounds.left + 1);
}

export function getSuggestedMiddle(bounds) {
  if (!bounds) return null;
  return Math.floor((bounds.left + bounds.right) / 2);
}

export function getMidpointTolerance(bounds) {
  const size = getDoorWindowSize(bounds);
  return Math.max(1, Math.ceil(size / 20));
}

export function isNearMiddle(doorIndex, bounds) {
  const middle = getSuggestedMiddle(bounds);
  if (middle === null) return false;
  return Math.abs(doorIndex - middle) <= getMidpointTolerance(bounds);
}

export function getBoundsAfterAttempt(bounds, attempt) {
  if (!bounds || attempt.feedback.kind !== 'direction') return bounds;
  if (attempt.feedback.key === 'right') return { left: attempt.doorIndex + 1, right: bounds.right };
  if (attempt.feedback.key === 'left') return { left: bounds.left, right: attempt.doorIndex - 1 };
  return bounds;
}

export function buildSearchTimeline(attempts, doorCount) {
  let bounds = { left: 0, right: doorCount - 1 };
  return attempts.map((attempt) => {
    const before = bounds;
    const after = getBoundsAfterAttempt(bounds, attempt);
    bounds = after;
    return { ...attempt, boundsBefore: before, boundsAfter: after };
  });
}

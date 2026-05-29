// Pure functions for computing feedback and scoring.

// Distance feedback ladder. Scales with door count so it works for any size.
export const TEMPERATURE_LEVELS = [
  { key: "found",     label: "FOUND IT!",  color: "#FFB627", emoji: "💎", threshold: 0    },
  { key: "blazing",   label: "BLAZING",    color: "#DC2626", emoji: "🔥", threshold: 0.10 },
  { key: "hot",       label: "HOT",        color: "#F97316", emoji: "☀️", threshold: 0.25 },
  { key: "warm",      label: "WARM",       color: "#FBBF24", emoji: "🌤️", threshold: 0.45 },
  { key: "cool",      label: "COOL",       color: "#60A5FA", emoji: "💧", threshold: 0.70 },
  { key: "cold",      label: "COLD",       color: "#2563EB", emoji: "❄️", threshold: 1.01 },
];

export function getTemperature(doorIndex, treasureIndex, totalDoors) {
  const distance = Math.abs(doorIndex - treasureIndex);
  if (distance === 0) return TEMPERATURE_LEVELS[0];
  // Distance as a fraction of the maximum possible distance.
  const ratio = distance / Math.max(1, totalDoors - 1);
  // Skip the "found" entry since we already handled distance 0.
  for (let i = 1; i < TEMPERATURE_LEVELS.length; i++) {
    if (ratio <= TEMPERATURE_LEVELS[i].threshold) return TEMPERATURE_LEVELS[i];
  }
  return TEMPERATURE_LEVELS[TEMPERATURE_LEVELS.length - 1];
}

export function getDirection(doorIndex, treasureIndex) {
  if (doorIndex === treasureIndex) {
    return { key: "found", label: "FOUND IT!", emoji: "💎" };
  }
  if (treasureIndex > doorIndex) {
    return { key: "right", label: "Treasure is to the RIGHT →", emoji: "➡️" };
  }
  return { key: "left", label: "← Treasure is to the LEFT", emoji: "⬅️" };
}

// Compute the feedback object for a given attempt based on level type.
export function computeFeedback(level, doorIndex, treasureIndex) {
  if (doorIndex === treasureIndex) {
    return { kind: "found", label: "FOUND IT!", color: "#FFB627", emoji: "💎" };
  }
  switch (level.feedbackType) {
    case "distance": {
      const t = getTemperature(doorIndex, treasureIndex, level.doorCount);
      return { kind: "distance", ...t };
    }
    case "direction": {
      const d = getDirection(doorIndex, treasureIndex);
      return { kind: "direction", ...d, color: "#475569" };
    }
    case "none":
    default:
      return { kind: "empty", label: "Empty room.", color: "#94A3B8", emoji: "🚪" };
  }
}

// ─── Advanced star logic ────────────────────────────────────────────────────

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

// Level 2: never click too close after COLD/COOL; never move to a colder door.
function checkLogicConsistency(attempts, doorCount) {
  const threshold = Math.max(1, Math.floor(doorCount * 0.2));
  for (let i = 0; i < attempts.length - 1; i++) {
    const { doorIndex, feedback } = attempts[i];
    const next = attempts[i + 1];
    if (feedback.kind !== 'distance') continue;

    const prevRank = tempRank(feedback.key);
    const nextRank = tempRank(next.feedback.key);
    if (prevRank >= 0 && nextRank >= 0 && nextRank < prevRank) return false;

    if (feedback.key !== 'cold' && feedback.key !== 'cool') continue;
    const nextDoor = next.doorIndex;
    if (Math.abs(nextDoor - doorIndex) <= threshold) return false;
  }
  return true;
}

// Levels 3-5: check every click was the exact midpoint of the remaining valid range.
// Tolerance per move = ceil(windowSize / 20), so it shrinks as the search narrows.
// e.g. 100-door window → ±5, 50-door window → ±3 (ceil(50/20)), 20-door → ±1.
export function checkApproximateBinarySearch(attempts, doorCount) {
  let left = 0;
  let right = doorCount - 1;
  for (const { doorIndex, feedback } of attempts) {
    const mid = Math.floor((left + right) / 2);
    const tolerance = Math.ceil((right - left + 1) / 20);
    if (Math.abs(doorIndex - mid) > tolerance) return false;
    if (feedback.key === 'right') left = doorIndex + 1;
    else if (feedback.key === 'left') right = doorIndex - 1;
  }
  return true;
}

// Returns { stars, maxStars, criteria[] } for the given level's evolving rubric.
// Each criterion: { label, earned, note? }
export function computeStarsAdvanced(attempts, level, status) {
  if (status !== 'won') {
    return { stars: 0, maxStars: level.maxStars ?? 3, criteria: [] };
  }

  switch (level.id) {
    case 1:
      return {
        stars: 1,
        maxStars: 1,
        criteria: [
          {
            label: 'Found the treasure',
            earned: true,
            note: "Without clues you had to rely on luck — let's hunt smarter next level!",
          },
        ],
      };

    case 2: {
      const logic = checkLogicConsistency(attempts, level.doorCount);
      return {
        stars: 1 + (logic ? 1 : 0),
        maxStars: 2,
        criteria: [
          { label: 'Found the treasure', earned: true },
          {
            label: 'Followed the clues correctly',
            earned: logic,
            note: logic
              ? 'You used the clues to stay away from the cold zones!'
              : 'Next time, jump far away from any COLD or COOL door.',
          },
        ],
      };
    }

    case 3: {
      const effLimit = level.efficiencyMoves ?? level.optimalMoves;
      const efficiency = attempts.length <= effLimit;
      return {
        stars: 1 + (efficiency ? 1 : 0),
        maxStars: 2,
        criteria: [
          { label: 'Found the treasure', earned: true },
          {
            label: `Found the treasure in ${effLimit} move${effLimit !== 1 ? 's' : ''} or less`,
            earned: efficiency,
            note: efficiency ? 'Smart hunting!' : `Try to finish in ${effLimit} moves by splitting the search.`,
          },
        ],
      };
    }

    case 4: {
      const effLimit = level.efficiencyMoves ?? level.optimalMoves;
      const efficiency = attempts.length <= effLimit;
      return {
        stars: 1 + (efficiency ? 1 : 0),
        maxStars: 2,
        criteria: [
          { label: 'Found the treasure', earned: true },
          {
            label: `Found the treasure in ${effLimit} move${effLimit !== 1 ? 's' : ''} or less`,
            earned: efficiency,
            note: efficiency
              ? 'Smart hunting!'
              : `Try to finish in ${effLimit} moves by splitting the remaining doors.`,
          },
        ],
      };
    }

    case 5: {
      const effLimit = level.efficiencyMoves ?? level.optimalMoves;
      const efficiency = attempts.length <= effLimit;
      const binary = checkApproximateBinarySearch(attempts, level.doorCount);
      return {
        stars: 1 + (efficiency ? 1 : 0) + (binary ? 1 : 0),
        maxStars: 3,
        criteria: [
          { label: 'Found the treasure', earned: true },
          {
            label: `Found the treasure in ${effLimit} move${effLimit !== 1 ? 's' : ''} or less`,
            earned: efficiency,
            note: efficiency ? 'Smart hunting!' : `Try to finish in ${effLimit} moves by splitting the search.`,
          },
          {
            label: 'Split the search in half each time',
            earned: binary,
            note: binary
              ? 'That is binary search — split the remaining doors in half every move!'
              : 'Pick doors near the middle of what is left to earn the third star.',
          },
        ],
      };
    }

    default: {
      // Custom levels — move-count fallback
      const perfect = Math.ceil(Math.log2(Math.max(level.doorCount, 2)));
      const stars = attempts.length <= perfect ? 3 : attempts.length <= perfect + 2 ? 2 : 1;
      return {
        stars,
        maxStars: 3,
        criteria: [
          { label: 'Found the treasure', earned: true },
          { label: `Finished in ${perfect + 2} moves or fewer`, earned: attempts.length <= perfect + 2 },
          { label: `Used only ${perfect} moves (optimal!)`, earned: attempts.length <= perfect },
        ],
      };
    }
  }
}

// Pick a treasure index. We avoid the very first/last positions on later
// levels so a learner who always tries index 0 or N-1 doesn't accidentally
// "win" without using the strategy. Level 1 is fully fair (any index).
export function chooseTreasureIndex(level) {
  const n = level.doorCount;
  if (level.id === 1) return Math.floor(Math.random() * n);
  // For clue-based levels, pick anywhere from index 1 to n-2.
  return 1 + Math.floor(Math.random() * (n - 2));
}

// Treasure placement is lazy ("Schrödinger's Treasure"):
// Level 1: locks after 3 wrong guesses — guaranteed minimum 4 tries.
// Levels 2+: locks after 2 wrong guesses — guaranteed minimum 3 tries.
// Direction levels: constrained to searchBounds so no arrow is ever wrong.
// Distance levels: candidate must reproduce the exact same temperature label
//   for every previously-shown clue, so no hot/cold reading is ever wrong.
export function relocateTreasureIfNeeded(level, doorIndex, currentTreasureIndex, triedSet, totalAttemptsSoFar, searchBounds = null, previousAttempts = []) {
  const minGuesses = level.id === 1 ? 3 : 2;
  if (totalAttemptsSoFar >= minGuesses) return currentTreasureIndex;
  if (doorIndex !== currentTreasureIndex) return currentTreasureIndex;

  // Player found the treasure too early — move it to a random valid untried door.
  const untried = [];
  for (let i = 0; i < level.doorCount; i++) {
    if (i === doorIndex) continue;
    if (triedSet.has(i)) continue;
    // Direction levels: stay within the narrowed search bounds.
    if (searchBounds && (i < searchBounds.left || i > searchBounds.right)) continue;
    // Distance levels: every prior temperature clue must still be correct for position i.
    if (level.feedbackType === 'distance' && previousAttempts.length > 0) {
      let consistent = true;
      for (const { doorIndex: prevDoor, feedback: prevFeedback } of previousAttempts) {
        if (prevFeedback.kind !== 'distance') continue;
        if (getTemperature(prevDoor, i, level.doorCount).key !== prevFeedback.key) {
          consistent = false;
          break;
        }
      }
      if (!consistent) continue;
    }
    untried.push(i);
  }
  if (untried.length === 0) return currentTreasureIndex;
  return untried[Math.floor(Math.random() * untried.length)];
}

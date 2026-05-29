const STORAGE_KEY = 'treasure-hunt-v1';

const DEFAULT_STATE = {
  progress: {},
  tutorialsSeen: { linearSeen: false, binarySeen: false },
  pennyIntroSeen: false,
  blazeIntroSeen: false,
  badgesEarned: [],
  playerName: '',
  leaderboard: {},
  classScores: {},
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadProgressState() {
  if (!canUseStorage()) return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      progress: parsed.progress || {},
      tutorialsSeen: {
        linearSeen: !!parsed.tutorialsSeen?.linearSeen,
        binarySeen: !!parsed.tutorialsSeen?.binarySeen,
      },
      pennyIntroSeen: !!parsed.pennyIntroSeen,
      blazeIntroSeen: !!parsed.blazeIntroSeen,
      badgesEarned: Array.isArray(parsed.badgesEarned) ? parsed.badgesEarned : [],
      playerName: parsed.playerName || '',
      leaderboard: parsed.leaderboard || {},
      classScores: parsed.classScores || {},
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveProgressState(state) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function mergeProgressState(prev, patch) {
  return {
    progress: patch.progress !== undefined ? patch.progress : prev.progress,
    tutorialsSeen: patch.tutorialsSeen !== undefined ? patch.tutorialsSeen : prev.tutorialsSeen,
    pennyIntroSeen: patch.pennyIntroSeen !== undefined ? patch.pennyIntroSeen : prev.pennyIntroSeen,
    blazeIntroSeen: patch.blazeIntroSeen !== undefined ? patch.blazeIntroSeen : prev.blazeIntroSeen,
    badgesEarned: patch.badgesEarned !== undefined ? patch.badgesEarned : prev.badgesEarned,
    playerName: patch.playerName !== undefined ? patch.playerName : prev.playerName,
    leaderboard: patch.leaderboard !== undefined ? patch.leaderboard : prev.leaderboard,
    classScores: patch.classScores !== undefined ? patch.classScores : prev.classScores,
  };
}

export function recordLevelScore(leaderboard, levelId, { stars, moves, name }) {
  const key = String(levelId);
  const prior = leaderboard[key];
  const next = { stars, moves, name, at: Date.now() };
  if (!prior || stars > prior.stars || (stars === prior.stars && moves < prior.moves)) {
    return { ...leaderboard, [key]: next };
  }
  return leaderboard;
}

export function recordClassScore(classScores, code, entry) {
  const key = String(code).toUpperCase();
  const list = Array.isArray(classScores[key]) ? [...classScores[key]] : [];
  list.push({ ...entry, at: Date.now() });
  list.sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars;
    return a.moves - b.moves;
  });
  return { ...classScores, [key]: list.slice(0, 50) };
}

export function getCampaignTotals(progress) {
  return Object.values(progress).reduce((sum, stars) => sum + (stars || 0), 0);
}

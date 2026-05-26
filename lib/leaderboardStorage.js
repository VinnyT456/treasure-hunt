import { getSupabaseClient, hasSupabaseConfig } from './supabaseClient';

function isBetterScore(next, previous) {
  if (!previous) return true;
  if (next.stars !== previous.stars) return next.stars > previous.stars;
  return next.moves < previous.moves;
}

function mapEntry(row) {
  return {
    levelId: row.level_id,
    playerId: row.player_id,
    playerName: row.player_name,
    stars: row.stars,
    moves: row.moves,
    createdAt: row.created_at,
  };
}

export function isLeaderboardAvailable() {
  return hasSupabaseConfig();
}

export async function submitScore({ levelId, playerId, playerName, stars, moves }) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Leaderboard is not configured.' };

  const sanitizedName = String(playerName || '').trim().slice(0, 20);
  if (!sanitizedName) return { ok: false, error: 'Name is required.' };

  const { data: existingRow, error: readError } = await client
    .from('leaderboard_entries')
    .select('level_id, player_id, player_name, stars, moves, created_at')
    .eq('level_id', levelId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };

  const previous = existingRow ? mapEntry(existingRow) : null;
  const next = { stars, moves };
  if (!isBetterScore(next, previous)) {
    return { ok: true, improved: false, skipped: true, previous, current: previous };
  }

  if (existingRow) {
    const { data, error } = await client
      .from('leaderboard_entries')
      .update({
        player_name: sanitizedName,
        stars,
        moves,
      })
      .eq('level_id', levelId)
      .eq('player_id', playerId)
      .select('level_id, player_id, player_name, stars, moves, created_at')
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, improved: true, skipped: false, previous, current: mapEntry(data) };
  }

  const { data, error } = await client
    .from('leaderboard_entries')
    .insert({
      level_id: levelId,
      player_id: playerId,
      player_name: sanitizedName,
      stars,
      moves,
      created_at: new Date().toISOString(),
    })
    .select('level_id, player_id, player_name, stars, moves, created_at')
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, improved: true, skipped: false, previous, current: mapEntry(data) };
}

export async function fetchLeaderboard(levelId, limit = 10) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Leaderboard is not configured.', entries: [] };

  const { data, error } = await client
    .from('leaderboard_entries')
    .select('level_id, player_id, player_name, stars, moves, created_at')
    .eq('level_id', levelId)
    .order('stars', { ascending: false })
    .order('moves', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return { ok: false, error: error.message, entries: [] };
  return { ok: true, entries: (data || []).map(mapEntry) };
}

export async function fetchPlayerRank(levelId, playerId) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Leaderboard is not configured.', rank: null };

  const { data, error } = await client
    .from('leaderboard_entries')
    .select('player_id')
    .eq('level_id', levelId)
    .order('stars', { ascending: false })
    .order('moves', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return { ok: false, error: error.message, rank: null };

  const rank = (data || []).findIndex((row) => row.player_id === playerId);
  return { ok: true, rank: rank < 0 ? null : rank + 1 };
}

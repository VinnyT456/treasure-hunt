// Storage adapter for custom levels — Supabase when configured, else localStorage.

import { getSupabaseClient } from './supabaseClient';

const LOCAL_LEVELS_KEY = 'treasure-hunt-custom-levels';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readLocalLevels() {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_LEVELS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalLevels(levels) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(LOCAL_LEVELS_KEY, JSON.stringify(levels));
    return true;
  } catch {
    return false;
  }
}

function configFromLocal(entry) {
  if (!entry) return null;
  return {
    doorCount: entry.doorCount,
    treasureMode: entry.treasureMode,
    treasureDoor: entry.treasureDoor,
    feedbackType: entry.feedbackType,
    hasLimit: entry.hasLimit,
    moveLimit: entry.moveLimit,
  };
}

function saveLevelLocal(code, config) {
  const key = code.toUpperCase();
  const levels = readLocalLevels();
  levels[key] = { ...config, createdAt: Date.now() };
  const ok = writeLocalLevels(levels);
  return { ok, error: ok ? undefined : 'Could not save on this device.', storage: 'local' };
}

export async function saveLevel(code, config) {
  const client = getSupabaseClient();
  if (!client) {
    return saveLevelLocal(code, config);
  }

  const { error } = await client.from('custom_levels').upsert({
    code:           code.toUpperCase(),
    door_count:     config.doorCount,
    treasure_mode:  config.treasureMode,
    treasure_door:  config.treasureDoor ?? null,
    feedback_type:  config.feedbackType,
    has_limit:      config.hasLimit,
    move_limit:     config.moveLimit ?? null,
    created_at:     new Date().toISOString(),
  });
  return { ok: !error, error: error?.message, storage: 'supabase' };
}

export async function loadLevel(code) {
  const normalized = code.toUpperCase().trim();
  const client = getSupabaseClient();

  if (!client) {
    return configFromLocal(readLocalLevels()[normalized]);
  }

  const { data, error } = await client
    .from('custom_levels')
    .select('door_count, treasure_mode, treasure_door, feedback_type, has_limit, move_limit')
    .eq('code', normalized)
    .single();

  if (error || !data) {
    const local = configFromLocal(readLocalLevels()[normalized]);
    if (local) return local;
    return null;
  }

  return {
    doorCount:    data.door_count,
    treasureMode: data.treasure_mode,
    treasureDoor: data.treasure_door,
    feedbackType: data.feedback_type,
    hasLimit:     data.has_limit,
    moveLimit:    data.move_limit,
  };
}

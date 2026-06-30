import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYS_KEY = 'futsal_plays_v1';

export async function savePlays(plays) {
  await AsyncStorage.setItem(PLAYS_KEY, JSON.stringify(plays));
}

export async function loadPlays() {
  try {
    const data = await AsyncStorage.getItem(PLAYS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function savePlay(play) {
  const plays = await loadPlays();
  const existing = plays.findIndex((p) => p.id === play.id);
  if (existing >= 0) {
    plays[existing] = play;
  } else {
    plays.unshift(play);
  }
  await savePlays(plays);
}

export async function deletePlay(id) {
  const plays = await loadPlays();
  await savePlays(plays.filter((p) => p.id !== id));
}

export function generateId() {
  return `play_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

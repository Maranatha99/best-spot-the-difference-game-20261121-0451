// The game state and its rules: two levels, a countdown per level, three hints per level,
// points for a find, a time and points penalty for a wrong click. No drawing lives here;
// render.js reads this state and paints it.

import { LEVELS } from './differences.js';
import { SCORING } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'time-up';

export function createGame() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    hintsLeft: SCORING.hintCount,
    timeLeft: LEVELS[0].timeLimit,
    popups: [],
    wrongFlash: 0,
    hintPulse: null,
    message: 'Klik perbedaan di gambar kiri atau kanan.',
    levelBonus: 0,
    best: 0,
  };
}

export function level(game) {
  return LEVELS[game.levelIndex];
}

export function startLevel(game, index) {
  game.levelIndex = index;
  game.found = new Set();
  game.hintsLeft = SCORING.hintCount;
  game.timeLeft = LEVELS[index].timeLimit;
  game.popups = [];
  game.hintPulse = null;
  game.wrongFlash = 0;
  game.levelBonus = 0;
  game.message = `Level ${index + 1}: ${LEVELS[index].name} — cari ${LEVELS[index].differences.length} perbedaan!`;
  game.screen = SCREEN_PLAY;
}

export function remaining(game) {
  return level(game).differences.length - game.found.size;
}

/** The nearest unfound difference within reach of a click, or null. */
function pickDifference(game, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const diff of level(game).differences) {
    if (game.found.has(diff.id)) continue;
    const distance = Math.hypot(diff.x - x, diff.y - y);
    if (distance <= diff.r + 8 && distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }
  return best;
}

export function clickAt(game, x, y, onFound, onWrong) {
  if (game.screen !== SCREEN_PLAY) return;
  const diff = pickDifference(game, x, y);
  if (diff) {
    game.found.add(diff.id);
    game.score += SCORING.found;
    game.message = `Ketemu! ${diff.label}  +${SCORING.found}`;
    game.popups.push({ x, y, text: `+${SCORING.found}`, life: 1, color: '#37d67a' });
    onFound?.(diff);
    if (game.found.size === level(game).differences.length) {
      game.levelBonus = Math.ceil(game.timeLeft) * SCORING.timeBonusPerSecond;
      game.score += game.levelBonus;
      game.screen = game.levelIndex + 1 < LEVELS.length ? SCREEN_LEVEL_DONE : SCREEN_WIN;
      onFound?.(null);
    }
  } else {
    game.timeLeft = Math.max(0, game.timeLeft - SCORING.wrongPenaltySeconds);
    game.score = Math.max(0, game.score - SCORING.wrongPenaltyPoints);
    game.wrongFlash = 0.45;
    game.message = `Bukan di situ!  −${SCORING.wrongPenaltySeconds} detik, −${SCORING.wrongPenaltyPoints} poin`;
    game.popups.push({ x, y, text: `−${SCORING.wrongPenaltySeconds} dtk`, life: 1, color: '#ff5d5d' });
    onWrong?.();
    if (game.timeLeft <= 0) game.screen = SCREEN_TIME_UP;
  }
}

export function useHint(game, onHint) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return false;
  const unfound = level(game).differences.filter((d) => !game.found.has(d.id));
  if (unfound.length === 0) return false;
  const diff = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintsLeft -= 1;
  game.hintPulse = { id: diff.id, until: 2.5 };
  game.message = `Petunjuk: cari di sekitar ${diff.label.toLowerCase()}… (sisa ${game.hintsLeft})`;
  onHint?.(diff);
  return true;
}

export function update(game, dt) {
  for (const popup of game.popups) popup.life -= dt * 0.9;
  game.popups = game.popups.filter((p) => p.life > 0);
  if (game.wrongFlash > 0) game.wrongFlash = Math.max(0, game.wrongFlash - dt);
  if (game.hintPulse) {
    game.hintPulse.until -= dt;
    if (game.hintPulse.until <= 0) game.hintPulse = null;
  }
  if (game.screen === SCREEN_PLAY) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = SCREEN_TIME_UP;
      game.message = 'Waktu habis! Coba lagi — kamu pasti bisa.';
    }
  }
}

// The screenshot scenes behind ?shot=start|play|level2|end. Each one stages a real game
// state (a level, a set of found differences, a fixed clock) and returns the screen to draw,
// so the frame is exactly what a player sees mid-game and the same query always gives the
// same frame. No autopilot is needed: the state is set directly from the level data.
import { SCORING } from './config.js';
import { SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_WIN, startLevel } from './state.js';

/**
 * Set `game` to the named scene and return the screen to draw and the best score to show.
 * start: level 1 fresh, nothing found yet. play: level 1, 4 of 7 found, markers and the
 * remaining counter visible. level2: level 2, 5 of 10 found. end: level 2, all found, win.
 */
export function stageShot(name, game) {
  if (name === 'level2' || name === 'end') {
    startLevel(game, 1);
    const found = name === 'end'
      ? game.levelIndex === 1 ? ['burung', 'apel', 'bangku', 'bebek', 'bunga', 'layang', 'lampu', 'kupu', 'bola', 'awan'] : []
      : ['burung', 'apel', 'bangku', 'bebek', 'bunga'];
    for (const id of found) game.found.add(id);
    game.score = found.length * SCORING.found;
    if (name === 'end') {
      game.timeLeft = 42;
      game.levelBonus = Math.ceil(game.timeLeft) * SCORING.timeBonusPerSecond;
      game.score += game.levelBonus;
      game.screen = SCREEN_WIN;
      game.message = 'Semua perbedaan ketemu!';
    } else {
      game.timeLeft = 96;
      game.message = 'Ketemu! Warna bunga berubah  +100';
      game.screen = SCREEN_PLAY;
    }
    return { screen: game.screen, best: 0 };
  }
  startLevel(game, 0);
  if (name === 'play') {
    for (const id of ['bulan', 'lentera', 'kucing', 'harga']) game.found.add(id);
    game.score = 4 * SCORING.found;
    game.timeLeft = 83;
    game.message = 'Ketemu! Harga sate berubah  +100';
  } else {
    game.timeLeft = 120;
  }
  game.screen = SCREEN_PLAY;
  return { screen: SCREEN_PLAY, best: 0 };
}

export { SCREEN_LEVEL_DONE };

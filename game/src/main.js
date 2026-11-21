// Boot and the one loop: clicks are read every frame, the timer advances in real time, and
// the renderer paints what is there. The game moves between six screens: title, play, paused,
// level done, win and time up.
//
// ?shot=start|play|level2|end stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { BEST_KEY, BUTTONS, PANEL, VIEW } from './config.js';
import { LEVELS } from './differences.js';
import { audio } from './audio.js';
import { createInput, ACTION_CONFIRM, ACTION_HINT, ACTION_NEXT, ACTION_PAUSE, ACTION_RESTART } from './input.js';
import { createRenderer } from './render.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  clickAt,
  createGame,
  remaining,
  startLevel,
  update,
  useHint,
} from './state.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
// Debug/test handle: lets an automated play-test read the state (screen, score, found).
window.__game = game;

function toLogical(clientX, clientY, rectWidth, rectHeight) {
  return {
    x: (clientX / rectWidth) * VIEW.width,
    y: (clientY / rectHeight) * VIEW.height,
  };
}

const input = createInput(canvas, toLogical);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Which panel (if any) a logical point falls in, and its scene coordinates. */
function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) return { x: x - PANEL.leftX, y: y - PANEL.y };
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) return { x: x - PANEL.rightX, y: y - PANEL.y };
  return null;
}

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function runShot(name) {
  const scene = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game, scene.best, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let best = readBest();
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function saveBestIfBeaten() {
    if (game.score > best) {
      best = game.score;
      saveBest(best);
    }
  }

  function confirm() {
    if (game.screen === SCREEN_TITLE) {
      audio.click();
      startLevel(game, 0);
      announce(`Level 1: ${LEVELS[0].name}. Cari ${LEVELS[0].differences.length} perbedaan.`);
    } else if (game.screen === SCREEN_LEVEL_DONE) {
      audio.click();
      startLevel(game, game.levelIndex + 1);
      announce(`Level ${game.levelIndex + 1}: ${LEVELS[game.levelIndex].name}.`);
    } else if (game.screen === SCREEN_WIN || game.screen === SCREEN_TIME_UP) {
      audio.click();
      saveBestIfBeaten();
      startLevel(game, 0);
      announce('Main lagi dari Level 1.');
    } else if (game.screen === SCREEN_PAUSED) {
      game.screen = SCREEN_PLAY;
      announce('Lanjut main.');
    }
  }

  function handleClick(point) {
    const { x, y } = point;
    // Footer buttons first.
    if (inRect(x, y, BUTTONS.hint)) {
      if (useHint(game, () => audio.hint())) announce(game.message);
      return;
    }
    if (inRect(x, y, BUTTONS.restart)) {
      audio.click();
      startLevel(game, game.levelIndex);
      announce(`Level ${game.levelIndex + 1} diulang.`);
      return;
    }
    if (inRect(x, y, BUTTONS.pause)) {
      if (game.screen === SCREEN_PLAY) {
        game.screen = SCREEN_PAUSED;
        announce('Jeda.');
      } else if (game.screen === SCREEN_PAUSED) {
        game.screen = SCREEN_PLAY;
        announce('Lanjut main.');
      }
      return;
    }
    if (game.screen === SCREEN_PLAY) {
      const scenePoint = panelAt(x, y);
      if (!scenePoint) return;
      clickAt(
        game,
        scenePoint.x,
        scenePoint.y,
        (diff) => {
          if (diff) {
            audio.found();
            announce(game.message);
          } else if (game.screen === SCREEN_LEVEL_DONE) {
            audio.win();
            saveBestIfBeaten();
            announce(`Level selesai! Bonus waktu +${game.levelBonus}. Skor ${game.score}.`);
          } else if (game.screen === SCREEN_WIN) {
            audio.win();
            saveBestIfBeaten();
            announce(`Menang! Skor akhir ${game.score}.`);
          }
        },
        () => {
          audio.wrong();
          announce(game.message);
        },
      );
      return;
    }
    // Any click on an overlay screen confirms it.
    confirm();
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM) confirm();
    if (actions & ACTION_PAUSE) {
      if (game.screen === SCREEN_PLAY) {
        game.screen = SCREEN_PAUSED;
        announce('Jeda.');
      } else if (game.screen === SCREEN_PAUSED) {
        game.screen = SCREEN_PLAY;
        announce('Lanjut main.');
      }
    }
    if (actions & ACTION_HINT) {
      if (useHint(game, () => audio.hint())) announce(game.message);
    }
    if (actions & ACTION_RESTART) {
      // From the win screen, R starts over from Level 1; anywhere else it replays the
      // current level.
      const fromWin = game.screen === SCREEN_WIN;
      startLevel(game, fromWin ? 0 : game.levelIndex);
      announce(fromWin ? 'Main lagi dari Level 1.' : `Level ${game.levelIndex + 1} diulang.`);
    }
    if (actions & ACTION_NEXT && game.screen === SCREEN_LEVEL_DONE) confirm();
    for (const click of input.takeClicks()) handleClick(click);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions();
    update(game, dt);
    if (game.screen === SCREEN_TIME_UP) saveBestIfBeaten();
    renderer.draw(game, best, now);
    void remaining;
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.screen === SCREEN_PLAY) {
      game.screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Temukan Perbedaan. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();

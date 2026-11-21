// The renderer: paints the two pre-rendered panels, the HUD (title, level, score, timer,
// found counter), the markers on found differences, hint pulses, score popups, the footer
// buttons and the screen overlays. The scenes themselves are painted once per level into
// offscreen canvases, so each frame is two drawImage calls plus decorations.

import { BUTTONS, FONT, PALETTE, PANEL, VIEW } from './config.js';
import { LEVELS } from './differences.js';
import { paintScene } from './scenes.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  level,
  remaining,
} from './state.js';

function makePanel(levelIndex, variant) {
  const canvas = document.createElement('canvas');
  canvas.width = PANEL.width;
  canvas.height = PANEL.height;
  paintScene(canvas.getContext('2d'), levelIndex, variant);
  return canvas;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let panels = { base: null, variant: null, levelIndex: -1 };

  function ensurePanels(levelIndex) {
    if (panels.levelIndex === levelIndex) return;
    panels = { base: makePanel(levelIndex, false), variant: makePanel(levelIndex, true), levelIndex };
  }

  function drawHeader(game, best) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, VIEW.width, 80);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 26px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('TEMUKAN PERBEDAAN', 20, 32);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    const lvl = level(game);
    ctx.fillText(`${lvl.name}  ·  ${lvl.subtitle}`, 20, 56);

    // Centre: found counter.
    const total = lvl.differences.length;
    const found = game.found.size;
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(`Ditemukan ${found} dari ${total}  ·  Sisa ${total - found}`, 640, 32);
    ctx.fillStyle = found === total ? PALETTE.good : PALETTE.accent;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(found === total ? 'Semua ketemu!' : 'Masih ada yang bersembunyi…', 640, 56);

    // Right: score and time.
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(`SKOR ${game.score}`, 1260, 32);
    const lowTime = game.timeLeft <= 20 && game.screen === SCREEN_PLAY;
    ctx.fillStyle = lowTime ? PALETTE.bad : PALETTE.muted;
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(`⏱ ${formatTime(game.timeLeft)}   ·   Terbaik ${Math.max(best, game.score)}`, 1260, 56);

    // Timer bar.
    const fraction = Math.max(0, game.timeLeft / lvl.timeLimit);
    ctx.fillStyle = '#0e0a18';
    ctx.fillRect(20, 68, 1240, 8);
    ctx.fillStyle = fraction > 0.5 ? PALETTE.good : fraction > 0.25 ? PALETTE.accent : PALETTE.bad;
    ctx.fillRect(20, 68, 1240 * fraction, 8);
  }

  function drawMarker(x, y, r, pulse) {
    ctx.strokeStyle = PALETTE.good;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.good;
    ctx.beginPath();
    ctx.arc(x + r * 0.55, y - r * 0.55, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0e0a18';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', x + r * 0.55, y - r * 0.55 + 4.5);
    if (pulse) {
      ctx.strokeStyle = 'rgba(55,214,122,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPanels(game, now) {
    ensurePanels(game.levelIndex);
    for (const [panelCanvas, x, tag] of [
      [panels.base, PANEL.leftX, 'A'],
      [panels.variant, PANEL.rightX, 'B'],
    ]) {
      ctx.drawImage(panelCanvas, x, PANEL.y);
      ctx.strokeStyle = PALETTE.panelBorder;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, PANEL.y, PANEL.width, PANEL.height);
      // Panel tag.
      ctx.fillStyle = 'rgba(20,16,29,0.75)';
      roundRectPath(ctx, x + 10, PANEL.y + 10, 34, 28, 8);
      ctx.fill();
      ctx.fillStyle = PALETTE.panelLabel;
      ctx.font = `bold 17px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(tag, x + 27, PANEL.y + 30);
    }

    // Found markers on both panels.
    for (const diff of level(game).differences) {
      if (!game.found.has(diff.id)) continue;
      drawMarker(PANEL.leftX + diff.x, PANEL.y + diff.y, diff.r, false);
      drawMarker(PANEL.rightX + diff.x, PANEL.y + diff.y, diff.r, false);
    }

    // Hint pulse: a breathing ring around one unfound difference, on both panels.
    if (game.hintPulse && game.screen === SCREEN_PLAY) {
      const diff = level(game).differences.find((d) => d.id === game.hintPulse.id);
      if (diff) {
        const pulse = 4 + Math.sin(now / 180) * 3;
        for (const x of [PANEL.leftX, PANEL.rightX]) {
          ctx.strokeStyle = PALETTE.hint;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x + diff.x, PANEL.y + diff.y, diff.r + 8 + pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  function drawFooter(game) {
    const buttons = [
      { ...BUTTONS.hint, label: `Petunjuk (H) · ${game.hintsLeft}`, enabled: game.hintsLeft > 0 && game.screen === SCREEN_PLAY },
      { ...BUTTONS.restart, label: 'Ulangi Level  (R)', enabled: true },
      { ...BUTTONS.pause, label: game.screen === SCREEN_PAUSED ? 'Lanjutkan  (P)' : 'Jeda  (P)', enabled: true },
    ];
    for (const button of buttons) {
      ctx.fillStyle = button.enabled ? PALETTE.button : '#1c1626';
      roundRectPath(ctx, button.x, button.y, button.width, button.height, 10);
      ctx.fill();
      ctx.strokeStyle = PALETTE.buttonEdge;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = button.enabled ? PALETTE.text : PALETTE.muted;
      ctx.font = `bold 16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(button.label, button.x + button.width / 2, button.y + 33);
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(game.message, 648, 618);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `14px ${FONT}`;
    ctx.fillText('Klik perbedaan di salah satu gambar — klik salah mengurangi 5 detik.', 648, 642);
  }

  function drawPopups(game) {
    ctx.textAlign = 'center';
    for (const popup of game.popups) {
      ctx.globalAlpha = Math.max(0, popup.life);
      ctx.fillStyle = popup.color;
      ctx.font = `bold 22px ${FONT}`;
      ctx.fillText(popup.text, popup.x, popup.y - (1 - popup.life) * 34);
    }
    ctx.globalAlpha = 1;
  }

  function drawOverlay(title, lines, action) {
    ctx.fillStyle = 'rgba(14,10,24,0.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#221b38';
    roundRectPath(ctx, 340, 190, 600, 330, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 34px ${FONT}`;
    ctx.fillText(title, 640, 260);
    ctx.font = `18px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    let y = 306;
    for (const text of lines) {
      ctx.fillText(text, 640, y);
      y += 30;
    }
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 19px ${FONT}`;
    ctx.fillText(action, 640, 478);
  }

  function draw(game, best, now) {
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    drawHeader(game, best);
    drawPanels(game, now);
    drawFooter(game);
    drawPopups(game);

    // Wrong-click flash: a red frame that fades.
    if (game.wrongFlash > 0) {
      ctx.globalAlpha = Math.min(0.55, game.wrongFlash);
      ctx.strokeStyle = PALETTE.bad;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, VIEW.width - 10, VIEW.height - 10);
      ctx.globalAlpha = 1;
    }

    const lvl = level(game);
    if (game.screen === SCREEN_TITLE) {
      drawOverlay(
        'TEMUKAN PERBEDAAN',
        [
          'Dua gambar nyaris sama — cari perbedaannya!',
          `${lvl.name}: ${lvl.differences.length} perbedaan  ·  ${LEVELS.length} level  ·  3 petunjuk per level`,
          'Klik yang benar: +100 poin. Klik salah: −5 detik.',
          'H = petunjuk   ·   R = ulangi level   ·   P = jeda',
        ],
        'Klik di mana saja atau tekan Spasi untuk mulai',
      );
    } else if (game.screen === SCREEN_LEVEL_DONE) {
      drawOverlay(
        'LEVEL SELESAI!',
        [
          `${lvl.name} — semua ${lvl.differences.length} perbedaan ketemu.`,
          `Bonus waktu: +${game.levelBonus} poin`,
          `Skor sementara: ${game.score}`,
        ],
        'Tekan N atau klik untuk lanjut ke level berikutnya',
      );
    } else if (game.screen === SCREEN_WIN) {
      drawOverlay(
        'KAMU MENANG!',
        [
          `Semua ${LEVELS.reduce((n, l) => n + l.differences.length, 0)} perbedaan di ${LEVELS.length} level ketemu.`,
          `Bonus waktu level ini: +${game.levelBonus} poin`,
          `Skor akhir: ${game.score}   ·   Terbaik: ${Math.max(best, game.score)}`,
        ],
        'Tekan R untuk main lagi dari Level 1',
      );
    } else if (game.screen === SCREEN_TIME_UP) {
      drawOverlay(
        'WAKTU HABIS!',
        [
          `${lvl.name}: ketemu ${game.found.size} dari ${lvl.differences.length} perbedaan.`,
          `Skor: ${game.score}`,
          'Sisa perbedaan masih bersembunyi di gambar…',
        ],
        'Tekan R atau klik untuk coba lagi',
      );
    } else if (game.screen === SCREEN_PAUSED) {
      drawOverlay('JEDA', [`${lvl.name} — ${remaining(game)} perbedaan tersisa.`, `Skor: ${game.score}`], 'Tekan P atau klik untuk lanjut');
    }
    void SCREEN_PLAY;
  }

  return { draw, ensurePanels };
}

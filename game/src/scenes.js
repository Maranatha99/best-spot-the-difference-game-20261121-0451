// The two scenes, drawn entirely in code (canvas 2D, no images). Each painter draws one
// 600x460 picture; `diffs` is the set of difference ids to apply, so the left panel is drawn
// with an empty set and the right panel with every id — the pictures are identical except at
// the differences listed in differences.js. Nothing here is copied from another game: the
// night market and the dusk park are original scenes drawn from primitives.
import { LEVELS } from './differences.js';

const W = 600;
const H = 460;

/** Tiny deterministic PRNG so the stars and pebbles never move between panels. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 1 — Pasar Malam (night market)
// ---------------------------------------------------------------------------

function drawNightMarket(ctx, diffs) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#241640');
  sky.addColorStop(0.55, '#6d2a5e');
  sky.addColorStop(1, '#e8734a');
  rect(ctx, 0, 0, W, 320, sky);

  // Stars.
  const rand = mulberry32(20261121);
  for (let i = 0; i < 46; i += 1) {
    const x = rand() * W;
    const y = rand() * 150;
    const r = 0.8 + rand() * 1.4;
    ctx.globalAlpha = 0.35 + rand() * 0.6;
    circle(ctx, x, y, r, '#ffe9b0');
  }
  ctx.globalAlpha = 1;

  // Moon — missing in the right picture.
  if (!diffs.has('bulan')) {
    circle(ctx, 520, 58, 22, '#f7e8a4');
    circle(ctx, 512, 52, 4, '#e3cd7d');
    circle(ctx, 528, 64, 3, '#e3cd7d');
    circle(ctx, 524, 48, 2.5, '#e3cd7d');
  }

  // Soft clouds.
  ellipse(ctx, 120, 52, 46, 12, 'rgba(90,60,120,0.55)');
  ellipse(ctx, 150, 60, 34, 10, 'rgba(90,60,120,0.55)');
  ellipse(ctx, 380, 42, 52, 12, 'rgba(90,60,120,0.5)');

  // Rooftops on the horizon.
  ctx.fillStyle = '#1d1233';
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.lineTo(0, 282);
  ctx.lineTo(60, 282);
  ctx.lineTo(90, 262);
  ctx.lineTo(130, 282);
  ctx.lineTo(210, 282);
  ctx.lineTo(240, 266);
  ctx.lineTo(280, 282);
  ctx.lineTo(360, 282);
  ctx.lineTo(400, 258);
  ctx.lineTo(440, 282);
  ctx.lineTo(520, 282);
  ctx.lineTo(560, 264);
  ctx.lineTo(600, 282);
  ctx.lineTo(600, 310);
  ctx.closePath();
  ctx.fill();

  // Ground: cobblestones.
  rect(ctx, 0, 310, W, 150, '#33263e');
  const rand2 = mulberry32(77);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      const x = col * 46 + (row % 2) * 20 - 8;
      const y = 318 + row * 28;
      roundRect(ctx, x, y, 38, 20, 8, rand2() > 0.5 ? '#413050' : '#3a2b47');
    }
  }

  // Bunting flags on a sagging line.
  ctx.strokeStyle = '#c9b8e8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 78);
  ctx.quadraticCurveTo(300, 108, 600, 78);
  ctx.stroke();
  const flagColors = ['#e84a5f', '#ffb347', '#37d67a', '#4fc3f7', '#e84a5f', '#ffb347', '#37d67a', '#4fc3f7', '#e84a5f', '#ffb347', '#37d67a', '#4fc3f7', '#e84a5f', '#ffb347'];
  for (let i = 0; i < 14; i += 1) {
    const x = 22 + i * 42;
    const t = x / W;
    const y = (1 - t) * (1 - t) * 78 + 2 * (1 - t) * t * 108 + t * t * 78;
    // The flag at x 462 changes colour in the right picture.
    const color = i === 10 ? (diffs.has('bendera') ? '#4fc3f7' : '#e84a5f') : flagColors[i];
    poly(ctx, [[x - 11, y], [x + 11, y], [x, y + 22]], color);
  }

  // String lights, lower row.
  ctx.strokeStyle = '#8d7bb5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 118);
  ctx.quadraticCurveTo(300, 138, 600, 118);
  ctx.stroke();
  const bulbColors = ['#ffd76e', '#ff9d5c', '#ff6b81', '#ffd76e', '#7fe0a8', '#ffd76e', '#ff9d5c', '#ff6b81', '#ffd76e', '#7fe0a8', '#ffd76e', '#ff9d5c'];
  for (let i = 0; i < 12; i += 1) {
    const x = 26 + i * 50;
    const t = x / W;
    const y = (1 - t) * (1 - t) * 118 + 2 * (1 - t) * t * 138 + t * t * 118;
    line(ctx, x, y, x, y + 8, '#8d7bb5', 1.5);
    circle(ctx, x, y + 13, 5, bulbColors[i]);
    ctx.globalAlpha = 0.25;
    circle(ctx, x, y + 13, 10, bulbColors[i]);
    ctx.globalAlpha = 1;
  }

  // --- Stall A (left): sate stall with striped awning.
  // Awning.
  for (let i = 0; i < 8; i += 1) {
    rect(ctx, 34 + i * 27, 140, 27, 44, i % 2 === 0 ? '#e84a5f' : '#fdf3e3');
  }
  poly(ctx, [[34, 184], [250, 184], [240, 198], [44, 198]], '#c93a4e');
  line(ctx, 40, 184, 40, 302, '#6b4a2f', 5);
  line(ctx, 244, 184, 244, 302, '#6b4a2f', 5);
  // Counter.
  roundRect(ctx, 30, 300, 224, 58, 6, '#7a4a2b');
  roundRect(ctx, 30, 300, 224, 10, 6, '#9c6238');
  // Vendor: cap, head, apron.
  circle(ctx, 150, 258, 17, '#f2c89b');
  poly(ctx, [[132, 252], [168, 252], [150, 232]], '#e84a5f');
  rect(ctx, 126, 274, 48, 28, '#3f6fb5');
  rect(ctx, 126, 274, 48, 8, '#f2eefb');
  circle(ctx, 143, 258, 2, '#241640');
  circle(ctx, 157, 258, 2, '#241640');
  // Signboard — the price changes in the right picture.
  roundRect(ctx, 96, 212, 92, 40, 6, '#241640');
  ctx.strokeStyle = '#f5d76e';
  ctx.lineWidth = 2;
  ctx.strokeRect(99, 215, 86, 34);
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SATE AYAM', 142, 230);
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(diffs.has('harga') ? '15K' : '10K', 142, 247);
  ctx.textAlign = 'left';
  // Basket of oranges — one fewer in the right picture.
  ellipse(ctx, 96, 296, 30, 10, '#5d3a1a');
  const orangeCount = diffs.has('jeruk') ? 2 : 3;
  const orangeXs = [82, 96, 110];
  for (let i = 0; i < orangeCount; i += 1) {
    circle(ctx, orangeXs[i], 288, 9, '#ff8c2e');
    circle(ctx, orangeXs[i] - 2, 285, 2.5, '#ffc46b');
  }
  // Skewers on the counter.
  for (let i = 0; i < 4; i += 1) {
    line(ctx, 190 + i * 12, 292, 196 + i * 12, 306, '#d9c9a8', 3);
    circle(ctx, 193 + i * 12, 290, 4, '#8a5a2e');
  }

  // --- Food cart (right): umbrella, cart body, wheel, lantern.
  // Umbrella canopy (striped).
  for (let i = 0; i < 8; i += 1) {
    poly(ctx, [[330 + i * 30, 208], [360 + i * 30, 208], [345 + i * 30, 246]], i % 2 === 0 ? '#ffb347' : '#fdf3e3');
  }
  line(ctx, 445, 208, 445, 330, '#6b4a2f', 5);
  // Cart body.
  roundRect(ctx, 336, 330, 220, 62, 8, '#2f6f5e');
  roundRect(ctx, 336, 330, 220, 12, 8, '#3d8a76');
  // Goods on the cart: jars and fruit.
  roundRect(ctx, 352, 306, 26, 24, 4, '#f2e6c9');
  roundRect(ctx, 386, 302, 26, 28, 4, '#e84a5f');
  circle(ctx, 436, 318, 10, '#37d67a');
  circle(ctx, 460, 318, 10, '#ff8c2e');
  circle(ctx, 484, 318, 10, '#e84a5f');
  // Big wheel.
  circle(ctx, 372, 398, 22, '#241640');
  circle(ctx, 372, 398, 12, '#8d7bb5');
  circle(ctx, 372, 398, 4, '#f2eefb');
  circle(ctx, 522, 398, 16, '#241640');
  circle(ctx, 522, 398, 8, '#8d7bb5');
  // Paper lantern hanging from the umbrella — recoloured in the right picture.
  line(ctx, 430, 246, 430, 256, '#8d7bb5', 2);
  const lanternColor = diffs.has('lentera') ? '#2ec4b6' : '#e84a5f';
  ellipse(ctx, 430, 272, 15, 17, lanternColor);
  ellipse(ctx, 430, 272, 15, 17, 'rgba(255,255,255,0.18)');
  rect(ctx, 424, 253, 12, 5, '#f5d76e');
  rect(ctx, 424, 286, 12, 5, '#f5d76e');
  ctx.globalAlpha = 0.22;
  circle(ctx, 430, 272, 26, lanternColor);
  ctx.globalAlpha = 1;

  // Balloons tied to the cart — one fewer in the right picture.
  if (!diffs.has('balon')) {
    line(ctx, 556, 200, 548, 108, '#c9b8e8', 1.5);
    circle(ctx, 548, 88, 16, '#e84a5f');
    poly(ctx, [[544, 102], [552, 102], [548, 110]], '#e84a5f');
  }
  line(ctx, 556, 200, 566, 122, '#c9b8e8', 1.5);
  line(ctx, 556, 200, 536, 128, '#c9b8e8', 1.5);
  circle(ctx, 568, 106, 15, '#4fc3f7');
  poly(ctx, [[564, 119], [572, 119], [568, 127]], '#4fc3f7');
  circle(ctx, 534, 112, 14, '#ffb347');
  poly(ctx, [[530, 124], [538, 124], [534, 132]], '#ffb347');

  // Cat sitting by the stall — missing in the right picture.
  if (!diffs.has('kucing')) {
    ellipse(ctx, 180, 428, 26, 8, 'rgba(0,0,0,0.25)');
    ellipse(ctx, 180, 410, 16, 18, '#2b2b33');
    circle(ctx, 180, 388, 12, '#2b2b33');
    poly(ctx, [[170, 380], [174, 366], [180, 378]], '#2b2b33');
    poly(ctx, [[182, 378], [188, 366], [190, 380]], '#2b2b33');
    circle(ctx, 176, 387, 2, '#7fe0a8');
    circle(ctx, 184, 387, 2, '#7fe0a8');
    // Tail curled around.
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(198, 414, 10, -0.6, 1.4);
    ctx.stroke();
  }

  // Puddle reflecting the lights.
  ellipse(ctx, 400, 438, 52, 8, 'rgba(232,74,95,0.25)');
  ellipse(ctx, 420, 440, 30, 5, 'rgba(255,179,71,0.3)');
}

// ---------------------------------------------------------------------------
// Level 2 — Taman Senja (dusk park)
// ---------------------------------------------------------------------------

function drawPark(ctx, diffs) {
  // Late-afternoon sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, '#6fb7e8');
  sky.addColorStop(0.6, '#a8d8f0');
  sky.addColorStop(1, '#ffd9a0');
  rect(ctx, 0, 0, W, 330, sky);

  // Sun with rays.
  circle(ctx, 480, 82, 28, '#ffcf4d');
  ctx.strokeStyle = '#ffcf4d';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 480 + Math.cos(a) * 36, 82 + Math.sin(a) * 36, 480 + Math.cos(a) * 46, 82 + Math.sin(a) * 46, '#ffcf4d', 4);
  }

  // Clouds — one disappears in the right picture.
  if (!diffs.has('awan')) {
    ellipse(ctx, 140, 66, 44, 13, '#ffffff');
    ellipse(ctx, 162, 58, 30, 11, '#ffffff');
    ellipse(ctx, 118, 60, 26, 10, '#ffffff');
  }
  ellipse(ctx, 380, 48, 40, 11, '#ffffff');
  ellipse(ctx, 398, 42, 26, 9, '#ffffff');

  // Birds — one fewer in the right picture.
  const birds = [[180, 82], [238, 62], [300, 66]];
  const birdCount = diffs.has('burung') ? 2 : 3;
  ctx.strokeStyle = '#33415c';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < birdCount; i += 1) {
    const [bx, by] = birds[i];
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.quadraticCurveTo(bx - 3, by - 7, bx, by);
    ctx.quadraticCurveTo(bx + 3, by - 7, bx + 9, by);
    ctx.stroke();
  }

  // Kite with a tail — one extra bow in the right picture.
  poly(ctx, [[430, 96], [452, 120], [430, 146], [408, 120]], '#e84a5f');
  poly(ctx, [[430, 96], [452, 120], [430, 122]], '#ffb347');
  line(ctx, 408, 120, 452, 120, '#c93a4e', 2);
  line(ctx, 430, 146, 452, 196, '#33415c', 1.5);
  const bows = [[438, 158], [445, 174], [450, 188]];
  for (const [bx, by] of bows) {
    poly(ctx, [[bx - 7, by - 3], [bx + 7, by - 3], [bx, by + 4]], '#4fc3f7');
  }
  if (diffs.has('layang')) {
    poly(ctx, [[445, 193], [459, 193], [452, 200]], '#4fc3f7');
  }

  // Grass.
  rect(ctx, 0, 320, W, 140, '#69a84f');
  rect(ctx, 0, 320, W, 10, '#7cbf5f');
  // Path.
  poly(ctx, [[0, 460], [0, 420], [600, 400], [600, 460]], '#d9c9a8');
  ctx.strokeStyle = 'rgba(120,100,70,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    line(ctx, 60 + i * 75, 448 - i * 2, 60 + i * 75, 424 - i * 2.5, 'rgba(120,100,70,0.5)', 2);
  }

  // Big tree with apples — one fewer in the right picture.
  rect(ctx, 78, 220, 26, 112, '#6b4a2f');
  rect(ctx, 66, 250, 50, 12, '#6b4a2f');
  circle(ctx, 60, 170, 42, '#3f7d3a');
  circle(ctx, 100, 140, 48, '#4c9440');
  circle(ctx, 140, 175, 44, '#3f7d3a');
  circle(ctx, 100, 195, 46, '#57a047');
  const apples = [[70, 162], [100, 142], [130, 170], [86, 192], [122, 178]];
  const appleCount = diffs.has('apel') ? 4 : 5;
  for (let i = 0; i < appleCount; i += 1) {
    circle(ctx, apples[i][0], apples[i][1], 7, '#e84a5f');
    circle(ctx, apples[i][0] - 2, apples[i][1] - 2, 2, '#ff9d9d');
  }

  // Bench — the middle seat slat is missing in the right picture.
  line(ctx, 340, 336, 340, 380, '#5d3a1a', 6);
  line(ctx, 470, 336, 470, 380, '#5d3a1a', 6);
  rect(ctx, 332, 318, 146, 8, '#8a5a2e');
  rect(ctx, 332, 332, 146, 8, '#8a5a2e');
  if (!diffs.has('bangku')) rect(ctx, 332, 346, 146, 8, '#8a5a2e');
  rect(ctx, 332, 360, 146, 8, '#8a5a2e');
  line(ctx, 344, 368, 344, 392, '#5d3a1a', 5);
  line(ctx, 466, 368, 466, 392, '#5d3a1a', 5);

  // Lamp post — lit in the right picture, dark in the left.
  line(ctx, 556, 258, 556, 392, '#33415c', 6);
  circle(ctx, 556, 252, 11, '#33415c');
  circle(ctx, 556, 252, 7, diffs.has('lampu') ? '#ffe9a8' : '#8b93a3');
  if (diffs.has('lampu')) {
    ctx.globalAlpha = 0.3;
    circle(ctx, 556, 262, 34, '#ffe9a8');
    ctx.globalAlpha = 0.15;
    circle(ctx, 556, 262, 52, '#ffe9a8');
    ctx.globalAlpha = 1;
  }

  // Pond with a duck — the duck is missing in the right picture.
  ellipse(ctx, 170, 408, 110, 26, '#5fb4d9');
  ellipse(ctx, 170, 408, 110, 26, 'rgba(255,255,255,0.12)');
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(120, 402, 26, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(220, 416, 30, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (!diffs.has('bebek')) {
    ellipse(ctx, 178, 404, 16, 11, '#ffffff');
    circle(ctx, 192, 394, 8, '#ffffff');
    poly(ctx, [[199, 394], [206, 396], [199, 398]], '#ff8c2e');
    circle(ctx, 194, 392, 1.8, '#241640');
    ellipse(ctx, 178, 414, 20, 3, 'rgba(255,255,255,0.6)');
  }

  // Dog sitting by the pond — its ball is missing in the right picture.
  ellipse(ctx, 300, 428, 22, 6, 'rgba(0,0,0,0.2)');
  ellipse(ctx, 300, 408, 15, 17, '#c98a4b');
  circle(ctx, 300, 388, 11, '#c98a4b');
  poly(ctx, [[291, 381], [294, 369], [300, 378]], '#c98a4b');
  poly(ctx, [[302, 378], [307, 369], [309, 381]], '#c98a4b');
  circle(ctx, 296, 387, 2, '#241640');
  circle(ctx, 304, 387, 2, '#241640');
  ellipse(ctx, 300, 398, 5, 3, '#8a5a2e');
  if (!diffs.has('bola')) {
    circle(ctx, 344, 428, 11, '#e84a5f');
    ctx.strokeStyle = '#fdf3e3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(344, 428, 11, 0.4, 2.2);
    ctx.stroke();
  }

  // Flower bed — one flower changes colour in the right picture.
  const flowers = [
    [492, 414, '#e84a5f'], [510, 424, '#ffb347'], [528, 412, '#e84a5f'],
    [546, 424, '#4fc3f7'], [566, 414, '#e84a5f'], [580, 426, '#ffb347'],
  ];
  for (const [fx, fy, fc] of flowers) {
    line(ctx, fx, fy, fx, fy + 14, '#3f7d3a', 2.5);
    const color = fx === 528 ? (diffs.has('bunga') ? '#ffd76e' : '#e84a5f') : fc;
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 4, color);
    }
    circle(ctx, fx, fy, 4, '#ffcf4d');
  }

  // Butterfly — missing in the right picture.
  if (!diffs.has('kupu')) {
    ctx.strokeStyle = '#33415c';
    ctx.lineWidth = 1.5;
    line(ctx, 468, 378, 468, 390, '#33415c', 1.5);
    ellipse(ctx, 460, 374, 7, 5, '#b388e8');
    ellipse(ctx, 476, 374, 7, 5, '#b388e8');
    ellipse(ctx, 461, 383, 5, 4, '#d9b8ff');
    ellipse(ctx, 475, 383, 5, 4, '#d9b8ff');
  }
}

/** Paint level `levelIndex` (0-based) into `ctx`; `variant` applies every difference. */
export function paintScene(ctx, levelIndex, variant) {
  const diffs = variant ? new Set(LEVELS[levelIndex].differences.map((d) => d.id)) : new Set();
  if (levelIndex === 0) drawNightMarket(ctx, diffs);
  else drawPark(ctx, diffs);
}

// Every tuning number, colour and layout constant in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule depends on screen size.

export const VIEW = { width: 1280, height: 720 };

/** One picture panel (both panels share the same scene size). */
export const PANEL = { width: 600, height: 460, y: 96, leftX: 20, rightX: 660 };

export const HEADER = { height: 80 };
export const FOOTER = { y: 576, height: 128 };

/** Clickable buttons drawn in the footer (canvas coordinates). */
export const BUTTONS = {
  hint: { x: 20, y: 600, width: 190, height: 52 },
  restart: { x: 226, y: 600, width: 190, height: 52 },
  pause: { x: 432, y: 600, width: 190, height: 52 },
  next: { x: 1050, y: 600, width: 210, height: 52 },
};

/** The simulation's fixed step, in seconds. */
export const STEP = 1 / 60;

export const SCORING = {
  found: 100,
  wrongPenaltySeconds: 5,
  wrongPenaltyPoints: 10,
  hintCount: 3,
  timeBonusPerSecond: 5,
};

export const PALETTE = {
  backdrop: '#14101d',
  header: '#1e1830',
  panelBorder: '#3d3358',
  panelLabel: '#f5d76e',
  text: '#f2eefb',
  muted: '#a89ec2',
  accent: '#ffb347',
  good: '#37d67a',
  bad: '#ff5d5d',
  hint: '#4fc3f7',
  button: '#2c2547',
  buttonEdge: '#4a3f73',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'spot-the-difference.best';

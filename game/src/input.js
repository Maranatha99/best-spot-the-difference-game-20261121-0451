// Keyboard and pointer input. One-shot presses (confirm, pause, hint, restart, next) are
// queued as bit flags and taken once by the loop, so a press between two frames is never
// lost and never counted twice. Pointer clicks are queued with their canvas coordinates.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_NEXT = 16;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);
const NEXT = new Set(['KeyN']);

export function createInput(canvas, toLogical) {
  let actions = 0;
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (CONFIRM.has(event.code)) actions |= ACTION_CONFIRM;
    else if (PAUSE.has(event.code)) actions |= ACTION_PAUSE;
    else if (HINT.has(event.code)) actions |= ACTION_HINT;
    else if (RESTART.has(event.code)) actions |= ACTION_RESTART;
    else if (NEXT.has(event.code)) actions |= ACTION_NEXT;
    else return;
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = toLogical(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
    clicks.push(point);
  });

  return {
    /** One-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Clicks since the last call, in logical canvas coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}

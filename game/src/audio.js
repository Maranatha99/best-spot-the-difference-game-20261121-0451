// Tiny synthesized sounds (Web Audio, no files): a chime when a difference is found, a low
// buzz for a wrong click, a blip for a hint, an arpeggio for a win. The context is created on
// the first user gesture, so loading the page never makes a sound.

let context = null;

function ensure() {
  if (context) return context;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  } catch {
    context = null;
  }
  return context;
}

function tone(freq, start, duration, type, volume) {
  const ctx = ensure();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + start;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    // Sound is decoration: a failure never breaks the game.
  }
}

export const audio = {
  click() {
    tone(720, 0, 0.07, 'sine', 0.12);
  },
  found() {
    tone(660, 0, 0.14, 'sine', 0.22);
    tone(880, 0.09, 0.22, 'sine', 0.22);
  },
  wrong() {
    tone(150, 0, 0.22, 'sawtooth', 0.12);
  },
  hint() {
    tone(520, 0, 0.1, 'sine', 0.16);
    tone(780, 0.08, 0.12, 'sine', 0.14);
  },
  win() {
    [523, 659, 784, 1046].forEach((freq, i) => tone(freq, i * 0.11, 0.3, 'triangle', 0.2));
  },
};

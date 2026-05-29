// services/soundManager.ts
// Web Audio API sound effects — no external dependencies, zero bundle cost

let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = (freq: number, dur: number, wave: OscillatorType = 'sine', vol = 0.07) => {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch {}
};

export const sfx = {
  card: () => {
    tone(440, 0.12, 'sine', 0.07);
    setTimeout(() => tone(660, 0.08, 'sine', 0.05), 90);
  },
  damage: () => tone(120, 0.25, 'sawtooth', 0.10),
  shield: () => tone(900, 0.15, 'sine', 0.06),
  endTurn: () => {
    tone(220, 0.15, 'square', 0.06);
    setTimeout(() => tone(180, 0.2, 'square', 0.04), 130);
  },
  enemyTurn: () => tone(150, 0.3, 'sawtooth', 0.08),
  victory: () => {
    tone(523, 0.15, 'sine', 0.09);
    setTimeout(() => tone(659, 0.15, 'sine', 0.09), 180);
    setTimeout(() => tone(784, 0.4, 'sine', 0.09), 360);
  },
  defeat: () => {
    tone(280, 0.4, 'sawtooth', 0.12);
    setTimeout(() => tone(180, 0.5, 'sawtooth', 0.08), 350);
  },
  click: () => tone(330, 0.07, 'sine', 0.04),
  travel: () => {
    tone(440, 0.1, 'sine', 0.05);
    setTimeout(() => tone(550, 0.15, 'sine', 0.07), 100);
    setTimeout(() => tone(660, 0.3, 'sine', 0.05), 220);
  },
};

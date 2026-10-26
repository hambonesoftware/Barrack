export class Audio {
  constructor(settings) { this.settings = settings; this.context = null; this.beat = 0; this.nextBeat = 0; }
  unlock() { try { if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)(); if (this.context.state === 'suspended') this.context.resume().catch(() => {}); } catch {} }
  tone(freq, duration, volume = .1, type = 'sine', end = freq, music = false) {
    const ctx = this.context; if (!ctx || ctx.state !== 'running') return;
    const level = music ? this.settings.music : this.settings.sfx; if (!level) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
    osc.type = type; osc.frequency.setValueAtTime(freq, now); osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume * level), now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + duration + .02); osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  effect(type) {
    if (type === 'fire') this.tone(720, .16, .09, 'sawtooth', 180);
    if (type === 'capture') { this.tone(440, .28, .12, 'sine', 880); this.tone(660, .4, .05, 'triangle', 1320); }
    if (type === 'hit') this.tone(130, .4, .14, 'sawtooth', 28);
    if (type === 'power' || type === 'shield') this.tone(220, .4, .1, 'sine', 1100);
    if (type === 'clear' || type === 'won') { this.tone(523, .8, .1); this.tone(659, .8, .07); this.tone(784, 1, .08); }
    if (type === 'over') this.tone(240, .8, .1, 'triangle', 45);
  }
  update(active) {
    if (!active || !this.context) { this.nextBeat = 0; return; }
    const now = this.context.currentTime; if (now < this.nextBeat) return;
    this.nextBeat = now + .24; const notes = [110, 110, 164.81, 130.81, 98, 98, 146.83, 130.81];
    this.tone(notes[Math.floor(this.beat / 2) % 8], .2, .07, 'triangle', notes[Math.floor(this.beat / 2) % 8], true);
    if (this.beat % 4 === 0) this.tone(70, .12, .1, 'sine', 30, true);
    if (this.beat % 2) this.tone(notes[this.beat % 8] * 4, .09, .025, 'sine', notes[this.beat % 8] * 4, true);
    this.beat++;
  }
}

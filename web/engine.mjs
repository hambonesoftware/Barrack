export const W = 960, H = 640, WALL = 6;
export const STAGES = ['First contact', 'Cross current', 'Heavy metal', 'Watchful eyes', 'Split decision', 'Reactor room', 'Double trouble', 'Fast lanes', 'Pressure point', 'Critical mass', 'No quiet corners', 'Final containment'];
export const TYPES = {
  chrome: { color: '#9bcfe4', speed: 1, radius: 18, label: 'Chrome', detail: 'Predictable bounces. Learn its rhythm.' },
  ember: { color: '#ff9b57', speed: 1.35, radius: 14, label: 'Ember', detail: 'Small, fast, and unforgiving.' },
  heavy: { color: '#c5a2ff', speed: .72, radius: 24, label: 'Heavy', detail: 'Slow but large. Leave room for the whole ball.' },
  watcher: { color: '#b4f568', speed: .92, radius: 20, label: 'Watcher', detail: 'Bends toward your aim point before you fire.' },
  pulse: { color: '#ff7293', speed: 1.05, radius: 18, label: 'Pulse', detail: 'Alternates between a crawl and a burst of speed.' }
};
export function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const area = r => r.w * r.h;
export const inside = (r, x, y, pad = 0) => x >= r.x + pad && x <= r.x + r.w - pad && y >= r.y + pad && y <= r.y + r.h - pad;
export class Game {
  constructor({ mode = 'enhanced', stage = 1, seed = Date.now(), difficulty = 'normal', onEvent = () => {} } = {}) {
    this.mode = mode; this.difficulty = difficulty; this.random = rng(seed); this.onEvent = onEvent;
    this.score = 0; this.lives = mode === 'survival' ? 3 : 5; this.time = 90; this.totalTime = 0; this.clears = 0; this.cuts = 0; this.bestCapture = 0;
    this.aim = { x: W / 2, y: H / 2 }; this.load(stage);
  }
  emit(type, data = {}) { this.onEvent({ type, ...data }); }
  load(stage) {
    this.stage = stage; this.state = 'playing'; this.beam = null; this.slow = 0; this.boost = 0; this.shield = 0; this.cooldown = 0; this.stageHits = 0; this.stageTime = 0; this.captured = []; this.sequence = 0;
    this.powers = this.mode === 'classic' ? { slow: 0, shield: 0, boost: 0 } : { slow: 2, shield: 1, boost: 2 };
    this.regions = [{ x: 0, y: 0, w: W, h: H, id: this.sequence++ }];
    if (this.mode !== 'classic' && stage % 3 === 0) {
      const gap = 72;
      this.regions = [{ x: 0, y: 0, w: W, h: 284, id: this.sequence++ }, { x: 0, y: 284 + gap, w: W, h: H - 284 - gap, id: this.sequence++ }];
    } else if (this.mode !== 'classic' && stage % 4 === 0) {
      this.regions = [{ x: 0, y: 0, w: 450, h: H, id: this.sequence++ }, { x: 510, y: 0, w: 450, h: H, id: this.sequence++ }];
    }
    this.initialArea = this.regions.reduce((n, r) => n + area(r), 0); this.percent = 0; this.target = 80;
    const count = Math.min(3 + Math.floor((stage - 1) * .65), 11);
    const kinds = this.mode === 'classic' ? ['chrome'] : ['chrome', ...(stage >= 2 ? ['ember'] : []), ...(stage >= 3 ? ['heavy'] : []), ...(stage >= 4 ? ['watcher'] : []), ...(stage >= 6 ? ['pulse'] : [])];
    this.balls = [];
    for (let i = 0; i < count; i++) {
      const kind = kinds[i % kinds.length], spec = TYPES[kind], region = this.regions[i % this.regions.length];
      const speed = (100 + Math.min(stage - 1, 20) * 8) * spec.speed * (this.difficulty === 'relaxed' ? .75 : this.difficulty === 'expert' ? 1.22 : 1);
      let x, y;
      for (let k = 0; k < 100; k++) {
        x = region.x + spec.radius + 12 + this.random() * (region.w - 2 * spec.radius - 24);
        y = region.y + spec.radius + 12 + this.random() * (region.h - 2 * spec.radius - 24);
        if (!this.balls.some(b => Math.hypot(b.x - x, b.y - y) < b.r + spec.radius + 15)) break;
      }
      const angle = .35 + this.random() * 5.5;
      this.balls.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, speed, r: spec.radius, kind, region: region.id, phase: this.random() * 6.28, trail: [] });
    }
    this.emit('stage', { stage });
  }
  regionAt(x, y) { return this.regions.find(r => inside(r, x, y, WALL)); }
  fire(x, y, axis) {
    if (this.state !== 'playing' || this.beam || this.cooldown > 0 || !Number.isFinite(x) || !Number.isFinite(y) || !['h', 'v'].includes(axis)) return false;
    const r = this.regionAt(x, y); if (!r) return false;
    if (this.balls.some(b => Math.hypot(b.x - x, b.y - y) < b.r + WALL)) { this.emit('invalid'); return false; }
    this.beam = { x, y, axis, a: axis === 'h' ? x : y, b: axis === 'h' ? x : y, min: axis === 'h' ? r.x : r.y, max: axis === 'h' ? r.x + r.w : r.y + r.h, region: r.id };
    this.emit('fire', { x, y }); return true;
  }
  power(kind) {
    if (this.state !== 'playing' || !this.powers[kind]) return false;
    if ((kind === 'slow' && this.slow) || (kind === 'shield' && this.shield) || (kind === 'boost' && this.boost)) return false;
    this.powers[kind]--; if (kind === 'slow') this.slow = 5; if (kind === 'shield') this.shield = 1; if (kind === 'boost') this.boost = 5;
    this.emit('power', { kind }); return true;
  }
  hit(ball) {
    this.beam = null; this.cooldown = .45;
    if (this.shield) { this.shield = 0; this.emit('shield', { x: ball.x, y: ball.y }); return; }
    this.lives--; this.stageHits++; this.emit('hit', { x: ball.x, y: ball.y });
    if (this.lives <= 0) this.end();
  }
  end() { this.state = 'over'; this.beam = null; this.emit('over'); }
  complete() {
    const beam = this.beam; if (!beam) return;
    const region = this.regions.find(r => r.id === beam.region); const half = WALL / 2;
    const parts = beam.axis === 'h'
      ? [{ x: region.x, y: region.y, w: region.w, h: beam.y - region.y - half }, { x: region.x, y: beam.y + half, w: region.w, h: region.y + region.h - beam.y - half }]
      : [{ x: region.x, y: region.y, w: beam.x - region.x - half, h: region.h }, { x: beam.x + half, y: region.y, w: region.x + region.w - beam.x - half, h: region.h }];
    this.regions = this.regions.filter(r => r.id !== region.id);
    for (const part of parts) {
      part.id = this.sequence++;
      const balls = this.balls.filter(b => b.region === region.id && inside(part, b.x, b.y));
      if (balls.length) { this.regions.push(part); balls.forEach(b => { b.region = part.id; }); }
      else this.captured.push({ ...part, age: 0 });
    }
    const old = this.percent;
    this.percent = (1 - this.regions.reduce((n, r) => n + area(r), 0) / this.initialArea) * 100;
    const gain = this.percent - old; this.bestCapture = Math.max(this.bestCapture, gain); this.cuts++;
    this.score += Math.round(gain * 100) + 25; this.beam = null; this.cooldown = .12;
    this.emit('capture', { gain, x: beam.x, y: beam.y });
    if (this.percent >= this.target) {
      this.clears++; const bonus = 500 + Math.round((this.percent - this.target) * 150) + (this.stageHits === 0 ? 1000 : 0);
      this.score += bonus; this.state = 'cleared';
      if (this.mode === 'survival') this.time += 30;
      else this.lives = Math.min(7, this.lives + 1);
      this.emit('clear', { bonus, perfect: this.stageHits === 0 });
    }
  }
  next() {
    if (this.state !== 'cleared') return;
    if (this.mode === 'enhanced' && this.stage >= 12) { this.state = 'won'; this.emit('won'); }
    else this.load(this.stage + 1);
  }
  update(dt) {
    if (this.state !== 'playing') return;
    // Small substeps prevent a ball passing through a growing beam on a slow frame.
    const steps = Math.ceil(Math.min(dt, .1) / (1 / 240));
    for (let i = 0; i < steps && this.state === 'playing'; i++) this.step(Math.min(dt, .1) / steps);
  }
  step(dt) {
    this.totalTime += dt; this.stageTime += dt; this.cooldown = Math.max(0, this.cooldown - dt);
    this.slow = Math.max(0, this.slow - dt); this.boost = Math.max(0, this.boost - dt);
    if (this.mode === 'survival') { this.time -= dt; if (this.time <= 0) { this.time = 0; this.end(); return; } }
    for (const c of this.captured) c.age += dt;
    const beam = this.beam;
    if (beam) { const speed = (this.boost ? 1150 : 410) * (this.difficulty === 'relaxed' ? 1.25 : 1); beam.a = Math.max(beam.min, beam.a - speed * dt); beam.b = Math.min(beam.max, beam.b + speed * dt); }
    for (const b of this.balls) {
      const r = this.regions.find(r => r.id === b.region); if (!r) throw new Error('Ball lost its region');
      if (b.kind === 'watcher' && !beam) {
        const dx = this.aim.x - b.x, dy = this.aim.y - b.y, distance = Math.hypot(dx, dy);
        if (distance > 1) { b.vx += dx / distance * 24 * dt; b.vy += dy / distance * 24 * dt; const v = Math.hypot(b.vx, b.vy); if (v > 0) { b.vx *= b.speed / v; b.vy *= b.speed / v; } }
      }
      const factor = (this.slow ? .35 : 1) * (b.kind === 'pulse' ? .85 + .45 * Math.sin(this.stageTime * 2.3 + b.phase) : 1);
      b.x += b.vx * dt * factor; b.y += b.vy * dt * factor;
      if (b.x - b.r < r.x) { b.x = r.x + b.r; b.vx = Math.abs(b.vx); }
      if (b.x + b.r > r.x + r.w) { b.x = r.x + r.w - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y - b.r < r.y) { b.y = r.y + b.r; b.vy = Math.abs(b.vy); }
      if (b.y + b.r > r.y + r.h) { b.y = r.y + r.h - b.r; b.vy = -Math.abs(b.vy); }
      if (this.beam && b.region === beam.region) {
        const bx = beam.axis === 'h' ? Math.max(beam.a, Math.min(beam.b, b.x)) : beam.x;
        const by = beam.axis === 'v' ? Math.max(beam.a, Math.min(beam.b, b.y)) : beam.y;
        if (Math.hypot(b.x - bx, b.y - by) <= b.r + WALL / 2) this.hit(b);
      }
    }
    if (this.beam && this.beam.a === this.beam.min && this.beam.b === this.beam.max) this.complete();
  }
}

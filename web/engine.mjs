export const W = 960, H = 640, WALL = 6;
export const STAGES = ['First contact', 'Cross current', 'Heavy metal', 'Watchful eyes', 'Split decision', 'Reactor room', 'Double trouble', 'Fast lanes', 'Pressure point', 'Critical mass', 'No quiet corners', 'Final containment'];
export const BONUSES = Object.freeze({
  haste: { label: 'Lightning', color: '#f5d348', glyph: 'ϟ', detail: 'Rapid barriers for 8 seconds' },
  laser: { label: 'Laser cannon', color: '#72f8ff', glyph: '✦', detail: 'Supercharged barriers for 6 seconds' },
  magnet: { label: 'Cluster magnet', color: '#ec5bbd', glyph: 'U', detail: 'Pull balls toward the boundaries for 7 seconds' },
  life: { label: 'Extra life', color: '#7dec78', glyph: '+', detail: 'Restore 1–3 lives' },
  multiplier: { label: 'Score multiplier', color: '#ffad62', glyph: '2×', detail: 'Double scoring for 12 seconds' },
  nuke: { label: 'Nuke charge', color: '#f35b38', glyph: '☢', detail: 'Destroy nearby balls' }
});
export const TYPES = {
  chrome: { color: '#9bcfe4', speed: 1, radius: 18, label: 'Chrome', detail: 'Predictable bounces. Learn its rhythm.' },
  ember: { color: '#ff9b57', speed: 1.35, radius: 14, label: 'Ember', detail: 'Small, fast, and unforgiving.' },
  heavy: { color: '#c5a2ff', speed: .72, radius: 24, label: 'Heavy', detail: 'Slow but large. Leave room for the whole ball.' },
  watcher: { color: '#b4f568', speed: .92, radius: 20, label: 'Watcher', detail: 'Bends toward your aim point before you fire.' },
  pulse: { color: '#ff7293', speed: 1.05, radius: 18, label: 'Pulse', detail: 'Alternates between a crawl and a burst of speed.' },
  gravity: { color: '#e3ba68', speed: .88, radius: 17, label: 'Gravity', detail: 'Accelerates downward and rebounds.' },
  glass: { color: '#8de9ff', speed: 1.14, radius: 18, label: 'Glass', detail: 'Shatters into smaller hazards after repeated impacts.' },
  shard: { color: '#c9f9ff', speed: 1.4, radius: 10, label: 'Shards', detail: 'Fast glass fragments.' },
  sentry: { color: '#e7c56e', speed: 1.1, radius: 19, label: 'Sentry', detail: 'Steers toward your emitter.' },
  nuke: { color: '#f44d39', speed: .95, radius: 21, label: 'Nuke ball', detail: 'Detonates when trapped in a small enclosure.' }
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
    const carried = this.mode === 'authentic' && stage > 1 && Array.isArray(this.balls) ? this.balls.map(b => ({ ...b, trail: [] })) : [];
    this.stage = stage; this.state = 'playing'; this.beam = null; this.slow = 0; this.boost = 0; this.shield = 0; this.cooldown = 0; this.stageHits = 0; this.stageTime = 0; this.captured = []; this.sequence = 0;
    this.pickups = []; this.pickupSerial = 0; this.nextPickupAt = 3.5 + this.random() * 2.5;
    this.haste = 0; this.laser = 0; this.magnet = 0; this.multiplier = 0;
    this.powers = this.mode === 'classic' || this.mode === 'authentic' ? { slow: 0, shield: 0, boost: 0 } : { slow: 2, shield: 1, boost: 2 };
    this.regions = [{ x: 0, y: 0, w: W, h: H, id: this.sequence++ }];
    if (!['classic', 'authentic'].includes(this.mode) && stage % 3 === 0) {
      const gap = 72;
      this.regions = [{ x: 0, y: 0, w: W, h: 284, id: this.sequence++ }, { x: 0, y: 284 + gap, w: W, h: H - 284 - gap, id: this.sequence++ }];
    } else if (!['classic', 'authentic'].includes(this.mode) && stage % 4 === 0) {
      this.regions = [{ x: 0, y: 0, w: 450, h: H, id: this.sequence++ }, { x: 510, y: 0, w: 450, h: H, id: this.sequence++ }];
    }
    this.initialArea = this.regions.reduce((n, r) => n + area(r), 0); this.percent = 0; this.target = 80;
    const count = this.mode === 'authentic' ? Math.min(14, Math.max(3, carried.length + (stage > 1 ? 1 : 0))) : Math.min(3 + Math.floor((stage - 1) * .65), 11);
    const kinds = this.mode === 'classic' ? ['chrome'] : [
      'chrome', ...(stage >= 2 ? ['ember'] : []), ...(stage >= 3 ? ['heavy', 'gravity'] : []),
      ...(stage >= 4 ? ['watcher', 'glass'] : []), ...(stage >= 5 ? ['sentry'] : []),
      ...(stage >= 6 ? ['pulse'] : []), ...(stage >= 7 ? ['nuke'] : [])
    ];
    this.balls = [];
    for (let i = 0; i < count; i++) {
      const old = carried[i];
      const kind = old?.kind || kinds[(i + (stage > 1 ? stage - 2 : 0)) % kinds.length];
      const spec = TYPES[kind];
      const region = this.regions[i % this.regions.length];
      const baseline = (125 + Math.min(stage - 1, 20) * 10) * spec.speed * (this.difficulty === 'relaxed' ? .75 : this.difficulty === 'expert' ? 1.22 : 1);
      const speed = old ? Math.max(baseline * .82, Math.min(baseline * 1.18, old.speed * 1.045)) : baseline;
      let x = region.x + region.w / 2, y = region.y + region.h / 2;
      for (let attempt = 0; attempt < 140; attempt++) {
        const tryX = attempt === 0 && old ? region.x + (old.x / W) * region.w : region.x + spec.radius + 12 + this.random() * (region.w - 2 * spec.radius - 24);
        const tryY = attempt === 0 && old ? region.y + (old.y / H) * region.h : region.y + spec.radius + 12 + this.random() * (region.h - 2 * spec.radius - 24);
        x = Math.max(region.x + spec.radius, Math.min(region.x + region.w - spec.radius, tryX));
        y = Math.max(region.y + spec.radius, Math.min(region.y + region.h - spec.radius, tryY));
        if (!this.balls.some(b => b.region === region.id && Math.hypot(b.x - x, b.y - y) < b.r + spec.radius + 10)) break;
      }
      const angle = .35 + this.random() * 5.5;
      const oldDirection = old ? Math.atan2(old.vy, old.vx) : angle;
      this.balls.push({
        x, y, vx: Math.cos(oldDirection) * speed, vy: Math.sin(oldDirection) * speed,
        speed, r: spec.radius, kind, region: region.id, phase: old?.phase ?? this.random() * 6.28,
        glassHits: old?.glassHits ?? 0, trail: []
      });
    }
    this.emit('stage', { stage });
  }
  spawnPickup() {
    if (this.mode === 'classic' || this.pickups.length >= 2) return false;
    const available = this.regions.filter(r => r.w >= 90 && r.h >= 90);
    if (!available.length) return false;
    const kinds = Object.keys(BONUSES);
    const kind = kinds[Math.floor(this.random() * kinds.length)];
    for (let tries = 0; tries < 40; tries++) {
      const region = available[Math.floor(this.random() * available.length)];
      const x = region.x + 24 + this.random() * (region.w - 48);
      const y = region.y + 24 + this.random() * (region.h - 48);
      if (this.balls.some(b => Math.hypot(x - b.x, y - b.y) < b.r + 24)) continue;
      if (this.pickups.some(p => Math.hypot(x - p.x, y - p.y) < 48)) continue;
      const pickup = { id: ++this.pickupSerial, kind, x, y, region: region.id, age: 0, ttl: 13 };
      this.pickups.push(pickup);
      this.emit('spawn', { kind, x, y });
      return true;
    }
    return false;
  }
  collectPickup(pickup) {
    const { kind, x, y } = pickup;
    if (kind === 'haste') this.haste = Math.max(this.haste, 8);
    if (kind === 'laser') this.laser = Math.max(this.laser, 6);
    if (kind === 'magnet') this.magnet = Math.max(this.magnet, 7);
    if (kind === 'multiplier') this.multiplier = Math.max(this.multiplier, 12);
    if (kind === 'life') this.lives = Math.min(9, this.lives + 1 + Math.floor(this.random() * 3));
    if (kind === 'nuke') {
      const victims = this.balls.filter(b => Math.hypot(b.x - x, b.y - y) <= 165);
      if (victims.length) {
        const doomed = new Set(victims);
        this.balls = this.balls.filter(b => !doomed.has(b));
        this.score += victims.length * 300;
        this.emit('detonate', { x, y, count: victims.length });
      }
    }
    this.score += 150;
    this.emit('pickup', { kind, x, y, label: BONUSES[kind].label });
  }
  collectForBeam(beam, regionId, emptyParts, allParts) {
    const keep = [];
    for (const p of this.pickups) {
      if (p.region !== regionId) { keep.push(p); continue; }
      const onBeam = beam.axis === 'h' ? Math.abs(p.y - beam.y) <= 16 : Math.abs(p.x - beam.x) <= 16;
      const inEmpty = emptyParts.some(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (onBeam || inEmpty) this.collectPickup(p);
      else {
        const next = allParts.find(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
        if (next) { p.region = next.id; keep.push(p); }
      }
    }
    this.pickups = keep;
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
    const emptyParts = [];
    for (const part of parts) {
      part.id = this.sequence++;
      const balls = this.balls.filter(b => b.region === region.id && inside(part, b.x, b.y));
      if (balls.length && !(area(part) < 36000 && balls.some(b => b.kind === 'nuke'))) {
        this.regions.push(part); balls.forEach(b => { b.region = part.id; });
      } else {
        if (balls.length) {
          const doomed = new Set(balls);
          this.balls = this.balls.filter(b => !doomed.has(b));
          this.score += balls.length * 350;
          this.emit('detonate', { x: part.x + part.w / 2, y: part.y + part.h / 2, count: balls.length });
        }
        emptyParts.push(part);
        this.captured.push({ ...part, age: 0 });
      }
    }
    this.collectForBeam(beam, region.id, emptyParts, parts);
    const old = this.percent;
    this.percent = (1 - this.regions.reduce((n, r) => n + area(r), 0) / this.initialArea) * 100;
    const gain = this.percent - old; this.bestCapture = Math.max(this.bestCapture, gain); this.cuts++;
    this.score += (Math.round(gain * 100) + 25) * (this.multiplier > 0 ? 2 : 1); this.beam = null; this.cooldown = .12;
    this.emit('capture', { gain, x: beam.x, y: beam.y });
    if (this.percent >= this.target) {
      this.clears++; const bonus = 500 + Math.round((this.percent - this.target) * 150) + (this.stageHits === 0 ? 1000 : 0);
      this.score += bonus * (this.multiplier > 0 ? 2 : 1); this.state = 'cleared';
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
    this.haste = Math.max(0, this.haste - dt); this.laser = Math.max(0, this.laser - dt);
    this.magnet = Math.max(0, this.magnet - dt); this.multiplier = Math.max(0, this.multiplier - dt);
    for (const p of this.pickups) p.age += dt;
    this.pickups = this.pickups.filter(p => p.age < p.ttl);
    if (this.stageTime >= this.nextPickupAt) {
      this.spawnPickup();
      this.nextPickupAt = this.stageTime + 10 + this.random() * 5;
    }
    if (this.mode === 'survival') { this.time -= dt; if (this.time <= 0) { this.time = 0; this.end(); return; } }
    for (const c of this.captured) c.age += dt;
    const beam = this.beam;
    if (beam) { const speed = (this.laser ? 1550 : this.boost ? 1150 : this.haste ? 730 : 410) * (this.difficulty === 'relaxed' ? 1.25 : 1); beam.a = Math.max(beam.min, beam.a - speed * dt); beam.b = Math.min(beam.max, beam.b + speed * dt); }
    const shattered = [];
    const debris = [];
    for (const b of this.balls) {
      const r = this.regions.find(r => r.id === b.region); if (!r) throw new Error('Ball lost its region');
      if ((b.kind === 'watcher' && !beam) || b.kind === 'sentry') {
        const dx = this.aim.x - b.x, dy = this.aim.y - b.y, distance = Math.hypot(dx, dy);
        if (distance > 1) { b.vx += dx / distance * (b.kind === 'sentry' ? 80 : 24) * dt; b.vy += dy / distance * (b.kind === 'sentry' ? 80 : 24) * dt; const v = Math.hypot(b.vx, b.vy); if (v > 0) { b.vx *= b.speed / v; b.vy *= b.speed / v; } }
      }
      if (b.kind === 'gravity') {
        b.vy += 190 * dt;
        const v = Math.hypot(b.vx, b.vy), limit = b.speed * 1.65;
        if (v > limit) { b.vx *= limit / v; b.vy *= limit / v; }
      }
      if (this.magnet) {
        const targetX = b.x < W / 2 ? r.x + b.r : r.x + r.w - b.r;
        const targetY = b.y < H / 2 ? r.y + b.r : r.y + r.h - b.r;
        const dx = targetX - b.x, dy = targetY - b.y, d = Math.hypot(dx, dy) || 1;
        b.vx += dx / d * 240 * dt; b.vy += dy / d * 240 * dt;
        const speed = Math.hypot(b.vx, b.vy), limit = b.speed * 1.35;
        if (speed > limit) { b.vx *= limit / speed; b.vy *= limit / speed; }
      }
      const factor = (this.slow ? .35 : 1) * (b.kind === 'pulse' ? .85 + .45 * Math.sin(this.stageTime * 2.3 + b.phase) : 1);
      b.x += b.vx * dt * factor; b.y += b.vy * dt * factor;
      let bounced = false;
      if (b.x - b.r < r.x) { bounced = true; b.x = r.x + b.r; b.vx = Math.abs(b.vx); }
      if (b.x + b.r > r.x + r.w) { bounced = true; b.x = r.x + r.w - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y - b.r < r.y) { bounced = true; b.y = r.y + b.r; b.vy = Math.abs(b.vy); }
      if (b.y + b.r > r.y + r.h) { bounced = true; b.y = r.y + r.h - b.r; b.vy = -Math.abs(b.vy); }
      if (bounced && b.kind === 'glass' && ++b.glassHits >= 5) {
        shattered.push(b);
        if (r.w >= 55 && r.h >= 55) {
          for (const sign of [-1, 1]) {
            const angle = Math.atan2(b.vy, b.vx) + sign * .55;
            debris.push({
              ...b, kind: 'shard', r: TYPES.shard.radius, speed: b.speed * 1.18,
              x: Math.max(r.x + 10, Math.min(r.x + r.w - 10, b.x + sign * 12)),
              y: Math.max(r.y + 10, Math.min(r.y + r.h - 10, b.y + sign * 8)),
              vx: Math.cos(angle) * b.speed * 1.18, vy: Math.sin(angle) * b.speed * 1.18,
              trail: [], glassHits: 0
            });
          }
        }
        this.emit('shatter', { x: b.x, y: b.y });
      }
      if (this.beam && b.region === beam.region) {
        const bx = beam.axis === 'h' ? Math.max(beam.a, Math.min(beam.b, b.x)) : beam.x;
        const by = beam.axis === 'v' ? Math.max(beam.a, Math.min(beam.b, b.y)) : beam.y;
        if (Math.hypot(b.x - bx, b.y - by) <= b.r + WALL / 2) this.hit(b);
      }
    }
    if (shattered.length) {
      const broken = new Set(shattered);
      this.balls = this.balls.filter(b => !broken.has(b)).concat(debris);
    }
    if (this.beam && this.beam.a === this.beam.min && this.beam.b === this.beam.max) this.complete();
  }
}

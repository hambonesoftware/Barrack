import { W, H, TYPES, inside } from './engine.mjs';
export class Renderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.particles = []; this.rings = []; this.shake = 0; this.reduced = false; }
  burst(x, y, color, amount = 25) {
    if (this.reduced) return;
    for (let i = 0; i < amount; i++) { const a = Math.random() * Math.PI * 2, s = 45 + Math.random() * 170; this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .4 + Math.random() * .5, color }); }
    this.rings.push({ x, y, life: .5, color }); this.particles = this.particles.slice(-180);
  }
  draw(game, aim, axis, dt, time, demo = false) {
    const c = this.ctx, canvas = this.canvas;
    c.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); c.clearRect(0, 0, W, H);
    c.save();
    if (this.shake > 0 && !this.reduced) { c.translate((Math.random() - .5) * this.shake * 16, (Math.random() - .5) * this.shake * 16); this.shake = Math.max(0, this.shake - dt * 3); }
    c.fillStyle = '#304639'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#c7f68b0a'; c.lineWidth = 1;
    for (let x = -H; x < W; x += 14) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); }
    for (const r of game.regions) {
      const g = c.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h); g.addColorStop(0, '#172b32'); g.addColorStop(1, '#09151e');
      c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h);
      c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
      c.strokeStyle = '#8ab4bd12'; c.lineWidth = 1;
      for (let x = 0; x < W; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y < H; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.fillStyle = '#acc8c825'; for (let x = 32; x < W; x += 64) for (let y = 32; y < H; y += 64) c.fillRect(x - 1, y - 1, 2, 2);
      c.restore(); c.strokeStyle = '#83ac9a70'; c.lineWidth = 2; c.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    }
    for (const r of game.captured) if (r.age < .8 && !this.reduced) {
      c.fillStyle = `rgba(199,246,139,${(1 - r.age / .8) * .4})`; c.fillRect(r.x, r.y, r.w, r.h);
    }
    if (game.slow) { c.fillStyle = '#74deff0c'; c.fillRect(0, 0, W, H); }
    for (const b of game.balls) {
      const col = TYPES[b.kind].color;
      if (!this.reduced && game.state === 'playing') { b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 9) b.trail.shift(); }
      if (!this.reduced) b.trail.forEach((p, i) => { c.globalAlpha = i / 100; c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, b.r * i / 10, 0, Math.PI * 2); c.fill(); });
      c.globalAlpha = 1;
      c.fillStyle = '#0007'; c.beginPath(); c.ellipse(b.x + 3, b.y + b.r * .7, b.r * 1.1, b.r * .65, 0, 0, Math.PI * 2); c.fill();
      const g = c.createRadialGradient(b.x - b.r * .36, b.y - b.r * .4, b.r * .05, b.x + b.r * .1, b.y + b.r * .1, b.r * 1.15);
      g.addColorStop(0, '#fff'); g.addColorStop(.18, col); g.addColorStop(.53, col); g.addColorStop(.76, '#384956'); g.addColorStop(.9, '#14232d'); g.addColorStop(1, col);
      c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI * 2); c.fill(); c.strokeStyle = col; c.lineWidth = .8; c.stroke();
      if (b.kind === 'heavy') { c.strokeStyle = '#342447'; c.lineWidth = 3; c.beginPath(); c.ellipse(b.x, b.y, b.r - 3, b.r * .36, -.4, 0, Math.PI * 2); c.stroke(); }
      if (b.kind === 'watcher') {
        const angle = Math.atan2(game.aim.y - b.y, game.aim.x - b.x);
        c.fillStyle = '#effbd7'; c.beginPath(); c.arc(b.x, b.y, b.r * .68, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#253c23'; c.beginPath(); c.arc(b.x + Math.cos(angle) * 4, b.y + Math.sin(angle) * 4, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x + Math.cos(angle) * 4 - 1.5, b.y + Math.sin(angle) * 4 - 2, 1.7, 0, Math.PI * 2); c.fill();
      }
      if (b.kind === 'pulse') { c.strokeStyle = '#ffbdd0'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y, b.r + 4 + (this.reduced ? 0 : Math.sin(time * 3 + b.phase) * 2), 0, Math.PI * 2); c.stroke(); }
      if (b.kind === 'ember') { c.fillStyle = '#633a18'; c.beginPath(); c.moveTo(b.x + 2, b.y - 6); c.lineTo(b.x - 4, b.y + 1); c.lineTo(b.x, b.y + 1); c.lineTo(b.x - 2, b.y + 6); c.lineTo(b.x + 5, b.y - 1); c.lineTo(b.x + 1, b.y - 1); c.fill(); }
    }
    if (game.beam) {
      const b = game.beam; c.save(); c.shadowColor = game.shield ? '#bfa3ff' : '#c7f68b'; c.shadowBlur = this.reduced ? 0 : 20;
      c.strokeStyle = game.shield ? '#c5a2ff' : '#c7f68b'; c.lineWidth = 6; c.beginPath(); c.moveTo(b.axis === 'h' ? b.a : b.x, b.axis === 'v' ? b.a : b.y); c.lineTo(b.axis === 'h' ? b.b : b.x, b.axis === 'v' ? b.b : b.y); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      for (const end of [b.a, b.b]) { const x = b.axis === 'h' ? end : b.x, y = b.axis === 'v' ? end : b.y; c.fillStyle = '#fff'; c.fillRect(x - 5, y - 5, 10, 10); }
      c.restore();
    }
    if (aim && !game.beam && game.state === 'playing') {
      const r = game.regionAt(aim.x, aim.y);
      if (r) {
        c.save(); c.setLineDash([5, 9]); c.lineWidth = 1; c.strokeStyle = '#c7f68b55'; c.beginPath();
        c.moveTo(axis === 'h' ? r.x : aim.x, axis === 'v' ? r.y : aim.y); c.lineTo(axis === 'h' ? r.x + r.w : aim.x, axis === 'v' ? r.y + r.h : aim.y); c.stroke(); c.restore();
      }
      c.save(); c.translate(aim.x, aim.y); if (axis === 'v') c.rotate(Math.PI / 2); c.strokeStyle = r ? '#c7f68b' : '#ff9158'; c.lineWidth = 2;
      c.strokeRect(-7, -7, 14, 14); c.beginPath(); c.moveTo(-22, 0); c.lineTo(-12, -5); c.lineTo(-12, 5); c.closePath(); c.moveTo(22, 0); c.lineTo(12, -5); c.lineTo(12, 5); c.closePath(); c.stroke(); c.restore();
    }
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .98; p.vy *= .98; c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.color; c.fillRect(p.x, p.y, 3, 3); }
    this.particles = this.particles.filter(p => p.life > 0); c.globalAlpha = 1;
    for (const r of this.rings) { r.life -= dt; c.globalAlpha = Math.max(0, r.life * 1.5); c.strokeStyle = r.color; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, (1 - r.life * 2) * 75, 0, Math.PI * 2); c.stroke(); }
    this.rings = this.rings.filter(r => r.life > 0); c.globalAlpha = 1;
    c.restore();
  }
}

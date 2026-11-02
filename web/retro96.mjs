// Barrack '96 HD: original procedural homage artwork, no third-party game assets.
// The gameplay engine is shared with Chrome Edition. Everything expensive is cached.
import { W, H } from './engine.mjs';

let textures;

function tile(size, painter) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  painter(canvas.getContext('2d'), size);
  return canvas;
}
function noise(x, y, seed = 0) {
  let n = Math.imul(x + seed * 17, 374761393) + Math.imul(y - seed * 37, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function buildTextures() {
  if (textures) return textures;
  const open = tile(256, (c, s) => {
    const data = c.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const px = x / s * Math.PI * 4, py = y / s * Math.PI * 4;
      const folds = Math.sin(px + Math.sin(py * .75) * 1.2)
        * Math.cos(py - Math.cos(px * .7) * .9);
      const vein = Math.sin(px * 1.5 + py * .65 + Math.cos(py) * 2);
      const highlight = Math.max(0, folds + .15 * vein);
      const grain = (noise(x, y, 8) - .5) * 19;
      const i = (y * s + x) * 4;
      data.data[i] = Math.max(3, 17 + highlight * 84 + grain);
      data.data[i + 1] = Math.max(2, 6 + highlight * 9 + grain * .27);
      data.data[i + 2] = Math.max(3, 10 + highlight * 14 + grain * .4);
      data.data[i + 3] = 255;
    }
    c.putImageData(data, 0, 0);
    c.fillStyle = '#090b0d45';
    for (let y = 0; y < s; y += 4) c.fillRect(0, y, s, 1);
  });
  const captured = tile(192, (c, s) => {
    const d = c.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const gran = noise(x, y, 1);
      const crack = noise(Math.floor(x / 7), Math.floor(y / 7), 4);
      const i = (y * s + x) * 4, base = 24 + 40 * crack + 48 * gran;
      d.data[i] = base * 1.3; d.data[i + 1] = base * .41;
      d.data[i + 2] = base * .31; d.data[i + 3] = 255;
    }
    c.putImageData(d, 0, 0);
    // Three heavy blades, like the original game's repeating spiral-metal relief.
    c.save(); c.translate(s / 2, s / 2);
    for (let k = 0; k < 3; k++) {
      c.save(); c.rotate(k * Math.PI * 2 / 3);
      const blade = c.createLinearGradient(-66, -55, 74, 65);
      blade.addColorStop(0, '#11191c'); blade.addColorStop(.34, '#526064');
      blade.addColorStop(.48, '#182022'); blade.addColorStop(1, '#05090c');
      c.beginPath(); c.moveTo(-10, -9);
      c.bezierCurveTo(8, -54, 58, -87, 96, -72);
      c.bezierCurveTo(51, -45, 54, 3, 15, 24);
      c.bezierCurveTo(-5, 31, -16, 15, -10, -9);
      c.fillStyle = '#050506'; c.fill();
      c.translate(-2, -3); c.fillStyle = blade; c.fill();
      c.strokeStyle = '#9d929060'; c.lineWidth = 1.5; c.stroke();
      c.restore();
    }
    const core = c.createRadialGradient(0, 0, 2, 0, 0, 22);
    core.addColorStop(0, '#222b30'); core.addColorStop(.48, '#060a0c'); core.addColorStop(1, '#6a2b21');
    c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fillStyle = core; c.fill();
    c.restore();
    c.strokeStyle = '#120d0c55'; c.lineWidth = 3; c.strokeRect(1, 1, s - 2, s - 2);
  });
  return (textures = { open, captured });
}
function ballColor(kind, index) {
  return ({ standard: '#56bceb', ember: '#e65329', heavy: '#9874df', watcher: '#54daab', pulse: '#f13d8c' })[kind]
    || ['#5bc6e9', '#fd7a3e', '#938eff', '#eb3e8e'][index % 4];
}
function drawOrb(c, b, color, t, reduced) {
  const r = b.r;
  c.save(); c.translate(b.x, b.y);
  c.fillStyle = '#000b'; c.beginPath(); c.ellipse(3, r * .66 + 3, r * 1.05, r * .55, -.25, 0, Math.PI * 2); c.fill();
  // Reflected light and an exaggerated chrome horizon create a pre-rendered sphere feel.
  const shell = c.createRadialGradient(-r * .34, -r * .47, 0, r * .12, r * .16, r * 1.35);
  shell.addColorStop(0, '#ffffff');
  shell.addColorStop(.12, '#e0f9ff');
  shell.addColorStop(.22, color);
  shell.addColorStop(.42, '#15232d');
  shell.addColorStop(.56, color);
  shell.addColorStop(.69, '#060b13');
  shell.addColorStop(.83, '#7d9ca9');
  shell.addColorStop(1, '#06090b');
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = shell; c.fill();
  c.strokeStyle = '#d6d0b7'; c.lineWidth = Math.max(.8, r * .085); c.stroke();
  c.save(); c.beginPath(); c.arc(0, 0, r - .9, 0, Math.PI * 2); c.clip();
  c.rotate(reduced ? 0 : t * (b.kind === 'heavy' ? .65 : 1.4) + b.x * .013);
  for (let k = 0; k < 3; k++) {
    c.rotate(Math.PI * 2 / 3);
    c.fillStyle = '#070e19b9';
    c.beginPath(); c.ellipse(r * .36, 0, r * .22, r * .72, -.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#d8f4ffbb'; c.lineWidth = r * .11;
    c.beginPath(); c.arc(r * .38, 0, r * .27, -.9, .8); c.stroke();
  }
  if (b.kind === 'watcher') {
    const a = Math.atan2(b.vy || 0, b.vx || 1);
    c.rotate(-t * 1.4 - b.x * .013);
    c.fillStyle = '#dbf9e4'; c.beginPath(); c.arc(Math.cos(a) * r * .13, Math.sin(a) * r * .13, r * .52, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#182a23'; c.beginPath(); c.arc(Math.cos(a) * r * .28, Math.sin(a) * r * .28, r * .29, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  c.lineWidth = Math.max(1, r * .12); c.strokeStyle = '#ffffffd9';
  c.beginPath(); c.arc(-r * .08, -r * .06, r * .73, 3.55, 4.92); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-r * .42, -r * .45, r * .13, r * .075, -.55, 0, Math.PI * 2); c.fill();
  if (b.kind === 'pulse') {
    c.strokeStyle = '#f747a1a0'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, r + 3 + (reduced ? 0 : 2 * Math.sin(t * 5)), 0, Math.PI * 2); c.stroke();
  }
  c.restore();
}
export class RetroRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.rings = [];
    this.shake = 0;
    this.reduced = false;
    this.textures = buildTextures();
  }
  burst(x, y, color, count = 25) {
    if (this.reduced) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 45 + Math.random() * 210;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .35 + Math.random() * .55, color });
    }
    this.particles = this.particles.slice(-160);
    this.rings.push({ x, y, life: .55, color });
  }
  draw(game, aim, axis, dt, time, demo = false) {
    const c = this.ctx;
    c.setTransform(this.canvas.width / W, 0, 0, this.canvas.height / H, 0, 0);
    c.clearRect(0, 0, W, H);
    c.save();
    if (this.shake > 0 && !this.reduced) {
      c.translate((Math.random() - .5) * 8 * this.shake, (Math.random() - .5) * 8 * this.shake);
      this.shake = Math.max(0, this.shake - dt * 2.8);
    }
    // Captured areas are the complement of the open regions, so draw them first.
    c.fillStyle = c.createPattern(this.textures.captured, 'repeat');
    c.fillRect(0, 0, W, H);
    for (const region of game.regions) {
      c.save();
      c.beginPath(); c.rect(region.x, region.y, region.w, region.h); c.clip();
      c.fillStyle = c.createPattern(this.textures.open, 'repeat');
      c.fillRect(region.x, region.y, region.w, region.h);
      const edge = c.createLinearGradient(region.x, region.y, region.x + region.w, region.y + region.h);
      edge.addColorStop(0, '#00000005'); edge.addColorStop(1, '#00000060');
      c.fillStyle = edge; c.fillRect(region.x, region.y, region.w, region.h);
      c.strokeStyle = '#08090a'; c.lineWidth = 5;
      c.strokeRect(region.x + 1.5, region.y + 1.5, region.w - 3, region.h - 3);
      c.strokeStyle = '#817b6caa'; c.lineWidth = 1.4;
      c.strokeRect(region.x + 4, region.y + 4, region.w - 8, region.h - 8);
      c.restore();
    }
    for (const patch of game.captured) {
      if (patch.age < .8 && !this.reduced) {
        c.fillStyle = 'rgba(255,159,54,' + ((1 - patch.age / .8) * .36) + ')';
        c.fillRect(patch.x, patch.y, patch.w, patch.h);
      }
    }
    if (game.slow) { c.fillStyle = '#5f76ff12'; c.fillRect(0, 0, W, H); }
    const active = game.state === 'playing';
    for (let i = 0; i < game.balls.length; i++) {
      const b = game.balls[i], col = ballColor(b.kind, i);
      if (!this.reduced && active) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 10) b.trail.shift();
      }
      if (!this.reduced && Array.isArray(b.trail)) {
        c.save();
        b.trail.forEach((pt, k) => {
          c.globalAlpha = .015 + .075 * (k / b.trail.length);
          c.fillStyle = col;
          c.beginPath(); c.arc(pt.x, pt.y, b.r * (.28 + .55 * k / b.trail.length), 0, Math.PI * 2); c.fill();
        });
        c.restore();
      }
      drawOrb(c, b, col, time, this.reduced);
    }
    if (game.beam) {
      const b = game.beam;
      const x1 = b.axis === 'h' ? b.a : b.x, y1 = b.axis === 'v' ? b.a : b.y;
      const x2 = b.axis === 'h' ? b.b : b.x, y2 = b.axis === 'v' ? b.b : b.y;
      c.save();
      c.strokeStyle = '#000'; c.lineWidth = 12;
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      c.shadowColor = game.shield ? '#5eb9ff' : '#ff6e24';
      c.shadowBlur = this.reduced ? 0 : 17;
      c.strokeStyle = game.shield ? '#48a8ea' : '#fd5a19'; c.lineWidth = 6; c.stroke();
      c.strokeStyle = '#ffdb91'; c.lineWidth = 2; c.stroke();
      c.shadowBlur = 0;
      for (const p of [[x1, y1], [x2, y2]]) {
        c.translate(p[0], p[1]);
        c.fillStyle = '#1f2528'; c.fillRect(-6, -7, 12, 14);
        c.strokeStyle = '#d1c9a9'; c.lineWidth = 2; c.strokeRect(-6, -7, 12, 14);
        c.translate(-p[0], -p[1]);
      }
      c.restore();
    }
    if (aim && !game.beam && active) {
      const r = game.regionAt(aim.x, aim.y);
      c.save();
      if (r) {
        c.setLineDash([4, 9]);
        c.strokeStyle = '#d9a66ba9'; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(axis === 'h' ? r.x : aim.x, axis === 'v' ? r.y : aim.y);
        c.lineTo(axis === 'h' ? r.x + r.w : aim.x, axis === 'v' ? r.y + r.h : aim.y);
        c.stroke(); c.setLineDash([]);
      }
      c.translate(aim.x, aim.y);
      if (axis === 'v') c.rotate(Math.PI / 2);
      const gun = c.createLinearGradient(-17, -8, 17, 8);
      gun.addColorStop(0, '#121b23'); gun.addColorStop(.35, '#aab8bd');
      gun.addColorStop(.51, '#3e515a'); gun.addColorStop(1, '#0d1419');
      c.fillStyle = gun; c.strokeStyle = '#13191f'; c.lineWidth = 2;
      c.fillRect(-19, -5, 38, 10); c.strokeRect(-19, -5, 38, 10);
      c.fillStyle = r ? '#fba357' : '#b54751';
      c.fillRect(-3, -7, 6, 14);
      c.restore();
    }
    if (!demo) {
      c.fillStyle = '#0009';
      c.fillRect(0, 0, W, 6); c.fillRect(0, H - 6, W, 6);
      c.fillRect(0, 0, 6, H); c.fillRect(W - 6, 0, 6, H);
    }
    for (const p of this.particles) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .98; p.vy *= .98;
      c.globalAlpha = Math.max(0, p.life * 1.2); c.fillStyle = p.color;
      c.fillRect(p.x, p.y, 3, 3);
    }
    this.particles = this.particles.filter(p => p.life > 0);
    c.globalAlpha = 1;
    for (const ring of this.rings) {
      ring.life -= dt;
      c.globalAlpha = Math.max(0, ring.life);
      c.strokeStyle = ring.color; c.lineWidth = 3;
      c.beginPath(); c.arc(ring.x, ring.y, (1 - ring.life / .55) * 86, 0, Math.PI * 2); c.stroke();
    }
    this.rings = this.rings.filter(r => r.life > 0);
    c.globalAlpha = 1;
    c.restore();
  }
}
// Shared procedural sprites. All symbols are drawn in Canvas at game coordinates.
import { BONUSES } from './engine.mjs';

const PI = Math.PI, TAU = PI * 2;
function path(c, pts, close = true) {
  c.beginPath();
  pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (close) c.closePath();
}
function emblem(c, kind) {
  c.save();
  c.strokeStyle = '#fff8e4'; c.fillStyle = '#fff8e4';
  c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 3;
  if (kind === 'haste') {
    path(c, [[1,-13],[-9,2],[-2,2],[-5,13],[10,-5],[2,-5]]); c.fill();
  } else if (kind === 'laser') {
    c.strokeRect(-10,-3,20,6);
    path(c, [[-5,-5],[-1,-10],[3,-5]]); c.fill();
    c.beginPath(); c.moveTo(10,0); c.lineTo(16,0); c.stroke();
  } else if (kind === 'magnet') {
    c.beginPath(); c.moveTo(-9,-9); c.lineTo(-9,3);
    c.arc(0,3,9,PI,0,true); c.lineTo(9,-9); c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(-12,-11,6,5); c.fillRect(6,-11,6,5);
  } else if (kind === 'life') {
    c.fillRect(-3,-12,6,24); c.fillRect(-12,-3,24,6);
  } else if (kind === 'multiplier') {
    c.font = '900 15px Arial,sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('2×', 0, 1);
  } else if (kind === 'nuke') {
    c.beginPath(); c.arc(0,0,3.4,0,TAU); c.fill();
    for(let i=0;i<3;i++) {
      c.beginPath(); c.moveTo(0,0); c.arc(0,0,12,i*TAU/3+.14,i*TAU/3+.92); c.closePath(); c.fill();
    }
  }
  c.restore();
}
export function drawPickups(c, game, time, reduced = false) {
  if (!Array.isArray(game.pickups) || game.pickups.length === 0) return;
  for (const p of game.pickups) {
    const spec = BONUSES[p.kind];
    if (!spec) continue;
    const life = (p.ttl - p.age);
    if (life <= 0) continue;
    const pulse = reduced ? 1 : 1 + .09 * Math.sin(time * 6 + p.id * 2);
    const blink = life < 3 && !reduced ? (.4 + .6 * Math.abs(Math.sin(time * 10))) : 1;
    c.save(); c.translate(p.x, p.y); c.globalAlpha *= blink;
    c.scale(pulse, pulse);
    if (!reduced) {
      c.shadowColor = spec.color; c.shadowBlur = 13;
    }
    const shell = c.createRadialGradient(-5,-6,1,0,0,21);
    shell.addColorStop(0,'#fffbd8');
    shell.addColorStop(.2,spec.color);
    shell.addColorStop(.7,spec.color);
    shell.addColorStop(1,'#151b28');
    c.fillStyle = shell;
    c.beginPath(); c.arc(0,0,20,0,TAU); c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = '#fff2c6'; c.lineWidth=2;
    c.beginPath(); c.arc(0,0,18,0,TAU); c.stroke();
    c.rotate(reduced ? 0 : time * .7);
    c.strokeStyle='#fff5cb9d'; c.lineWidth=1.6;
    for(let k=0;k<4;k++) {
      const a = k * PI / 2;
      c.beginPath(); c.moveTo(Math.cos(a)*21,Math.sin(a)*21);
      c.lineTo(Math.cos(a)*25,Math.sin(a)*25); c.stroke();
    }
    c.rotate(reduced ? 0 : -time*.7);
    c.fillStyle='#15141c9c'; c.beginPath(); c.arc(0,0,14.8,0,TAU); c.fill();
    emblem(c,p.kind);
    c.restore();
  }
}
export function drawSpecialBallAccent(c, ball, time, reduced = false) {
  const {kind,x,y,r} = ball;
  if (!['gravity','glass','shard','sentry','nuke'].includes(kind)) return;
  c.save(); c.translate(x,y);
  if (kind === 'glass' || kind === 'shard') {
    c.strokeStyle='#edffffee'; c.lineWidth=kind==='shard'?1:1.7;
    path(c,[[-r*.7,-r*.25],[r*.2,-r*.55],[r*.1,r*.16],[r*.7,r*.28]],false);c.stroke();
    c.beginPath();c.moveTo(r*.1,r*.16);c.lineTo(-r*.16,r*.7);c.stroke();
    c.fillStyle='#ffffffaa';path(c,[[-r*.5,-r*.4],[-r*.1,-r*.65],[r*.05,-r*.2]]);c.fill();
  } else if (kind === 'gravity') {
    c.strokeStyle='#f9d884';c.lineWidth=2;
    c.beginPath();c.moveTo(0,-r*.52);c.lineTo(0,r*.58);c.stroke();
    path(c,[[-r*.29,r*.25],[0,r*.65],[r*.29,r*.25]]);c.fillStyle='#ffe6a2';c.fill();
  } else if (kind === 'sentry') {
    const a = Math.atan2(ball.vy,ball.vx);
    c.rotate(a);
    c.fillStyle='#050a11';c.beginPath();c.ellipse(r*.07,0,r*.6,r*.43,0,0,TAU);c.fill();
    c.fillStyle='#eafbd3';c.beginPath();c.arc(r*.35,0,r*.22,0,TAU);c.fill();
    c.fillStyle='#15191a';c.beginPath();c.arc(r*.4,0,r*.12,0,TAU);c.fill();
  } else if (kind === 'nuke') {
    c.rotate(reduced ? 0 : time*.7);
    c.strokeStyle='#ffdf9f';c.lineWidth=2;
    for(let i=0;i<3;i++) {
      const a = i*TAU/3;
      c.beginPath();c.arc(0,0,r*.57,a+.05,a+.82);c.stroke();
    }
    c.fillStyle='#ffce56';c.beginPath();c.arc(0,0,r*.18,0,TAU);c.fill();
  }
  c.restore();
}
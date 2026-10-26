import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, W, H, inside, rng } from '../web/engine.mjs';
function advance(g, seconds) { for (let i = 0; i < seconds * 120; i++) g.update(1 / 120); }
function stillBall(g, x, y) { g.balls = [{ ...g.balls[0], x, y, vx: 0, vy: 0, kind: 'chrome', region: g.regions[0].id }]; }
function validate(g) {
  assert.ok(g.percent >= 0 && g.percent <= 100);
  for (const r of g.regions) assert.ok(r.w > 0 && r.h > 0);
  for (const b of g.balls) { const r = g.regions.find(r => r.id === b.region); assert.ok(r, 'ball has a region'); assert.ok(inside(r, b.x, b.y, b.r - .00001), `ball is contained in region at stage ${g.stage}`); assert.ok(Number.isFinite(b.x + b.y + b.vx + b.vy)); }
}
test('deterministic spawns and simulation', () => { const a = new Game({ seed: 42 }), b = new Game({ seed: 42 }); advance(a, 10); advance(b, 10); assert.deepEqual(a.balls, b.balls); });
test('a finished barrier captures only the empty side', () => { const g = new Game({ seed: 1 }); stillBall(g, 800, 400); assert.equal(g.fire(480, 320, 'v'), true); advance(g, 1); assert.equal(g.regions.length, 1); assert.ok(g.percent > 49 && g.percent < 51); assert.ok(g.regions[0].x > 480); validate(g); });
test('occupied sides both remain open', () => { const g = new Game({ seed: 1 }); stillBall(g, 200, 400); g.balls.push({ ...g.balls[0], x: 800 }); g.fire(480, 320, 'v'); advance(g, 1); assert.equal(g.regions.length, 2); assert.ok(g.percent < 1); validate(g); });
test('collision destroys active barrier and removes exactly one life', () => { const g = new Game({ seed: 1 }); stillBall(g, 700, 320); const lives = g.lives; g.fire(480, 320, 'h'); advance(g, 2); assert.equal(g.lives, lives - 1); assert.equal(g.beam, null); assert.equal(g.percent, 0); });
test('shield protects a life but still cancels the cut', () => { const g = new Game({ seed: 1 }); stillBall(g, 700, 320); g.power('shield'); g.fire(480, 320, 'h'); advance(g, 2); assert.equal(g.lives, 5); assert.equal(g.shield, 0); assert.equal(g.beam, null); });
test('slow and boost expire and inventory is finite; classic rejects powers', () => { const g = new Game({ seed: 1 }); assert.ok(g.power('slow')); assert.equal(g.power('slow'), false); advance(g, 6); assert.equal(g.slow, 0); assert.ok(g.power('slow')); advance(g, 6); assert.equal(g.power('slow'), false); const c = new Game({ mode: 'classic' }); assert.equal(c.power('shield'), false); });
test('80 percent clears stage; next refills powers and advances', () => { const g = new Game({ seed: 1 }); stillBall(g, 900, 500); g.fire(800, 320, 'v'); advance(g, 1); assert.equal(g.state, 'cleared'); assert.ok(g.percent >= 80); assert.equal(g.lives, 6); g.next(); assert.equal(g.stage, 2); assert.equal(g.percent, 0); assert.equal(g.state, 'playing'); });
test('survival times out and pauses safely', () => { const g = new Game({ mode: 'survival' }); g.time = .5; g.state = 'paused'; advance(g, 1); assert.equal(g.time, .5); g.state = 'playing'; advance(g, 1); assert.equal(g.state, 'over'); assert.equal(g.time, 0); });
test('survival clear awards time once', () => { const g = new Game({ mode: 'survival', seed: 1 }); stillBall(g, 900, 500); g.fire(800, 320, 'v'); advance(g, 1); assert.equal(g.state, 'cleared'); assert.ok(g.time > 119 && g.time < 120); const t = g.time; advance(g, 2); assert.equal(g.time, t); });
test('last campaign sector reaches win screen', () => { const g = new Game({ stage: 12 }); g.state = 'cleared'; g.next(); assert.equal(g.state, 'won'); });
test('invalid placement and duplicate firing are rejected', () => { const g = new Game({ seed: 1 }); assert.equal(g.fire(-2, 20, 'h'), false); assert.equal(g.fire(NaN, 20, 'h'), false); assert.equal(g.fire(480, 320, 'q'), false); assert.equal(g.fire(480, 320, 'h'), true); assert.equal(g.fire(400, 400, 'h'), false); });
test('all 12 layouts and 3 difficulties contain balls over 60 simulated seconds', () => {
  for (const difficulty of ['relaxed', 'normal', 'expert']) for (let stage = 1; stage <= 12; stage++) {
    const g = new Game({ stage, difficulty, seed: stage * 73 });
    for (let i = 0; i < 60 * 60; i++) { g.update(1 / 60); validate(g); }
  }
});
test('100 seeded runs: attempted cuts preserve containment and finite scores', () => {
  let cuts = 0, hits = 0, clears = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const random = rng(seed), g = new Game({ seed, stage: 1 + seed % 12, onEvent: e => { if (e.type === 'capture') cuts++; if (e.type === 'hit') hits++; if (e.type === 'clear') clears++; } });
    for (let tick = 0; tick < 60 * 90 && g.state === 'playing'; tick++) {
      if (tick % 90 === 0) { const r = g.regions[Math.floor(random() * g.regions.length)]; g.fire(r.x + r.w * (.15 + random() * .7), r.y + r.h * (.15 + random() * .7), random() < .5 ? 'h' : 'v'); }
      g.update(1 / 60); validate(g); assert.ok(Number.isFinite(g.score));
    }
  }
  console.log(`Stress results: 100 runs, ${cuts} completed barriers, ${hits} hits, ${clears} stage clears. Random inputs, not human balance testing.`);
  assert.ok(cuts > 100); assert.ok(hits > 0);
});

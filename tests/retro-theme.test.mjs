import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, W, H } from '../web/engine.mjs';
import { RetroRenderer } from '../web/retro96.mjs';

function context() {
  const gradient = { addColorStop() {} };
  const target = {
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    createPattern: () => ({}),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient
  };
  return new Proxy(target, {
    get(obj, key) { return key in obj ? obj[key] : () => {}; },
    set(obj, key, value) { obj[key] = value; return true; }
  });
}
globalThis.document = {
  createElement() {
    const c = context();
    return { width: 0, height: 0, getContext: () => c };
  }
};
function renderer() {
  const c = context();
  return new RetroRenderer({ width: W, height: H, getContext: () => c });
}
test('retro art initializes texture caches and renders an untouched game', () => {
  const r = renderer(), game = new Game({ seed: 12 });
  assert.equal(r.textures.open.width, 256);
  assert.equal(r.textures.captured.width, 192);
  assert.doesNotThrow(() => r.draw(game, { x: 430, y: 300 }, 'h', 1 / 60, 0));
});
test('retro art renders every ball type, active beams, and reduces motion', () => {
  const r = renderer(), game = new Game({ stage: 8, seed: 8 });
  r.reduced = true;
  assert.doesNotThrow(() => r.draw(game, game.aim, 'v', 1 / 60, 3));
  game.balls = [];
  assert.ok(game.fire(230, 320, 'h'));
  assert.doesNotThrow(() => r.draw(game, game.aim, 'h', 1 / 60, 3.1));
  r.burst(400, 300, '#ffaa00', 20);
  assert.equal(r.particles.length, 0);
});
test('retro effects, captured tiles, and attract mode stay renderable', () => {
  const r = renderer(), game = new Game({ seed: 4 });
  r.burst(200, 250, '#f33', 8);
  game.captured = [{ x: 0, y: 0, w: 400, h: 640, age: .1 }];
  game.regions = [{ x: 406, y: 0, w: W - 406, h: H, id: 9 }];
  assert.doesNotThrow(() => r.draw(game, game.aim, 'v', 1 / 60, 6, true));
  assert.equal(r.particles.length, 8);
  r.reduced = true;
  assert.doesNotThrow(() => r.draw(game, game.aim, 'h', 1 / 60, 7));
});

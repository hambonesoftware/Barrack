import { Game } from '../web/engine.mjs';
const g = new Game({ seed: 20261026 });
function fork(g) { const copy = Object.create(Game.prototype); for (const k of Object.keys(g)) copy[k] = typeof g[k] === 'function' ? g[k] : structuredClone(g[k]); copy.onEvent = () => {}; return copy; }
function advance(g, sec) { for (let n = 0; n < sec * 120 && g.state === 'playing'; n++) g.update(1 / 120); }
let attempts = 0;
while (g.state !== 'won' && g.state !== 'over' && attempts < 1500) {
  if (g.state === 'cleared') { console.log(`Sector ${g.stage}: ${g.percent.toFixed(1)}%, ${g.cuts} cumulative cuts, ${g.lives} lives`); g.next(); continue; }
  let chosen = null;
  for (const r of g.regions) for (const axis of ['h', 'v']) for (const ratio of [.12, .24, .38, .5, .62, .76, .88]) {
    const x = r.x + r.w * (axis === 'v' ? ratio : .5), y = r.y + r.h * (axis === 'h' ? ratio : .5), t = fork(g);
    if (!t.fire(x, y, axis)) continue;
    advance(t, 1.8);
    if (t.lives >= g.lives && t.percent > g.percent && (!chosen || t.percent > chosen.percent)) chosen = { x, y, axis, percent: t.percent };
  }
  if (chosen) { g.fire(chosen.x, chosen.y, chosen.axis); advance(g, 1.8); } else advance(g, .25);
  attempts++;
}
console.log(`Predictive engine playthrough: state=${g.state}, stage=${g.stage}, score=${g.score}, cuts=${g.cuts}, simulatedSeconds=${g.totalTime.toFixed(1)}`);
if (g.state !== 'won') process.exitCode = 1;

import { Game, W, H, STAGES, TYPES } from './engine.mjs';
import { Renderer } from './render.mjs';
import { Audio } from './audio.mjs';
const $ = id => document.getElementById(id);
const defaults = { sfx: .5, music: .15, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
let saved = { best: {}, unlocked: 1, achievements: [], settings: defaults };
try { const v = JSON.parse(localStorage.getItem('barrack-plus-v1')); if (v && typeof v === 'object') saved = { ...saved, ...v, settings: { ...defaults, ...v.settings } }; } catch {}
if (!saved.best || typeof saved.best !== 'object') saved.best = {};
if (!Array.isArray(saved.achievements)) saved.achievements = [];
saved.unlocked = Math.min(12, Math.max(1, Number(saved.unlocked) || 1));
const save = () => { try { localStorage.setItem('barrack-plus-v1', JSON.stringify(saved)); } catch {} };
const audio = new Audio(saved.settings), renderer = new Renderer($('arena')), attractRenderer = new Renderer($('attract'));
let mode = 'enhanced', axis = 'h', game = null, aim = { x: W / 2, y: H / 2 }, last = 0, toastTime = 0, pointer = null, demoTime = 0, hudClock = 0;
const keys = new Set();
const records = [ ['first', 'First incision', 'Complete your first barrier.'], ['large', 'A clean sweep', 'Reclaim 35% with a single barrier.'], ['perfect', 'Untouchable', 'Clear a sector without losing a life.'], ['five', 'On a roll', 'Clear five sectors in one run.'], ['score', 'Five figures', 'Score 10,000 points in one run.'], ['campaign', 'Containment complete', 'Finish all 12 campaign sectors.'] ];
const pad = (n, width = 6) => Math.floor(n).toString().padStart(width, '0');
function unlock(id) { if (!saved.achievements.includes(id)) { saved.achievements.push(id); save(); } }
function updateHome() {
  $('homeBest').textContent = pad(saved.best[`${mode}:${$('difficulty').value}`] || 0);
  $('achievementCount').textContent = `${saved.achievements.length} / 6`;
  $('stageLabel').hidden = mode !== 'enhanced';
  $('stageSelect').replaceChildren(...STAGES.slice(0, saved.unlocked).map((s, i) => { const o = document.createElement('option'); o.value = i + 1; o.textContent = `${pad(i + 1, 2)} · ${s}`; return o; }));
}
function best() { if (!game) return; const key = `${game.mode}:${game.difficulty}`; saved.best[key] = Math.max(saved.best[key] || 0, game.score); save(); }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); toastTime = 2; }
function event(e) {
  audio.effect(e.type);
  if (e.type === 'fire') renderer.burst(e.x, e.y, '#c7f68b', 10);
  if (e.type === 'capture') { renderer.burst(e.x, e.y, '#c7f68b', 28); toast(`+${e.gain.toFixed(1)}% RECLAIMED`); unlock('first'); if (e.gain >= 35) unlock('large'); }
  if (e.type === 'hit') { renderer.burst(e.x, e.y, '#ff9158', 45); renderer.shake = .7; toast('BARRIER BREACHED · −1 LIFE'); }
  if (e.type === 'shield') { renderer.burst(e.x, e.y, '#c5a2ff'); toast('LIFE PROTECTED · SHIELD USED'); }
  if (e.type === 'invalid') toast('MOVE THE EMITTER CLEAR OF THE BALL');
  if (e.type === 'power') toast({ slow: 'TIME DILATION · 5 SECONDS', shield: 'BEAM INSURANCE ARMED', boost: 'OVERDRIVE · 5 SECONDS' }[e.kind]);
  if (e.type === 'clear') {
    if (e.perfect) unlock('perfect'); if (game.clears >= 5) unlock('five');
    if (game.mode === 'enhanced') saved.unlocked = Math.max(saved.unlocked, Math.min(12, game.stage + 1));
    best(); showClear(e);
  }
  if (e.type === 'over' || e.type === 'won') { if (e.type === 'won') unlock('campaign'); best(); showEnd(e.type === 'won'); }
  if (game && game.score >= 10000) unlock('score');
}
function start() {
  closeModal(); audio.unlock(); keys.clear(); game = new Game({ mode, stage: mode === 'enhanced' ? Number($('stageSelect').value) : 1, difficulty: $('difficulty').value, onEvent: event });
  aim = { x: W / 2, y: H / 2 }; game.aim = aim; renderer.particles = []; renderer.rings = [];
  document.body.classList.add('playing'); $('home').hidden = true; $('play').hidden = false; $('arena').focus({ preventScroll: true }); window.scrollTo(0, 0); refreshStage(); hud();
}
function refreshStage() {
  $('modeName').textContent = { enhanced: 'ENHANCED CAMPAIGN', classic: 'CLASSIC ARCADE', survival: 'SURVIVAL / AGAINST THE CLOCK' }[game.mode];
  $('sectorName').textContent = `${pad(game.stage, 2)} / ${(STAGES[(game.stage - 1) % STAGES.length]).toUpperCase()}`;
  $('powerDescription').textContent = game.mode === 'classic' ? 'Classic is pure skill. Tactical powers are disabled.' : 'A little help when the field fights back.';
  $('enemyList').innerHTML = [...new Set(game.balls.map(b => b.kind))].map(k => `<div class="enemy-item"><span class="orb-swatch" style="--orb:${TYPES[k].color}"></span><div><b>${TYPES[k].label.toUpperCase()}</b><small>${TYPES[k].detail}</small></div></div>`).join('');
  $('timeLabel').textContent = game.mode === 'survival' ? 'TIME LEFT' : 'SECTOR';
  toast('CONTAIN THE FIELD · RECLAIM 80%');
}
function hud() {
  if (!game) return;
  $('score').textContent = pad(game.score); $('lives').textContent = '● '.repeat(game.lives).trim() || '—'; $('lives').setAttribute('aria-label', `${game.lives} lives remaining`);
  $('stageNumber').textContent = game.mode === 'survival' ? `${Math.ceil(game.time)}s` : `${pad(game.stage, 2)}${game.mode === 'enhanced' ? ' / 12' : ''}`;
  $('percent').innerHTML = `${game.percent.toFixed(1)}<span>%</span>`; $('progressFill').style.width = `${game.percent}%`;
  for (const p of ['slow', 'shield', 'boost']) { const active = game[p] > 0; $(`${p}Count`).textContent = active ? p === 'shield' ? 'ON' : `${Math.ceil(game[p])}s` : game.powers[p]; $(`${p}Button`).disabled = game.state !== 'playing' || !game.powers[p] || active; $(`${p}Button`).classList.toggle('on', active); }
  $('fireButton').disabled = game.state !== 'playing' || !!game.beam;
}
function modal(content) { keys.clear(); pointer = null; $('modalContent').innerHTML = content; if (!$('modal').open) $('modal').showModal(); }
function closeModal() { if ($('modal').open) $('modal').close(); }
function pause() { if (!game || game.state !== 'playing') return; game.state = 'paused'; hud(); modal(`<div class="eyebrow">TAKE A BREATHER</div><h2>FIELD ON HOLD.</h2><p>Your next move can wait. The arena is paused.</p><button class="primary" id="resume">BACK TO THE FIELD ↗</button><button class="outline" id="restart">RESTART RUN</button><button class="outline" id="menu">MAIN MENU</button>`); $('resume').onclick = resume; $('restart').onclick = () => confirmRestart(); $('menu').onclick = menu; }
function resume() { closeModal(); if (game?.state === 'paused') game.state = 'playing'; keys.clear(); last = performance.now(); $('arena').focus({ preventScroll: true }); }
function menu() { if (game) best(); closeModal(); game = null; document.body.classList.remove('playing'); keys.clear(); $('play').hidden = true; $('home').hidden = false; updateHome(); window.scrollTo(0, 0); }
function confirmRestart() { modal('<div class="eyebrow">START FRESH</div><h2>ANOTHER SHOT?</h2><p>This ends your current run. Your personal best is saved.</p><button class="primary" id="confirmRestart">RESTART RUN ↗</button><button class="outline" id="cancelRestart">KEEP THIS RUN</button>'); $('confirmRestart').onclick = () => { best(); start(); }; $('cancelRestart').onclick = () => { game.state = 'playing'; pause(); }; }
function showClear(e) {
  modal(`<div class="eyebrow">SECTOR ${pad(game.stage, 2)} / SECURED</div><h2>${e.perfect ? 'CLEAN. PRECISE.<br>UNTOUCHABLE.' : 'CHAOS, CONTAINED.'}</h2><p>${e.perfect ? 'A flawless sector. No lives lost.' : 'Another piece of the field belongs to you.'} ${game.mode === 'survival' ? '30 seconds added to the clock.' : 'One life restored, up to seven.'}</p><div class="result-stats"><div>RECLAIMED<strong>${game.percent.toFixed(1)}%</strong></div><div>SECTOR BONUS<strong>+${e.bonus}</strong></div></div><button class="primary" id="next">${game.mode === 'enhanced' && game.stage === 12 ? 'COMPLETE CAMPAIGN' : 'NEXT SECTOR'} ↗</button><button class="outline" id="menu">MAIN MENU</button>`);
  $('next').onclick = () => { closeModal(); game.next(); if (game.state === 'playing') { refreshStage(); $('arena').focus({ preventScroll: true }); } }; $('menu').onclick = menu;
}
function showEnd(won) {
  modal(`<div class="eyebrow">${won ? 'ALL 12 SECTORS SECURED' : 'RUN COMPLETE'}</div><h2>${won ? 'MASTER OF<br>THE FIELD.' : 'ONE MORE<br>ROUND?'}</h2><p>${won ? 'You contained every sector. Try Expert or see how long you can last in Survival.' : 'Every cut teaches you something. Take that knowledge into the next run.'}</p><div class="result-stats"><div>FINAL SCORE<strong>${pad(game.score)}</strong></div><div>SECTORS CLEARED<strong>${pad(game.clears, 2)}</strong></div></div><button class="primary" id="again">PLAY AGAIN ↗</button><button class="outline" id="menu">MAIN MENU</button>`); $('again').onclick = start; $('menu').onclick = menu;
}
function utility(content, setup) { const wasPlaying = game?.state === 'playing'; if (wasPlaying) game.state = 'paused'; modal(content + '<button class="primary" id="done">BACK ↗</button>'); $('done').onclick = () => { closeModal(); if (wasPlaying) resume(); else if (game?.state === 'paused') { game.state = 'playing'; pause(); } }; if (setup) setup(); }
$('settingsButton').onclick = () => utility(`<div class="eyebrow">MAKE IT YOURS</div><h2>SETTINGS.</h2><label class="setting">Sound effects <input id="sfx" type="range" min="0" max="1" step=".05" value="${saved.settings.sfx}"></label><label class="setting">Arcade soundtrack <input id="music" type="range" min="0" max="1" step=".05" value="${saved.settings.music}"></label><label class="setting">Reduced motion <input id="reduced" type="checkbox" ${saved.settings.reduced ? 'checked' : ''}></label><p>Settings, unlocked sectors, records, and achievements are saved in this browser. Clearing website data resets them.</p>`, () => { for (const key of ['sfx', 'music', 'reduced']) $(key).oninput = () => { saved.settings[key] = key === 'reduced' ? $(key).checked : Number($(key).value); audio.unlock(); save(); }; });
$('helpButton').onclick = () => utility('<div class="eyebrow">BRIEFING / THE BASICS</div><h2>DRAW THE LINE.</h2><div class="how-step"><strong>01</strong><p><b>Aim in open territory.</b><br>Tap or click to fire. On touch, drag to position precisely and release to fire.</p></div><div class="how-step"><strong>02</strong><p><b>Pick your direction.</b><br>Use ↔ / ↕ below the field. A barrier grows in both directions. If a ball touches it before completion, you lose a life.</p></div><div class="how-step"><strong>03</strong><p><b>Take back 80%.</b><br>Empty regions fill automatically. Regions containing balls stay open. Separate them, then cut closer.</p></div><p>Keyboard: arrows aim · Enter fires · Space rotates · P / Esc pauses · 1 / 2 / 3 use powers. Powers recharge each sector. Survival adds 30 seconds per clear.</p>');
$('achievementsButton').onclick = () => utility('<div class="eyebrow">YOUR PERSONAL COLLECTION</div><h2>FIELD RECORDS.</h2>' + records.map(([id, name, detail]) => `<div class="achievement ${saved.achievements.includes(id) ? '' : 'locked'}"><span>${saved.achievements.includes(id) ? '✦' : '◇'}</span><div><b>${name}</b><small>${detail}</small></div></div>`).join(''));
$('homeLink').onclick = e => { e.preventDefault(); if (game?.state === 'playing') pause(); else if (!game) window.scrollTo({ top: 0, behavior: 'smooth' }); };
$('pauseButton').onclick = pause; $('startButton').onclick = start; $('difficulty').onchange = updateHome;
document.querySelectorAll('[data-mode]').forEach(button => { button.onclick = () => { mode = button.dataset.mode; document.querySelectorAll('[data-mode]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); }); updateHome(); }; });
function setAxis(value) { axis = value; $('horizontal').classList.toggle('active', axis === 'h'); $('vertical').classList.toggle('active', axis === 'v'); $('horizontal').setAttribute('aria-pressed', String(axis === 'h')); $('vertical').setAttribute('aria-pressed', String(axis === 'v')); }
$('horizontal').onclick = () => setAxis('h'); $('vertical').onclick = () => setAxis('v');
function fire() { audio.unlock(); if (!game?.fire(aim.x, aim.y, axis) && game?.state === 'playing' && !game.beam && !game.regionAt(aim.x, aim.y)) toast('AIM INSIDE THE OPEN FIELD'); }
$('fireButton').onclick = fire;
for (const p of ['slow', 'shield', 'boost']) $(`${p}Button`).onclick = () => { audio.unlock(); game?.power(p); hud(); };
function point(e) { const r = $('arena').getBoundingClientRect(); return { x: Math.max(1, Math.min(W - 1, (e.clientX - r.left) / r.width * W)), y: Math.max(1, Math.min(H - 1, (e.clientY - r.top) / r.height * H)) }; }
$('arena').onpointerdown = e => { if (e.button !== 0 || pointer !== null || game?.state !== 'playing') return; audio.unlock(); aim = point(e); game.aim = aim; pointer = e.pointerId; $('arena').setPointerCapture(e.pointerId); $('arena').focus({ preventScroll: true }); if (e.pointerType === 'mouse') fire(); };
$('arena').onpointermove = e => { if (e.pointerType !== 'mouse' && e.pointerId !== pointer) return; aim = point(e); if (game) game.aim = aim; };
$('arena').onpointerup = e => { if (e.pointerId !== pointer) return; if (e.pointerType !== 'mouse') { aim = point(e); if (game) game.aim = aim; fire(); } pointer = null; if ($('arena').hasPointerCapture(e.pointerId)) $('arena').releasePointerCapture(e.pointerId); };
$('arena').onpointercancel = () => { pointer = null; };
$('arena').oncontextmenu = e => { e.preventDefault(); setAxis(axis === 'h' ? 'v' : 'h'); };
window.addEventListener('keydown', e => {
  if (!game || $('modal').open || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape', 'p', 'P', '1', '2', '3'].includes(e.key)) {
    // Preserve ordinary Enter activation on focused buttons.
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') return;
    e.preventDefault(); keys.add(e.key);
    if (!e.repeat) { if (e.key === ' ') setAxis(axis === 'h' ? 'v' : 'h'); if (e.key === 'Enter') fire(); if (['Escape', 'p', 'P'].includes(e.key)) pause(); if (['1', '2', '3'].includes(e.key)) game.power(['slow', 'shield', 'boost'][Number(e.key) - 1]); }
  }
});
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => { keys.clear(); if (game?.state === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game?.state === 'playing') pause(); });
$('modal').addEventListener('cancel', e => { e.preventDefault(); if ($('resume')) resume(); else if ($('done')) $('done').click(); });
if (matchMedia('(pointer:coarse)').matches) $('controlHint').textContent = 'Touch & drag to aim · Release to fire · Choose ↔ or ↕ below the field';
const demo = new Game({ mode: 'enhanced', stage: 6, seed: 17 });
demo.regions = [{ x: 0, y: 0, w: 375, h: 640, id: 0 }, { x: 381, y: 0, w: 579, h: 320, id: 1 }];
demo.balls = demo.balls.slice(0, 5); demo.balls.forEach((b, i) => { const r = demo.regions[i % 2]; b.region = r.id; b.x = r.x + 45 + i * 41; b.y = r.y + 75 + i * 29; });
function frame(now) {
  const dt = Math.min((now - last) / 1000 || 0, .05); last = now; renderer.reduced = attractRenderer.reduced = saved.settings.reduced;
  if (game) {
    if (game.state === 'playing' && !$('modal').open) {
      const dx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0), dy = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
      aim.x = Math.max(6, Math.min(W - 6, aim.x + dx * 350 * dt)); aim.y = Math.max(6, Math.min(H - 6, aim.y + dy * 350 * dt)); game.aim = aim; game.update(dt);
    }
    renderer.draw(game, aim, axis, dt, now / 1000); audio.update(game.state === 'playing');
    hudClock += dt; if (hudClock > .08) { hud(); hudClock = 0; }
    if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) $('toast').classList.remove('visible'); }
  } else {
    demoTime += dt; if (!saved.settings.reduced && !document.hidden) demo.update(dt);
    attractRenderer.draw(demo, { x: 240, y: 280 }, 'h', dt, now / 1000, true);
  }
  requestAnimationFrame(frame);
}
updateHome(); requestAnimationFrame(frame);

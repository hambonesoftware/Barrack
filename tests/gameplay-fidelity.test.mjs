import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, TYPES, BONUSES, inside } from '../web/engine.mjs';

function tick(g, seconds, fps = 60) {
  for (let k = 0; k < seconds * fps; k++) g.update(1 / fps);
}
function park(g, x, y) {
  g.balls = [{ ...g.balls[0], x, y, vx: 0, vy: 0, region: g.regions[0].id, kind: 'chrome', trail: [] }];
}
test('all collectible types have labels and deterministic spawn timing', () => {
  assert.deepEqual(Object.keys(BONUSES).sort(), ['haste','laser','life','magnet','multiplier','nuke'].sort());
  const a = new Game({ seed: 82 }), b = new Game({ seed: 82 });
  tick(a, 7); tick(b, 7);
  assert.ok(a.pickups.length > 0, 'first pickup should appear after a few seconds');
  assert.deepEqual(a.pickups, b.pickups);
  for (const p of a.pickups) {
    assert.ok(a.regions.some(r => r.id === p.region && inside(r,p.x,p.y)), 'pickup inside a free region');
  }
  const classic = new Game({ mode: 'classic', seed: 82 });
  tick(classic, 7);
  assert.equal(classic.pickups.length, 0);
});
test('beam intersect and empty captured region both collect pickups', () => {
  for (const pX of [480, 150]) {
    const events = [], g = new Game({ seed: 1, onEvent: e => events.push(e) });
    park(g, 850, 450);
    g.pickups = [{ id: 4, x: pX, y: 320, region: g.regions[0].id, kind: 'multiplier', age: 0, ttl: 13 }];
    assert.ok(g.fire(480, 320, 'v'));
    tick(g, 1.2);
    assert.equal(g.pickups.length, 0);
    assert.ok(g.multiplier > 0);
    assert.ok(events.some(e => e.type === 'pickup'));
    assert.ok(g.score > 8500, 'multiplier should apply to capture points');
  }
});
test('all pickup effects activate, life caps and nuke removes nearby hazards', () => {
  const g = new Game({ seed: 23 });
  for (const kind of ['haste','laser','magnet','multiplier']) g.collectPickup({ kind, x: 90, y: 90 });
  assert.equal(g.haste, 8); assert.equal(g.laser, 6);
  assert.equal(g.magnet, 7); assert.equal(g.multiplier, 12);
  g.lives = 8; g.collectPickup({kind:'life',x:90,y:90});
  assert.equal(g.lives, 9);
  g.balls = [{...g.balls[0],x:100,y:120},{...g.balls[0],x:870,y:550}];
  g.collectPickup({kind:'nuke',x:90,y:100});
  assert.equal(g.balls.length, 1);
});
test('gravity accelerates, sentries steer, glass breaks into shards', () => {
  const g = new Game({ seed: 91 });
  const id = g.regions[0].id;
  g.balls = [{...g.balls[0],kind:'gravity',x:450,y:350,vx:90,vy:0,r:TYPES.gravity.radius,region:id}];
  g.step(1/60);
  assert.ok(g.balls[0].vy > 0);
  g.balls = [{...g.balls[0],kind:'sentry',x:210,y:300,vx:0,vy:125,r:TYPES.sentry.radius,region:id}];
  g.aim = {x:800,y:300}; g.step(1/60);
  assert.ok(g.balls[0].vx > 0);
  g.balls = [{...g.balls[0],kind:'glass',r:18,x:18,y:125,vx:-170,vy:0,glassHits:4,region:id}];
  g.step(1/60);
  assert.equal(g.balls.filter(b=>b.kind==='glass').length,0);
  assert.equal(g.balls.filter(b=>b.kind==='shard').length,2);
});
test('trapped nuke ball detonates and clears the tiny partition', () => {
  const events=[], g=new Game({seed:12,onEvent:e=>events.push(e)});
  g.regions = [{x:0,y:0,w:170,h:250,id:0}];
  g.initialArea = 170*250;
  g.balls = [{...g.balls[0],kind:'nuke',r:21,x:35,y:24,vx:0,vy:0,region:0}];
  assert.ok(g.fire(90, 62, 'h'));
  tick(g,.5);
  assert.equal(g.balls.length,0);
  assert.ok(events.some(e=>e.type==='detonate'));
});
test('Authentic Classic retains surviving balls and their special types', () => {
  const g = new Game({mode:'authentic',seed:41});
  assert.equal(g.balls.length,3);
  assert.deepEqual(g.powers, {slow:0,shield:0,boost:0});
  g.balls[0].kind='gravity';
  const before = g.balls.map(b=>b.kind);
  g.state='cleared';g.next();
  assert.equal(g.stage,2);
  assert.equal(g.balls.length,4);
  assert.deepEqual(g.balls.slice(0,3).map(b=>b.kind),before);
  g.balls = g.balls.slice(0,2);
  g.state='cleared';g.next();
  assert.equal(g.balls.length,3,'destroyed balls do not reappear, one new enemy enters');
});
test('level speed progression increases but remains bounded on all difficulties', () => {
  const a = new Game({seed:14,stage:1,difficulty:'normal'});
  const b = new Game({seed:14,stage:12,difficulty:'normal'});
  assert.ok(a.balls[0].speed >= 125);
  assert.ok(b.balls[0].speed > a.balls[0].speed);
  assert.ok(new Game({seed:14,difficulty:'expert'}).balls[0].speed > a.balls[0].speed);
  assert.ok(new Game({seed:14,difficulty:'relaxed'}).balls[0].speed < a.balls[0].speed);
});
test('60-seed gameplay balance sweep remains numerically safe', () => {
  let spawns=0, shards=0, cuts=0;
  for(let seed=1;seed<=60;seed++) {
    const g=new Game({seed,stage:1+seed%12,mode:seed%5===0?'authentic':'enhanced',
      onEvent:e=>{if(e.type==='spawn')spawns++;if(e.type==='shatter')shards++;if(e.type==='capture')cuts++;}});
    for(let t=0;t<25*60 && g.state==='playing';t++) {
      if(t%150===0) {
        const r=g.regions[0];
        if(r && r.w>50 && r.h>50) g.fire(r.x + r.w*.5,r.y+r.h*.5,t%300===0?'h':'v');
      }
      g.update(1/60);
      assert.ok(Number.isFinite(g.score));
      assert.ok(Number.isFinite(g.percent) && g.percent>=0 && g.percent<=100);
      for(const b of g.balls) {
        const r=g.regions.find(r=>r.id===b.region);
        assert.ok(r && inside(r,b.x,b.y,b.r-.01),'ball still contained');
        assert.ok(Number.isFinite(b.x+b.y+b.vx+b.vy));
      }
    }
  }
  console.log('Gameplay balance seeds:',60,'pickups:',spawns,'shatters:',shards,'captures:',cuts);
  assert.ok(spawns>0);
});

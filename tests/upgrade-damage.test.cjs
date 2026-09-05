const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const bounds = {min:{x:-1,y:0,z:-2},max:{x:1,y:1.5,z:2}};

test('actual collision zones deform upgrades only on the impacted end and side', async () => {
  const { upgradeDamageAt } = await import('../upgrade-damage.js');
  const source = fs.readFileSync('game.js','utf8');
  const c = { THREE:{MathUtils:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}} };
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('function raiseZoneDamage('),source.indexOf('function syncVisualDamage(')),c);
  for (const [impact,region,x,z] of [[{x:0,z:1},'front',0,2],[{x:0,z:-1},'rear',0,-1.5],[{x:1,z:0},'rear',.95,-1.5],[{x:-1,z:0},'front',-.95,2]]) {
    const racer={drive:{yaw:0},health:94,bodyDamage:{frontBumper:0,rearBumper:0,leftDoor:0,rightDoor:0}};
    c.applyBodyImpactDamage(racer,6,impact);
    const bent = upgradeDamageAt(x,1,z,region,bounds,racer.bodyDamage);
    assert.ok(bent.shade<1);
    assert.ok(bent.y<1);
    const untouched = impact.x===0
      ? upgradeDamageAt(x,1,-z,region==='front'?'rear':'front',bounds,racer.bodyDamage)
      : upgradeDamageAt(-x,1,z,region,bounds,racer.bodyDamage);
    assert.equal(untouched.shade,1);
    assert.equal(untouched.y,1);
  }
});

test('partial repair reduces upgrade dents and full repair restores pristine geometry and paint', async () => {
  const { upgradeDamageAt } = await import('../upgrade-damage.js');
  const evaluate = rearBumper => upgradeDamageAt(.8,1.6,-1.7,'rear',bounds,{rearBumper});
  const damaged=evaluate(1), repaired=evaluate(.3), pristine=evaluate(0);
  assert.ok(repaired.y>damaged.y);
  assert.ok(repaired.shade>damaged.shade);
  assert.deepEqual(pristine,{x:.8,y:1.6,z:-1.7,shade:1});
  assert.deepEqual(evaluate(1),damaged,'repeat updates must not accumulate deformation');
});

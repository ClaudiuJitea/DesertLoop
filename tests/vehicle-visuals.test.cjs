const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('actual GLB palette separates windows, chrome, rubber, lights and body paint', async () => {
  const {vehicleSurface} = await import('../vehicle-surfaces.js');
  assert.equal(vehicleSurface(.539,.571,.610),'glass');
  assert.equal(vehicleSurface(.880,.888,.863),'chrome');
  assert.equal(vehicleSurface(.01,.014,.019),'trim');
  assert.equal(vehicleSurface(.638,.047,.034),'lamp');
  assert.equal(vehicleSurface(.784,.220,.032),'lamp');
  assert.equal(vehicleSurface(.723,.617,.434),'paint');
  assert.equal(vehicleSurface(.159,.254,.070),'paint');
  assert.equal(vehicleSurface(.839,.880,.597),'paint');
});
test('frontal impacts damage the windshield; full repair clears its damage state', () => {
  const source = fs.readFileSync('game.js','utf8');
  const c = { THREE: {MathUtils: {clamp: (v,a,b)=>Math.max(a,Math.min(b,v))}},
    deformBodyPanels() {}, syncCarDetails() {} };
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('function raiseZoneDamage('),source.indexOf('function repairRacer(')),c);
  const r = {drive:{yaw:0},health:94, bodyDamage:{frontBumper:0,hood:0,windshield:0,frontRightLight:0,frontLeftLight:0}};
  c.applyBodyImpactDamage(r,6,{x:0,z:1});
  assert.ok(r.bodyDamage.windshield>0);
  assert.ok(r.bodyDamage.frontBumper>r.bodyDamage.windshield);
  r.health=100;
  c.syncVisualDamage(r,true);
  assert.ok(Object.values(r.bodyDamage).every(value=>value===0));
});

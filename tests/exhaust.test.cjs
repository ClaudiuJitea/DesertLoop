const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const bounds = {min:{x:-1,y:0,z:-2},max:{x:1,y:2,z:2}};
test('car-specific outlets have the correct count, location and unit emission axis',async()=>{
  const {exhaustLayout}=await import('../exhaust-layout.js');
  const muscle=exhaustLayout('muscle-car-60s-524d46',bounds);
  assert.equal(muscle.length,2);
  assert.ok(Math.abs(muscle[0].x+muscle[1].x)<1e-10);
  for(const id of ['camper-van-8d10e2','hatchback-80s-e95554']) {
    const points=exhaustLayout(id,bounds);
    assert.equal(points.length,1);assert.ok(points[0].x<0);assert.ok(points[0].z<bounds.min.z);
  }
  const pickup=exhaustLayout('pickup-truck-70s-8c0080',bounds);
  assert.equal(pickup.length,1);assert.ok(pickup[0].x>bounds.max.x);
  assert.ok(pickup[0].z>bounds.min.z && pickup[0].z<0);
  assert.ok(pickup[0].direction[0]>.9);
  for(const point of [...muscle,...pickup]) {
    assert.ok(Math.abs(Math.hypot(...point.direction)-1)<1e-10);
    assert.ok(point.y>bounds.min.y && point.y<.4);
  }
});
test('nitro flames only run during an active boost and stay compact',()=>{
  const source=fs.readFileSync('exhaust-system.js','utf8');
  const c={};vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('export function updateExhaustFlames')).replace('export ',''),c);
  const mesh=()=>({visible:false,scale:{set(...size){this.size=size;}},material:{}});
  const racer={drive:{speed:45},boostT:3,exhaustOutlets:[{flame:mesh(),core:mesh()}]};
  c.updateExhaustFlames(racer,.016,true,false);
  assert.equal(racer.exhaustOutlets[0].flame.visible,true);
  assert.ok(racer.exhaustOutlets[0].flame.scale.size[2]<1.2);
  assert.ok(racer.exhaustOutlets[0].core.scale.size[2]<racer.exhaustOutlets[0].flame.scale.size[2]);
  for(const state of [{active:false,reduced:false},{active:true,reduced:true},{active:true,reduced:false,wrecked:true}]) {
    racer.wrecked=state.wrecked||false;
    c.updateExhaustFlames(racer,.016,state.active,state.reduced);
    assert.equal(racer.exhaustOutlets[0].flame.visible,false);
    assert.equal(racer.exhaustOutlets[0].core.visible,false);
  }
  racer.wrecked=false;racer.boostT=0;racer.onPad=false;
  c.updateExhaustFlames(racer,.016,true,false);
  assert.equal(racer.exhaustOutlets[0].flame.visible,false);
  racer.onPad=true;c.updateExhaustFlames(racer,.016,true,false);
  assert.equal(racer.exhaustOutlets[0].flame.visible,true);
});

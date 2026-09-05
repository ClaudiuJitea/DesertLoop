const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8');
const base={id:'muscle',name:'Muscle',maxSpeed:38,accel:24,brake:38,steer:1.55,halfL:2,halfW:1};
async function harness() {
  const {Career,PAINTS}=await import('../progression.js');
  const career=new Career(null,['muscle']);
  class Group {
    constructor(){this.position={set(){}};this.rotation={};}
    add(){} updateMatrixWorld(){}
  }
  const c={career,PAINTS,VEHICLES:[base],AI_COLORS:[0x886644],PLAYER_GRID_SLOT:4,WAYPOINTS:Array(80),racers:[],
    THREE:{Group,Box3:class {setFromObject(){return this;}},MathUtils:{lerp:(a,b,t)=>a+(b-a)*t,clamp:(n,a,b)=>Math.min(b,Math.max(a,n))}},
    scene:{add(){}},gridStarts:()=>Array.from({length:8},(_,i)=>({x:i,z:0,yaw:0,t:.95})),
    loadVehicleMesh:async()=>new Group(),recolorVehicle(){},carPaintColor:()=>({}),bindRig:()=>({}),
    addVehicleEffects(){},completeCarAppearance(racer,level){racer.installedEngine=level;},updatePlaceHud(){},
    keys:new Set(),mode:'race',BOOST_MAX_MS:200/3.6,
    resolveCollisions(){},applyPose(){},updateVehicleEffects(){},updateLap(){},announcePickup(){},showLoss(){},
    applyBodyImpactDamage(r,amount){r.lastDamage=amount;},syncVisualDamage(){},spawnImpactSparks(){},
  };
  c.clearRacers=()=>{c.racers.length=0;};
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('async function spawnField('),source.indexOf('function applyDamage(')),c);
  vm.runInContext(source.slice(source.indexOf('function applyDamage('),source.indexOf('window.__desertLoop.damagePlayer')),c);
  vm.runInContext(source.slice(source.indexOf('function effectiveMax('),source.indexOf('const TOAST_ICONS')),c);
  vm.runInContext(source.slice(source.indexOf('function updatePlayer('),source.indexOf('function chooseAiPassingLane(')),c);
  return c;
}
test('every upgrade level reaches the spawned player and drives actual acceleration and braking',async()=>{
  const c=await harness();
  for(let i=0;i<8;i++)c.career.reward(i,1);
  for(let level=0;level<=3;level++) {
    if(level)for(const type of ['engine','handling','armor'])assert.equal(c.career.purchase('muscle',type),true);
    await c.spawnField('muscle');
    const r=c.racers[0],tuned=c.career.tune(base);
    for(const field of ['maxSpeed','accel','brake','steer'])assert.equal(r.drive[field],tuned[field]);
    assert.equal(r.installedEngine,level);
    assert.equal(c.effectiveMax(r),tuned.maxSpeed);
    assert.equal(c.racers[1].def,base,'AI definition stays stock');
    c.keys.clear();c.keys.add('KeyW');c.updatePlayer(.1);
    assert.ok(Math.abs(r.drive.speed-tuned.accel*.1)<1e-9);
    r.drive.speed=20;c.keys.clear();c.keys.add('Space');c.updatePlayer(.1);
    assert.ok(Math.abs(r.drive.speed-(20-tuned.brake*.1))<1e-9);
    r.drive.speed=20;r.drive.yaw=0;c.keys.clear();c.keys.add('KeyD');c.updatePlayer(.1);
    assert.ok(r.drive.yaw<0,'steering is active with installed handling');
    r.boostT=1;assert.equal(c.effectiveMax(r),200/3.6,'boost cap remains 200 km/h');
  }
});
test('protection reduces both health loss and body impact damage at each level',async()=>{
  const c=await harness();
  for(let i=0;i<3;i++)c.career.reward(i,1);
  for(let level=0;level<=3;level++) {
    if(level)c.career.purchase('muscle','armor');
    await c.spawnField('muscle');
    const r=c.racers[0];c.applyDamage(r,20,{x:0,z:1});
    const expected=10*(1-.12*level);
    assert.ok(Math.abs((100-r.health)-expected)<1e-9);
    assert.ok(Math.abs(r.lastDamage-expected)<1e-9);
  }
});

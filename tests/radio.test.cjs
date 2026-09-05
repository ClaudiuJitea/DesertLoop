const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('game.js','utf8');
function radio() {
  const c={mode:'menu',localStorage:{setItem(){}},RADIO_STATIONS:[{src:'first.mp3'},{src:'second.mp3'},{src:null}]};
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('class RadioManager'),source.indexOf('const radioManager ='))+'\nthis.Manager = RadioManager;',c);
  const r=Object.create(c.Manager.prototype);
  r.currentIndex=0;r.muted=false;r.applyStation=()=>{};
  return r;
}
test('next and previous loop over music without switching power off',()=>{
  const r=radio();
  for(const expected of [1,0,1,0]){r.nextStation();assert.equal(r.currentIndex,expected);}
  for(const expected of [1,0,1,0]){r.prevStation();assert.equal(r.currentIndex,expected);}
});
test('arrows from off select music; power still switches off and restores the last station',()=>{
  const r=radio();r.currentIndex=2;r.nextStation();assert.equal(r.currentIndex,0);
  r.currentIndex=2;r.prevStation();assert.equal(r.currentIndex,1);
  r.togglePower();assert.equal(r.currentIndex,2);
  r.togglePower();assert.equal(r.currentIndex,1);
});

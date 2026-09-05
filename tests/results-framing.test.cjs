const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('game.js','utf8');
test('results camera reserves the bottom report area on desktop, portrait and short landscape screens', () => {
  for (const [width,height,left,top,expected] of [
    [1440,900,240,778,[1440,766]],
    [390,844,12,520,[390,508]],
    [844,390,16,260,[844,248]],
  ]) {
    let shown = true;
    const c = {
      window:{visualViewport:{width,height,offsetLeft:8,offsetTop:10}},
      finishEl:{classList:{contains:()=>shown},querySelector:()=>({getBoundingClientRect:()=>({left:left+8,top:top+10})})},
      camera:{setViewOffset(...args){c.offset=args;},clearViewOffset(){c.cleared=true;},updateProjectionMatrix(){}},
    };
    vm.createContext(c);
    vm.runInContext(source.slice(source.indexOf('function frameRaceResults('),source.indexOf('function resultOrbitDistance(')),c);
    c.frameRaceResults();
    assert.deepEqual(c.offset,[...expected,0,0,width,height]);
    shown=false;c.frameRaceResults();
    assert.equal(c.cleared,true);
    assert.equal(c.camera.aspect,width/height);
  }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('game.js', 'utf8');
const clamp = (x, low, high) => Math.min(high, Math.max(low, x));
function element() {
  return { textContent: '', attributes: {}, style: {}, classes: new Set(),
    setAttribute(k, v) { this.attributes[k] = v; },
    classList: { toggle() {} } };
}
function telemetryContext() {
  const context = {
    THREE: { MathUtils: { clamp } },
    SPEEDO_MAX_KMH: 240, SPEEDO_START_DEG: -120, SPEEDO_SWEEP_DEG: 240,
    speedValueEl: element(), driveStateEl: element(), speedoEl: element(),
    speedNeedleEl: element(), speedProgressEl: element(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function speedoPoint('), source.indexOf('function buildSpeedometer(')), context);
  vm.runInContext(source.slice(source.indexOf('function updateSpeedometer('), source.indexOf('\nbuildSpeedometer();')), context);
  return context;
}
test('speedometer handles idle, boost headroom, reverse and invalid telemetry', () => {
  const c = telemetryContext();
  c.updateSpeedometer(200 / 3.6, true);
  assert.equal(c.speedValueEl.textContent, '200');
  assert.equal(c.speedNeedleEl.attributes.transform, 'rotate(80.00 100 100)');
  assert.equal(c.driveStateEl.textContent, 'NITRO');
  c.updateSpeedometer(-10);
  assert.equal(c.speedValueEl.textContent, '036');
  assert.equal(c.driveStateEl.textContent, 'REVERSE');
  for (const speed of [0, NaN, Infinity, undefined]) {
    c.updateSpeedometer(speed);
    assert.equal(c.speedValueEl.textContent, '000');
    assert.equal(c.speedNeedleEl.attributes.transform, 'rotate(-120.00 100 100)');
    assert.equal(c.speedProgressEl.attributes.d, '');
  }
});
function frameContext(mode) {
  const c = telemetryContext();
  const player = { isPlayer: true, drive: { speed: 40, x: 1, z: 2 }, boostT: 0 };
  Object.assign(c, {
    mode, player, racers: [player], raceElapsed: 0,
    clock: { elapsedTime: 1, getDelta: () => .05 },
    lossOrbitStart: null, finishCinematicStart: null,
    renderer: { setAnimationLoop(fn) { c.frame = fn; }, render() {} },
    sun: { position: { set() {} }, target: { position: { set() {} } } },
    sky: { position: { copy() {} } }, camera: { position: { set() {} }, lookAt() {} }, scene: {},
    keys: new Set(), reducedMotion: { matches: false }, drivingEffects: { update() {} },
    updateRacePresentation() {}, updateExhaustFlames() {},
    updateFinishedRacers: () => { player.drive.speed = Math.max(0, player.drive.speed - 10); },
  });
  for (const name of ['updateBoostPadVisuals', 'updatePickupVisuals', 'updatePlayer', 'updateAI', 'resolveRacerCollisions', 'updatePowerups', 'updatePlaceHud', 'updateCamera', 'updateRaceTelemetry', 'updateSpeedEffects', 'updateVehicleEffects']) c[name] = () => {};
  vm.runInContext(source.slice(source.lastIndexOf('renderer.setAnimationLoop(')), c);
  return c;
}
test('finish frame keeps updating the needle as the car parks, then reads zero', () => {
  const c = frameContext('finish');
  c.finishCinematicStart = 0;
  for (const expected of ['108', '072', '036', '000']) {
    c.frame();
    assert.equal(c.speedValueEl.textContent, expected);
  }
  assert.equal(c.speedNeedleEl.attributes.transform, 'rotate(-120.00 100 100)');
  assert.equal(c.raceElapsed, 0, 'race time is frozen after finishing');
});
test('HUD reads final collision state, including a totaled car', () => {
  const c = frameContext('race');
  c.resolveRacerCollisions = () => { c.player.drive.speed = 0; c.player.wrecked = true; c.mode = 'finish'; };
  c.frame();
  assert.equal(c.speedValueEl.textContent, '000');
  assert.equal(c.driveStateEl.textContent, 'IDLE');
});
test('countdown reads idle and does not run the race timer', () => {
  const c = frameContext('countdown');
  c.player.drive.speed = 0;
  c.frame();
  assert.equal(c.speedValueEl.textContent, '000');
  assert.equal(c.raceElapsed, 0);
});
test('race timer advances only while racing and formats minute boundaries', () => {
  const c = frameContext('race');
  c.frame();
  assert.equal(c.raceElapsed, .05);
  vm.runInContext(source.slice(source.indexOf('function formatRaceTime('), source.indexOf('function buildCircuitMap(')), c);
  assert.equal(c.formatRaceTime(0), '00:00.0');
  assert.equal(c.formatRaceTime(59.99), '00:59.9');
  assert.equal(c.formatRaceTime(60), '01:00.0');
  assert.equal(c.formatRaceTime(125.4), '02:05.4');
});
test('race clock uses elapsed time even when the physics step is capped', () => {
  const c = frameContext('race');
  c.clock.getDelta = () => .2;
  let physicsStep;
  c.updatePlayer = dt => { physicsStep = dt; };
  c.frame();
  assert.equal(physicsStep, .05);
  assert.equal(c.raceElapsed, .2);
});
test('leaving during countdown cannot start an abandoned race', async () => {
  let releaseWait;
  const c = {
    trackReady: true, trackLoading: false, raceStartToken: 0, keys: new Set(), raceElapsed: 100,
    frameRaceResults() {}, resetRacePresentation() {}, drivingEffects: { clear() {} },
    buildCircuitMap() {}, radioManager: { ensurePlaying() {} },
    totalLaps: 3, selectedId: 'test', updateNitroHud() {}, updateSpeedometer() {},
    spawnField: async () => {}, clearRacers() {},
    wait: () => new Promise(resolve => { releaseWait = resolve; }),
  };
  for (const name of ['introEl', 'finishEl', 'lapTotalEl', 'lapCountEl', 'damageValueEl', 'damageFillEl', 'damageHudEl', 'fuelValueEl', 'fuelFillEl', 'fuelHudEl', 'hudEl', 'countdownEl']) {
    c[name] = element(); c[name].classList.add = c[name].classList.remove = () => {};
  }
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('async function startRace()'), source.indexOf('function showFinish(')), c);
  const pending = c.startRace();
  await new Promise(setImmediate);
  assert.equal(c.mode, 'countdown');
  c.raceStartToken++;
  c.mode = 'menu';
  releaseWait();
  await pending;
  assert.equal(c.mode, 'menu');
});
test('HUD fits the available viewport without cropping on small or short screens', () => {
  const c = {};
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('function getHudScale('), source.indexOf('function resizeGameViewport(')), c);
  for (const [width, height] of [[1920,1080], [1280,720], [800,600], [640,360], [390,844], [320,568], [844,390]]) {
    const scale = c.getHudScale(width, height);
    assert.ok(scale > 0 && scale <= 1);
    assert.ok(width / scale >= 390 - .001);
    assert.ok(height / scale >= 560 - .001);
    assert.ok(Math.abs((width / scale) * scale - width) < .001);
    assert.ok(Math.abs((height / scale) * scale - height) < .001);
  }
});
test('canvas and HUD use the same visible viewport on resize and high-density displays', () => {
  const properties = {};
  const c = {
    window: { visualViewport: { width: 640, height: 360, offsetLeft: 8, offsetTop: 12 } },
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 3, frameRaceResults() {},
    document: { documentElement: { style: { setProperty(k, v) { properties[k] = v; } } } },
    camera: { updateProjectionMatrix() {} },
    renderer: { setSize(...size) { c.size = size; }, setPixelRatio(ratio) { c.ratio = ratio; } },
  };
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('function getHudScale('), source.indexOf("addEventListener('resize', resizeGameViewport)")), c);
  c.resizeGameViewport();
  assert.deepEqual(c.size, [640, 360, false]);
  assert.equal(c.camera.aspect, 640 / 360);
  assert.equal(c.ratio, 2);
  assert.equal(properties['--game-left'], '8px');
  assert.equal(properties['--game-top'], '12px');
  assert.equal(parseFloat(properties['--hud-height']), 560);
  c.window.visualViewport = null;
  c.resizeGameViewport();
  assert.deepEqual(c.size, [1280, 720, false]);
  assert.equal(properties['--hud-scale'], 1);
});
test('lap timing records completed laps and reports the fastest lap', () => {
  const heading = element(), time = element();
  const c = { raceElapsed: 72.4, lapStartedAt: 0, lapTimes: [], bestLapEl: element(), lapClockEl: element(),
    lapAlertEl: { querySelector: selector => selector === 'strong' ? heading : time, classList: { add() {} } } };
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('function formatRaceTime('), source.indexOf('function buildCircuitMap(')), c);
  vm.runInContext(source.slice(source.indexOf('function recordLap('), source.indexOf('function updateResultStats(')), c);
  c.recordLap();
  assert.equal(c.bestLapEl.textContent, '01:12.4');
  assert.equal(heading.textContent, 'LAP COMPLETE');
  c.raceElapsed = 142.4;
  c.recordLap();
  assert.equal(c.bestLapEl.textContent, '01:10.0');
  assert.equal(heading.textContent, 'PERSONAL BEST');
  c.raceElapsed = 220.4;
  c.recordLap();
  assert.equal(c.bestLapEl.textContent, '01:10.0');
  assert.equal(heading.textContent, 'LAP COMPLETE');
  assert.equal(c.lapTimes.length, 3);
});

function effectHarness() {
  const code = fs.readFileSync('driving-effects.js', 'utf8').replace(/^import .*\n/, '').replaceAll('export ', '');
  const c = {};
  vm.createContext(c);
  vm.runInContext(code + '\nthis.Effects = DrivingEffects;', c);
  const e = Object.create(c.Effects.prototype);
  const vector = () => ({ x: 0, y: 0, z: 0, set(x, y, z) { Object.assign(this, { x, y, z }); }, setScalar() {} });
  const sprite = () => ({ visible: false, position: vector(), scale: vector(), material: {} });
  Object.assign(e, {
    group: {}, previous: null, emitTime: 0, cursor: 0, dustCursor: 0,
    matrix: { position: vector(), rotation: vector(), scale: vector(), updateMatrix() {} },
    marks: Array.from({ length: 4 }, () => ({ life: 0, x: 0, z: 0, yaw: 0, length: 0 })),
    dust: Array.from({ length: 2 }, () => ({ sprite: sprite(), life: 0 })),
    jets: [sprite(), sprite()], skids: { setMatrixAt() {}, instanceMatrix: {} },
  });
  const player = { drive: { speed: 20, yaw: 0, x: 0, z: 0 }, def: { halfL: 2, halfW: 1 }, boostT: 2, slipT: 0 };
  return { e, player };
}
test('tire effects reuse bounded pools, reject recovery jumps and expire', () => {
  const { e, player } = effectHarness();
  for (let i = 0; i < 100; i++) {
    player.drive.z += 1;
    e.update(.05, player, { active: true, braking: true });
  }
  assert.equal(e.marks.length, 4);
  assert.equal(e.dust.length, 2);
  assert.ok(e.cursor > e.marks.length);
  assert.ok(e.marks.some(mark => mark.life > 0));
  const cursor = e.cursor;
  player.drive.z += 100;
  e.update(.05, player, { active: true, braking: true });
  assert.equal(e.cursor, cursor, 'no skid across a teleport');
  e.update(11, player, { active: false });
  assert.ok(e.marks.every(mark => mark.life === 0));
  assert.ok(e.dust.every(particle => !particle.sprite.visible));
});
test('reduced motion suppresses tire smoke; reset clears effects', () => {
  const { e, player } = effectHarness();
  e.update(.05, player, { active: true, braking: true });
  e.update(.05, player, { active: true, braking: true, reducedMotion: true });
  assert.ok(e.dust.every(particle => !particle.sprite.visible));
  e.clear();
  assert.equal(e.previous, null);
  assert.ok(e.marks.every(mark => mark.life === 0));
});

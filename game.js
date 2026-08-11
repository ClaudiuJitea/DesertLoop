import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createAsset as createGuardrail } from './assets/guardrail-d3bd42.mjs';
import { createAsset as createLamp } from './assets/street-lamp-b4fa26.mjs';
import { createAsset as createPicnic } from './assets/picnic-table-4ee33a.mjs';
import { createAsset as createPlanter } from './assets/planter-f0dab0.mjs';
import { createAsset as createFlag } from './assets/checkered-flag-81784a.mjs';
import { createAsset as createSidewalk } from './assets/sidewalk-tile-09d894.mjs';
import { createAsset as createTallPine } from './assets/tall-pine-tree-ab4108.mjs';
import { createAsset as createStreetTree } from './assets/street-tree-0d33f3.mjs';
import { createAsset as createPine } from './assets/pine-tree-3ea075.mjs';
import { createAsset as createOak } from './assets/broadleaf-oak-997c22.mjs';
import { createAsset as createBush } from './assets/bush-8bb596.mjs';
import { createAsset as createCactus } from './assets/potted-cactus-855c1d.mjs';
import { createAsset as createRockSpire } from './assets/rock-spire-13819c.mjs';
import { createAsset as createRock } from './assets/medium-rock-e08405.mjs';
import { createAsset as createFence } from './assets/wooden-fence-section-5f04b7.mjs';
import { createAsset as createSign } from './assets/sandwich-board-sign-cb5e7c.mjs';

const TOTAL_LAPS_DEFAULT = 3;
const ROAD_WIDTH = 11;

const VEHICLES = [
  {
    id: 'camper-van-8d10e2',
    name: 'Camper Van',
    tagline: 'Steady cruiser',
    maxSpeed: 30,
    accel: 18,
    brake: 34,
    steer: 1.8,
    halfL: 2.15,
    halfW: 1.05,
  },
  {
    id: 'pickup-truck-70s-8c0080',
    name: 'Pickup Truck',
    tagline: 'Torque & grit',
    maxSpeed: 33,
    accel: 20,
    brake: 34,
    steer: 1.65,
    halfL: 2.25,
    halfW: 1.05,
  },
  {
    id: 'muscle-car-60s-524d46',
    name: 'Muscle Car',
    tagline: 'Raw horsepower',
    maxSpeed: 38,
    accel: 24,
    brake: 38,
    steer: 1.55,
    halfL: 2.2,
    halfW: 0.95,
  },
  {
    id: 'hatchback-80s-e95554',
    name: 'Hatchback',
    tagline: 'Nimble & quick',
    maxSpeed: 35,
    accel: 22,
    brake: 38,
    steer: 2.05,
    halfL: 1.95,
    halfW: 0.92,
  },
];

function ordinal(n) {
  const mod100 = n % 100;
  const suffix = mod100 >= 11 && mod100 <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${suffix}`;
}

// —— UI ——
const introEl = document.getElementById('intro');
const garageEl = document.getElementById('garage');
const raceBtn = document.getElementById('raceBtn');
const hudEl = document.getElementById('hud');
const countdownEl = document.getElementById('countdown');
const finishEl = document.getElementById('finish');
const finishTitle = document.getElementById('finishTitle');
const finishMsg = document.getElementById('finishMsg');
const speedEl = document.getElementById('speedValue');
const lapCountEl = document.getElementById('lapCount');
const lapTotalEl = document.getElementById('lapTotal');
const placeEl = document.getElementById('place');
const boostHudEl = document.getElementById('boostHud');
const damageHudEl = document.getElementById('damageHud');
const damageValueEl = document.getElementById('damageValue');
const damageFillEl = document.getElementById('damageFill');
const fuelHudEl = document.getElementById('fuelHud');
const fuelValueEl = document.getElementById('fuelValue');
const fuelFillEl = document.getElementById('fuelFill');

let selectedId = VEHICLES[2].id; // muscle as default pick
let totalLaps = TOTAL_LAPS_DEFAULT;
let mode = 'menu'; // menu | countdown | race | finish

garageEl.innerHTML = VEHICLES.map((v) => `
  <button type="button" class="car-card${v.id === selectedId ? ' selected' : ''}" data-id="${v.id}">
    <div class="thumb"><img src="./assets/cutouts/${v.id}.png" alt="${v.name}" loading="lazy"></div>
    <h3>${v.name}</h3>
    <p>${v.tagline}</p>
  </button>
`).join('');

const featureCar = document.getElementById('featureCar');
const featureName = document.getElementById('featureName');
const featureTag = document.getElementById('featureTag');
const featureStats = document.getElementById('featureStats');
const featureIndex = document.getElementById('featureIndex');

function syncFeature(id) {
  const v = VEHICLES.find((car) => car.id === id) || VEHICLES[0];
  const index = VEHICLES.indexOf(v);
  if (!featureCar) return;
  featureCar.style.opacity = '0';
  window.setTimeout(() => {
    featureCar.src = `./assets/cutouts/${v.id}.png`;
    featureCar.alt = v.name;
    featureName.textContent = v.name;
    featureTag.textContent = v.tagline;
    if (featureIndex) featureIndex.textContent = String(index + 1).padStart(2, '0');
    featureStats.innerHTML = `<span><strong>${Math.round(v.maxSpeed * 3.6)}</strong> top</span><span><strong>${v.steer.toFixed(1)}</strong> steer</span>`;
    featureCar.style.opacity = '1';
  }, 140);
}
syncFeature(selectedId);

garageEl.addEventListener('click', (e) => {
  const card = e.target.closest('.car-card');
  if (!card) return;
  selectedId = card.dataset.id;
  garageEl.querySelectorAll('.car-card').forEach((c) => c.classList.toggle('selected', c.dataset.id === selectedId));
  syncFeature(selectedId);
});

garageEl.addEventListener('pointermove', (e) => {
  const card = e.target.closest('.car-card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  card.style.transform = `translateY(-6px) scale(1.02) rotateY(${px * 8}deg) rotateX(${-py * 6}deg)`;
});
garageEl.addEventListener('pointerleave', () => {
  garageEl.querySelectorAll('.car-card').forEach((c) => { c.style.transform = ''; });
});

// Intro parallax — layers track the pointer
const plxLayers = [...document.querySelectorAll('.plx-layer')];
const onIntroPointer = (e) => {
  if (mode !== 'menu' || introEl.classList.contains('hidden')) return;
  const nx = (e.clientX / innerWidth - 0.5) * 2;
  const ny = (e.clientY / innerHeight - 0.5) * 2;
  for (const layer of plxLayers) {
    const depth = Number(layer.dataset.depth) || 20;
    layer.style.transform = `translate3d(${(-nx * depth).toFixed(1)}px, ${(-ny * depth * 0.55).toFixed(1)}px, 0)`;
  }
  if (featureCar) {
    featureCar.style.setProperty('--fx', `${(nx * 14).toFixed(1)}px`);
    featureCar.style.setProperty('--fy', `${(ny * 8).toFixed(1)}px`);
  }
};
addEventListener('pointermove', onIntroPointer);

document.querySelectorAll('.laps-pick button').forEach((btn) => {
  btn.addEventListener('click', () => {
    totalLaps = Number(btn.dataset.laps);
    document.querySelectorAll('.laps-pick button').forEach((b) => b.classList.toggle('on', b === btn));
    lapTotalEl.textContent = String(totalLaps);
  });
});

raceBtn.addEventListener('click', () => startRace());
document.getElementById('againBtn').addEventListener('click', () => startRace());
document.getElementById('menuBtn').addEventListener('click', () => showMenu());

const keys = new Set();
addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyR' && mode === 'race') resetPlayer();
  if (e.code === 'Escape') showMenu();
});
addEventListener('keyup', (e) => keys.delete(e.code));

// —— Scene ——
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3ecdc);
scene.fog = new THREE.Fog(0xf3ecdc, 140, 360);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 12, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a7a62, 1.15));
const sun = new THREE.DirectionalLight(0xfff2e0, 2.1);
sun.position.set(22, 32, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 120;
Object.assign(sun.shadow.camera, { left: -220, right: 220, top: 220, bottom: -220 });
sun.shadow.camera.far = 480;
sun.position.set(60, 80, 40);
scene.add(sun);

{
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(380, 96),
    new THREE.MeshLambertMaterial({ color: 0xc9d4a3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);
}

function place(factory, x, z, yaw = 0, params) {
  const obj = factory(params);
  obj.position.set(x, 0, z);
  obj.rotation.y = yaw;
  obj.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  scene.add(obj);
  return obj;
}

const bumpers = []; // legacy name; rails are visual-only now
function placeBumper(x, z, yaw) {
  place(createGuardrail, x, z, yaw);
}

// —— Long smooth circuit (kit tiles are 90° only — continuous CurvePath road) ——
function arcPts(cx, cz, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
  }
  return pts;
}

function addStraight(path, x0, z0, x1, z1) {
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(x0, 0, z0),
    new THREE.Vector3(x1, 0, z1)
  ));
}

function addArc(path, cx, cz, r, a0, a1) {
  // Dense samples → local Catmull–Rom (open) so the arc stays circular
  const span = Math.abs(a1 - a0);
  const n = Math.max(12, Math.ceil(span * r / 4));
  const pts = arcPts(cx, cz, r, a0, a1, n);
  path.add(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0));
}

const R = 70; // corner radius ≫ road half-width — no 90° corners, continuous arcs
const trackCurve = new THREE.CurvePath();

// Rounded-rectangle circuit with long straights (≈1.5 km scale in game units)
// South start/finish (west → east)
addStraight(trackCurve, -180, -150, 200, -150);
// SE
addArc(trackCurve, 200, -150 + R, R, -Math.PI / 2, 0);
// East
addStraight(trackCurve, 200 + R, -150 + R, 200 + R, 140);
// NE
addArc(trackCurve, 200, 140, R, 0, Math.PI / 2);
// North
addStraight(trackCurve, 200, 140 + R, -180, 140 + R);
// NW
addArc(trackCurve, -180, 140, R, Math.PI / 2, Math.PI);
// West
addStraight(trackCurve, -180 - R, 140, -180 - R, -150 + R);
// SW → joins start
addArc(trackCurve, -180, -150 + R, R, Math.PI, Math.PI * 1.5);

{
  const end = trackCurve.curves.at(-1).getPoint(1);
  const start = trackCurve.curves[0].getPoint(0);
  const gap = end.distanceTo(start);
  if (gap > 0.25) {
    console.warn('track close gap', gap);
    addStraight(trackCurve, end.x, end.z, start.x, start.z);
  }
}

const LOOP_LEN = trackCurve.getLength();
trackCurve.updateArcLengths();

function frameAt(t) {
  const tt = ((t % 1) + 1) % 1;
  const p = trackCurve.getPointAt(tt);
  let tan = trackCurve.getTangentAt(tt);
  tan.y = 0;
  if (tan.lengthSq() < 1e-8) tan = new THREE.Vector3(1, 0, 0);
  else tan.normalize();
  const side = new THREE.Vector3(-tan.z, 0, tan.x);
  return { p, tan, side };
}

function createRibbonMesh(offsets, y, colors, materialOpts = {}) {
  // offsets: array of lateral distances (road center = 0)
  const samples = Math.max(420, Math.floor(LOOP_LEN / 1.6));
  const positions = [];
  const cols = [];
  const indices = [];
  const n = offsets.length;

  for (let i = 0; i <= samples; i++) {
    const { p, side } = frameAt(i / samples);
    const base = positions.length / 3;
    for (let k = 0; k < n; k++) {
      const d = offsets[k];
      positions.push(p.x + side.x * d, y, p.z + side.z * d);
      const c = colors[k];
      cols.push(c.r, c.g, c.b);
    }
    if (i > 0) {
      const prev = base - n;
      for (let k = 0; k < n - 1; k++) {
        const a = prev + k;
        const b = prev + k + 1;
        const c = base + k;
        const d = base + k + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new THREE.Mesh(
    geo,
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      ...materialOpts,
    })
  );
}

function createRoadMesh() {
  const half = ROAD_WIDTH * 0.5;
  const shoulder = 1.35;
  const cAsphalt = new THREE.Color(0x3d3f46);
  const cCourse = new THREE.Color(0x4a4d55);
  const cShoulder = new THREE.Color(0xc7baa6);
  const mesh = createRibbonMesh(
    [-(half + shoulder), -half, 0, half, half + shoulder],
    0.02,
    [cShoulder, cCourse, cAsphalt, cCourse, cShoulder]
  );
  mesh.receiveShadow = true;
  return mesh;
}

function addCenterDashes() {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0xf1f2ef });
  const dashLen = 2.4;
  const gap = 2.6;
  const step = dashLen + gap;
  const count = Math.floor(LOOP_LEN / step);
  for (let i = 0; i < count; i++) {
    const t0 = (i * step) / LOOP_LEN;
    const t1 = Math.min(0.999, (i * step + dashLen) / LOOP_LEN);
    // Skip near finish so dashes don't fight the zebra / wrap chord
    if (t0 < 0.012 || t1 > 0.988) continue;
    if (t1 - t0 < 0.0005) continue;
    const a = frameAt(t0);
    const b = frameAt(t1);
    const mid = a.p.clone().lerp(b.p, 0.5);
    const len = Math.max(0.4, a.p.distanceTo(b.p));
    const yaw = Math.atan2(b.p.x - a.p.x, b.p.z - a.p.z);
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.045, len), mat);
    dash.position.set(mid.x, 0.05, mid.z);
    dash.rotation.y = yaw;
    group.add(dash);
  }
  return group;
}

function addEdgeLines() {
  const white = new THREE.Color(0xf1f2ef);
  const half = ROAD_WIDTH * 0.5 - 0.2;
  const w = 0.16;
  const group = new THREE.Group();
  for (const sign of [-1, 1]) {
    const strip = createRibbonMesh(
      [sign * (half - w), sign * (half + w)],
      0.04,
      [white, white]
    );
    group.add(strip);
  }
  return group;
}

function makeBannerTexture(text, bg = '#1a1f26', fg = '#f1f2ef') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  // checkered ends
  const cell = 16;
  for (let y = 0; y < c.height; y += cell) {
    for (let x = 0; x < 64; x += cell) {
      if (((x + y) / cell) % 2 < 1) {
        ctx.fillStyle = '#f1f2ef';
        ctx.fillRect(x, y, cell, cell);
        ctx.fillRect(c.width - 64 + x, y, cell, cell);
      }
    }
  }
  ctx.fillStyle = fg;
  ctx.font = 'bold 72px Bebas Neue, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addFinishZebra() {
  const group = new THREE.Group();
  // Place on the start straight so the gate is unmistakable
  const { p, tan, side } = frameAt(0.006);
  const white = new THREE.MeshLambertMaterial({ color: 0xf4f5f2 });
  const black = new THREE.MeshLambertMaterial({ color: 0x1c1f24 });

  // Thick checkered start/finish band across the road
  const cols = 10;
  const rows = 3;
  const cellW = ROAD_WIDTH / cols;
  const cellD = 0.85;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const mat = (r + c) % 2 === 0 ? white : black;
      const cell = new THREE.Mesh(new THREE.BoxGeometry(cellW * 0.96, 0.07, cellD * 0.92), mat);
      const across = (c + 0.5 - cols / 2) * cellW;
      const along = (r - (rows - 1) / 2) * cellD;
      cell.position.copy(p)
        .addScaledVector(side, across)
        .addScaledVector(tan, along);
      cell.position.y = 0.06;
      cell.rotation.y = Math.atan2(tan.x, tan.z);
      group.add(cell);
    }
  }

  // Gantry with START / FINISH banners
  const postH = 5.6;
  const postMat = new THREE.MeshLambertMaterial({ color: 0x3d3f46 });
  const beamMat = new THREE.MeshLambertMaterial({ color: 0x2a2d33 });
  const gate = ROAD_WIDTH * 0.58;
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, postH, 0.28), postMat);
    post.position.copy(p).addScaledVector(side, gate * s);
    post.position.y = postH / 2;
    group.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(gate * 2 + 0.8, 0.4, 0.4), beamMat);
  beam.position.copy(p);
  beam.position.y = postH - 0.15;
  // Stretch local X across the road (‖ side), not along the racing line
  beam.rotation.y = Math.atan2(side.x, side.z) - Math.PI / 2;
  group.add(beam);

  const mkSign = (label, along, y) => {
    const tex = makeBannerTexture(label);
    // Two fronts so text is never mirrored from either approach
    for (const facing of [-1, 1]) {
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(7.2, 1.6),
        new THREE.MeshLambertMaterial({ map: tex })
      );
      sign.position.copy(p).addScaledVector(tan, along + facing * 0.03);
      sign.position.y = y;
      sign.rotation.y = Math.atan2(facing * tan.x, facing * tan.z);
      group.add(sign);
    }
  };
  mkSign('START', -0.2, postH - 1.35);
  mkSign('FINISH', 0.2, postH - 1.35);

  for (const s of [-1, 1]) {
    place(createFlag, p.x + side.x * gate * s + tan.x * 2.4, p.z + side.z * gate * s + tan.z * 2.4, Math.atan2(side.x * s, side.z * s));
    place(createFlag, p.x + side.x * gate * s - tan.x * 2.4, p.z + side.z * gate * s - tan.z * 2.4, Math.atan2(side.x * s, side.z * s));
  }
  return group;
}

function placeScenery() {
  const trees = [createTallPine, createStreetTree, createPine, createOak];
  const rng = (n) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  // Dense vegetation and rocks outside the oval
  const sceneryCount = 280;
  for (let i = 0; i < sceneryCount; i++) {
    const t = (i + 0.37) / sceneryCount;
    const { p, side, tan } = frameAt(t);
    const outward = rng(i) > 0.48 ? -1 : 1;
    const dist = ROAD_WIDTH * 0.5 + 8 + rng(i + 3) * 30;
    const along = (rng(i + 7) - 0.5) * 13;
    const x = p.x + side.x * outward * dist + tan.x * along;
    const z = p.z + side.z * outward * dist + tan.z * along;
    const yaw = rng(i + 11) * Math.PI * 2;
    const roll = rng(i + 13);
    if (roll < 0.53) place(trees[i % trees.length], x, z, yaw);
    else if (roll < 0.72) place(createBush, x, z, yaw);
    else if (roll < 0.84) place(createCactus, x, z, yaw);
    else if (roll < 0.95) place(createRock, x, z, yaw);
    else place(createRockSpire, x, z, yaw);
  }
}

const BUILDING_IDS = [
  'timber-barn-90b3ce',
  'three-storey-shophouse-2f6378',
  'cove-tavern-5861a6',
  'corner-shop-db18e2',
  'street-diner-bb174e',
  'village-tavern-4e94e3',
  'two-story-house-40f6dc',
];

async function loadBuildingTemplate(id) {
  const gltf = await loader.loadAsync(`./assets/${id}-preview.glb`);
  const asset = gltf.scene;
  asset.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return asset;
}

async function placeBuildings() {
  const templates = {};
  await Promise.all(BUILDING_IDS.map(async (id) => {
    templates[id] = await loadBuildingTemplate(id);
  }));

  const clusters = [
    { t: 0.02, ids: ['street-diner-bb174e', 'corner-shop-db18e2', 'two-story-house-40f6dc', 'timber-barn-90b3ce'] },
    { t: 0.09, ids: ['village-tavern-4e94e3', 'three-storey-shophouse-2f6378', 'street-diner-bb174e'] },
    { t: 0.17, ids: ['two-story-house-40f6dc', 'corner-shop-db18e2', 'cove-tavern-5861a6', 'timber-barn-90b3ce'] },
    { t: 0.25, ids: ['street-diner-bb174e', 'village-tavern-4e94e3', 'three-storey-shophouse-2f6378'] },
    { t: 0.33, ids: ['cove-tavern-5861a6', 'two-story-house-40f6dc', 'corner-shop-db18e2', 'timber-barn-90b3ce'] },
    { t: 0.41, ids: ['village-tavern-4e94e3', 'street-diner-bb174e', 'three-storey-shophouse-2f6378'] },
    { t: 0.49, ids: ['two-story-house-40f6dc', 'cove-tavern-5861a6', 'corner-shop-db18e2', 'street-diner-bb174e'] },
    { t: 0.57, ids: ['timber-barn-90b3ce', 'village-tavern-4e94e3', 'two-story-house-40f6dc'] },
    { t: 0.65, ids: ['street-diner-bb174e', 'three-storey-shophouse-2f6378', 'corner-shop-db18e2', 'cove-tavern-5861a6'] },
    { t: 0.73, ids: ['village-tavern-4e94e3', 'two-story-house-40f6dc', 'timber-barn-90b3ce'] },
    { t: 0.81, ids: ['corner-shop-db18e2', 'street-diner-bb174e', 'three-storey-shophouse-2f6378', 'two-story-house-40f6dc'] },
    { t: 0.89, ids: ['cove-tavern-5861a6', 'village-tavern-4e94e3', 'timber-barn-90b3ce'] },
    { t: 0.96, ids: ['street-diner-bb174e', 'two-story-house-40f6dc', 'corner-shop-db18e2', 'village-tavern-4e94e3'] },
  ];

  for (const [clusterIndex, cl] of clusters.entries()) {
    const { p, side, tan } = frameAt(cl.t);
    const base = ROAD_WIDTH * 0.5 + 16;
    const primarySide = clusterIndex % 2 === 0 ? -1 : 1;
    const districtSides = clusterIndex % 3 === 0 ? [primarySide, -primarySide] : [primarySide];
    districtSides.forEach((districtSide, sideIndex) => {
      const ids = sideIndex === 0 ? cl.ids : cl.ids.slice(0, 3).reverse();
      ids.forEach((id, i) => {
        const lat = base + (i % 2) * 12 + sideIndex * 3;
        const along = (i - (ids.length - 1) / 2) * 11;
        const x = p.x + side.x * districtSide * lat + tan.x * along;
        const z = p.z + side.z * districtSide * lat + tan.z * along;
        const b = templates[id].clone(true);
        b.position.set(x, 0, z);
        b.rotation.y = Math.atan2(-side.x * districtSide, -side.z * districtSide)
          + (i % 2 === 0 ? 0 : 0.25);
        scene.add(b);
      });
      // Roadside furniture makes each cluster read as a small settlement.
      for (const offset of [-5, 0, 5]) {
        const x = p.x + side.x * districtSide * (base - 5) + tan.x * offset;
        const z = p.z + side.z * districtSide * (base - 5) + tan.z * offset;
        place(createFence, x, z, Math.atan2(tan.x, tan.z));
      }
      place(
        createSign,
        p.x + side.x * districtSide * (ROAD_WIDTH * 0.5 + 8),
        p.z + side.z * districtSide * (ROAD_WIDTH * 0.5 + 8),
        Math.atan2(-side.x * districtSide, -side.z * districtSide)
      );
    });
  }
}

// —— Power-ups & speed boosters ——
const powerups = [];
const boostPads = [];
const oilSlicks = [];

function makeOilSlickMesh(seed) {
  const group = new THREE.Group();
  const materials = [
    new THREE.MeshBasicMaterial({
      color: 0x151513,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x39352e,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
    }),
  ];
  const patches = [
    { x: 0, z: 0, rx: 1.35, rz: 0.78, material: 0 },
    { x: -0.85, z: 0.18, rx: 0.68, rz: 0.48, material: 0 },
    { x: 0.92, z: -0.12, rx: 0.58, rz: 0.42, material: 0 },
    { x: 0.1, z: -0.05, rx: 0.72, rz: 0.35, material: 1 },
  ];
  patches.forEach((patch, patchIndex) => {
    const shape = new THREE.Shape();
    const points = 9;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const irregularity = 0.82 + 0.18 * Math.sin(seed * 2.7 + patchIndex * 1.9 + i * 3.1);
      const x = Math.cos(angle) * patch.rx * irregularity;
      const y = Math.sin(angle) * patch.rz * irregularity;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, materials[patch.material]);
    mesh.position.set(patch.x, patchIndex * 0.002, patch.z);
    group.add(mesh);
  });
  return group;
}

function makeBoostPadMesh() {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0xffc14a, emissive: 0xff6a1a, emissiveIntensity: 0.55 });
  for (let i = 0; i < 4; i++) {
    const chev = new THREE.Mesh(new THREE.BoxGeometry(2.4 - i * 0.2, 0.08, 0.7), mat);
    chev.position.set(0, 0.06, i * 1.35);
    g.add(chev);
  }
  return g;
}

function makePowerOrb(type) {
  const color = {
    repair: 0x67d66f,
    fuel: 0xf3bd35,
    nitro: 0x3ec7ff,
    boost: 0xff6b3d,
  }[type];
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.85, 0),
    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.55 })
  );
  if (type === 'repair') {
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xf5fff2 });
    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.14), crossMat);
    const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.14), crossMat);
    horizontal.position.z = 0.72;
    vertical.position.z = 0.72;
    mesh.add(horizontal, vertical);
  } else if (type === 'fuel') {
    const iconMat = new THREE.MeshBasicMaterial({ color: 0xfff6d4 });
    const can = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.14), iconMat);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.14), iconMat);
    can.position.z = 0.72;
    handle.position.set(0.1, 0.42, 0.72);
    mesh.add(can, handle);
  }
  mesh.position.y = 1.25;
  return mesh;
}

function placePowerups() {
  // Speed booster strips distributed around the full lap.
  for (const t of [0.06, 0.12, 0.24, 0.38, 0.49, 0.62, 0.76, 0.85, 0.94]) {
    const { p, tan, side } = frameAt(t);
    for (const lane of [-2.2, 2.2]) {
      const mesh = makeBoostPadMesh();
      mesh.position.copy(p).addScaledVector(side, lane);
      mesh.position.y = 0.04;
      mesh.rotation.y = Math.atan2(tan.x, tan.z);
      scene.add(mesh);
      boostPads.push({ t, lane, mesh });
    }
  }

  // Nitro, boost, repair and fuel pickups.
  const orbSpots = [
    0.025, 0.07, 0.11, 0.15, 0.19, 0.23,
    0.28, 0.32, 0.36, 0.41, 0.45, 0.49,
    0.54, 0.58, 0.62, 0.67, 0.71, 0.75,
    0.80, 0.84, 0.88, 0.92, 0.96,
  ];
  const pickupCycle = ['boost', 'nitro', 'repair', 'boost', 'nitro', 'fuel', 'repair', 'nitro'];
  orbSpots.forEach((t, i) => {
    const { p, side } = frameAt(t);
    const lane = (i % 2 === 0 ? -2.4 : 2.4);
    const type = pickupCycle[i % pickupCycle.length];
    const mesh = makePowerOrb(type);
    mesh.position.copy(p).addScaledVector(side, lane);
    scene.add(mesh);
    powerups.push({ t, lane, type, mesh, taken: false, respawn: 0 });
  });
}

function placeOilSlicks() {
  const spots = [
    { t: 0.085, lane: -1.7 },
    { t: 0.175, lane: 2.1 },
    { t: 0.305, lane: 0 },
    { t: 0.43, lane: -2.15 },
    { t: 0.55, lane: 1.8 },
    { t: 0.685, lane: -0.4 },
    { t: 0.805, lane: 2.05 },
    { t: 0.9, lane: -1.9 },
    { t: 0.975, lane: 0.55 },
  ];
  spots.forEach(({ t, lane }, index) => {
    const { p, tan, side } = frameAt(t);
    const mesh = makeOilSlickMesh(index + 1);
    mesh.position.copy(p).addScaledVector(side, lane);
    mesh.position.y = 0.085;
    mesh.rotation.y = Math.atan2(tan.x, tan.z) + (index % 2 === 0 ? 0.2 : -0.18);
    scene.add(mesh);
    oilSlicks.push({ t, lane, mesh });
  });
}

function placeTrackProps() {
  const railEvery = 3.9;
  const railCount = Math.floor(LOOP_LEN / railEvery);
  for (let i = 0; i < railCount; i++) {
    const t = i / railCount;
    const { p, tan, side } = frameAt(t);
    const yaw = Math.atan2(-tan.z, tan.x); // rail length along local X ‖ tangent
    const dist = ROAD_WIDTH * 0.5 + 1.85;
    placeBumper(p.x - side.x * dist, p.z - side.z * dist, yaw);
    placeBumper(p.x + side.x * dist, p.z + side.z * dist, yaw + Math.PI);
  }

  const lampEvery = 42;
  const lampCount = Math.floor(LOOP_LEN / lampEvery);
  for (let i = 0; i < lampCount; i++) {
    const t = (i + 0.5) / lampCount;
    const { p, side } = frameAt(t);
    const lx = p.x + side.x * (ROAD_WIDTH * 0.5 + 3.4);
    const lz = p.z + side.z * (ROAD_WIDTH * 0.5 + 3.4);
    // The lamp's curved arm extends along local +X; point it from the pole toward the road.
    const yaw = Math.atan2(side.z, -side.x);
    place(createLamp, lx, lz, yaw);
  }

  const lookouts = [0.03, 0.42, 0.68];
  for (const t of lookouts) {
    const { p, side } = frameAt(t);
    const ox = p.x + side.x * 16;
    const oz = p.z + side.z * 16;
    place(createSidewalk, ox, oz, 0, { colorway: 'pale-concrete' });
    place(createPicnic, ox, oz, t * 6);
    place(createPlanter, ox + 1.6, oz + 0.8);
    place(createPlanter, ox - 1.4, oz - 0.6);
  }
}

const roadMesh = createRoadMesh();
scene.add(roadMesh);
scene.add(addCenterDashes());
scene.add(addEdgeLines());
scene.add(addFinishZebra());
placeTrackProps();
placeScenery();
placePowerups();
placeOilSlicks();

// Debug helpers for screenshots / tuning
window.__desertLoop = {
  LOOP_LEN,
  frameAt,
  setTopDown(on = true) {
    if (on) {
      scene.fog = null;
      camera.position.set(10, 520, 0);
      camera.near = 1;
      camera.far = 1200;
      camera.fov = 42;
      camera.updateProjectionMatrix();
      camera.lookAt(10, 0, 0);
      window.__topDown = true;
    } else {
      window.__topDown = false;
      scene.fog = new THREE.Fog(0xf3ecdc, 140, 360);
      camera.fov = 50;
      camera.near = 0.1;
      camera.far = 500;
      camera.updateProjectionMatrix();
    }
  },
  lookFinish() {
    scene.fog = null;
    const { p, tan, side } = frameAt(0);
    camera.position.copy(p)
      .addScaledVector(tan, -22)
      .addScaledVector(side, -10)
      .add(new THREE.Vector3(0, 16, 0));
    camera.near = 0.1;
    camera.far = 500;
    camera.fov = 50;
    camera.updateProjectionMatrix();
    camera.lookAt(p.x + tan.x * 12, 0.4, p.z + tan.z * 12);
    window.__freezeCam = true;
  },
};

// AI / lap samples along the continuous centerline
const WAYPOINTS = [];
{
  const n = Math.max(48, Math.floor(LOOP_LEN / 16));
  for (let i = 0; i < n; i++) {
    const p = trackCurve.getPointAt(i / n);
    WAYPOINTS.push({ x: p.x, z: p.z });
  }
}

function progressAlongTrack(x, z) {
  let bestDist = Infinity;
  let bestT = 0;
  const N = 240;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const p = trackCurve.getPointAt(t);
    const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
    }
  }
  // Local refine
  for (let k = -6; k <= 6; k++) {
    const t = (bestT + k / (N * 8) + 1) % 1;
    const p = trackCurve.getPointAt(t);
    const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
    }
  }
  return bestT * LOOP_LEN;
}

// —— Vehicles / race state ——
const loader = new GLTFLoader();
const racers = []; // { mesh, drive, wheels, steers, def, ai, wp, lap, crossed, lastSide }
window.__desertLoop.getRaceState = () => ({
  racerCount: racers.length,
  cameraDistance: racers[0] ? camera.position.distanceTo(racers[0].mesh.position) : null,
  cameraFov: camera.fov,
  cameraYaw,
  racers: racers.map((r) => ({
    id: r.id,
    isPlayer: r.isPlayer,
    health: r.health,
    fuel: r.fuel,
    wrecked: r.wrecked,
    speed: r.drive.speed,
    maxSpeed: r.drive.maxSpeed,
    slipT: r.slipT,
    aiLane: r.aiLane,
    reverseT: r.reverseT,
    passingT: r.passingT,
    x: r.drive.x,
    z: r.drive.z,
    yaw: r.drive.yaw,
    halfL: r.drive.halfL,
    halfW: r.drive.halfW,
    brakeLightsOn: r.brakeLights?.some((light) => light.visible) || false,
  })),
});

const camOffset = new THREE.Vector3(0, 7.2, -14.5);
const camLook = new THREE.Vector3(0, 1.45, 4.5);
const camPos = new THREE.Vector3();
const lookPos = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _y = new THREE.Vector3(0, 1, 0);
let cameraYaw = null;

async function loadVehicleMesh(id) {
  const gltf = await loader.loadAsync(`./assets/${id}-preview.glb`);
  const asset = gltf.scene;
  asset.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.material && c.material.isMeshStandardMaterial) {
        c.material = c.material.clone();
        c.material.flatShading = true;
        c.material.needsUpdate = true;
      }
    }
  });
  return asset;
}

placeBuildings().catch((err) => console.error('Failed to place buildings', err));

function bindRig(root) {
  return {
    fl: root.getObjectByName('wheel-fl'),
    fr: root.getObjectByName('wheel-fr'),
    rl: root.getObjectByName('wheel-rl'),
    rr: root.getObjectByName('wheel-rr'),
    steerFl: root.getObjectByName('steer-fl'),
    steerFr: root.getObjectByName('steer-fr'),
  };
}

const smokeGeometry = new THREE.DodecahedronGeometry(0.36, 0);
const BRAKE_LIGHT_PROFILES = {
  'camper-van-8d10e2': [
    { x: -0.335, y: 0.35, w: 0.048, h: 0.095, round: true },
    { x: 0.335, y: 0.35, w: 0.048, h: 0.095, round: true },
  ],
  'pickup-truck-70s-8c0080': [
    { x: -0.41, y: 0.55, w: 0.057, h: 0.165 },
    { x: 0.41, y: 0.55, w: 0.057, h: 0.165 },
  ],
  'muscle-car-60s-524d46': [
    { x: -0.385, y: 0.55, w: 0.095, h: 0.11 },
    { x: -0.275, y: 0.55, w: 0.095, h: 0.11 },
    { x: -0.165, y: 0.55, w: 0.095, h: 0.11 },
    { x: 0.165, y: 0.55, w: 0.095, h: 0.11 },
    { x: 0.275, y: 0.55, w: 0.095, h: 0.11 },
    { x: 0.385, y: 0.55, w: 0.095, h: 0.11 },
  ],
  'hatchback-80s-e95554': [
    { x: -0.317, y: 0.46, w: 0.127, h: 0.105 },
    { x: 0.317, y: 0.46, w: 0.127, h: 0.105 },
  ],
};

function brakeLampGeometry(width, height, round, scale = 1) {
  const geometry = round
    ? new THREE.CircleGeometry(0.5, 16)
    : new THREE.PlaneGeometry(1, 1);
  geometry.scale(width * scale, height * scale, 1);
  return geometry;
}

function addVehicleEffects(racer) {
  const bounds = racer.visualBounds;
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const rearZ = bounds.min.z - 0.07;
  const profile = BRAKE_LIGHT_PROFILES[racer.id];
  racer.brakeLights = profile.map((lamp) => {
    const width = size.x * lamp.w;
    const height = size.y * lamp.h;
    const light = new THREE.Mesh(
      brakeLampGeometry(width, height, lamp.round),
      new THREE.MeshBasicMaterial({
        color: 0xff1808,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    );
    const glow = new THREE.Mesh(
      brakeLampGeometry(width, height, lamp.round, 1.38),
      new THREE.MeshBasicMaterial({
        color: 0xff3a18,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    );
    glow.position.z = -0.015;
    light.add(glow);
    light.position.set(
      center.x + lamp.x * size.x,
      bounds.min.y + lamp.y * size.y,
      rearZ
    );
    light.visible = false;
    light.renderOrder = 8;
    racer.mesh.add(light);
    return light;
  });
  racer.smokeTimer = 0;
  racer.smokeIndex = 0;
  racer.exhaust = racer.isPlayer
    ? Array.from({ length: 36 }, () => {
      const material = new THREE.MeshLambertMaterial({
        color: 0xa8aaa5,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(smokeGeometry, material);
      mesh.visible = false;
      scene.add(mesh);
      return {
        mesh,
        life: 0,
        maxLife: 1.1,
        baseOpacity: 0.5,
        velocity: new THREE.Vector3(),
        angular: new THREE.Vector3(),
      };
    })
    : [];
}

function updateVehicleEffects(racer, dt, accelerating, braking) {
  for (const light of racer.brakeLights) {
    light.visible = braking;
  }

  if (!racer.isPlayer) return;
  racer.smokeTimer -= dt;
  if (accelerating && Math.abs(racer.drive.speed) > 1.5 && racer.smokeTimer <= 0) {
    racer.smokeTimer = racer.boostT > 0 ? 0.018 : 0.035;
    const particle = racer.exhaust[racer.smokeIndex++ % racer.exhaust.length];
    const exhaustSide = racer.smokeIndex % 2 === 0 ? -1 : 1;
    const origin = new THREE.Vector3(
      exhaustSide * racer.def.halfW * 0.38 + (Math.random() - 0.5) * 0.08,
      0.38,
      -racer.def.halfL * 0.95
    );
    racer.mesh.localToWorld(origin);
    particle.mesh.position.copy(origin);
    particle.mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    particle.mesh.scale.setScalar(0.72 + Math.random() * 0.35);
    particle.mesh.material.color.setHex(racer.boostT > 0 ? 0x8fdcff : 0xa8aaa5);
    particle.baseOpacity = racer.boostT > 0 ? 0.62 : 0.48;
    particle.mesh.material.opacity = particle.baseOpacity;
    particle.mesh.visible = true;
    particle.maxLife = 0.95 + Math.random() * 0.32;
    particle.life = particle.maxLife;
    particle.velocity.set(
      -Math.sin(racer.drive.yaw) * 1.8 + (Math.random() - 0.5) * 0.65,
      0.55 + Math.random() * 0.45,
      -Math.cos(racer.drive.yaw) * 1.8 + (Math.random() - 0.5) * 0.65
    );
    particle.angular.set(
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 2.2
    );
  }

  for (const particle of racer.exhaust) {
    if (particle.life <= 0) continue;
    particle.life -= dt;
    if (particle.life <= 0) {
      particle.mesh.visible = false;
      continue;
    }
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += particle.angular.x * dt;
    particle.mesh.rotation.y += particle.angular.y * dt;
    particle.mesh.rotation.z += particle.angular.z * dt;
    const age = 1 - particle.life / particle.maxLife;
    particle.mesh.scale.setScalar(0.8 + age * 1.95);
    particle.mesh.material.opacity = (1 - age) * particle.baseOpacity;
  }
}

const AI_COLORS = [0xe53935, 0x1e88e5, 0x43a047, 0xf9a825, 0x8e24aa, 0xfb8c00, 0x00acc1];

function recolorVehicle(root, tintHex) {
  const tint = new THREE.Color(tintHex);
  const tintHsl = {};
  tint.getHSL(tintHsl);
  const sample = new THREE.Color();
  const hsl = {};
  root.traverse((part) => {
    if (!part.isMesh) return;
    if (part.material) {
      part.material = Array.isArray(part.material)
        ? part.material.map((m) => m.clone())
        : part.material.clone();
    }
    const colors = part.geometry?.getAttribute('color');
    if (!colors) return;
    part.geometry = part.geometry.clone();
    const colorAttr = part.geometry.getAttribute('color');
    for (let i = 0; i < colorAttr.count; i++) {
      sample.setRGB(colorAttr.getX(i), colorAttr.getY(i), colorAttr.getZ(i));
      sample.getHSL(hsl);
      // Preserve neutral glass, chrome and tyres; shift painted body panels.
      if (hsl.s > 0.09 && hsl.l > 0.16) {
        sample.setHSL(tintHsl.h, Math.max(0.45, hsl.s), hsl.l);
        colorAttr.setXYZ(i, sample.r, sample.g, sample.b);
      }
    }
    colorAttr.needsUpdate = true;
  });
}

function gridStarts() {
  // Staggered grid just before the finish line, facing race direction
  const starts = [];
  for (let i = 0; i < 8; i++) {
    const t = (0.985 - i * 0.0055 + 1) % 1;
    const { p, tan, side } = frameAt(t);
    const lane = (i % 2 === 0 ? 1.65 : -1.65);
    starts.push({
      x: p.x + side.x * lane - tan.x * 0.5,
      z: p.z + side.z * lane - tan.z * 0.5,
      yaw: Math.atan2(tan.x, tan.z),
      t,
    });
  }
  return starts;
}

const PLAYER_GRID_SLOT = 4;

function clearRacers() {
  for (const r of racers) {
    scene.remove(r.mesh);
    for (const particle of r.exhaust || []) scene.remove(particle.mesh);
  }
  racers.length = 0;
}

async function spawnField(playerId) {
  clearRacers();
  const order = [playerId];
  while (order.length < 8) {
    order.push(VEHICLES[Math.floor(Math.random() * VEHICLES.length)].id);
  }
  const starts = gridStarts();
  const gridSlots = [
    PLAYER_GRID_SLOT,
    ...starts.map((_, index) => index).filter((index) => index !== PLAYER_GRID_SLOT),
  ];
  const meshes = await Promise.all(order.map((id) => loadVehicleMesh(id)));
  const colorOffset = Math.floor(Math.random() * AI_COLORS.length);

  order.forEach((id, i) => {
    const def = VEHICLES.find((v) => v.id === id);
    if (i > 0) recolorVehicle(meshes[i], AI_COLORS[(i - 1 + colorOffset) % AI_COLORS.length]);
    meshes[i].updateMatrixWorld(true);
    const visualBounds = new THREE.Box3().setFromObject(meshes[i]);
    const mesh = new THREE.Group();
    mesh.add(meshes[i]);
    const start = starts[gridSlots[i]];
    mesh.position.set(start.x, 0, start.z);
    mesh.rotation.y = start.yaw;
    scene.add(mesh);
    const racer = {
      id,
      def,
      mesh,
      visualBounds,
      wheels: bindRig(mesh),
      isPlayer: i === 0,
      ai: i !== 0,
      aiLane: i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * (0.85 + Math.random() * 0.55),
      aiPace: i === 0 ? 1 : i === 1 ? 1.08 : i === 2 ? 1.055 : 1 + Math.random() * 0.08,
      aiPhase: Math.random() * Math.PI * 2,
      laneChangeCooldown: 1 + Math.random() * 2,
      blockedT: 0,
      reverseT: 0,
      passingT: 0,
      avoidCar: null,
      avoidDirection: i % 2 === 0 ? 1 : -1,
      wp: Math.ceil(start.t * WAYPOINTS.length + 1) % WAYPOINTS.length,
      lap: 1,
      passedMid: false,
      nearFinish: true, // spawned in the gate — must leave before a lap can count
      finished: false,
      finishPlace: 0,
      health: 100,
      // Fuel management is a player-only challenge; AI racers never run out.
      fuel: i === 0 ? 100 : Infinity,
      wrecked: false,
      hitCooldown: 0,
      padCooldown: 0,
      oilCooldown: 0,
      slipT: 0,
      slipAngle: 0,
      slipPhase: Math.random() * Math.PI * 2,
      boostT: 0,
      onPad: false,
      pickupMessage: '',
      pickupMessageT: 0,
      drive: {
        x: start.x,
        z: start.z,
        yaw: start.yaw,
        speed: 0,
        maxSpeed: i === 0
          ? def.maxSpeed
          : i === 1
            ? Math.max(39.5, THREE.MathUtils.lerp(def.maxSpeed, 37.5, 0.62) * 1.06)
            : i === 2
              ? Math.max(38.5, THREE.MathUtils.lerp(def.maxSpeed, 37.5, 0.62) * 1.035)
              : THREE.MathUtils.lerp(def.maxSpeed, 37.5, 0.62) * (0.99 + Math.random() * 0.07),
        accel: i === 0
          ? def.accel
          : i === 1
            ? Math.max(26, THREE.MathUtils.lerp(def.accel, 24, 0.5) * 1.12)
            : i === 2
              ? Math.max(25, THREE.MathUtils.lerp(def.accel, 24, 0.5) * 1.08)
              : THREE.MathUtils.lerp(def.accel, 24, 0.5) * (1 + Math.random() * 0.1),
        brake: def.brake,
        steer: def.steer,
        halfL: def.halfL,
        halfW: def.halfW,
      },
    };
    racers.push(racer);
    addVehicleEffects(racer);
  });
  cameraYaw = racers[0]?.drive.yaw ?? null;
  updatePlaceHud();
}

function applyDamage(racer, amount) {
  if (racer.wrecked || racer.hitCooldown > 0 || amount <= 0) return;
  racer.health = Math.max(0, racer.health - amount);
  racer.hitCooldown = 0.45;
  racer.drive.speed *= 0.88;
  if (racer.isPlayer) {
    racer.pickupMessage = `IMPACT -${Math.round(amount)}%`;
    racer.pickupMessageT = 0.85;
  }
  if (racer.health <= 0) {
    racer.wrecked = true;
    racer.drive.speed = 0;
    racer.boostT = 0;
    racer.onPad = false;
    racer.slipT = 0;
    racer.slipAngle = 0;
    if (racer.isPlayer) showLoss('Your car reached 100% damage and is totaled.');
  }
}

window.__desertLoop.damagePlayer = (amount = 100) => {
  const player = racers.find((racer) => racer.isPlayer);
  if (player) applyDamage(player, amount);
};
window.__desertLoop.setRacerState = (index, state) => {
  const racer = racers[index];
  if (!racer) return;
  Object.assign(racer.drive, state);
  racer.mesh.position.set(racer.drive.x, 0, racer.drive.z);
  racer.mesh.rotation.y = racer.drive.yaw;
};

function constrainToTrack(racer) {
  // Soft corridor walls — follows the racing line, so curves don't invent phantom OBB snags
  const d = racer.drive;
  const frac = (((progressAlongTrack(d.x, d.z) / LOOP_LEN) % 1) + 1) % 1;
  const { p, side } = frameAt(frac);
  const lat = (d.x - p.x) * side.x + (d.z - p.z) * side.z;
  const maxLat = ROAD_WIDTH * 0.5 - d.halfW - 0.05;
  if (Math.abs(lat) <= maxLat) return;
  const sign = Math.sign(lat);
  const excess = Math.abs(lat) - maxLat;
  d.x -= side.x * sign * excess;
  d.z -= side.z * sign * excess;
  const vx = Math.sin(d.yaw) * d.speed;
  const vz = Math.cos(d.yaw) * d.speed;
  const vLat = vx * side.x + vz * side.z;
  if (vLat * sign > 0) {
    applyDamage(racer, THREE.MathUtils.clamp(Math.abs(vLat) * 0.45 + Math.abs(d.speed) * 0.06, 2, 14));
    const rvx = vx - vLat * side.x;
    const rvz = vz - vLat * side.z;
    d.speed = Math.sin(d.yaw) * rvx + Math.cos(d.yaw) * rvz;
  }
}

function resolveCollisions(racer) {
  constrainToTrack(racer);
}

function racerObbMtv(a, b) {
  const ad = a.drive;
  const bd = b.drive;
  const axes = [
    { x: Math.sin(ad.yaw), z: Math.cos(ad.yaw) },
    { x: Math.cos(ad.yaw), z: -Math.sin(ad.yaw) },
    { x: Math.sin(bd.yaw), z: Math.cos(bd.yaw) },
    { x: Math.cos(bd.yaw), z: -Math.sin(bd.yaw) },
  ];
  const deltaX = bd.x - ad.x;
  const deltaZ = bd.z - ad.z;
  let smallestOverlap = Infinity;
  let normalX = 0;
  let normalZ = 0;

  for (const axis of axes) {
    const aForward = Math.abs(Math.sin(ad.yaw) * axis.x + Math.cos(ad.yaw) * axis.z);
    const aSide = Math.abs(Math.cos(ad.yaw) * axis.x - Math.sin(ad.yaw) * axis.z);
    const bForward = Math.abs(Math.sin(bd.yaw) * axis.x + Math.cos(bd.yaw) * axis.z);
    const bSide = Math.abs(Math.cos(bd.yaw) * axis.x - Math.sin(bd.yaw) * axis.z);
    const radiusA = (ad.halfL + 0.1) * aForward + (ad.halfW + 0.08) * aSide;
    const radiusB = (bd.halfL + 0.1) * bForward + (bd.halfW + 0.08) * bSide;
    const signedDistance = deltaX * axis.x + deltaZ * axis.z;
    const overlap = radiusA + radiusB - Math.abs(signedDistance);
    if (overlap <= 0) return null;
    if (overlap < smallestOverlap) {
      const sign = Math.sign(signedDistance) || 1;
      smallestOverlap = overlap;
      normalX = axis.x * sign;
      normalZ = axis.z * sign;
    }
  }

  return { x: normalX, z: normalZ, depth: smallestOverlap };
}

function resolveRacerCollisions() {
  for (let pass = 0; pass < 6; pass++) {
    let foundCollision = false;
    for (let i = 0; i < racers.length; i++) {
      for (let j = i + 1; j < racers.length; j++) {
        const a = racers[i];
        const b = racers[j];
        const mtv = racerObbMtv(a, b);
        if (!mtv) continue;
        foundCollision = true;

        const correction = mtv.depth + 0.025;
        let aShare = 0.5;
        let bShare = 0.5;
        if (a.wrecked && !b.wrecked) {
          aShare = 0;
          bShare = 1;
        } else if (b.wrecked && !a.wrecked) {
          aShare = 1;
          bShare = 0;
        }
        a.drive.x -= mtv.x * correction * aShare;
        a.drive.z -= mtv.z * correction * aShare;
        b.drive.x += mtv.x * correction * bShare;
        b.drive.z += mtv.z * correction * bShare;

        if (pass === 0) {
          const aVelocityX = Math.sin(a.drive.yaw) * a.drive.speed;
          const aVelocityZ = Math.cos(a.drive.yaw) * a.drive.speed;
          const bVelocityX = Math.sin(b.drive.yaw) * b.drive.speed;
          const bVelocityZ = Math.cos(b.drive.yaw) * b.drive.speed;
          const closingSpeed = (aVelocityX - bVelocityX) * mtv.x
            + (aVelocityZ - bVelocityZ) * mtv.z;
          if (closingSpeed > 0) {
            const speedRetention = THREE.MathUtils.clamp(1 - closingSpeed * 0.025, 0.58, 0.9);
            if (!a.wrecked) a.drive.speed *= speedRetention;
            if (!b.wrecked) b.drive.speed *= speedRetention;
            if (closingSpeed > 4) {
              const impact = THREE.MathUtils.clamp(2 + closingSpeed * 0.28, 2, 14);
              applyDamage(a, impact);
              applyDamage(b, impact);
            }
          }
        }
      }
    }
    for (const racer of racers) constrainToTrack(racer);
    if (!foundCollision) break;
  }

  for (const racer of racers) {
    racer.mesh.position.set(racer.drive.x, 0, racer.drive.z);
    racer.mesh.rotation.y = racer.drive.yaw;
  }
}

function effectiveMax(racer) {
  const d = racer.drive;
  const condition = 0.58 + 0.42 * (racer.health / 100);
  let m = d.maxSpeed * condition;
  if (racer.boostT > 0) m *= 1.26;
  else if (racer.onPad) m *= 1.16;
  return m;
}

function updatePowerups(dt) {
  const now = performance.now() / 1000;
  for (const pu of powerups) {
    if (pu.taken) {
      if (now >= pu.respawn) {
        pu.taken = false;
        pu.mesh.visible = true;
      }
      continue;
    }
    pu.mesh.rotation.y += dt * 2.2;
    pu.mesh.position.y = 1.1 + Math.sin(now * 4 + pu.t * 10) * 0.15;
  }

  for (const racer of racers) {
    racer.hitCooldown = Math.max(0, racer.hitCooldown - dt);
    racer.padCooldown = Math.max(0, racer.padCooldown - dt);
    racer.oilCooldown = Math.max(0, racer.oilCooldown - dt);
    racer.slipT = Math.max(0, racer.slipT - dt);
    racer.pickupMessageT = Math.max(0, racer.pickupMessageT - dt);
    if (racer.boostT > 0) racer.boostT = Math.max(0, racer.boostT - dt);
    racer.onPad = false;
    if (racer.wrecked) continue;
    const d = racer.drive;
    const frac = (((progressAlongTrack(d.x, d.z) / LOOP_LEN) % 1) + 1) % 1;
    const { p, side } = frameAt(frac);
    const lat = (d.x - p.x) * side.x + (d.z - p.z) * side.z;

    if (racer.oilCooldown <= 0) {
      for (const slick of oilSlicks) {
        let dtTrack = Math.abs(frac - slick.t);
        if (dtTrack > 0.5) dtTrack = 1 - dtTrack;
        if (dtTrack < 0.0035 && Math.abs(lat - slick.lane) < 1.35) {
          racer.slipT = 1.3;
          racer.oilCooldown = 4;
          racer.slipAngle = (Math.random() < 0.5 ? -1 : 1) * (0.32 + Math.random() * 0.22);
          racer.slipPhase = Math.random() * Math.PI * 2;
          if (racer.isPlayer) {
            racer.pickupMessage = 'OIL SLICK';
            racer.pickupMessageT = 0.8;
          }
          break;
        }
      }
    }

    for (const pad of boostPads) {
      let dtTrack = Math.abs(frac - pad.t);
      if (dtTrack > 0.5) dtTrack = 1 - dtTrack;
      if (dtTrack < 0.012 && Math.abs(lat - pad.lane) < 1.6) {
        racer.onPad = true;
        if (racer.padCooldown <= 0) {
          racer.padCooldown = 1.1;
          racer.boostT = Math.max(racer.boostT, 0.85);
          d.speed = Math.min(d.speed + 5, effectiveMax(racer));
          if (racer.isPlayer) {
            racer.pickupMessage = 'PAD BOOST';
            racer.pickupMessageT = 0.8;
          }
        }
        break;
      }
    }

    for (const pu of powerups) {
      if (pu.taken) continue;
      if (pu.type === 'fuel' && !racer.isPlayer) continue;
      let dtTrack = Math.abs(frac - pu.t);
      if (dtTrack > 0.5) dtTrack = 1 - dtTrack;
      if (dtTrack < 0.01 && Math.abs(lat - pu.lane) < 1.8) {
        pu.taken = true;
        pu.mesh.visible = false;
        pu.respawn = now + 8;
        if (pu.type === 'fuel') {
          const fuelAdded = Math.min(18, 100 - racer.fuel);
          racer.fuel = Math.min(100, racer.fuel + 18);
          racer.pickupMessage = fuelAdded > 0 ? `FUEL +${Math.round(fuelAdded)}%` : 'TANK FULL';
          racer.pickupMessageT = 1.25;
        } else if (pu.type === 'repair') {
          const repair = Math.min(35, 100 - racer.health);
          racer.health = Math.min(100, racer.health + 35);
          if (racer.isPlayer) {
            racer.pickupMessage = repair > 0 ? `REPAIR +${Math.round(repair)}%` : 'FULL HEALTH';
            racer.pickupMessageT = 1.25;
          }
        } else {
          racer.boostT = Math.max(racer.boostT, pu.type === 'nitro' ? 2.6 : 1.7);
          if (racer.isPlayer) {
            d.speed = Math.min(d.speed + 6, effectiveMax(racer));
            racer.pickupMessage = pu.type === 'nitro' ? 'NITRO BOOST' : 'TURBO BOOST';
            racer.pickupMessageT = 1;
          }
        }
      }
    }
  }

  const player = racers.find((r) => r.isPlayer);
  if (boostHudEl) {
    boostHudEl.classList.toggle('repair', Boolean(player?.pickupMessage.startsWith('REPAIR') || player?.pickupMessage === 'FULL HEALTH'));
    boostHudEl.classList.toggle('fuel', Boolean(player?.pickupMessage.startsWith('FUEL') || player?.pickupMessage === 'TANK FULL'));
    boostHudEl.classList.toggle('impact', Boolean(player?.pickupMessage.startsWith('IMPACT')));
    boostHudEl.classList.toggle('oil', Boolean(player?.slipT > 0));
    if (player && player.slipT > 0) {
      boostHudEl.classList.add('on');
      boostHudEl.textContent = `OIL SLIP ${player.slipT.toFixed(1)}s`;
    } else if (player && player.pickupMessageT > 0) {
      boostHudEl.classList.add('on');
      boostHudEl.textContent = player.pickupMessage;
    } else if (player && (player.boostT > 0 || player.onPad)) {
      boostHudEl.classList.add('on');
      boostHudEl.textContent = player.boostT > 0 ? `BOOST ${player.boostT.toFixed(1)}s` : 'SPEED PAD';
    } else {
      boostHudEl.classList.remove('on');
    }
  }
  if (player && damageHudEl && damageValueEl && damageFillEl) {
    const damage = Math.round(100 - player.health);
    damageValueEl.textContent = `${damage}%`;
    damageFillEl.style.width = `${damage}%`;
    damageHudEl.classList.toggle('critical', player.health < 35);
  }
  if (player && fuelHudEl && fuelValueEl && fuelFillEl) {
    const fuel = Math.round(player.fuel);
    fuelValueEl.textContent = `${fuel}%`;
    fuelFillEl.style.width = `${fuel}%`;
    fuelHudEl.classList.toggle('critical', player.fuel < 20);
  }
}

function updateLap(racer) {
  const d = racer.drive;
  const prog = progressAlongTrack(d.x, d.z);
  const frac = (((prog / LOOP_LEN) % 1) + 1) % 1;

  if (frac > 0.40 && frac < 0.70) racer.passedMid = true;

  const nearFinish = frac < 0.025 || frac > 0.975;
  if (nearFinish) {
    if (!racer.nearFinish && racer.passedMid && d.speed > 2) {
      if (racer.lap >= totalLaps) {
        if (!racer.finished) {
          racer.finished = true;
          racer.finishPlace = racers.filter((r) => r.finished).length;
          if (racer.isPlayer) showFinish(racer.finishPlace);
        }
      } else {
        racer.lap += 1;
        if (racer.isPlayer) lapCountEl.textContent = String(racer.lap);
      }
      racer.passedMid = false;
    }
    racer.nearFinish = true;
  } else {
    racer.nearFinish = false;
  }

  const wp = WAYPOINTS[racer.wp % WAYPOINTS.length];
  if (Math.hypot(d.x - wp.x, d.z - wp.z) < 12) {
    racer.wp = (racer.wp + 1) % WAYPOINTS.length;
  }
}

function steerToward(d, tx, tz, rate, dt) {
  const desired = Math.atan2(tx - d.x, tz - d.z);
  let diff = desired - d.yaw;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const max = rate * dt;
  d.yaw += THREE.MathUtils.clamp(diff, -max, max);
}

function updatePlayer(dt) {
  const racer = racers.find((r) => r.isPlayer);
  if (!racer || racer.finished || racer.wrecked) return;
  const d = racer.drive;
  const throttle = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0)
    - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const reversePressed = keys.has('KeyS') || keys.has('ArrowDown');
  const steerInput = (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
    - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0);
  const braking = keys.has('Space');
  const engineRequested = throttle !== 0 && !braking;
  if (engineRequested && racer.fuel > 0) {
    const previousFuel = racer.fuel;
    const burnRate = racer.boostT > 0 ? 2.35 : racer.onPad ? 1.7 : 1.35;
    racer.fuel = Math.max(0, racer.fuel - burnRate * Math.abs(throttle) * dt);
    if (previousFuel > 0 && racer.fuel === 0) {
      racer.pickupMessage = 'OUT OF FUEL';
      racer.pickupMessageT = 1.8;
    }
  }
  const accelerating = throttle > 0 && !braking && racer.fuel > 0;

  if (braking) {
    const sign = Math.sign(d.speed) || 0;
    d.speed -= sign * d.brake * dt;
    if (Math.sign(d.speed) !== sign) d.speed = 0;
  } else if (throttle && racer.fuel > 0) {
    const boostAccel = racer.boostT > 0 ? 1.38 : racer.onPad ? 1.22 : 1;
    d.speed += throttle * d.accel * boostAccel * dt;
  } else {
    const sign = Math.sign(d.speed);
    d.speed -= sign * 3.2 * dt;
    if (Math.sign(d.speed) !== sign) d.speed = 0;
  }
  const vmax = effectiveMax(racer);
  d.speed = THREE.MathUtils.clamp(d.speed, -d.maxSpeed * 0.35, vmax);

  const speedRatio = THREE.MathUtils.clamp(Math.abs(d.speed) / Math.max(1, vmax), 0, 1);
  const sf = THREE.MathUtils.clamp(Math.abs(d.speed) / 8, 0.12, 1)
    * THREE.MathUtils.lerp(1, 0.5, speedRatio);
  const slipping = racer.slipT > 0;
  if (Math.abs(d.speed) > 0.4) {
    d.yaw += steerInput * d.steer * sf * (slipping ? 0.2 : 1) * Math.sign(d.speed || 1) * dt;
    if (slipping) {
      const wobble = Math.sin(performance.now() * 0.012 + racer.slipPhase);
      d.yaw += wobble * (0.75 + speedRatio * 0.65) * dt;
      racer.slipAngle = THREE.MathUtils.clamp(
        racer.slipAngle + Math.cos(performance.now() * 0.009 + racer.slipPhase) * 0.42 * dt,
        -0.72,
        0.72
      );
    }
  }

  if (!slipping) racer.slipAngle *= Math.exp(-4 * dt);
  const moveYaw = d.yaw + racer.slipAngle;
  d.x += Math.sin(moveYaw) * d.speed * dt;
  d.z += Math.cos(moveYaw) * d.speed * dt;
  resolveCollisions(racer);
  applyPose(racer, steerInput);
  updateVehicleEffects(racer, dt, accelerating, braking || reversePressed);
  updateLap(racer);
  speedEl.textContent = String(Math.round(Math.abs(d.speed) * 3.6));
}

function chooseAiPassingLane(racer, p, side) {
  const preferred = racer.aiLane <= 0 ? 2.65 : -2.65;
  const candidates = [preferred, -preferred, 0];
  for (const candidate of candidates) {
    const clear = racers.every((other) => {
      if (other === racer) return true;
      const dx = other.drive.x - racer.drive.x;
      const dz = other.drive.z - racer.drive.z;
      const along = dx * Math.sin(racer.drive.yaw) + dz * Math.cos(racer.drive.yaw);
      if (along < -7 || along > 14) return true;
      const otherLat = (other.drive.x - p.x) * side.x + (other.drive.z - p.z) * side.z;
      const requiredSpace = racer.drive.halfW + other.drive.halfW + 0.55;
      return Math.abs(otherLat - candidate) > requiredSpace;
    });
    if (clear) return candidate;
  }
  return null;
}

function updateAiReverse(racer, dt) {
  const d = racer.drive;
  racer.reverseT = Math.max(0, racer.reverseT - dt);
  d.speed = Math.max(-5.5, d.speed - d.brake * 0.7 * dt);
  d.yaw += racer.avoidDirection * d.steer * 0.55 * dt;
  d.x += Math.sin(d.yaw) * d.speed * dt;
  d.z += Math.cos(d.yaw) * d.speed * dt;
  resolveCollisions(racer);
  applyPose(racer, -racer.avoidDirection);
  updateVehicleEffects(racer, dt, false, true);
  updateLap(racer);
  if (racer.reverseT <= 0) {
    d.speed = 3;
    racer.blockedT = 0;
    racer.laneChangeCooldown = 1.2;
    racer.passingT = 4;
  }
}

function updateAI(racer, dt) {
  if (racer.wrecked) {
    racer.drive.speed = 0;
    applyPose(racer, 0);
    updateVehicleEffects(racer, dt, false, false);
    return;
  }
  if (racer.finished) {
    racer.drive.speed *= 0.96;
    applyPose(racer, 0);
    updateVehicleEffects(racer, dt, false, true);
    return;
  }
  const d = racer.drive;
  racer.laneChangeCooldown = Math.max(0, racer.laneChangeCooldown - dt);
  racer.passingT = Math.max(0, racer.passingT - dt);
  if (racer.passingT <= 0) racer.avoidCar = null;
  if (racer.reverseT > 0) {
    updateAiReverse(racer, dt);
    return;
  }
  const look = WAYPOINTS[(racer.wp + 1) % WAYPOINTS.length];
  const target = WAYPOINTS[racer.wp % WAYPOINTS.length];
  // Blend current + next while preserving separate racing lanes.
  let tx = target.x * 0.3 + look.x * 0.7;
  let tz = target.z * 0.3 + look.z * 0.7;
  const frac = (((progressAlongTrack(d.x, d.z) / LOOP_LEN) % 1) + 1) % 1;
  const { p, side } = frameAt(frac);
  const lat = (d.x - p.x) * side.x + (d.z - p.z) * side.z;
  const lanePull = racer.passingT > 0 ? 2.6 : 0.58;
  tx += side.x * (racer.aiLane - lat) * lanePull;
  tz += side.z * (racer.aiLane - lat) * lanePull;
  const slipping = racer.slipT > 0;
  const steeringRate = slipping ? 0.22 : racer.passingT > 0 ? 2.1 : 1.15;
  steerToward(d, tx, tz, d.steer * steeringRate, dt);
  if (slipping) {
    d.yaw += Math.sin(performance.now() * 0.011 + racer.slipPhase) * 1.05 * dt;
    racer.slipAngle = THREE.MathUtils.clamp(
      racer.slipAngle + Math.cos(performance.now() * 0.008 + racer.slipPhase) * 0.38 * dt,
      -0.68,
      0.68
    );
  } else {
    racer.slipAngle *= Math.exp(-4 * dt);
  }

  const cornering = Math.abs(Math.atan2(
    Math.sin(Math.atan2(tx - d.x, tz - d.z) - d.yaw),
    Math.cos(Math.atan2(tx - d.x, tz - d.z) - d.yaw)
  ));
  const baseVmax = effectiveMax(racer);
  const player = racers.find((entry) => entry.isPlayer);
  let catchUp = 1;
  if (player && !player.finished) {
    const playerDistance = (player.lap - 1) * LOOP_LEN
      + progressAlongTrack(player.drive.x, player.drive.z);
    const aiDistance = (racer.lap - 1) * LOOP_LEN + progressAlongTrack(d.x, d.z);
    const gapBehind = playerDistance - aiDistance;
    catchUp = gapBehind > 8
      ? THREE.MathUtils.clamp(1 + gapBehind / 650, 1, 1.19)
      : 1;
  }
  const vmax = baseVmax * catchUp;
  const now = performance.now() / 1000;
  const paceWave = THREE.MathUtils.clamp(
    1.015
      + Math.sin(now * 0.52 + racer.aiPhase) * 0.045
      + Math.sin(now * 1.31 + racer.aiPhase * 0.7) * 0.02,
    0.94,
    1.09
  );
  let want = vmax * racer.aiPace * paceWave
    * (cornering > 0.6 ? 0.8 : cornering > 0.3 ? 0.93 : 1);
  if (slipping) want *= 0.68;
  // Match the nearest car ahead, then find a clear lane to pass it.
  let nearestBlocker = null;
  let nearestAhead = Infinity;
  for (const other of racers) {
    if (other === racer) continue;
    if (other === racer.avoidCar && racer.passingT > 0) continue;
    const dx = other.drive.x - d.x;
    const dz = other.drive.z - d.z;
    const ahead = dx * Math.sin(d.yaw) + dz * Math.cos(d.yaw);
    const across = Math.abs(dx * Math.cos(d.yaw) - dz * Math.sin(d.yaw));
    const safeGap = d.halfL + other.drive.halfL + 4 + d.speed * 0.16;
    if (ahead > 0 && ahead < safeGap && across < d.halfW + other.drive.halfW + 0.4) {
      const gapFactor = THREE.MathUtils.clamp(ahead / safeGap, 0.25, 0.92);
      want = Math.min(want, other.drive.speed * gapFactor);
      if (ahead < nearestAhead) {
        nearestAhead = ahead;
        nearestBlocker = other;
      }
    }
  }

  if (nearestBlocker) {
    const passingLane = chooseAiPassingLane(racer, p, side);
    const stoppedBlocker = Math.abs(nearestBlocker.drive.speed) < 1.5;
    const boxedDistance = d.halfL + nearestBlocker.drive.halfL + 1.15;
    if (passingLane !== null && (racer.laneChangeCooldown <= 0 || stoppedBlocker)) {
      racer.avoidDirection = Math.sign(passingLane - lat) || racer.avoidDirection;
      racer.aiLane = passingLane;
      racer.laneChangeCooldown = 1.8 + Math.random() * 0.8;
      if (nearestAhead >= boxedDistance || d.speed >= 3) {
        racer.avoidCar = nearestBlocker;
        racer.passingT = 1.8;
      }
    }

    if (nearestAhead < boxedDistance && d.speed < 3) {
      racer.blockedT += dt;
      if (racer.blockedT > 0.38) {
        racer.reverseT = 0.8;
        racer.avoidCar = nearestBlocker;
        if (passingLane === null) {
          racer.avoidDirection = lat <= 0 ? 1 : -1;
          racer.aiLane = racer.avoidDirection * 2.65;
        }
        updateAiReverse(racer, dt);
        return;
      }
    } else {
      racer.blockedT = Math.max(0, racer.blockedT - dt * 2);
    }
  } else {
    racer.blockedT = Math.max(0, racer.blockedT - dt * 2);
  }

  const accelerating = d.speed < want - 0.35;
  if (accelerating) d.speed += d.accel * (racer.boostT > 0 ? 1.28 : racer.onPad ? 1.15 : 0.94) * dt;
  else d.speed -= d.brake * 0.35 * dt;
  d.speed = THREE.MathUtils.clamp(d.speed, 0, vmax);

  const moveYaw = d.yaw + racer.slipAngle;
  d.x += Math.sin(moveYaw) * d.speed * dt;
  d.z += Math.cos(moveYaw) * d.speed * dt;
  if (racer.passingT > 0) {
    const lateralStep = THREE.MathUtils.clamp(racer.aiLane - lat, -1, 1) * 2.8 * dt;
    d.x += side.x * lateralStep;
    d.z += side.z * lateralStep;
  }
  resolveCollisions(racer);
  applyPose(racer, THREE.MathUtils.clamp(
    Math.atan2(Math.sin(Math.atan2(tx - d.x, tz - d.z) - d.yaw), Math.cos(Math.atan2(tx - d.x, tz - d.z) - d.yaw)) * 2,
    -1, 1
  ));
  updateVehicleEffects(racer, dt, accelerating, !accelerating);
  updateLap(racer);
}

function applyPose(racer, steerInput) {
  const d = racer.drive;
  d.x = THREE.MathUtils.clamp(d.x, -280, 280);
  d.z = THREE.MathUtils.clamp(d.z, -200, 340);
  racer.mesh.position.set(d.x, 0, d.z);
  racer.mesh.rotation.y = d.yaw;
  const spin = (d.speed * 0.016) / 0.34;
  for (const key of ['fl', 'fr', 'rl', 'rr']) {
    if (racer.wheels[key]) racer.wheels[key].rotation.x += spin;
  }
  const ang = steerInput * THREE.MathUtils.degToRad(28);
  if (racer.wheels.steerFl) racer.wheels.steerFl.rotation.y = ang;
  if (racer.wheels.steerFr) racer.wheels.steerFr.rotation.y = ang;
}

function raceStanding() {
  const scored = racers.map((r) => ({
    r,
    score: r.finished
      ? 1e9 - r.finishPlace
      : (r.lap - 1) * LOOP_LEN + progressAlongTrack(r.drive.x, r.drive.z),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function updatePlaceHud() {
  const standings = raceStanding();
  const idx = standings.findIndex((s) => s.r.isPlayer);
  placeEl.textContent = idx >= 0 ? ordinal(idx + 1) : '—';
}

function updateCamera(dt) {
  if (window.__freezeCam) return;
  if (window.__topDown) {
    camera.position.set(10, 520, 0);
    camera.lookAt(10, 0, 0);
    return;
  }
  const player = racers.find((r) => r.isPlayer);
  if (!player) return;
  if (cameraYaw === null) cameraYaw = player.drive.yaw;
  const yawDelta = Math.atan2(
    Math.sin(player.drive.yaw - cameraYaw),
    Math.cos(player.drive.yaw - cameraYaw)
  );
  cameraYaw += yawDelta * (1 - Math.exp(-2.6 * dt));
  // Position follows a softened heading, revealing the car's side in corners.
  _q.setFromAxisAngle(_y, cameraYaw);
  camPos.copy(camOffset).applyQuaternion(_q).add(player.mesh.position);
  // Keep the focus aligned with the car itself so the wheels remain visible.
  _q.setFromAxisAngle(_y, player.drive.yaw);
  lookPos.copy(camLook).applyQuaternion(_q).add(player.mesh.position);
  // Lock the chase distance: smoothing position caused a speed-dependent zoom-out.
  camera.position.copy(camPos);
  if (camera.fov !== 49) {
    camera.fov = 49;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(lookPos);
}

function resetPlayer() {
  const player = racers.find((r) => r.isPlayer);
  if (!player) return;
  const s = gridStarts()[PLAYER_GRID_SLOT];
  Object.assign(player.drive, { x: s.x, z: s.z, yaw: s.yaw, speed: 0 });
  cameraYaw = s.yaw;
  player.health = 100;
  player.fuel = 100;
  player.wrecked = false;
  player.hitCooldown = 0;
  player.boostT = 0;
  player.slipT = 0;
  player.slipAngle = 0;
  player.oilCooldown = 0;
  player.pickupMessageT = 0;
  for (const light of player.brakeLights) light.visible = false;
  for (const particle of player.exhaust) {
    particle.life = 0;
    particle.mesh.visible = false;
  }
  player.wp = Math.floor(WAYPOINTS.length * 0.99) % WAYPOINTS.length;
  player.mesh.position.set(s.x, 0, s.z);
  player.mesh.rotation.y = s.yaw;
}

function showMenu() {
  mode = 'menu';
  cameraYaw = null;
  introEl.classList.remove('hidden');
  hudEl.classList.remove('on');
  finishEl.classList.remove('show');
  countdownEl.classList.remove('show');
  clearRacers();
  camera.position.set(40, 68, 150);
  camera.lookAt(10, 2, 40);
}

async function startRace() {
  mode = 'countdown';
  introEl.classList.add('hidden');
  finishEl.classList.remove('show');
  lapTotalEl.textContent = String(totalLaps);
  lapCountEl.textContent = '1';
  damageValueEl.textContent = '0%';
  damageFillEl.style.width = '0%';
  fuelValueEl.textContent = '100%';
  fuelFillEl.style.width = '100%';
  await spawnField(selectedId);
  hudEl.classList.add('on');

  const seq = ['3', '2', '1', 'GO'];
  for (const text of seq) {
    countdownEl.textContent = text;
    countdownEl.classList.add('show');
    await wait(text === 'GO' ? 500 : 700);
  }
  countdownEl.classList.remove('show');
  mode = 'race';
}

function showFinish(place) {
  mode = 'finish';
  finishTitle.textContent = place === 1 ? 'You win!' : `${ordinal(place)} place`;
  finishMsg.textContent = place === 1
    ? 'Clean run around Desert Loop.'
    : 'Hit Race again or head back to the garage.';
  finishEl.classList.add('show');
}

function showLoss(message) {
  mode = 'finish';
  finishTitle.textContent = 'Race lost';
  finishMsg.textContent = message;
  finishEl.classList.add('show');
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
camera.position.set(40, 68, 150);
camera.lookAt(10, 2, 40);

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'menu') {
    camera.position.x = Math.cos(clock.elapsedTime * 0.08) * 180;
    camera.position.z = Math.sin(clock.elapsedTime * 0.08) * 180 + 30;
    camera.position.y = 72;
    camera.lookAt(10, 2, 40);
  } else if (mode === 'race' || mode === 'countdown' || mode === 'finish') {
    if (mode === 'race') {
      updatePlayer(dt);
      for (const r of racers) {
        if (r.ai) updateAI(r, dt);
      }
      resolveRacerCollisions();
      updatePowerups(dt);
      updatePlaceHud();
    }
    updateCamera(dt);
  }
  renderer.render(scene, camera);
});

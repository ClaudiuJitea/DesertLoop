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
import { createAsset as createSeagrass } from './assets/seagrass-tuft-862cc5.mjs';

const TOTAL_LAPS_DEFAULT = 3;
const ROAD_WIDTH = 11;
const NITRO_MAX = 3;
const NITRO_DURATION = 5;
const FOG_COLOR = 0xf3ecdc;
const FOG_NEAR = 210;
const FOG_FAR = 940;
const CAMERA_FAR = 1100;

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
const speedoEl = document.getElementById('speedo');
const speedNeedleEl = document.getElementById('speedNeedle');
const speedProgressEl = document.getElementById('speedProgress');
const speedTrackEl = document.getElementById('speedTrack');
const speedRedzoneEl = document.getElementById('speedRedzone');
const speedTicksEl = document.getElementById('speedTicks');
const SPEEDO_MAX_KMH = 200;
const SPEEDO_MAX_MS = SPEEDO_MAX_KMH / 3.6;
const SPEEDO_START_DEG = -120;
const SPEEDO_SWEEP_DEG = 240;
const lapCountEl = document.getElementById('lapCount');
const lapTotalEl = document.getElementById('lapTotal');
const placeEl = document.getElementById('place');
const boostHudEl = document.getElementById('boostHud');
const pickupToastEl = document.getElementById('pickupToast');
const pickupToastIconEl = document.getElementById('pickupToastIcon');
const pickupToastKickerEl = document.getElementById('pickupToastKicker');
const pickupToastTitleEl = document.getElementById('pickupToastTitle');
const pickupToastDetailEl = document.getElementById('pickupToastDetail');
const speedFxEl = document.getElementById('speedFx');
const damageHudEl = document.getElementById('damageHud');
const damageValueEl = document.getElementById('damageValue');
const damageFillEl = document.getElementById('damageFill');
const fuelHudEl = document.getElementById('fuelHud');
const fuelValueEl = document.getElementById('fuelValue');
const fuelFillEl = document.getElementById('fuelFill');
const nitroHudEl = document.getElementById('nitroHud');
const nitroValueEl = document.getElementById('nitroValue');
const nitroPipsEl = document.getElementById('nitroPips');

const introRadioEl = document.getElementById('introRadio');
const introRadioTrackEl = document.getElementById('introRadioTrack');
const introRadioPrevBtn = document.getElementById('introRadioPrev');
const introRadioToggleBtn = document.getElementById('introRadioToggle');
const introRadioNextBtn = document.getElementById('introRadioNext');
const introRadioVolumeEl = document.getElementById('introRadioVolume');
const introRadioVolNumEl = document.getElementById('introRadioVolNum');

const radioHudEl = document.getElementById('radioHud');
const radioEqEl = document.getElementById('radioEq');
const radioFreqBadgeEl = document.getElementById('radioFreqBadge');
const radioTagEl = document.getElementById('radioTag');
const radioTitleEl = document.getElementById('radioTitle');
const radioPrevBtn = document.getElementById('radioPrevBtn');
const radioToggleBtn = document.getElementById('radioToggleBtn');
const radioNextBtn = document.getElementById('radioNextBtn');
const radioVolumeEl = document.getElementById('radioVolume');
const radioVolNumEl = document.getElementById('radioVolNum');

// —— Radio system ——
const RADIO_STATIONS = [
  {
    id: 'neon-night',
    name: 'Neon Night',
    freq: '94.2 FM',
    genre: 'Synthwave',
    src: './sounds/radio/Neon Night.mp3',
  },
  {
    id: 'neon-velocity',
    name: 'Neon Velocity',
    freq: '106.8 FM',
    genre: 'Cyber Beat',
    src: './sounds/radio/Neon Velocity.mp3',
  },
  {
    id: 'off',
    name: 'Radio Off',
    freq: 'OFF',
    genre: 'Muted',
    src: null,
  },
];

class RadioManager {
  constructor() {
    let savedIndex = 0;
    let savedMuted = false;
    let savedVol = 0.55;
    try {
      const idxStr = localStorage.getItem('desert_loop_radio_index');
      if (idxStr !== null) {
        const parsed = parseInt(idxStr, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < RADIO_STATIONS.length) {
          savedIndex = parsed;
        }
      }
      savedMuted = localStorage.getItem('desert_loop_radio_muted') === 'true';
      const volStr = localStorage.getItem('desert_loop_radio_vol');
      if (volStr !== null) {
        const parsedVol = parseFloat(volStr);
        if (!isNaN(parsedVol) && parsedVol >= 0 && parsedVol <= 1) {
          savedVol = parsedVol;
        }
      }
    } catch (e) {}

    this.currentIndex = savedIndex;
    this.muted = savedMuted;
    this.volume = savedVol;
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.muted ? 0 : this.volume;
    this.audio.preload = 'auto';
    this.unlocked = false;

    this.audio.addEventListener('play', () => this.updateUI());
    this.audio.addEventListener('pause', () => this.updateUI());
    this.audio.addEventListener('ended', () => this.updateUI());

    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      removeEventListener('pointerdown', unlock);
      removeEventListener('keydown', unlock);
      if (!this.muted && this.currentStation.src && this.audio.paused) {
        this.audio.volume = this.volume;
        this.audio.play().catch(() => {});
      }
    };
    addEventListener('pointerdown', unlock, { passive: true });
    addEventListener('keydown', unlock, { passive: true });

    this.applyStation(false);
  }

  get currentStation() {
    return RADIO_STATIONS[this.currentIndex] || RADIO_STATIONS[0];
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.muted && this.volume > 0) {
      this.muted = false;
      try {
        localStorage.setItem('desert_loop_radio_muted', 'false');
      } catch (e) {}
      if (this.currentStation.src && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    }
    if (!this.muted) {
      this.audio.volume = this.volume;
    }
    try {
      localStorage.setItem('desert_loop_radio_vol', String(this.volume));
    } catch (e) {}
    this.updateUI();
  }

  applyStation(autoPlay = true) {
    const st = this.currentStation;
    if (st.src) {
      const targetHref = new URL(st.src, window.location.href).href;
      if (this.audio.src !== targetHref) {
        this.audio.src = st.src;
        this.audio.currentTime = 0;
      }
      this.audio.volume = this.muted ? 0 : this.volume;
      if (autoPlay && !this.muted) {
        this.audio.play().catch(() => {});
      } else if (this.muted) {
        this.audio.pause();
      }
    } else {
      this.audio.pause();
    }
    try {
      localStorage.setItem('desert_loop_radio_index', String(this.currentIndex));
    } catch (e) {}
    this.updateUI();
  }

  setStation(index, autoPlay = true, notify = true) {
    this.currentIndex = (index + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    if (this.muted && this.currentStation.src) {
      this.muted = false;
      try {
        localStorage.setItem('desert_loop_radio_muted', 'false');
      } catch (e) {}
    }
    this.applyStation(autoPlay);
    if (notify && (mode === 'race' || mode === 'countdown')) {
      const player = racers.find((r) => r.isPlayer);
      const st = this.currentStation;
      if (st.src) {
        announcePickup(player, 'radio', st.name, st.freq);
      } else {
        announcePickup(player, 'radio', 'RADIO OFF', 'Muted');
      }
    }
  }

  nextStation(notify = true) {
    this.setStation(this.currentIndex + 1, true, notify);
  }

  prevStation(notify = true) {
    this.setStation(this.currentIndex - 1, true, notify);
  }

  toggleMute() {
    const st = this.currentStation;
    if (!st.src) {
      this.currentIndex = 0;
      this.muted = false;
      try {
        localStorage.setItem('desert_loop_radio_index', '0');
        localStorage.setItem('desert_loop_radio_muted', 'false');
      } catch (e) {}
      this.applyStation(true);
      if (mode === 'race' || mode === 'countdown') {
        const player = racers.find((r) => r.isPlayer);
        announcePickup(player, 'radio', this.currentStation.name, this.currentStation.freq);
      }
      return;
    }
    this.muted = !this.muted;
    try {
      localStorage.setItem('desert_loop_radio_muted', String(this.muted));
    } catch (e) {}
    if (this.muted) {
      this.audio.pause();
    } else {
      this.audio.volume = this.volume;
      this.audio.play().catch(() => {});
    }
    this.updateUI();
    if (mode === 'race' || mode === 'countdown') {
      const player = racers.find((r) => r.isPlayer);
      announcePickup(player, 'radio', this.muted ? 'RADIO MUTED' : st.name, this.muted ? '' : st.freq);
    }
  }

  ensurePlaying() {
    if (!this.muted && this.currentStation.src && this.audio.paused) {
      this.audio.volume = this.volume;
      this.audio.play().catch(() => {});
    }
  }

  updateUI() {
    const st = this.currentStation;
    const isPlaying = !this.muted && Boolean(st.src) && !this.audio.paused;
    const isOff = !st.src;
    const isMuted = this.muted || isOff;

    if (introRadioTrackEl) {
      introRadioTrackEl.textContent = isOff ? 'Radio Off' : `${st.name} (${st.freq})`;
    }
    if (introRadioEl) {
      introRadioEl.classList.toggle('muted', isMuted);
      introRadioEl.classList.toggle('off', isOff);
      introRadioEl.classList.toggle('playing', isPlaying);
    }
    if (introRadioVolumeEl) {
      introRadioVolumeEl.value = String(this.volume);
    }
    if (introRadioVolNumEl) {
      introRadioVolNumEl.textContent = this.muted ? 'MUTED' : `${Math.round(this.volume * 100)}%`;
    }

    if (radioTitleEl) {
      radioTitleEl.textContent = st.name;
    }
    if (radioFreqBadgeEl) {
      radioFreqBadgeEl.textContent = st.freq;
    }
    if (radioTagEl) {
      radioTagEl.textContent = isOff ? 'OFF' : isPlaying ? 'LIVE' : 'PAUSED';
    }
    if (radioEqEl) {
      radioEqEl.classList.toggle('playing', isPlaying);
      radioEqEl.classList.toggle('muted', isMuted);
      radioEqEl.classList.toggle('off', isOff);
    }
    if (radioHudEl) {
      radioHudEl.classList.toggle('muted', isMuted);
      radioHudEl.classList.toggle('off', isOff);
      radioHudEl.classList.toggle('playing', isPlaying);
    }
    if (radioVolumeEl) {
      radioVolumeEl.value = String(this.volume);
    }
    if (radioVolNumEl) {
      radioVolNumEl.textContent = this.muted ? 'MUTED' : `${Math.round(this.volume * 100)}%`;
    }
  }
}

const radioManager = new RadioManager();

let selectedId = VEHICLES[2].id; // muscle as default pick
let totalLaps = TOTAL_LAPS_DEFAULT;
let mode = 'menu'; // menu | countdown | race | finish
let lossOrbitStart = null;
let finishCinematicStart = null;
let finishPlaceSaved = 1;
const finishSideCamPos = new THREE.Vector3();

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

function speedoPoint(radius, ratio) {
  const deg = SPEEDO_START_DEG + ratio * SPEEDO_SWEEP_DEG;
  const rad = (deg - 90) * Math.PI / 180;
  return {
    x: 100 + Math.cos(rad) * radius,
    y: 100 + Math.sin(rad) * radius,
    deg,
  };
}

function speedoArcPath(radius, fromRatio, toRatio) {
  const start = speedoPoint(radius, fromRatio);
  const end = speedoPoint(radius, toRatio);
  const sweep = (toRatio - fromRatio) * SPEEDO_SWEEP_DEG;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function buildSpeedometer() {
  if (!speedTicksEl) return;
  const marks = [];
  for (let kmh = 0; kmh <= SPEEDO_MAX_KMH; kmh += 10) {
    const t = kmh / SPEEDO_MAX_KMH;
    const major = kmh % 40 === 0;
    const outer = speedoPoint(72, t);
    const inner = speedoPoint(major ? 58 : 64, t);
    marks.push(
      `<line class="tick${major ? ' major' : ''}" x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" />`
    );
    if (major) {
      const label = speedoPoint(46, t);
      marks.push(`<text class="label" x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}">${kmh}</text>`);
    }
  }
  speedTicksEl.innerHTML = marks.join('');
  if (speedTrackEl) speedTrackEl.setAttribute('d', speedoArcPath(72, 0, 1));
  if (speedRedzoneEl) speedRedzoneEl.setAttribute('d', speedoArcPath(72, 0.8, 1));
  updateSpeedometer(0, false);
}

function updateSpeedometer(speedMs, boosting = false) {
  const kmh = Math.round(Math.abs(speedMs) * 3.6);
  if (speedoEl) speedoEl.classList.toggle('boost', Boolean(boosting));
  const ratio = THREE.MathUtils.clamp(kmh / SPEEDO_MAX_KMH, 0, 1);
  const angle = SPEEDO_START_DEG + ratio * SPEEDO_SWEEP_DEG;
  if (speedNeedleEl) speedNeedleEl.setAttribute('transform', `rotate(${angle.toFixed(2)} 100 100)`);
  if (speedProgressEl) {
    speedProgressEl.setAttribute('d', ratio <= 0.001 ? '' : speedoArcPath(72, 0, ratio));
  }
}
buildSpeedometer();

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

document.querySelectorAll('.track-pick button').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const trackId = btn.dataset.track;
    if (trackId === selectedTrackId) return;
    try {
      localStorage.setItem('desert_loop_track', trackId);
    } catch (e) {}
    await buildTrack(trackId);
  });
});

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

introRadioPrevBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.prevStation(); });
introRadioNextBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.nextStation(); });
introRadioToggleBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.toggleMute(); });

radioPrevBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.prevStation(); });
radioNextBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.nextStation(); });
radioToggleBtn?.addEventListener('click', (e) => { e.stopPropagation(); radioManager.toggleMute(); });

const onVolumeSliderInput = (e) => {
  e.stopPropagation();
  radioManager.setVolume(parseFloat(e.target.value));
};
introRadioVolumeEl?.addEventListener('input', onVolumeSliderInput);
introRadioVolumeEl?.addEventListener('change', onVolumeSliderInput);
radioVolumeEl?.addEventListener('input', onVolumeSliderInput);
radioVolumeEl?.addEventListener('change', onVolumeSliderInput);

const keys = new Set();
addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyR' && mode === 'race') resetPlayer();
  if (e.code === 'KeyN' && mode === 'race' && !e.repeat) tryUseNitro();
  if (e.code === 'KeyT' && !e.repeat) radioManager.nextStation();
  if (e.code === 'BracketRight' && !e.repeat) radioManager.nextStation();
  if (e.code === 'BracketLeft' && !e.repeat) radioManager.prevStation();
  if (e.code === 'KeyM' && !e.repeat) radioManager.toggleMute();
  if (e.code === 'Escape') showMenu();
});
addEventListener('keyup', (e) => keys.delete(e.code));

// —— Scene ——
const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG_COLOR);
scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, CAMERA_FAR);
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

const loader = new GLTFLoader();
const racers = []; // { mesh, drive, wheels, steers, def, ai, wp, lap, crossed, lastSide }

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(420, 96),
  new THREE.MeshLambertMaterial({ color: 0xc9d4a3 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);

const flats = new THREE.Mesh(
  new THREE.RingGeometry(400, 880, 80),
  new THREE.MeshLambertMaterial({ color: 0xdbc8a4 })
);
flats.rotation.x = -Math.PI / 2;
flats.position.y = -0.04;
flats.receiveShadow = true;
scene.add(flats);

const trackGroup = new THREE.Group();
scene.add(trackGroup);

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
  trackGroup.add(obj);
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
let trackCurve = new THREE.CurvePath();
let LOOP_LEN = 1640;

function frameAt(t) {
  if (!trackCurve) return { p: new THREE.Vector3(), tan: new THREE.Vector3(1, 0, 0), side: new THREE.Vector3(0, 0, 1) };
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

function sceneryRng(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function scatterTrackScenery(count, dist0, dist1, seed, treeChance) {
  const trees = [createTallPine, createStreetTree, createPine, createOak];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.37) / count;
    const { p, side, tan } = frameAt(t);
    const outward = sceneryRng(seed + i) > 0.42 ? -1 : 1;
    const dist = ROAD_WIDTH * 0.5 + dist0 + sceneryRng(seed + i + 3) * (dist1 - dist0);
    const along = (sceneryRng(seed + i + 7) - 0.5) * 16;
    const x = p.x + side.x * outward * dist + tan.x * along;
    const z = p.z + side.z * outward * dist + tan.z * along;
    const yaw = sceneryRng(seed + i + 11) * Math.PI * 2;
    const roll = sceneryRng(seed + i + 13);
    if (roll < treeChance) {
      const tree = trees[i % trees.length];
      const obj = place(tree, x, z, yaw);
      const s = 0.88 + sceneryRng(seed + i + 17) * 0.65;
      obj.scale.setScalar(tree === createPine ? s * 2.3 : s);
    } else if (roll < treeChance + 0.15) {
      place(createBush, x, z, yaw);
    } else if (roll < treeChance + 0.24) {
      place(createCactus, x, z, yaw);
    } else if (roll < treeChance + 0.34) {
      place(createRock, x, z, yaw);
    } else {
      place(createRockSpire, x, z, yaw);
    }
  }
}

function findCornerSpans() {
  const steps = 140;
  const mark = [];
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const a = frameAt(t);
    const b = frameAt((t + 2 / steps) % 1);
    mark[i] = a.tan.dot(b.tan) < 0.96;
  }
  const spans = [];
  let i = 0;
  while (i < steps) {
    if (!mark[i]) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < steps && mark[j]) j += 1;
    spans.push({ t0: i / steps, t1: j / steps });
    i = j;
  }
  if (spans.length >= 2 && mark[0] && mark[steps - 1]) {
    const first = spans.shift();
    const last = spans.pop();
    spans.push({ t0: last.t0, t1: first.t1 + 1 });
  }
  return spans;
}

function walkSpan(span, steps, fn) {
  const len = span.t1 - span.t0;
  for (let i = 0; i < steps; i++) {
    const t = (((span.t0 + (i / Math.max(1, steps - 1)) * len) % 1) + 1) % 1;
    fn(t, i);
  }
}

function placeTreeGroves() {
  for (let g = 0; g < 12; g++) {
    const t = (g + 0.18) / 12;
    const { p, side, tan } = frameAt(t);
    const outward = g % 2 === 0 ? -1 : 1;
    const dist = 62 + (g % 4) * 16;
    const cx = p.x + side.x * outward * dist + tan.x * ((g % 3) - 1) * 8;
    const cz = p.z + side.z * outward * dist + tan.z * ((g % 3) - 1) * 8;
    const count = 7;
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + g;
      const r = 3.2 + (k % 4) * 2.4;
      const factory = k % 3 === 0 ? createOak : createTallPine;
      const obj = place(factory, cx + Math.cos(a) * r, cz + Math.sin(a) * r, a);
      obj.scale.setScalar(1.05 + (k % 5) * 0.12);
    }
  }
}

function placeCornerWoods() {
  const spans = findCornerSpans();
  for (const [spanIndex, span] of spans.entries()) {
    walkSpan(span, 30, (t, i) => {
      const { p, side, tan } = frameAt(t);
      for (const dir of [-1, 1]) {
        const dist = 8 + sceneryRng(spanIndex * 40 + i + dir + 3) * 26;
        const along = (sceneryRng(spanIndex * 40 + i + 9) - 0.5) * 9;
        const x = p.x + side.x * dir * (ROAD_WIDTH * 0.5 + dist) + tan.x * along;
        const z = p.z + side.z * dir * (ROAD_WIDTH * 0.5 + dist) + tan.z * along;
        const yaw = sceneryRng(spanIndex * 40 + i + 14) * Math.PI * 2;
        const roll = sceneryRng(spanIndex * 40 + i + 18);
        if (roll < 0.72) {
          const factory = i % 5 === 0 ? createOak : createTallPine;
          const obj = place(factory, x, z, yaw);
          obj.scale.setScalar(1.08 + sceneryRng(spanIndex * 40 + i + 21) * 0.5);
        } else if (roll < 0.88) {
          place(createBush, x, z, yaw);
        } else {
          place(createRock, x, z, yaw);
        }
      }
    });
  }
}

function placeScenery() {
  scatterTrackScenery(380, 8, 40, 1, 0.58);
  scatterTrackScenery(170, 42, 98, 80, 0.72);
  scatterTrackScenery(90, 105, 175, 160, 0.8);
  placeTreeGroves();
  placeCornerWoods();
}

function placeAmericanDesertScenery() {
  // Rich American southwest desert scenery: Saguaro cacti, red rock spires, sandstone boulders, desert scrub
  const count = 460;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.33) / count;
    const { p, side, tan } = frameAt(t);
    const outward = sceneryRng(100 + i) > 0.45 ? -1 : 1;
    const dist = ROAD_WIDTH * 0.5 + 4 + sceneryRng(100 + i + 3) * 65;
    const along = (sceneryRng(100 + i + 7) - 0.5) * 18;
    const x = p.x + side.x * outward * dist + tan.x * along;
    const z = p.z + side.z * outward * dist + tan.z * along;
    const yaw = sceneryRng(100 + i + 11) * Math.PI * 2;
    const roll = sceneryRng(100 + i + 13);

    if (roll < 0.35) {
      const obj = place(createCactus, x, z, yaw);
      const s = 1.0 + sceneryRng(100 + i + 17) * 0.8;
      obj.scale.setScalar(s);
    } else if (roll < 0.58) {
      const obj = place(createRockSpire, x, z, yaw);
      const s = 1.2 + sceneryRng(100 + i + 19) * 1.5;
      obj.scale.set(s * (0.8 + sceneryRng(100 + i + 21) * 0.4), s * 1.4, s * (0.8 + sceneryRng(100 + i + 23) * 0.4));
    } else if (roll < 0.76) {
      const obj = place(createRock, x, z, yaw);
      obj.scale.setScalar(1.1 + sceneryRng(100 + i + 27) * 1.0);
    } else if (roll < 0.88) {
      // Single tall grass tuft spot
      const tuft = place(createSeagrass, x, z, yaw, {
        colorway: 'bleached-bed',
        tallness: 0.95 + sceneryRng(100 + i + 29) * 0.15,
        blades: 11,
      });
      tuft.scale.setScalar(1.2 + sceneryRng(100 + i + 31) * 0.7);
    } else if (roll < 0.96) {
      place(createBush, x, z, yaw);
    } else {
      const obj = place(createPine, x, z, yaw);
      obj.scale.setScalar(1.4);
    }
  }

  // Tiny spots of tall grass (clusters of 2-3 tufts along roadside shoulders & desert floor)
  const grassSpotCount = 130;
  for (let g = 0; g < grassSpotCount; g++) {
    const t = (g + 0.19) / grassSpotCount;
    const { p, side, tan } = frameAt(t);
    const outward = sceneryRng(500 + g) > 0.5 ? -1 : 1;
    const dist = ROAD_WIDTH * 0.5 + 2.5 + sceneryRng(500 + g + 2) * 32;
    const along = (sceneryRng(500 + g + 5) - 0.5) * 16;
    const cx = p.x + side.x * outward * dist + tan.x * along;
    const cz = p.z + side.z * outward * dist + tan.z * along;

    const clusterSize = sceneryRng(500 + g + 7) > 0.4 ? 3 : 2;
    for (let k = 0; k < clusterSize; k++) {
      const ox = cx + (sceneryRng(500 + g * 10 + k * 4) - 0.5) * 1.6;
      const oz = cz + (sceneryRng(500 + g * 10 + k * 4 + 1) - 0.5) * 1.6;
      const yaw = sceneryRng(500 + g * 10 + k * 4 + 2) * Math.PI * 2;
      const colorScheme = sceneryRng(500 + g * 10 + k) > 0.2 ? 'bleached-bed' : 'reef-green';
      const tuft = place(createSeagrass, ox, oz, yaw, {
        colorway: colorScheme,
        tallness: 0.9 + sceneryRng(500 + g * 10 + k * 4 + 3) * 0.2,
        blades: 10 + (k % 3),
      });
      tuft.scale.setScalar(1.1 + sceneryRng(500 + g * 10 + k * 4 + 4) * 0.8);
    }
  }

  // Canyon wall formations on corner spans
  const spans = findCornerSpans();
  for (const [spanIndex, span] of spans.entries()) {
    walkSpan(span, 32, (t, i) => {
      const { p, side, tan } = frameAt(t);
      for (const dir of [-1, 1]) {
        const dist = 7 + sceneryRng(spanIndex * 50 + i + dir + 5) * 32;
        const along = (sceneryRng(spanIndex * 50 + i + 11) - 0.5) * 10;
        const x = p.x + side.x * dir * (ROAD_WIDTH * 0.5 + dist) + tan.x * along;
        const z = p.z + side.z * dir * (ROAD_WIDTH * 0.5 + dist) + tan.z * along;
        const yaw = sceneryRng(spanIndex * 50 + i + 14) * Math.PI * 2;
        const roll = sceneryRng(spanIndex * 50 + i + 18);
        if (roll < 0.45) {
          const spire = place(createRockSpire, x, z, yaw);
          spire.scale.set(1.5 + sceneryRng(spanIndex * 50 + i + 2) * 1.8, 2.2 + sceneryRng(spanIndex * 50 + i + 4) * 1.6, 1.5);
        } else if (roll < 0.70) {
          const rock = place(createRock, x, z, yaw);
          rock.scale.setScalar(1.4 + sceneryRng(spanIndex * 50 + i + 6) * 1.2);
        } else if (roll < 0.85) {
          const cactus = place(createCactus, x, z, yaw);
          cactus.scale.setScalar(1.3);
        } else {
          // Grass tuft at base of canyon wall / rock
          const tuft = place(createSeagrass, x, z, yaw, { colorway: 'bleached-bed', tallness: 1.05 });
          tuft.scale.setScalar(1.3);
        }
      }
    });
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

const buildingTemplates = {};
async function loadBuildingTemplate(id) {
  if (buildingTemplates[id]) return buildingTemplates[id];
  const gltf = await loader.loadAsync(`./assets/${id}-preview.glb`);
  const asset = gltf.scene;
  asset.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  buildingTemplates[id] = asset;
  return asset;
}

async function placeBuildings() {
  const templates = {};
  await Promise.all(BUILDING_IDS.map(async (id) => {
    templates[id] = await loadBuildingTemplate(id);
  }));

  const clusters = [
    { t: 0.02, ids: ['street-diner-bb174e', 'corner-shop-db18e2', 'two-story-house-40f6dc', 'timber-barn-90b3ce', 'village-tavern-4e94e3'] },
    { t: 0.08, ids: ['village-tavern-4e94e3', 'three-storey-shophouse-2f6378', 'street-diner-bb174e', 'cove-tavern-5861a6'] },
    { t: 0.14, ids: ['two-story-house-40f6dc', 'corner-shop-db18e2', 'timber-barn-90b3ce'] },
    { t: 0.2, ids: ['cove-tavern-5861a6', 'two-story-house-40f6dc', 'corner-shop-db18e2', 'timber-barn-90b3ce', 'street-diner-bb174e'] },
    { t: 0.27, ids: ['street-diner-bb174e', 'village-tavern-4e94e3', 'three-storey-shophouse-2f6378', 'two-story-house-40f6dc'] },
    { t: 0.34, ids: ['cove-tavern-5861a6', 'two-story-house-40f6dc', 'corner-shop-db18e2', 'timber-barn-90b3ce'] },
    { t: 0.41, ids: ['village-tavern-4e94e3', 'street-diner-bb174e', 'three-storey-shophouse-2f6378', 'cove-tavern-5861a6'] },
    { t: 0.48, ids: ['two-story-house-40f6dc', 'cove-tavern-5861a6', 'corner-shop-db18e2', 'street-diner-bb174e', 'timber-barn-90b3ce'] },
    { t: 0.55, ids: ['timber-barn-90b3ce', 'village-tavern-4e94e3', 'two-story-house-40f6dc', 'three-storey-shophouse-2f6378'] },
    { t: 0.62, ids: ['street-diner-bb174e', 'three-storey-shophouse-2f6378', 'corner-shop-db18e2'] },
    { t: 0.69, ids: ['cove-tavern-5861a6', 'two-story-house-40f6dc', 'timber-barn-90b3ce', 'village-tavern-4e94e3'] },
    { t: 0.76, ids: ['village-tavern-4e94e3', 'two-story-house-40f6dc', 'timber-barn-90b3ce', 'street-diner-bb174e'] },
    { t: 0.83, ids: ['corner-shop-db18e2', 'street-diner-bb174e', 'three-storey-shophouse-2f6378', 'two-story-house-40f6dc', 'cove-tavern-5861a6'] },
    { t: 0.9, ids: ['cove-tavern-5861a6', 'village-tavern-4e94e3', 'timber-barn-90b3ce', 'corner-shop-db18e2'] },
    { t: 0.96, ids: ['street-diner-bb174e', 'two-story-house-40f6dc', 'corner-shop-db18e2', 'village-tavern-4e94e3'] },
  ];

  for (const [clusterIndex, cl] of clusters.entries()) {
    const { p, side, tan } = frameAt(cl.t);
    const base = ROAD_WIDTH * 0.5 + 16;
    const primarySide = clusterIndex % 2 === 0 ? -1 : 1;
    const districtSides = clusterIndex % 2 === 0 ? [primarySide, -primarySide] : [primarySide];
    districtSides.forEach((districtSide, sideIndex) => {
      const ids = sideIndex === 0 ? cl.ids : cl.ids.slice(0, Math.max(3, cl.ids.length - 1)).reverse();
      ids.forEach((id, i) => {
        const lat = base + (i % 3) * 11 + sideIndex * 3;
        const along = (i - (ids.length - 1) / 2) * 10;
        const x = p.x + side.x * districtSide * lat + tan.x * along;
        const z = p.z + side.z * districtSide * lat + tan.z * along;
        const b = templates[id].clone(true);
        b.position.set(x, 0, z);
        b.rotation.y = Math.atan2(-side.x * districtSide, -side.z * districtSide)
          + (i % 2 === 0 ? 0 : 0.22);
        trackGroup.add(b);
      });
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

  const outliers = [
    { t: 0.05, dist: 46, id: 'timber-barn-90b3ce', side: 1 },
    { t: 0.22, dist: 50, id: 'two-story-house-40f6dc', side: -1 },
    { t: 0.38, dist: 48, id: 'cove-tavern-5861a6', side: 1 },
    { t: 0.58, dist: 52, id: 'timber-barn-90b3ce', side: -1 },
    { t: 0.74, dist: 47, id: 'village-tavern-4e94e3', side: 1 },
    { t: 0.91, dist: 49, id: 'two-story-house-40f6dc', side: -1 },
  ];
  for (const spot of outliers) {
    const { p, side } = frameAt(spot.t);
    const x = p.x + side.x * spot.side * spot.dist;
    const z = p.z + side.z * spot.side * spot.dist;
    const b = templates[spot.id].clone(true);
    b.position.set(x, 0, z);
    b.rotation.y = Math.atan2(-side.x * spot.side, -side.z * spot.side);
    trackGroup.add(b);
  }

  const cornerIds = BUILDING_IDS;
  for (const [spanIndex, span] of findCornerSpans().entries()) {
    walkSpan(span, 6, (t, step) => {
      const { p, side, tan } = frameAt(t);
      for (const dir of [-1, 1]) {
        const rows = 2 + (step % 2);
        for (let k = 0; k < rows; k++) {
          const id = cornerIds[(spanIndex * 5 + step * 2 + k) % cornerIds.length];
          const lat = ROAD_WIDTH * 0.5 + 13 + k * 11;
          const along = (k - 0.4) * 5.5;
          const x = p.x + side.x * dir * lat + tan.x * along;
          const z = p.z + side.z * dir * lat + tan.z * along;
          const b = templates[id].clone(true);
          b.position.set(x, 0, z);
          b.rotation.y = Math.atan2(-side.x * dir, -side.z * dir) + (k ? 0.18 : 0);
          trackGroup.add(b);
        }
      }
    });
  }
}

async function placeAmericanDesertBuildings() {
  const templates = {};
  await Promise.all(BUILDING_IDS.map(async (id) => {
    templates[id] = await loadBuildingTemplate(id);
  }));

  // Route 66 Highway pitstops, diners, desert barns, outpost stations
  const clusters = [
    { t: 0.04, ids: ['street-diner-bb174e', 'corner-shop-db18e2', 'timber-barn-90b3ce'] },
    { t: 0.28, ids: ['cove-tavern-5861a6', 'two-story-house-40f6dc'] },
    { t: 0.55, ids: ['street-diner-bb174e', 'timber-barn-90b3ce', 'two-story-house-40f6dc'] },
    { t: 0.78, ids: ['village-tavern-4e94e3', 'corner-shop-db18e2'] },
    { t: 0.94, ids: ['timber-barn-90b3ce', 'street-diner-bb174e'] },
  ];

  for (const [clusterIndex, cl] of clusters.entries()) {
    const { p, side, tan } = frameAt(cl.t);
    const base = ROAD_WIDTH * 0.5 + 15;
    const dir = clusterIndex % 2 === 0 ? 1 : -1;
    cl.ids.forEach((id, i) => {
      const lat = base + (i % 2) * 12;
      const along = (i - (cl.ids.length - 1) / 2) * 12;
      const x = p.x + side.x * dir * lat + tan.x * along;
      const z = p.z + side.z * dir * lat + tan.z * along;
      const b = templates[id].clone(true);
      b.position.set(x, 0, z);
      b.rotation.y = Math.atan2(-side.x * dir, -side.z * dir);
      trackGroup.add(b);
    });
    for (const offset of [-6, 0, 6]) {
      const x = p.x + side.x * dir * (base - 5) + tan.x * offset;
      const z = p.z + side.z * dir * (base - 5) + tan.z * offset;
      place(createFence, x, z, Math.atan2(tan.x, tan.z));
    }
    place(
      createSign,
      p.x + side.x * dir * (ROAD_WIDTH * 0.5 + 7),
      p.z + side.z * dir * (ROAD_WIDTH * 0.5 + 7),
      Math.atan2(-side.x * dir, -side.z * dir)
    );
  }
}

function hash2(ix, iz, seed) {
  const n = Math.sin(ix * 127.1 + iz * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x, z, seed) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash2(x0, z0, seed), hash2(x0 + 1, z0, seed), sx),
    THREE.MathUtils.lerp(hash2(x0, z0 + 1, seed), hash2(x0 + 1, z0 + 1, seed), sx),
    sz
  );
}

function fbm2(x, z, seed, octaves = 5) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    v += valueNoise(x * freq, z * freq, seed + i * 19) * amp;
    sum += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return v / sum;
}

function ridgeFbm(x, z, seed) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const n = 1 - Math.abs(valueNoise(x * freq, z * freq, seed + i * 13) * 2 - 1);
    v += n * n * amp;
    sum += amp;
    amp *= 0.48;
    freq *= 2.12;
  }
  return v / sum;
}

function mountainHeight(x, z, seed, width, depth) {
  const nx = x / (width * 0.5);
  const nz = z / (depth * 0.5);
  const edge = Math.max(0, 1 - (nx * nx * 0.86 + nz * nz * 1.02));
  const envelope = edge * edge;
  const wx = nx + (fbm2(nx * 1.3, nz * 1.3, seed) - 0.5) * 0.55;
  const wz = nz + (fbm2(nx * 1.3 + 6, nz * 1.3, seed + 4) - 0.5) * 0.4;
  const body = fbm2(wx * 2.1 + 2, wz * 2.6, seed + 8, 5);
  const ridges = ridgeFbm(wx * 3.1, wz * 4.6, seed + 12);
  let peaks = 0;
  for (let p = 0; p < 5; p++) {
    const px = (hash2(p, 1, seed) - 0.5) * 1.2;
    const pz = (hash2(p, 2, seed) - 0.5) * 0.4;
    const dx = nx - px;
    const dz = nz - pz;
    peaks += Math.exp(-(dx * dx * 2.1 + dz * dz * 5.8) * (1.05 + hash2(p, 3, seed)))
      * (0.4 + hash2(p, 4, seed) * 0.7);
  }
  return Math.max(0, (body * 0.3 + ridges * 0.56 + peaks * 0.78) * envelope);
}

const MOUNTAIN_BIOMES = {
  foothill: {
    desert: new THREE.Color(0xb08960),
    dirt: new THREE.Color(0x7d623f),
    forest: new THREE.Color(0x2f4a28),
    meadow: new THREE.Color(0x4f6a34),
    rock: new THREE.Color(0x6a6560),
    cliff: new THREE.Color(0x4a4640),
    snow: new THREE.Color(0xf4f1ea),
    ice: new THREE.Color(0xd5e0ea),
    snowLine: 0.74,
    forestLo: 0.08,
    forestHi: 0.5,
  },
  alpine: {
    desert: new THREE.Color(0x9a7a52),
    dirt: new THREE.Color(0x6d5840),
    forest: new THREE.Color(0x243c24),
    meadow: new THREE.Color(0x3f5a30),
    rock: new THREE.Color(0x6e6862),
    cliff: new THREE.Color(0x3f3c38),
    snow: new THREE.Color(0xf7f5f1),
    ice: new THREE.Color(0xd8e6f0),
    snowLine: 0.54,
    forestLo: 0.1,
    forestHi: 0.44,
  },
  high: {
    desert: new THREE.Color(0xb8a088),
    dirt: new THREE.Color(0x8a7864),
    forest: new THREE.Color(0x3a4a3c),
    meadow: new THREE.Color(0x5a6850),
    rock: new THREE.Color(0x8a8680),
    cliff: new THREE.Color(0x5c5854),
    snow: new THREE.Color(0xf8f6f2),
    ice: new THREE.Color(0xe2eaf2),
    snowLine: 0.36,
    forestLo: 0.06,
    forestHi: 0.32,
  },
  canyon: {
    desert: new THREE.Color(0xd47a3e),
    dirt: new THREE.Color(0xa85226),
    forest: new THREE.Color(0x784422),
    meadow: new THREE.Color(0xb86432),
    rock: new THREE.Color(0xbf5b28),
    cliff: new THREE.Color(0x8a3818),
    snow: new THREE.Color(0xecd4b4),
    ice: new THREE.Color(0xdfba92),
    snowLine: 0.95,
    forestLo: 0.04,
    forestHi: 0.22,
  },
};

function colorMountainVertex(tmp, t, slope, north, biome) {
  const snowLine = biome.snowLine - north * 0.12;
  if (t > snowLine && slope < 0.58) {
    const pack = THREE.MathUtils.smoothstep(snowLine, snowLine + 0.16, t);
    tmp.copy(biome.rock).lerp(north > 0.2 ? biome.ice : biome.snow, pack);
    if (slope > 0.42) tmp.lerp(biome.cliff, (slope - 0.42) / 0.16);
    return tmp;
  }
  if (slope > 0.52) {
    tmp.copy(biome.rock).lerp(biome.cliff, THREE.MathUtils.clamp((slope - 0.52) / 0.3, 0, 1));
    return tmp;
  }
  if (t > biome.forestLo && t < biome.forestHi && slope < 0.44) {
    const cover = THREE.MathUtils.smoothstep(biome.forestLo, biome.forestLo + 0.1, t)
      * (1 - THREE.MathUtils.smoothstep(biome.forestHi - 0.08, biome.forestHi, t));
    tmp.copy(biome.dirt).lerp(biome.forest, 0.55 + cover * 0.45);
    if (t < biome.forestLo + 0.12) tmp.lerp(biome.meadow, 0.35);
    return tmp;
  }
  if (t < 0.16) {
    tmp.copy(biome.desert).lerp(biome.dirt, t / 0.16);
    return tmp;
  }
  tmp.copy(biome.dirt).lerp(biome.rock, THREE.MathUtils.clamp((t - 0.16) / 0.5, 0, 1));
  if (t > 0.38 && t < 0.55 && slope < 0.32) tmp.lerp(biome.meadow, 0.28);
  return tmp;
}

function makeMountainRange(seed, width, depth, height, biomeKey, segs = [56, 30]) {
  const biome = MOUNTAIN_BIOMES[biomeKey] || MOUNTAIN_BIOMES.alpine;
  const geo = new THREE.PlaneGeometry(width, depth, segs[0], segs[1]);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const h = mountainHeight(pos.getX(i), pos.getZ(i), seed, width, depth) * height;
    pos.setY(i, h);
  }
  geo.computeVertexNormals();
  const nor = geo.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp(pos.getY(i) / height, 0, 1);
    const ny = nor.getY(i);
    const slope = 1 - THREE.MathUtils.clamp(ny, 0, 1);
    const north = THREE.MathUtils.clamp(nor.getZ(i), 0, 1);
    colorMountainVertex(tmp, t, slope, north, biome);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
    if (t > biome.snowLine && slope < 0.35) pos.setY(i, pos.getY(i) + 0.8);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function plantMountainForest(mesh, seed, width, depth, height, count, scale) {
  mesh.updateMatrixWorld(true);
  const local = new THREE.Vector3();
  const world = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const lx = (sceneryRng(seed + i * 2) - 0.5) * width * 0.78;
    const lz = (sceneryRng(seed + i * 2 + 1) - 0.5) * depth * 0.64;
    const hn = mountainHeight(lx, lz, seed, width, depth);
    if (hn < 0.1 || hn > 0.66) continue;
    local.set(lx, hn * height, lz);
    world.copy(local).applyMatrix4(mesh.matrixWorld);
    const snowy = hn > 0.45;
    const pine = createTallPine({
      season: snowy ? 'snow' : 'summer',
      colorway: snowy ? 'shadow-spruce' : i % 3 === 0 ? 'spring-fir' : 'deep-pine',
      tallness: 6.8 + sceneryRng(seed + i + 9) * 2.4,
    });
    pine.position.copy(world);
    pine.rotation.y = sceneryRng(seed + i + 11) * Math.PI * 2;
    pine.scale.setScalar(scale * (0.9 + sceneryRng(seed + i + 13) * 0.5));
    pine.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = false;
        c.receiveShadow = false;
      }
    });
    trackGroup.add(pine);
  }
}

function createSkyDome() {
  const radius = 980;
  const geo = new THREE.SphereGeometry(radius, 40, 18, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const cols = [];
  const pos = geo.attributes.position;
  const horizon = new THREE.Color(scene.fog ? scene.fog.color : FOG_COLOR);
  const zenith = new THREE.Color(0x8ec4e8);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp(pos.getY(i) / radius, 0, 1);
    tmp.copy(horizon).lerp(zenith, t ** 0.62);
    cols.push(tmp.r, tmp.g, tmp.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    })
  );
  mesh.position.y = -16;
  return mesh;
}

function placeHorizonStandard() {
  trackGroup.add(createSkyDome());
  const mat = { vertexColors: true, flatShading: false };

  const placeRange = (count, radius, width, depth, height, biome, seed0, yawJitter, forest, treeScale, segs) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.08;
      const r = radius + sceneryRng(seed0 + i) * 36;
      const w = width * (0.88 + sceneryRng(seed0 + i + 2) * 0.26);
      const d = depth * (0.84 + sceneryRng(seed0 + i + 4) * 0.28);
      const h = height * (0.82 + sceneryRng(seed0 + i + 6) * 0.38);
      const seed = seed0 + i * 17.3;
      const mesh = new THREE.Mesh(
        makeMountainRange(seed, w, d, h, biome, segs),
        new THREE.MeshLambertMaterial(mat)
      );
      mesh.position.set(Math.cos(a) * r, -3, Math.sin(a) * r);
      mesh.rotation.y = -a - Math.PI * 0.5 + (sceneryRng(seed0 + i + 8) - 0.5) * yawJitter;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      trackGroup.add(mesh);
      if (forest > 0) plantMountainForest(mesh, seed, w, d, h, forest, treeScale);
    }
  };

  placeRange(7, 420, 170, 80, 46, 'foothill', 3, 0.2, 34, 1.55, [48, 26]);
  placeRange(9, 545, 260, 115, 98, 'alpine', 21, 0.16, 22, 2.1, [60, 32]);
  placeRange(8, 730, 320, 140, 138, 'high', 44, 0.1, 0, 1, [48, 26]);
}

function placeHorizonAmericanDesert() {
  trackGroup.add(createSkyDome());
  const mat = { vertexColors: true, flatShading: false };

  const placeRange = (count, radius, width, depth, height, biome, seed0, yawJitter, segs) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.12;
      const r = radius + sceneryRng(seed0 + i) * 36;
      const w = width * (0.88 + sceneryRng(seed0 + i + 2) * 0.26);
      const d = depth * (0.84 + sceneryRng(seed0 + i + 4) * 0.28);
      const h = height * (0.82 + sceneryRng(seed0 + i + 6) * 0.38);
      const seed = seed0 + i * 17.3;
      const mesh = new THREE.Mesh(
        makeMountainRange(seed, w, d, h, biome, segs),
        new THREE.MeshLambertMaterial(mat)
      );
      mesh.position.set(Math.cos(a) * r, -3, Math.sin(a) * r);
      mesh.rotation.y = -a - Math.PI * 0.5 + (sceneryRng(seed0 + i + 8) - 0.5) * yawJitter;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      trackGroup.add(mesh);
    }
  };

  // Southwestern Canyon Mesas & Ridge backdrop
  placeRange(8, 430, 180, 85, 52, 'canyon', 11, 0.22, [48, 26]);
  placeRange(9, 560, 280, 120, 105, 'canyon', 37, 0.16, [60, 32]);
  placeRange(8, 740, 340, 145, 145, 'high', 55, 0.1, [48, 26]);
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

let boostPadTexture = null;

function drawBoostChevron(ctx, cx, tipY, halfW, height, bar) {
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx + halfW, tipY - height);
  ctx.lineTo(cx + halfW - bar, tipY - height);
  ctx.lineTo(cx, tipY - bar * 0.92);
  ctx.lineTo(cx - halfW + bar, tipY - height);
  ctx.lineTo(cx - halfW, tipY - height);
  ctx.closePath();
}

function getBoostPadTexture() {
  if (boostPadTexture) return boostPadTexture;
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const count = 4;
  const halfW = w * 0.4;
  const height = 188;
  const bar = 62;
  const step = 228;
  const firstTip = 198;

  for (let i = 0; i < count; i++) {
    const tipY = firstTip + i * step;
    ctx.fillStyle = 'rgba(18, 8, 10, 0.38)';
    drawBoostChevron(ctx, w / 2 + 3, tipY + 4, halfW, height, bar);
    ctx.fill();
    ctx.fillStyle = '#ff3b3b';
    drawBoostChevron(ctx, w / 2, tipY, halfW, height, bar);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  boostPadTexture = tex;
  return tex;
}

function makeBoostPadMesh() {
  const group = new THREE.Group();
  const length = 7.1;
  const width = 4.9;
  const paint = new THREE.MeshLambertMaterial({
    map: getBoostPadTexture(),
    color: 0xffffff,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    emissive: 0xff2a2a,
    emissiveMap: getBoostPadTexture(),
    emissiveIntensity: 0.28,
  });
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(width, length), paint);
  decal.rotation.x = -Math.PI / 2;
  group.add(decal);
  group.userData.paint = paint;
  return group;
}

const pickupTexCache = new Map();

function makeCanvasTexture(width, height, draw, key) {
  if (key && pickupTexCache.has(key)) return pickupTexCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (key) pickupTexCache.set(key, tex);
  return tex;
}

function hexGeometry(radius) {
  const key = `hex:${radius}`;
  if (pickupTexCache.has(key)) return pickupTexCache.get(key);
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  pickupTexCache.set(key, geo);
  return geo;
}

function getRadialGlowTexture(hex) {
  return makeCanvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 4, w * 0.5, h * 0.5, w * 0.48);
    g.addColorStop(0, hex);
    g.addColorStop(0.28, hex);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, `glow:${hex}`);
}

function getShaftTexture(hex) {
  return makeCanvasTexture(64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.18, hex);
    g.addColorStop(0.55, hex);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.fillRect(w * 0.35, 0, w * 0.3, h);
    const fade = ctx.createLinearGradient(0, 0, w, 0);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.45;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h);
  }, `shaft:${hex}`);
}

function getFuelCanTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    const wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, '#ffd24a');
    wash.addColorStop(0.4, '#ff9a12');
    wash.addColorStop(1, '#d45a00');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(40, 22, 4, 0.2)';
    ctx.fillRect(0, 0, 14, h);
    ctx.fillRect(w - 14, 0, 14, h);
    ctx.fillRect(0, 0, w, 12);
    ctx.fillRect(0, h - 12, w, 12);
    for (let y = 42; y < h - 36; y += 26) {
      ctx.fillStyle = 'rgba(255, 228, 150, 0.16)';
      ctx.fillRect(22, y, w - 44, 6);
      ctx.fillStyle = 'rgba(70, 40, 6, 0.2)';
      ctx.fillRect(22, y + 6, w - 44, 2);
    }
    ctx.fillStyle = '#1b1914';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(46, 74, w - 92, 92, 7);
    else ctx.rect(46, 74, w - 92, 92);
    ctx.fill();
    ctx.strokeStyle = '#ffc44a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#f3ecdc';
    ctx.font = '700 46px "Bebas Neue", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FUEL', w / 2, 110);
    ctx.fillStyle = '#c9a24a';
    ctx.font = '600 15px "DM Sans", sans-serif';
    ctx.fillText('18L  ·  RACE GRADE', w / 2, 142);
  }, 'fuel-can');
}

function getNitroCanTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    const wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, '#c46bff');
    wash.addColorStop(0.4, '#7a28e0');
    wash.addColorStop(1, '#3a0a7a');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(28, 0, 18, h);
    ctx.fillStyle = '#140818';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(46, 74, w - 92, 92, 7);
    else ctx.rect(46, 74, w - 92, 92);
    ctx.fill();
    ctx.strokeStyle = '#e0b8ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#f6edff';
    ctx.font = '700 40px "Bebas Neue", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NITRO', w / 2, 110);
    ctx.fillStyle = '#c89cff';
    ctx.font = '600 15px "DM Sans", sans-serif';
    ctx.fillText('PRESS  N', w / 2, 142);
  }, 'nitro-can');
}

function getRepairKitTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    const wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, '#6aff9a');
    wash.addColorStop(0.45, '#14d45a');
    wash.addColorStop(1, '#0a8a38');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#fff6d8';
    ctx.lineWidth = 16;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(w * 0.5 - 18, 48, 36, 160);
    ctx.fillRect(48, h * 0.5 - 18, 160, 36);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w * 0.5 - 10, 56, 20, 144);
    ctx.fillRect(56, h * 0.5 - 10, 144, 20);
    ctx.fillStyle = '#fff8e8';
    ctx.font = '700 22px "Bebas Neue", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REPAIR', w / 2, 34);
  }, 'repair-kit');
}

function getProjectorTexture(accent) {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const bg = ctx.createRadialGradient(cx, cy, 8, cx, cy, 118);
    bg.addColorStop(0, '#3a2414');
    bg.addColorStop(1, '#1a0e08');
    ctx.fillStyle = bg;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const x = cx + Math.cos(a) * 118;
      const y = cy + Math.sin(a) * 118;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    for (const r of [36, 62, 88]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28);
      ctx.lineTo(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  }, `pad:${accent}`);
}

function makePickupPlatform(accentHex, glowRgba) {
  const group = new THREE.Group();
  const plate = new THREE.Mesh(
    hexGeometry(1.05),
    new THREE.MeshLambertMaterial({
      map: getProjectorTexture(accentHex),
      color: 0xffffff,
      emissive: 0x4a2810,
      emissiveIntensity: 0.55,
    })
  );
  plate.position.y = 0.06;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 3.8),
    new THREE.MeshBasicMaterial({
      map: getRadialGlowTexture(glowRgba),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.05;
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(0.98, 1.1, 6),
    new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.07;
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 0.07, 12),
    new THREE.MeshLambertMaterial({ color: 0x4a2a14, emissive: 0x3a1a0a, emissiveIntensity: 0.35 })
  );
  lens.position.y = 0.11;
  group.add(glow, plate, rim, lens);
  group.userData.glow = glow.material;
  group.userData.rim = rim;
  return group;
}

function makeLightShafts(glowRgba) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    map: getShaftTexture(glowRgba),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  for (const yaw of [0, Math.PI / 2]) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.6), mat);
    plane.rotation.y = yaw;
    plane.position.y = 1.28;
    group.add(plane);
  }
  group.userData.mat = mat;
  return group;
}

function makeFuelPickup() {
  const hover = new THREE.Group();
  const canMat = new THREE.MeshLambertMaterial({
    map: getFuelCanTexture(),
    color: 0xffffff,
    emissive: 0xff7a10,
    emissiveIntensity: 0.55,
  });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0xc9c2b2, emissive: 0x2a261c, emissiveIntensity: 0.08 });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a2d31 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.74, 0.3), canMat);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.34), darkMat);
  skirt.position.y = -0.39;
  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.3), canMat);
  shoulder.position.y = 0.4;
  for (let i = 0; i < 3; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.035, 0.04), darkMat);
    rib.position.set(0, -0.16 + i * 0.16, 0.16);
    hover.add(rib);
  }
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), metalMat);
  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), metalMat);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.06), metalMat);
  postL.position.set(-0.14, 0.54, 0);
  postR.position.set(0.14, 0.54, 0);
  bar.position.set(0, 0.62, 0);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), metalMat);
  cap.position.set(-0.18, 0.49, 0.02);
  hover.add(body, skirt, shoulder, postL, postR, bar, cap);
  return { hover, accent: 0xff9a14, glow: 'rgba(255,150,20,1)' };
}

function makeRepairPickup() {
  const hover = new THREE.Group();
  const kitMat = new THREE.MeshLambertMaterial({
    map: getRepairKitTexture(),
    color: 0xffffff,
    emissive: 0x14e05a,
    emissiveIntensity: 0.5,
  });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0x18e060, emissive: 0x0ab040, emissiveIntensity: 0.45 });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0xc9c2b2 });

  const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.5, 0.52), kitMat);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.54), trimMat);
  lid.position.y = 0.28;
  const latchL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), metalMat);
  const latchR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), metalMat);
  latchL.position.set(-0.16, 0.2, 0.28);
  latchR.position.set(0.16, 0.2, 0.28);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.05), metalMat);
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), metalMat);
  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), metalMat);
  handle.position.set(0, 0.4, 0);
  postL.position.set(-0.12, 0.36, 0);
  postR.position.set(0.12, 0.36, 0);
  hover.add(caseBody, lid, latchL, latchR, handle, postL, postR);
  return { hover, accent: 0x1cff6a, glow: 'rgba(40,255,120,1)' };
}

function makeNitroPickup() {
  const hover = new THREE.Group();
  const canMat = new THREE.MeshLambertMaterial({
    map: getNitroCanTexture(),
    color: 0xffffff,
    emissive: 0x7a28e0,
    emissiveIntensity: 0.55,
  });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0xd8d2e4, emissive: 0x2a1838, emissiveIntensity: 0.1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.92, 14), canMat);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 10), metalMat);
  neck.position.y = 0.52;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 10), metalMat);
  cap.position.y = 0.64;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 14), metalMat);
  band.position.y = 0.18;
  hover.add(body, neck, cap, band);
  return { hover, accent: 0xb44cff, glow: 'rgba(180,80,255,1)' };
}

function makePowerOrb(type) {
  const group = new THREE.Group();
  const built = type === 'nitro'
    ? makeNitroPickup()
    : type === 'repair'
      ? makeRepairPickup()
      : makeFuelPickup();
  const platform = makePickupPlatform(built.accent, built.glow);
  const shafts = makeLightShafts(built.glow);
  built.hover.position.y = 1.35;
  built.hover.scale.setScalar(0.92);
  const billboard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshBasicMaterial({
      map: getRadialGlowTexture(built.glow),
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  billboard.position.y = 1.35;
  group.add(platform, shafts, billboard, built.hover);
  group.userData.hover = built.hover;
  group.userData.glowMat = platform.userData.glow;
  group.userData.rim = platform.userData.rim;
  group.userData.shaftMat = shafts.userData.mat;
  group.userData.billboard = billboard;
  group.userData.accent = built.accent;
  return group;
}

const pickupBursts = [];

function spawnPickupBurst(position, hex) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.position.y += 1.25;
  const color = new THREE.Color(hex);
  for (let i = 0; i < 14; i++) {
    const mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 6, 6),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const dir = new THREE.Vector3(Math.random() - 0.5, 0.25 + Math.random() * 0.9, Math.random() - 0.5).normalize();
    mote.position.copy(dir).multiplyScalar(0.18);
    mote.userData.vel = dir.multiplyScalar(3.8 + Math.random() * 5.2);
    group.add(mote);
  }
  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshBasicMaterial({
      map: getRadialGlowTexture(`#${new THREE.Color(hex).getHexString()}`),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  group.add(flash);
  scene.add(group);
  pickupBursts.push({ group, flash, life: 0.42, maxLife: 0.42 });
}

function updatePickupBursts(dt) {
  for (let i = pickupBursts.length - 1; i >= 0; i--) {
    const burst = pickupBursts[i];
    burst.life -= dt;
    const age = 1 - burst.life / burst.maxLife;
    burst.flash.scale.setScalar(1 + age * 5);
    burst.flash.material.opacity = (1 - age) * 0.75;
    burst.flash.lookAt(camera.position);
    for (const mote of burst.group.children) {
      if (mote === burst.flash) continue;
      mote.position.addScaledVector(mote.userData.vel, dt);
      mote.userData.vel.multiplyScalar(Math.exp(-2.4 * dt));
      mote.userData.vel.y += 1.8 * dt;
      mote.material.opacity = (1 - age) * 0.9;
      mote.scale.setScalar(1 + age * 0.8);
    }
    if (burst.life <= 0) {
      scene.remove(burst.group);
      burst.group.traverse((child) => {
        if (child.geometry && child !== burst.group) child.geometry.dispose?.();
      });
      pickupBursts.splice(i, 1);
    }
  }
}

function placePowerups() {
  const padSpots = [
    { t: 0.12, lane: -2.75 },
    { t: 0.36, lane: 2.75 },
    { t: 0.62, lane: -2.75 },
    { t: 0.86, lane: 2.75 },
  ];
  for (const { t, lane } of padSpots) {
    const { p, tan, side } = frameAt(t);
    const mesh = makeBoostPadMesh();
    mesh.position.copy(p).addScaledVector(side, lane);
    mesh.position.y = 0.055;
    mesh.rotation.y = Math.atan2(tan.x, tan.z);
    trackGroup.add(mesh);
    boostPads.push({ t, lane, mesh, flash: 0 });
  }

  const orbSpots = [
    { t: 0.04, lane: -2.4, type: 'fuel' },
    { t: 0.2, lane: 2.4, type: 'repair' },
    { t: 0.28, lane: -2.4, type: 'repair' },
    { t: 0.46, lane: 2.4, type: 'fuel' },
    { t: 0.54, lane: -2.4, type: 'fuel' },
    { t: 0.72, lane: 2.4, type: 'repair' },
    { t: 0.78, lane: -2.4, type: 'fuel' },
    { t: 0.96, lane: 2.4, type: 'repair' },
    { t: 0.1, lane: 2.4, type: 'nitro' },
    { t: 0.5, lane: -2.4, type: 'nitro' },
    { t: 0.7, lane: -2.4, type: 'nitro' },
    { t: 0.92, lane: -2.4, type: 'nitro' },
  ];
  orbSpots.forEach(({ t, lane, type }) => {
    const { p, side } = frameAt(t);
    const mesh = makePowerOrb(type);
    mesh.position.copy(p).addScaledVector(side, lane);
    trackGroup.add(mesh);
    powerups.push({ t, lane, type, mesh, taken: false, respawn: 0 });
  });
}

function placeOilSlicks() {
  const spots = [0.18, 0.43, 0.68, 0.91].map((t) => ({
    t,
    lane: (Math.random() < 0.5 ? -1 : 1) * 2.4,
  }));
  spots.forEach(({ t, lane }, index) => {
    const { p, tan, side } = frameAt(t);
    const mesh = makeOilSlickMesh(index + 1);
    mesh.position.copy(p).addScaledVector(side, lane);
    mesh.position.y = 0.085;
    mesh.rotation.y = Math.atan2(tan.x, tan.z) + (index % 2 === 0 ? 0.2 : -0.18);
    trackGroup.add(mesh);
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

const TRACKS = [
  {
    id: 'american-desert',
    name: 'American Desert',
    tagline: 'Red Rock Highway & Canyon',
    lengthLabel: '1,820 m circuit',
    fogColor: 0xf2ddc7,
    fogNear: 220,
    fogFar: 980,
    groundColor: 0xdf9e62,
    flatsColor: 0xc87d40,
    buildCurve: () => {
      const points = [
        new THREE.Vector3(-180, 0, -160),
        new THREE.Vector3(-40, 0, -160),
        new THREE.Vector3(120, 0, -160),
        new THREE.Vector3(220, 0, -110),
        new THREE.Vector3(250, 0, -10),
        new THREE.Vector3(210, 0, 80),
        new THREE.Vector3(245, 0, 150),
        new THREE.Vector3(160, 0, 230),
        new THREE.Vector3(20, 0, 240),
        new THREE.Vector3(-110, 0, 230),
        new THREE.Vector3(-210, 0, 170),
        new THREE.Vector3(-260, 0, 80),
        new THREE.Vector3(-210, 0, 0),
        new THREE.Vector3(-260, 0, -70),
        new THREE.Vector3(-230, 0, -145),
      ];
      return new THREE.CatmullRomCurve3(points, true, 'centripetal');
    },
    buildHorizon: () => {
      placeHorizonAmericanDesert();
    },
    buildScenery: async () => {
      placeAmericanDesertScenery();
      await placeAmericanDesertBuildings();
    },
  },
  {
    id: 'city',
    name: 'City',
    tagline: 'City Oasis Circuit',
    lengthLabel: '1,640 m circuit',
    fogColor: 0xf3ecdc,
    fogNear: 210,
    fogFar: 940,
    groundColor: 0xc9d4a3,
    flatsColor: 0xdbc8a4,
    buildCurve: () => {
      const path = new THREE.CurvePath();
      const cornerR = 70;
      addStraight(path, -180, -150, 200, -150);
      addArc(path, 200, -150 + cornerR, cornerR, -Math.PI / 2, 0);
      addStraight(path, 200 + cornerR, -150 + cornerR, 200 + cornerR, 140);
      addArc(path, 200, 140, cornerR, 0, Math.PI / 2);
      addStraight(path, 200, 140 + cornerR, -180, 140 + cornerR);
      addArc(path, -180, 140, cornerR, Math.PI / 2, Math.PI);
      addStraight(path, -180 - cornerR, 140, -180 - cornerR, -150 + cornerR);
      addArc(path, -180, -150 + cornerR, cornerR, Math.PI, Math.PI * 1.5);
      const end = path.curves.at(-1).getPoint(1);
      const start = path.curves[0].getPoint(0);
      if (end.distanceTo(start) > 0.25) addStraight(path, end.x, end.z, start.x, start.z);
      return path;
    },
    buildHorizon: () => {
      placeHorizonStandard();
    },
    buildScenery: async () => {
      placeScenery();
      await placeBuildings();
    },
  },
];

let selectedTrackId = 'american-desert';
try {
  let saved = localStorage.getItem('desert_loop_track');
  if (saved === 'desert-loop') saved = 'city';
  if (saved && TRACKS.some((t) => t.id === saved)) {
    selectedTrackId = saved;
  }
} catch (e) {}

const WAYPOINTS = [];

async function buildTrack(trackId) {
  selectedTrackId = trackId;
  const trackDef = TRACKS.find((t) => t.id === trackId) || TRACKS[0];

  while (trackGroup.children.length > 0) {
    const child = trackGroup.children[0];
    trackGroup.remove(child);
    child.traverse?.((c) => {
      if (c.geometry) c.geometry.dispose?.();
    });
  }
  boostPads.length = 0;
  powerups.length = 0;
  oilSlicks.length = 0;
  pickupBursts.length = 0;
  WAYPOINTS.length = 0;

  trackCurve = trackDef.buildCurve();
  LOOP_LEN = trackCurve.getLength();
  trackCurve.updateArcLengths();

  ground.material.color.setHex(trackDef.groundColor);
  flats.material.color.setHex(trackDef.flatsColor);
  scene.background.setHex(trackDef.fogColor);
  if (scene.fog) {
    scene.fog.color.setHex(trackDef.fogColor);
    scene.fog.near = trackDef.fogNear;
    scene.fog.far = trackDef.fogFar;
  }

  const roadMesh = createRoadMesh();
  trackGroup.add(roadMesh);
  trackGroup.add(addCenterDashes());
  trackGroup.add(addEdgeLines());
  trackGroup.add(addFinishZebra());
  placeTrackProps();

  trackDef.buildHorizon();
  await trackDef.buildScenery();

  placePowerups();
  placeOilSlicks();

  const n = Math.max(48, Math.floor(LOOP_LEN / 16));
  for (let i = 0; i < n; i++) {
    const p = trackCurve.getPointAt(i / n);
    WAYPOINTS.push({ x: p.x, z: p.z });
  }

  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = trackDef.name;
  const trackLengthBadge = document.getElementById('trackLengthBadge');
  if (trackLengthBadge) trackLengthBadge.textContent = trackDef.lengthLabel;

  document.querySelectorAll('.track-pick button').forEach((b) => {
    b.classList.toggle('on', b.dataset.track === selectedTrackId);
  });
}

// Debug helpers for screenshots / tuning
window.__desertLoop = {
  get LOOP_LEN() { return LOOP_LEN; },
  frameAt,
  getTracks: () => TRACKS,
  getCurrentTrack: () => selectedTrackId,
  setTrack: (id) => buildTrack(id),
  radio: {
    getStations: () => RADIO_STATIONS,
    getCurrentStation: () => radioManager.currentStation,
    setStation: (idx, notify = true) => radioManager.setStation(idx, true, notify),
    nextStation: (notify = true) => radioManager.nextStation(notify),
    prevStation: (notify = true) => radioManager.prevStation(notify),
    toggleMute: () => radioManager.toggleMute(),
    setVolume: (v) => { radioManager.volume = v; if (!radioManager.muted) radioManager.audio.volume = v; },
  },
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
      const curTrack = TRACKS.find((t) => t.id === selectedTrackId) || TRACKS[0];
      scene.fog = new THREE.Fog(curTrack.fogColor, curTrack.fogNear, curTrack.fogFar);
      camera.fov = 50;
      camera.near = 0.1;
      camera.far = CAMERA_FAR;
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
    camera.far = CAMERA_FAR;
    camera.fov = 50;
    camera.updateProjectionMatrix();
    camera.lookAt(p.x + tan.x * 12, 0.4, p.z + tan.z * 12);
    window.__freezeCam = true;
  },
};

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
const CHASE_FOV = 49;
const BOOST_FOV = 59;
let chaseFov = CHASE_FOV;
let speedFxIntensity = 0;
let speedFxSpawn = 0;
const speedStreaks = [];
const _streakFwd = new THREE.Vector3();
const _streakRight = new THREE.Vector3();

function createSpeedStreaks() {
  const geo = new THREE.BoxGeometry(0.04, 0.04, 1);
  geo.translate(0, 0, 0.5);
  for (let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0xff4a3a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    mesh.visible = false;
    mesh.frustumCulled = false;
    scene.add(mesh);
    speedStreaks.push({ mesh, life: 0, maxLife: 0.2 });
  }
}

function spawnSpeedStreak(racer, intensity) {
  const streak = speedStreaks.find((item) => item.life <= 0);
  if (!streak) return;
  const d = racer.drive;
  _streakFwd.set(Math.sin(d.yaw), 0, Math.cos(d.yaw));
  _streakRight.set(_streakFwd.z, 0, -_streakFwd.x);
  const side = (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 5.8);
  const along = 1.2 + Math.random() * 11;
  const lift = 0.25 + Math.random() * 3.4;
  streak.mesh.position.set(d.x, lift, d.z)
    .addScaledVector(_streakFwd, along)
    .addScaledVector(_streakRight, side);
  streak.mesh.rotation.set(0, d.yaw, (Math.random() - 0.5) * 0.12);
  const len = 1.1 + Math.random() * 3.8 * (0.55 + intensity);
  streak.mesh.scale.set(0.7 + intensity * 0.6, 0.7 + intensity * 0.6, len);
  streak.mesh.material.color.setHex(Math.random() > 0.4 ? 0xff5a48 : 0xffd060);
  streak.maxLife = 0.1 + Math.random() * 0.16;
  streak.life = streak.maxLife;
  streak.mesh.visible = true;
  streak.mesh.material.opacity = 0.18 + intensity * 0.42;
}

function setSpeedFxOverlay(intensity) {
  if (!speedFxEl) return;
  speedFxEl.style.setProperty('--speed', intensity.toFixed(3));
  speedFxEl.classList.toggle('on', intensity > 0.04);
}

function updateSpeedEffects(dt, player) {
  const racing = mode === 'race' || mode === 'countdown';
  let target = 0;
  if (racing && player && !player.wrecked && !window.__topDown && lossOrbitStart === null) {
    const speedRatio = Math.abs(player.drive.speed) / Math.max(1, player.drive.maxSpeed);
    const boostAmt = player.boostT > 0 || player.onPad
      ? THREE.MathUtils.clamp(Math.max(player.boostT / 1.6, player.onPad ? 0.7 : 0), 0.4, 1)
      : 0;
    const highSpeed = THREE.MathUtils.smoothstep(speedRatio, 0.78, 1.08);
    target = Math.max(boostAmt, highSpeed * 0.42);
  }
  speedFxIntensity += (target - speedFxIntensity) * (1 - Math.exp(-(target > speedFxIntensity ? 8 : 4.2) * dt));
  if (speedFxIntensity < 0.01) speedFxIntensity = 0;
  setSpeedFxOverlay(speedFxIntensity);

  if (player && speedFxIntensity > 0.08) {
    speedFxSpawn -= dt;
    const interval = THREE.MathUtils.lerp(0.04, 0.01, speedFxIntensity);
    while (speedFxSpawn <= 0) {
      spawnSpeedStreak(player, speedFxIntensity);
      speedFxSpawn += interval;
    }
  } else {
    speedFxSpawn = 0;
  }

  for (const streak of speedStreaks) {
    if (streak.life <= 0) continue;
    streak.life -= dt;
    const age = 1 - streak.life / streak.maxLife;
    streak.mesh.material.opacity = (1 - age) * (0.16 + speedFxIntensity * 0.4);
    if (player) {
      const retreat = Math.max(8, Math.abs(player.drive.speed)) * 0.42 * dt;
      streak.mesh.position.x -= Math.sin(player.drive.yaw) * retreat;
      streak.mesh.position.z -= Math.cos(player.drive.yaw) * retreat;
    }
    if (streak.life <= 0) {
      streak.mesh.visible = false;
      streak.mesh.material.opacity = 0;
    }
  }
}

function clearSpeedStreaks() {
  for (const streak of speedStreaks) {
    streak.life = 0;
    streak.mesh.visible = false;
    streak.mesh.material.opacity = 0;
  }
}

function updateBoostPadVisuals(dt) {
  for (const pad of boostPads) {
    pad.flash = Math.max(0, pad.flash - dt * 2.4);
    const paint = pad.mesh.userData.paint;
    if (!paint) continue;
    paint.emissiveIntensity = 0.28 + pad.flash * 0.22;
    paint.opacity = 0.94 + pad.flash * 0.06;
  }
}

createSpeedStreaks();

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

const smokeGeometry = new THREE.IcosahedronGeometry(0.42, 0);
const smokeGeometries = [
  smokeGeometry,
  new THREE.DodecahedronGeometry(0.38, 0),
  new THREE.OctahedronGeometry(0.4, 0),
];
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
  const poolSize = racer.isPlayer ? 42 : 18;
  racer.exhaust = Array.from({ length: poolSize }, (_, index) => {
    const material = new THREE.MeshLambertMaterial({
      color: 0x6f716c,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(smokeGeometries[index % smokeGeometries.length], material);
    mesh.visible = false;
    mesh.renderOrder = 2;
    scene.add(mesh);
    return {
      mesh,
      life: 0,
      maxLife: 1.2,
      baseOpacity: 0.45,
      startScale: 0.55,
      velocity: new THREE.Vector3(),
      angular: new THREE.Vector3(),
      startColor: new THREE.Color(),
      endColor: new THREE.Color(),
    };
  });
  captureDamageLook(racer);
}

const _sparkOrigin = new THREE.Vector3();
const _sparkJitter = new THREE.Vector3();
const sparkGeometry = new THREE.SphereGeometry(0.055, 4, 4);

const DAMAGE_SCUFF = new THREE.Color(0x272220);
const DAMAGE_LENS = new THREE.Color(0x0a0908);
const _dmgVertex = new THREE.Vector3();
const _dmgColor = new THREE.Color();

function damageNoise(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/** Panel zones in car-local space: ellipsoid of influence + crush direction. */
function buildDamageZoneDefs(bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const c = bounds.getCenter(new THREE.Vector3());
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const defs = {
    frontBumper: {
      center: v(c.x, bounds.min.y + size.y * 0.26, bounds.max.z),
      radii: v(size.x * 0.62, size.y * 0.26, size.z * 0.15),
      dir: v(0, 0, -1),
      depth: size.z * 0.11,
    },
    hood: {
      center: v(c.x, bounds.min.y + size.y * 0.66, c.z + size.z * 0.28),
      radii: v(size.x * 0.5, size.y * 0.28, size.z * 0.2),
      dir: v(0, -1, -0.3),
      depth: size.y * 0.12,
    },
    trunk: {
      center: v(c.x, bounds.min.y + size.y * 0.66, c.z - size.z * 0.3),
      radii: v(size.x * 0.48, size.y * 0.26, size.z * 0.18),
      dir: v(0, -1, 0.25),
      depth: size.y * 0.14,
    },
    rearBumper: {
      center: v(c.x, bounds.min.y + size.y * 0.26, bounds.min.z),
      radii: v(size.x * 0.6, size.y * 0.26, size.z * 0.13),
      dir: v(0, 0, 1),
      depth: size.z * 0.09,
    },
    leftDoor: {
      center: v(bounds.min.x, bounds.min.y + size.y * 0.44, c.z + size.z * 0.02),
      radii: v(size.x * 0.32, size.y * 0.28, size.z * 0.26),
      dir: v(1, 0, 0),
      depth: size.x * 0.14,
    },
    rightDoor: {
      center: v(bounds.max.x, bounds.min.y + size.y * 0.44, c.z + size.z * 0.02),
      radii: v(size.x * 0.32, size.y * 0.28, size.z * 0.26),
      dir: v(-1, 0, 0),
      depth: size.x * 0.14,
    },
    frontLeftLight: {
      center: v(c.x - size.x * 0.3, bounds.min.y + size.y * 0.45, bounds.max.z),
      radii: v(size.x * 0.2, size.y * 0.15, size.z * 0.09),
      dir: v(0, 0, -1),
      depth: size.z * 0.07,
      lens: true,
    },
    frontRightLight: {
      center: v(c.x + size.x * 0.3, bounds.min.y + size.y * 0.45, bounds.max.z),
      radii: v(size.x * 0.2, size.y * 0.15, size.z * 0.09),
      dir: v(0, 0, -1),
      depth: size.z * 0.07,
      lens: true,
    },
    rearLeftLight: {
      center: v(c.x - size.x * 0.32, bounds.min.y + size.y * 0.5, bounds.min.z),
      radii: v(size.x * 0.18, size.y * 0.14, size.z * 0.08),
      dir: v(0, 0, 1),
      depth: size.z * 0.06,
      lens: true,
    },
    rearRightLight: {
      center: v(c.x + size.x * 0.32, bounds.min.y + size.y * 0.5, bounds.min.z),
      radii: v(size.x * 0.18, size.y * 0.14, size.z * 0.08),
      dir: v(0, 0, 1),
      depth: size.z * 0.06,
      lens: true,
    },
  };
  for (const def of Object.values(defs)) {
    def.dir.normalize();
    // Surface basis so wrinkles ripple across the panel instead of spiking out of it.
    def.tangentA = new THREE.Vector3(0, 1, 0).cross(def.dir);
    if (def.tangentA.lengthSq() < 1e-4) def.tangentA.set(1, 0, 0);
    def.tangentA.normalize();
    def.tangentB = new THREE.Vector3().crossVectors(def.dir, def.tangentA).normalize();
  }
  return defs;
}

function zoneFalloff(def, point) {
  const dx = (point.x - def.center.x) / def.radii.x;
  const dy = (point.y - def.center.y) / def.radii.y;
  const dz = (point.z - def.center.z) / def.radii.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist >= 1) return 0;
  const t = 1 - dist;
  return t * t * (3 - 2 * t);
}

function isRigPart(object) {
  for (let node = object; node; node = node.parent) {
    if (/wheel|steer|tyre|tire/i.test(node.name || '')) return true;
  }
  return false;
}

/**
 * Splits triangles that sit inside a damage zone so low-poly panels have enough
 * vertices to crumple. Untouched triangles are copied through unchanged.
 */
function subdivideForDamage(geometry, insideZone, maxEdge, maxVertices) {
  let geo = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let pass = 0; pass < 4; pass += 1) {
    const position = geo.getAttribute('position');
    if (!position || position.count >= maxVertices) break;

    const sources = Object.keys(geo.attributes).map((name) => {
      const attr = geo.getAttribute(name);
      const values = new Float32Array(attr.count * attr.itemSize);
      for (let i = 0; i < attr.count; i += 1) {
        values[i * attr.itemSize] = attr.getX(i);
        if (attr.itemSize > 1) values[i * attr.itemSize + 1] = attr.getY(i);
        if (attr.itemSize > 2) values[i * attr.itemSize + 2] = attr.getZ(i);
        if (attr.itemSize > 3) values[i * attr.itemSize + 3] = attr.getW(i);
      }
      return { name, itemSize: attr.itemSize, values, out: [] };
    });

    const emit = (src, i) => {
      for (let k = 0; k < src.itemSize; k += 1) src.out.push(src.values[i * src.itemSize + k]);
    };
    const emitMid = (src, i, j) => {
      for (let k = 0; k < src.itemSize; k += 1) {
        src.out.push((src.values[i * src.itemSize + k] + src.values[j * src.itemSize + k]) * 0.5);
      }
    };

    let didSplit = false;
    for (let t = 0; t + 2 < position.count; t += 3) {
      a.fromBufferAttribute(position, t);
      b.fromBufferAttribute(position, t + 1);
      c.fromBufferAttribute(position, t + 2);
      const longest = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
      if (longest <= maxEdge || !insideZone(a, b, c)) {
        for (const src of sources) {
          emit(src, t);
          emit(src, t + 1);
          emit(src, t + 2);
        }
        continue;
      }
      didSplit = true;
      for (const src of sources) {
        // a, ab, ca | ab, b, bc | ca, bc, c | ab, bc, ca
        emit(src, t); emitMid(src, t, t + 1); emitMid(src, t + 2, t);
        emitMid(src, t, t + 1); emit(src, t + 1); emitMid(src, t + 1, t + 2);
        emitMid(src, t + 2, t); emitMid(src, t + 1, t + 2); emit(src, t + 2);
        emitMid(src, t, t + 1); emitMid(src, t + 1, t + 2); emitMid(src, t + 2, t);
      }
    }
    if (!didSplit) break;

    const next = new THREE.BufferGeometry();
    for (const src of sources) {
      next.setAttribute(src.name, new THREE.BufferAttribute(new Float32Array(src.out), src.itemSize));
    }
    geo = next;
  }

  // Vertex colours may arrive as normalised ints; damage tinting needs floats.
  const color = geo.getAttribute('color');
  if (color && !(color.array instanceof Float32Array)) {
    const floats = new Float32Array(color.count * color.itemSize);
    for (let i = 0; i < color.count; i += 1) {
      floats[i * color.itemSize] = color.getX(i);
      floats[i * color.itemSize + 1] = color.getY(i);
      floats[i * color.itemSize + 2] = color.getZ(i);
      if (color.itemSize > 3) floats[i * color.itemSize + 3] = color.getW(i);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(floats, color.itemSize));
  }
  return geo;
}

/** Caches per-vertex crumple weights so impacts only touch affected vertices. */
function prepareBodyDamage(racer) {
  const defs = buildDamageZoneDefs(racer.visualBounds);
  racer.damageZoneDefs = defs;
  racer.bodyDamage = {};
  for (const id of Object.keys(defs)) racer.bodyDamage[id] = 0;
  racer.damageMeshes = [];

  racer.mesh.updateMatrixWorld(true);
  const rootInverse = new THREE.Matrix4().copy(racer.mesh.matrixWorld).invert();
  const size = racer.visualBounds.getSize(new THREE.Vector3());
  const maxEdge = Math.max(size.y * 0.11, 0.05);
  const maxVertices = racer.isPlayer ? 36000 : 15000;
  const zoneList = Object.entries(defs);
  const parts = [];
  racer.mesh.traverse((child) => {
    if (child.isMesh && child.geometry && !isRigPart(child)) parts.push(child);
  });

  for (const child of parts) {
    const toRoot = new THREE.Matrix4().multiplyMatrices(rootInverse, child.matrixWorld);
    const fromRoot = new THREE.Matrix4().copy(toRoot).invert();
    const insideZone = (a, b, c) => {
      _dmgVertex.set((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3)
        .applyMatrix4(toRoot);
      for (const [, def] of zoneList) {
        const dx = (_dmgVertex.x - def.center.x) / (def.radii.x * 1.2);
        const dy = (_dmgVertex.y - def.center.y) / (def.radii.y * 1.2);
        const dz = (_dmgVertex.z - def.center.z) / (def.radii.z * 1.2);
        if (dx * dx + dy * dy + dz * dz < 1) return true;
      }
      return false;
    };

    const geometry = subdivideForDamage(child.geometry, insideZone, maxEdge, maxVertices);
    const position = geometry.getAttribute('position');
    const basePosition = Float32Array.from(position.array);
    const colorAttr = geometry.getAttribute('color');
    const baseColor = colorAttr ? Float32Array.from(colorAttr.array) : null;

    const zones = [];
    const affected = new Set();
    for (const [id, def] of zoneList) {
      const indices = [];
      const weights = [];
      const noise = [];
      for (let i = 0; i < position.count; i += 1) {
        _dmgVertex
          .set(basePosition[i * 3], basePosition[i * 3 + 1], basePosition[i * 3 + 2])
          .applyMatrix4(toRoot);
        const falloff = zoneFalloff(def, _dmgVertex);
        if (falloff <= 0.002) continue;
        indices.push(i);
        weights.push(falloff);
        noise.push(
          damageNoise(_dmgVertex.x, _dmgVertex.y, _dmgVertex.z),
          damageNoise(_dmgVertex.y + 3.1, _dmgVertex.z, _dmgVertex.x),
          damageNoise(_dmgVertex.z, _dmgVertex.x + 7.3, _dmgVertex.y)
        );
        affected.add(i);
      }
      if (!indices.length) continue;
      zones.push({
        id,
        def,
        indices: Int32Array.from(indices),
        weights: Float32Array.from(weights),
        noise: Float32Array.from(noise),
      });
    }

    if (!zones.length) {
      if (geometry !== child.geometry) geometry.dispose();
      continue;
    }

    child.geometry = geometry;
    // Flat-shaded materials derive normals in the shader, so crushed panels
    // never need a normal recompute after a hit.
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const flatShaded = materials.every((material) => material?.flatShading);
    geometry.computeBoundingSphere();
    if (geometry.boundingSphere) geometry.boundingSphere.radius *= 1.2;

    racer.damageMeshes.push({
      mesh: child,
      geometry,
      toRoot,
      fromRoot,
      basePosition,
      baseColor,
      zones,
      flatShaded,
      affected: Int32Array.from(affected),
      displacement: new Float32Array(position.count * 3),
      scuff: new Float32Array(position.count),
      shatter: new Float32Array(position.count),
    });
  }
}

/** Rebuilds crushed panel geometry from the current per-zone severities. */
function deformBodyPanels(racer) {
  if (!racer.damageMeshes?.length) return;
  const severities = racer.bodyDamage;

  for (const entry of racer.damageMeshes) {
    for (let n = 0; n < entry.affected.length; n += 1) {
      const i = entry.affected[n];
      entry.displacement[i * 3] = 0;
      entry.displacement[i * 3 + 1] = 0;
      entry.displacement[i * 3 + 2] = 0;
      entry.scuff[i] = 0;
      entry.shatter[i] = 0;
    }

    for (const zone of entry.zones) {
      const severity = severities[zone.id] || 0;
      if (severity <= 0.02) continue;
      const { dir, tangentA, tangentB, depth, lens } = zone.def;
      for (let k = 0; k < zone.indices.length; k += 1) {
        const i = zone.indices[k];
        const weight = zone.weights[k] * severity;
        const wrinkle = depth * 0.55 * weight;
        // Always crush inward; noise only varies how deep each fold goes.
        const inward = depth * weight + Math.abs(zone.noise[k * 3]) * wrinkle;
        const foldA = zone.noise[k * 3 + 1] * wrinkle * 0.5;
        const foldB = zone.noise[k * 3 + 2] * wrinkle * 0.5;
        entry.displacement[i * 3] += dir.x * inward + tangentA.x * foldA + tangentB.x * foldB;
        entry.displacement[i * 3 + 1] += dir.y * inward + tangentA.y * foldA + tangentB.y * foldB;
        entry.displacement[i * 3 + 2] += dir.z * inward + tangentA.z * foldA + tangentB.z * foldB;
        // Bare metal shows in the deep folds, not across the whole panel.
        const scuff = weight * weight;
        if (scuff > entry.scuff[i]) entry.scuff[i] = scuff;
        if (lens && weight > entry.shatter[i]) entry.shatter[i] = weight;
      }
    }

    const position = entry.geometry.getAttribute('position');
    const color = entry.baseColor ? entry.geometry.getAttribute('color') : null;
    for (let n = 0; n < entry.affected.length; n += 1) {
      const i = entry.affected[n];
      _dmgVertex
        .set(entry.basePosition[i * 3], entry.basePosition[i * 3 + 1], entry.basePosition[i * 3 + 2])
        .applyMatrix4(entry.toRoot);
      _dmgVertex.x += entry.displacement[i * 3];
      _dmgVertex.y += entry.displacement[i * 3 + 1];
      _dmgVertex.z += entry.displacement[i * 3 + 2];
      _dmgVertex.applyMatrix4(entry.fromRoot);
      position.setXYZ(i, _dmgVertex.x, _dmgVertex.y, _dmgVertex.z);

      if (!color) continue;
      _dmgColor.setRGB(
        entry.baseColor[i * color.itemSize],
        entry.baseColor[i * color.itemSize + 1],
        entry.baseColor[i * color.itemSize + 2]
      );
      const scuff = entry.scuff[i];
      if (scuff > 0) _dmgColor.lerp(DAMAGE_SCUFF, Math.min(0.8, scuff * 1.15));
      const shatter = entry.shatter[i];
      if (shatter > 0) _dmgColor.lerp(DAMAGE_LENS, Math.min(0.95, shatter * 1.3));
      color.setXYZ(i, _dmgColor.r, _dmgColor.g, _dmgColor.b);
    }

    position.needsUpdate = true;
    if (color) color.needsUpdate = true;
    if (!entry.flatShaded) entry.geometry.computeVertexNormals();
  }
}

function captureDamageLook(racer) {
  racer.visualDamage = 0;
  racer.damageSmokeTimer = 0;
  racer.sparkIndex = 0;
  racer.brokenLampIndex = -1;
  racer.brokenRearLamps = new Set();
  prepareBodyDamage(racer);

  const sparkCount = racer.isPlayer ? 18 : 10;
  racer.sparks = Array.from({ length: sparkCount }, () => {
    const mesh = new THREE.Mesh(
      sparkGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xffb14a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      })
    );
    mesh.visible = false;
    mesh.renderOrder = 9;
    scene.add(mesh);
    return {
      mesh,
      life: 0,
      maxLife: 0.3,
      velocity: new THREE.Vector3(),
    };
  });
}

function raiseZoneDamage(racer, zoneId, amount) {
  if (!racer.bodyDamage || racer.bodyDamage[zoneId] === undefined) return;
  racer.bodyDamage[zoneId] = THREE.MathUtils.clamp(racer.bodyDamage[zoneId] + amount, 0, 1);
}

function applyBodyImpactDamage(racer, amount, impact = {}) {
  const worldX = impact.x ?? 0;
  const worldZ = impact.z ?? -1;
  const forward = worldX * Math.sin(racer.drive.yaw) + worldZ * Math.cos(racer.drive.yaw);
  const side = worldX * Math.cos(racer.drive.yaw) - worldZ * Math.sin(racer.drive.yaw);
  const hit = THREE.MathUtils.clamp(amount / 12, 0.18, 1);
  const absF = Math.abs(forward);
  const absS = Math.abs(side);

  if (absF >= absS) {
    if (forward >= 0) {
      raiseZoneDamage(racer, 'frontBumper', hit);
      raiseZoneDamage(racer, 'hood', hit * 0.72);
      raiseZoneDamage(racer, side >= 0 ? 'frontRightLight' : 'frontLeftLight', hit * 0.9);
      if (hit > 0.55) raiseZoneDamage(racer, side >= 0 ? 'frontLeftLight' : 'frontRightLight', hit * 0.35);
    } else {
      raiseZoneDamage(racer, 'rearBumper', hit);
      raiseZoneDamage(racer, 'trunk', hit * 0.7);
      const rearId = side >= 0 ? 'rearRightLight' : 'rearLeftLight';
      raiseZoneDamage(racer, rearId, hit * 0.95);
      if (racer.brakeLights?.length) {
        const idx = side >= 0
          ? racer.brakeLights.length - 1
          : 0;
        racer.brokenRearLamps.add(idx);
        if (hit > 0.65 && racer.brakeLights.length > 1) {
          racer.brokenRearLamps.add(idx === 0 ? 1 : racer.brakeLights.length - 2);
        }
      }
    }
  } else {
    raiseZoneDamage(racer, side >= 0 ? 'rightDoor' : 'leftDoor', hit);
    if (forward > 0.15) {
      raiseZoneDamage(racer, 'frontBumper', hit * 0.35);
      raiseZoneDamage(racer, side >= 0 ? 'frontRightLight' : 'frontLeftLight', hit * 0.45);
    } else if (forward < -0.15) {
      raiseZoneDamage(racer, 'rearBumper', hit * 0.35);
      raiseZoneDamage(racer, side >= 0 ? 'rearRightLight' : 'rearLeftLight', hit * 0.45);
    }
  }

  // Progressive wear: as overall health drops, secondary panels also show damage.
  const overall = 1 - racer.health / 100;
  if (overall > 0.45) raiseZoneDamage(racer, 'hood', 0.08);
  if (overall > 0.6) raiseZoneDamage(racer, 'trunk', 0.08);
  if (overall > 0.75) {
    raiseZoneDamage(racer, 'frontBumper', 0.1);
    raiseZoneDamage(racer, 'rearBumper', 0.1);
  }
}

function syncVisualDamage(racer, force = false) {
  const damage = THREE.MathUtils.clamp(1 - racer.health / 100, 0, 1);
  if (!force && Math.abs(damage - racer.visualDamage) < 0.008) return;
  racer.visualDamage = damage;

  if (racer.wrecked) {
    for (const id of ['frontBumper', 'hood', 'frontLeftLight', 'frontRightLight', 'rearBumper', 'trunk', 'leftDoor', 'rightDoor']) {
      raiseZoneDamage(racer, id, 1);
    }
    if (racer.brakeLights?.length) {
      racer.brokenRearLamps.add(0);
      racer.brokenRearLamps.add(racer.brakeLights.length - 1);
    }
  }

  deformBodyPanels(racer);
}

function spawnImpactSparks(racer, amount = 8) {
  if (!racer.sparks?.length) return;
  const count = Math.round(THREE.MathUtils.clamp(3 + amount * 0.55, 4, racer.sparks.length));
  _sparkOrigin.set(
    (Math.random() - 0.5) * racer.def.halfW * 1.4,
    0.35 + Math.random() * 0.55,
    (Math.random() - 0.5) * racer.def.halfL * 1.2
  );
  racer.mesh.localToWorld(_sparkOrigin);
  for (let i = 0; i < count; i += 1) {
    const spark = racer.sparks[racer.sparkIndex++ % racer.sparks.length];
    _sparkJitter.set(
      (Math.random() - 0.5) * 0.35,
      Math.random() * 0.2,
      (Math.random() - 0.5) * 0.35
    );
    spark.mesh.position.copy(_sparkOrigin).add(_sparkJitter);
    spark.mesh.scale.setScalar(0.7 + Math.random() * 1.1);
    spark.mesh.material.color.setHex(Math.random() > 0.45 ? 0xffc35a : 0xff6a2a);
    spark.mesh.material.opacity = 1;
    spark.mesh.visible = true;
    spark.maxLife = 0.18 + Math.random() * 0.22;
    spark.life = spark.maxLife;
    const outward = 4 + Math.random() * 7;
    spark.velocity.set(
      (Math.random() - 0.5) * outward,
      2.5 + Math.random() * 5,
      (Math.random() - 0.5) * outward
    );
  }
}

function spawnDamageSmoke(racer, intensity = 1) {
  if (!racer.exhaust?.length) return;
  const particle = racer.exhaust[racer.smokeIndex++ % racer.exhaust.length];
  const origin = new THREE.Vector3(
    (Math.random() - 0.5) * racer.def.halfW * 0.45,
    1.05 + Math.random() * 0.2,
    -racer.def.halfL * 0.55 + (Math.random() - 0.5) * 0.25
  );
  racer.mesh.localToWorld(origin);
  particle.mesh.position.copy(origin);
  particle.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  particle.startScale = (0.55 + Math.random() * 0.4) * intensity;
  particle.mesh.scale.setScalar(particle.startScale);
  particle.startColor.setHex(0x2a2a28);
  particle.endColor.setHex(0x6e6a62);
  particle.mesh.material.color.copy(particle.startColor);
  particle.baseOpacity = 0.5 * intensity;
  particle.mesh.material.opacity = particle.baseOpacity;
  particle.mesh.visible = true;
  particle.maxLife = 1.4 + Math.random() * 0.5;
  particle.life = particle.maxLife;
  particle.velocity.set(
    (Math.random() - 0.5) * 0.7,
    0.55 + Math.random() * 0.7,
    (Math.random() - 0.5) * 0.7
  );
  particle.angular.set(
    (Math.random() - 0.5) * 1.2,
    (Math.random() - 0.5) * 1.2,
    (Math.random() - 0.5) * 1.2
  );
}

function updateHitFlash(racer, dt) {
  void racer;
  void dt;
}

function updateSparks(racer, dt) {
  if (!racer.sparks) return;
  for (const spark of racer.sparks) {
    if (spark.life <= 0) continue;
    spark.life -= dt;
    if (spark.life <= 0) {
      spark.mesh.visible = false;
      continue;
    }
    const age = 1 - spark.life / spark.maxLife;
    spark.velocity.y -= 18 * dt;
    spark.velocity.multiplyScalar(Math.exp(-2.2 * dt));
    spark.mesh.position.addScaledVector(spark.velocity, dt);
    spark.mesh.material.opacity = (1 - age) * (1 - age);
    spark.mesh.scale.setScalar(0.55 + (1 - age) * 0.9);
  }
}

function spawnExhaustPuff(racer, intensity = 1) {
  if (!racer.exhaust.length) return;
  const particle = racer.exhaust[racer.smokeIndex++ % racer.exhaust.length];
  const boost = racer.boostT > 0;
  const rearZ = racer.visualBounds.min.z + 0.08;
  const exhaustSide = racer.smokeIndex % 2 === 0 ? -1 : 1;
  const origin = new THREE.Vector3(
    exhaustSide * racer.def.halfW * 0.34 + (Math.random() - 0.5) * 0.12,
    0.28 + Math.random() * 0.16,
    rearZ
  );
  racer.mesh.localToWorld(origin);

  const backSpeed = 1.1 + Math.min(2.4, Math.abs(racer.drive.speed) * 0.045);
  particle.mesh.position.copy(origin);
  particle.mesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  particle.startScale = (0.45 + Math.random() * 0.28) * intensity;
  particle.mesh.scale.setScalar(particle.startScale);
  particle.startColor.setHex(boost ? 0x6aa9c8 : 0x4e504c);
  particle.endColor.setHex(boost ? 0xd7eef8 : 0xc5c7c1);
  particle.mesh.material.color.copy(particle.startColor);
  particle.baseOpacity = (boost ? 0.58 : 0.42) * intensity;
  particle.mesh.material.opacity = particle.baseOpacity;
  particle.mesh.visible = true;
  particle.maxLife = (boost ? 1.05 : 1.35) + Math.random() * 0.35;
  particle.life = particle.maxLife;
  particle.velocity.set(
    -Math.sin(racer.drive.yaw) * backSpeed + (Math.random() - 0.5) * 0.85,
    0.35 + Math.random() * 0.55,
    -Math.cos(racer.drive.yaw) * backSpeed + (Math.random() - 0.5) * 0.85
  );
  particle.angular.set(
    (Math.random() - 0.5) * 1.6,
    (Math.random() - 0.5) * 1.6,
    (Math.random() - 0.5) * 1.6
  );
}

function updateVehicleEffects(racer, dt, accelerating, braking) {
  const damageRatio = THREE.MathUtils.clamp(1 - racer.health / 100, 0, 1);
  const rearLeftBroken = (racer.bodyDamage?.rearLeftLight || 0) > 0.35;
  const rearRightBroken = (racer.bodyDamage?.rearRightLight || 0) > 0.35;
  for (let i = 0; i < racer.brakeLights.length; i += 1) {
    const light = racer.brakeLights[i];
    const onLeft = i < racer.brakeLights.length / 2;
    const broken = racer.brokenRearLamps?.has(i)
      || (onLeft ? rearLeftBroken : rearRightBroken)
      || i === racer.brokenLampIndex;
    light.visible = braking || broken;
    light.material.color.setHex(broken ? 0x210d0a : 0xff1808);
    if (light.children[0]) light.children[0].visible = braking && !broken;
  }

  updateHitFlash(racer, dt);
  updateSparks(racer, dt);

  racer.smokeTimer -= dt;
  racer.damageSmokeTimer -= dt;
  const moving = Math.abs(racer.drive.speed) > 1.2;
  if (accelerating && moving && racer.smokeTimer <= 0) {
    const boost = racer.boostT > 0;
    const speedFactor = THREE.MathUtils.clamp(Math.abs(racer.drive.speed) / 28, 0.35, 1);
    racer.smokeTimer = boost
      ? 0.016
      : THREE.MathUtils.lerp(0.055, 0.028, speedFactor);
    spawnExhaustPuff(racer, boost ? 1.15 : 0.85 + speedFactor * 0.25);
    if (boost || speedFactor > 0.75) spawnExhaustPuff(racer, 0.7);
  } else if (!accelerating && moving && Math.abs(racer.drive.speed) > 8 && racer.smokeTimer <= 0) {
    // Thin idle trail while coasting keeps the field feeling alive.
    racer.smokeTimer = racer.isPlayer ? 0.12 : 0.18;
    spawnExhaustPuff(racer, 0.35);
  }

  // Save smoke for serious damage so ordinary collision wear remains readable.
  if ((damageRatio > 0.8 || racer.wrecked) && racer.damageSmokeTimer <= 0) {
    const severity = racer.wrecked ? 1 : damageRatio;
    racer.damageSmokeTimer = THREE.MathUtils.lerp(0.48, 0.14, severity);
    spawnDamageSmoke(racer, 0.35 + severity * 0.55);
    if (racer.wrecked) spawnDamageSmoke(racer, 0.5);
  }

  for (const particle of racer.exhaust) {
    if (particle.life <= 0) continue;
    particle.life -= dt;
    if (particle.life <= 0) {
      particle.mesh.visible = false;
      continue;
    }
    const age = 1 - particle.life / particle.maxLife;
    const ease = age * age;
    particle.velocity.multiplyScalar(Math.exp(-1.35 * dt));
    particle.velocity.y += 0.55 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += particle.angular.x * dt;
    particle.mesh.rotation.y += particle.angular.y * dt;
    particle.mesh.rotation.z += particle.angular.z * dt;
    particle.mesh.scale.setScalar(particle.startScale * (1 + ease * 3.4));
    particle.mesh.material.color.copy(particle.startColor).lerp(particle.endColor, ease);
    // Soft billowing fade: denser early, thinner as it expands.
    const fade = age < 0.18
      ? THREE.MathUtils.smoothstep(age / 0.18, 0, 1)
      : 1 - THREE.MathUtils.smoothstep((age - 0.18) / 0.82, 0, 1);
    particle.mesh.material.opacity = fade * particle.baseOpacity;
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
    for (const spark of r.sparks || []) scene.remove(spark.mesh);
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
      nitroCharges: 0,
      onPad: false,
      pickupMessage: '',
      pickupKind: '',
      pickupTitle: '',
      pickupDetail: '',
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

function applyDamage(racer, amount, impact = null) {
  if (racer.wrecked || racer.hitCooldown > 0 || amount <= 0) return;
  // Reduce damage intake by 50% for everyone to make racing balanced and enjoyable
  const adjustedAmount = amount * 0.5;
  racer.health = Math.max(0, racer.health - adjustedAmount);
  racer.hitCooldown = 0.45;
  racer.drive.speed *= 0.94;
  applyBodyImpactDamage(racer, adjustedAmount, impact || {});
  syncVisualDamage(racer, true);
  spawnImpactSparks(racer, adjustedAmount);
  announcePickup(racer, 'impact', 'IMPACT', `−${Math.round(adjustedAmount)}`);
  if (racer.health <= 0) {
    racer.wrecked = true;
    racer.drive.speed = 0;
    racer.boostT = 0;
    racer.onPad = false;
    racer.slipT = 0;
    racer.slipAngle = 0;
    syncVisualDamage(racer, true);
    if (racer.isPlayer) showLoss('Your car reached 100% damage and is totaled.');
  }
}

window.__desertLoop.damagePlayer = (amount = 100, from = 'all') => {
  const player = racers.find((racer) => racer.isPlayer);
  if (!player) return;
  const yaw = player.drive.yaw;
  const local = {
    front: { x: Math.sin(yaw), z: Math.cos(yaw) },
    rear: { x: -Math.sin(yaw), z: -Math.cos(yaw) },
    right: { x: Math.cos(yaw), z: -Math.sin(yaw) },
    left: { x: -Math.cos(yaw), z: Math.sin(yaw) },
  };
  const dirs = from === 'all' ? Object.values(local) : [local[from] || local.front];
  const hit = Math.max(8, amount / dirs.length);
  for (const dir of dirs) {
    player.hitCooldown = 0;
    applyDamage(player, hit, { ...dir, source: 'debug' });
  }
};
// Parks the camera around the player so body damage can be inspected panel by panel.
window.__desertLoop.inspectPlayer = (angle = 0, dist = 5.5, height = 1.9) => {
  const player = racers.find((racer) => racer.isPlayer);
  if (!player) return;
  const yaw = player.drive.yaw + angle;
  const target = player.mesh.position.clone().add(new THREE.Vector3(0, 0.7, 0));
  camera.position.set(
    target.x + Math.sin(yaw) * dist,
    target.y + height,
    target.z + Math.cos(yaw) * dist
  );
  camera.lookAt(target);
  window.__freezeCam = true;
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
    applyDamage(
      racer,
      THREE.MathUtils.clamp(Math.abs(vLat) * 0.45 + Math.abs(d.speed) * 0.06, 2, 14),
      { x: side.x * sign, z: side.z * sign, source: 'wall' }
    );
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
            const speedRetention = THREE.MathUtils.clamp(1 - closingSpeed * 0.012, 0.84, 0.96);
            if (!a.wrecked) a.drive.speed *= speedRetention;
            if (!b.wrecked) b.drive.speed *= speedRetention;
            if (closingSpeed > 4) {
              const impact = THREE.MathUtils.clamp(2 + closingSpeed * 0.28, 2, 14);
              applyDamage(a, impact, { x: mtv.x, z: mtv.z, source: 'car' });
              applyDamage(b, impact, { x: -mtv.x, z: -mtv.z, source: 'car' });
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
  if (racer.boostT > 0 || racer.onPad) return SPEEDO_MAX_MS;
  const condition = 0.94 + 0.06 * (racer.health / 100);
  return d.maxSpeed * condition;
}

const TOAST_ICONS = {
  boost: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2 4 13.2h6.2L9 22 20 9.6h-6.4L13 2z"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h7a2 2 0 0 1 2 2v12h1.5A2.5 2.5 0 0 0 20 14.5V9.2l-2-1.5V5h-1v4.1l3 2.2V14.5A3.5 3.5 0 0 1 16.5 18H16v2H6v-2H5.5A1.5 1.5 0 0 1 4 16.5v-11A2.5 2.5 0 0 1 6.5 3H7zm2 2v7h5V5H9z"/></svg>',
  repair: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 3 7v5c0 5.1 3.4 9.8 9 11 5.6-1.2 9-5.9 9-11V7l-9-5zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V8z"/></svg>',
  oil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2s6 7.1 6 11.2A6 6 0 1 1 6 13.2C6 9.1 12 2 12 2zm0 7.4c-2.4 2.6-3 4.2-3 5.8a3 3 0 0 0 6 0c0-1.6-.6-3.2-3-5.8z"/></svg>',
  impact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 2.2 6.4L21 11l-6.8 2.6L12 20l-2.2-6.4L3 11l6.8-2.6L12 2z"/></svg>',
  empty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h7a2 2 0 0 1 2 2v3.2l4 3V14.5A3.5 3.5 0 0 1 16.5 18H16v2H6v-2H5.5A1.5 1.5 0 0 1 4 16.5v-11A2.5 2.5 0 0 1 6.5 3H7zm2 2v7h5V5H9zm10.6 14.1L3.7 4.2 5 2.9l15.9 15.9-1.3 1.3z"/></svg>',
  nitro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 2h6l.8 3H19v2h-1.2l-1.1 13H7.3L6.2 7H5V5h3.2L9 2zm1.2 3 .5-1.5h2.6L13.8 5H10.2zM8.3 7l.9 11h5.6l.9-11H8.3z"/></svg>',
  radio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM4 8h16v12H4V8zm4 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm8-2h2v2h-2v-2zm0 4h2v2h-2v-2z"/></svg>',
};
const TOAST_KINDS = ['boost', 'fuel', 'repair', 'nitro', 'oil', 'impact', 'empty', 'radio'];

function tryUseNitro() {
  const racer = racers.find((entry) => entry.isPlayer);
  if (!racer || racer.wrecked || racer.finished) return;
  if ((racer.nitroCharges || 0) <= 0) return;
  racer.nitroCharges -= 1;
  racer.boostT = Math.max(racer.boostT, NITRO_DURATION);
  racer.drive.speed = Math.max(racer.drive.speed, effectiveMax(racer));
  announcePickup(racer, 'nitro', 'NITRO', 'GO');
  updateNitroHud(racer);
}

function racerTouchesPickup(racer, pu, pad = 0.7) {
  const d = racer.drive;
  const dx = pu.mesh.position.x - d.x;
  const dz = pu.mesh.position.z - d.z;
  const along = dx * Math.sin(d.yaw) + dz * Math.cos(d.yaw);
  const lat = dx * Math.cos(d.yaw) - dz * Math.sin(d.yaw);
  return Math.abs(along) < d.halfL + pad && Math.abs(lat) < d.halfW + pad;
}

function updateNitroHud(player) {
  if (!nitroHudEl) return;
  const charges = player ? (player.nitroCharges || 0) : 0;
  if (nitroValueEl) {
    nitroValueEl.textContent = charges >= NITRO_MAX ? 'MAX' : charges > 0 ? `${charges}/${NITRO_MAX}` : '—';
  }
  nitroHudEl.classList.toggle('ready', charges > 0);
  nitroHudEl.classList.toggle('empty', charges <= 0);
  if (nitroPipsEl) {
    nitroPipsEl.querySelectorAll('.nitro-pip').forEach((pip, i) => {
      pip.classList.toggle('on', i < charges);
    });
  }
}

function announcePickup(racer, kind, title, detail = '', hold = 0.95) {
  if (!racer?.isPlayer) return;
  racer.pickupKind = kind;
  racer.pickupTitle = title;
  racer.pickupDetail = detail;
  racer.pickupMessage = title;
  racer.pickupMessageT = hold;
  if (kind === 'fuel' && fuelHudEl) {
    fuelHudEl.classList.remove('flash');
    void fuelHudEl.offsetWidth;
    fuelHudEl.classList.add('flash');
  }
  if (kind === 'repair' && damageHudEl) {
    damageHudEl.classList.remove('flash');
    void damageHudEl.offsetWidth;
    damageHudEl.classList.add('flash');
  }
  if (kind === 'nitro' && nitroHudEl) {
    nitroHudEl.classList.remove('flash');
    void nitroHudEl.offsetWidth;
    nitroHudEl.classList.add('flash');
  }
  if (pickupToastEl) {
    pickupToastEl.classList.remove('on', 'pop');
    for (const name of TOAST_KINDS) pickupToastEl.classList.remove(name);
    if (pickupToastIconEl) pickupToastIconEl.innerHTML = TOAST_ICONS[kind] || TOAST_ICONS.boost;
    if (pickupToastKickerEl) pickupToastKickerEl.textContent = '';
    if (pickupToastTitleEl) pickupToastTitleEl.textContent = title;
    if (pickupToastDetailEl) {
      pickupToastDetailEl.textContent = detail;
      pickupToastDetailEl.hidden = !detail;
    }
    pickupToastEl.classList.add(kind);
    void pickupToastEl.offsetWidth;
    pickupToastEl.classList.add('on', 'pop');
  }
}

function updatePickupToast(player) {
  if (!pickupToastEl) return;
  const showing = Boolean(player && player.pickupMessageT > 0);
  pickupToastEl.classList.toggle('on', showing);
  if (!showing) pickupToastEl.classList.remove('pop');
}

function updatePickupVisuals(dt) {
  const now = performance.now() / 1000;
  for (const pu of powerups) {
    if (pu.taken) continue;
    const fx = pu.mesh.userData;
    const hover = fx.hover || pu.mesh;
    hover.position.y = 1.22 + Math.sin(now * 2.1 + pu.t * 7) * 0.08;
    hover.rotation.y += dt * 0.55;
    if (fx.rim) fx.rim.rotation.z += dt * 0.45;
    const pulse = 0.82 + Math.sin(now * 3.4 + pu.t * 8) * 0.18;
    if (fx.glowMat) fx.glowMat.opacity = 0.78 + pulse * 0.22;
    if (fx.shaftMat) fx.shaftMat.opacity = 0.7 + pulse * 0.22;
    if (fx.billboard) {
      fx.billboard.position.y = hover.position.y;
      fx.billboard.lookAt(camera.position);
      fx.billboard.material.opacity = 0.58 + pulse * 0.28;
    }
  }
  updatePickupBursts(dt);
}

function updatePowerups(dt) {
  const now = performance.now() / 1000;
  for (const pu of powerups) {
    if (pu.taken && now >= pu.respawn) {
      pu.taken = false;
      pu.mesh.visible = true;
    }
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
          announcePickup(racer, 'oil', 'OIL');
          break;
        }
      }
    }

    for (const pad of boostPads) {
      let dtTrack = Math.abs(frac - pad.t);
      if (dtTrack > 0.5) dtTrack = 1 - dtTrack;
      if (dtTrack < 0.012 && Math.abs(lat - pad.lane) < 2.45) {
        racer.onPad = true;
        if (racer.padCooldown <= 0) {
          racer.padCooldown = 1.1;
          racer.boostT = Math.max(racer.boostT, 5);
          pad.flash = 1;
          d.speed = Math.max(d.speed, effectiveMax(racer));
          announcePickup(racer, 'boost', 'BOOST', '200');
        }
        break;
      }
    }

    if (!racer.isPlayer) continue;
    for (const pu of powerups) {
      if (pu.taken) continue;
      if (pu.type === 'nitro' && (racer.nitroCharges || 0) >= NITRO_MAX) continue;
      if (!racerTouchesPickup(racer, pu)) continue;
      pu.taken = true;
      pu.mesh.visible = false;
      pu.respawn = now + 8;
      spawnPickupBurst(pu.mesh.position, pu.mesh.userData.accent || 0xffffff);
      if (pu.type === 'fuel') {
        const fuelAdded = Math.min(18, 100 - racer.fuel);
        racer.fuel = Math.min(100, racer.fuel + 18);
        if (fuelAdded > 0) announcePickup(racer, 'fuel', 'FUEL', `+${Math.round(fuelAdded)}`);
        else announcePickup(racer, 'fuel', 'FUEL', 'FULL');
      } else if (pu.type === 'repair') {
        const repair = Math.min(35, 100 - racer.health);
        racer.health = Math.min(100, racer.health + 35);
        if (repair > 0) {
          racer.wrecked = false;
          for (const zoneId of Object.keys(racer.bodyDamage || {})) {
            racer.bodyDamage[zoneId] = Math.max(0, racer.bodyDamage[zoneId] - repair / 100);
          }
          if (racer.health >= 60) {
            racer.brokenLampIndex = -1;
            racer.brokenRearLamps?.clear();
          }
          syncVisualDamage(racer, true);
        }
        if (repair > 0) announcePickup(racer, 'repair', 'REPAIR', `+${Math.round(repair)}`);
        else announcePickup(racer, 'repair', 'REPAIR', 'FULL');
      } else if (pu.type === 'nitro') {
        racer.nitroCharges = Math.min(NITRO_MAX, (racer.nitroCharges || 0) + 1);
        announcePickup(racer, 'nitro', 'NITRO', 'N');
      }
    }
  }

  const player = racers.find((r) => r.isPlayer);
  updatePickupToast(player);
  if (boostHudEl) boostHudEl.classList.remove('on');
  if (player && damageHudEl && damageValueEl && damageFillEl) {
    const damage = Math.round(100 - player.health);
    damageValueEl.textContent = `${damage}%`;
    damageFillEl.style.width = `${damage}%`;
    damageHudEl.classList.toggle('warn', damage >= 45 && damage < 75);
    damageHudEl.classList.toggle('critical', damage >= 75);
  }
  if (player && fuelHudEl && fuelValueEl && fuelFillEl) {
    const fuel = Math.round(player.fuel);
    fuelValueEl.textContent = `${fuel}%`;
    fuelFillEl.style.width = `${fuel}%`;
    fuelHudEl.classList.toggle('warn', fuel > 20 && fuel <= 45);
    fuelHudEl.classList.toggle('critical', fuel <= 20);
  }
  updateNitroHud(player);
}

function updateLap(racer) {
  const d = racer.drive;
  const prog = progressAlongTrack(d.x, d.z);
  const frac = (((prog / LOOP_LEN) % 1) + 1) % 1;

  if (frac > 0.35 && frac < 0.65) racer.passedMid = true;

  const lastFrac = racer.lastFrac !== undefined ? racer.lastFrac : frac;
  // A forward crossing across 0.0 occurs when lastFrac is near loop end (> 0.82) and current frac is near loop start (< 0.18)
  const crossedFinishLine = (lastFrac > 0.82 && frac < 0.18);

  if (crossedFinishLine && racer.passedMid && d.speed > 1.5) {
    if (racer.lap >= totalLaps) {
      if (!racer.finished) {
        racer.finished = true;
        racer.finishPlace = racers.filter((r) => r.finished).length;
        // Assign staggered parking / cooldown slot well beyond the finish line
        const stopDistance = 22 + (racer.finishPlace * 10);
        racer.finishTargetT = (stopDistance / LOOP_LEN) % 1;
        racer.finishTargetLane = (racer.finishPlace % 2 === 0 ? 1 : -1) * (ROAD_WIDTH * 0.5 - 1.8);
        if (racer.isPlayer) {
          showFinish(racer.finishPlace);
        }
      }
    } else {
      racer.lap += 1;
      if (racer.isPlayer) lapCountEl.textContent = String(racer.lap);
    }
    racer.passedMid = false;
  }

  racer.lastFrac = frac;

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
      announcePickup(racer, 'empty', 'NO FUEL');
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
  updateSpeedometer(d.speed, racer.boostT > 0 || racer.onPad);
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
    const d = racer.drive;
    const frac = (((progressAlongTrack(d.x, d.z) / LOOP_LEN) % 1) + 1) % 1;
    const targetT = racer.finishTargetT !== undefined ? racer.finishTargetT : 0.025;
    const targetLane = racer.finishTargetLane !== undefined ? racer.finishTargetLane : 2.5;

    // Check if the car has arrived past its designated stopping slot
    const pastTarget = (frac >= targetT && frac < 0.2) || (frac >= 0.2 && frac < 0.85);

    if (pastTarget || d.speed <= 0.6) {
      d.speed = Math.max(0, d.speed - 16 * dt);
      if (d.speed > 0) {
        d.x += Math.sin(d.yaw) * d.speed * dt;
        d.z += Math.cos(d.yaw) * d.speed * dt;
      }
      applyPose(racer, 0);
      updateVehicleEffects(racer, dt, false, d.speed > 0.1);
      return;
    }

    // Guide the car forward along the track into its parking slot past the finish line
    d.speed = Math.max(6, d.speed - 10 * dt);
    const { p, tan, side } = frameAt(frac);
    let tx = p.x + tan.x * 12 + side.x * targetLane;
    let tz = p.z + tan.z * 12 + side.z * targetLane;
    steerToward(d, tx, tz, 2.4, dt);

    d.x += Math.sin(d.yaw) * d.speed * dt;
    d.z += Math.cos(d.yaw) * d.speed * dt;
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
  const sank = racer.wrecked ? -0.06 : 0;
  racer.mesh.position.set(d.x, sank, d.z);
  racer.mesh.rotation.y = d.yaw;
  racer.mesh.rotation.z = racer.wrecked ? 0.12 : 0;
  racer.mesh.rotation.x = racer.wrecked ? 0.04 : 0;
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

  // 1. Victory / finish line cinematic (side track view -> orbit view)
  if (finishCinematicStart !== null) {
    const elapsed = clock.elapsedTime - finishCinematicStart;
    const SIDE_VIEW_DURATION = 2.3;

    if (elapsed < SIDE_VIEW_DURATION) {
      // Dynamic trackside side-view camera tracking player car across finish
      camera.position.lerp(finishSideCamPos, 0.12);
      const lookY = player.mesh.position.y + 0.65;
      camera.lookAt(player.mesh.position.x, lookY, player.mesh.position.z);
      if (camera.fov !== 46) {
        camera.fov = 46;
        camera.updateProjectionMatrix();
      }
      return;
    } else {
      // Orbit camera view around player car as it coasts to a stop
      const orbitElapsed = elapsed - SIDE_VIEW_DURATION;
      const orbit = player.drive.yaw + orbitElapsed * 0.42;
      const targetY = player.mesh.position.y + 0.75;
      camera.position.set(
        player.mesh.position.x + Math.sin(orbit) * 7.5,
        targetY + 2.4,
        player.mesh.position.z + Math.cos(orbit) * 7.5
      );
      if (camera.fov !== 42) {
        camera.fov = 42;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(player.mesh.position.x, targetY, player.mesh.position.z);

      if (!finishEl.classList.contains('show')) {
        showFinishModal(finishPlaceSaved);
      }
      return;
    }
  }

  // 2. Race lost orbit camera
  if (lossOrbitStart !== null) {
    const elapsed = clock.elapsedTime - lossOrbitStart;
    const orbit = player.drive.yaw + elapsed * 0.42;
    const targetY = player.mesh.position.y + 0.75;
    camera.position.set(
      player.mesh.position.x + Math.sin(orbit) * 7.4,
      targetY + 2.5,
      player.mesh.position.z + Math.cos(orbit) * 7.4
    );
    if (camera.fov !== 42) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(player.mesh.position.x, targetY, player.mesh.position.z);
    return;
  }

  // 3. Standard race chase camera
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
  const targetFov = THREE.MathUtils.lerp(CHASE_FOV, BOOST_FOV, speedFxIntensity);
  chaseFov += (targetFov - chaseFov) * (1 - Math.exp(-7 * dt));
  if (Math.abs(camera.fov - chaseFov) > 0.04) {
    camera.fov = chaseFov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(lookPos);
}

function updateFinishedRacers(dt) {
  for (const r of racers) {
    if (r.drive && r.drive.speed > 0) {
      r.drive.speed = Math.max(0, r.drive.speed - 14 * dt);
      r.drive.x += Math.sin(r.drive.yaw) * r.drive.speed * dt;
      r.drive.z += Math.cos(r.drive.yaw) * r.drive.speed * dt;
      applyPose(r, 0);
      updateVehicleEffects(r, dt, false, r.drive.speed > 0.5);
    }
  }
}

function resetPlayer() {
  const player = racers.find((r) => r.isPlayer);
  if (!player) return;
  const s = gridStarts()[PLAYER_GRID_SLOT];
  Object.assign(player.drive, { x: s.x, z: s.z, yaw: s.yaw, speed: 0 });
  cameraYaw = s.yaw;
  lossOrbitStart = null;
  finishCinematicStart = null;
  player.health = 100;
  player.fuel = 100;
  player.wrecked = false;
  player.hitCooldown = 0;
  player.boostT = 0;
  player.nitroCharges = 0;
  player.slipT = 0;
  player.slipAngle = 0;
  player.oilCooldown = 0;
  player.pickupMessageT = 0;
  player.pickupKind = '';
  player.pickupTitle = '';
  player.pickupDetail = '';
  if (pickupToastEl) pickupToastEl.classList.remove('on', 'pop', ...TOAST_KINDS);
  updateNitroHud(player);
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
  lossOrbitStart = null;
  finishCinematicStart = null;
  introEl.classList.remove('hidden');
  hudEl.classList.remove('on');
  finishEl.classList.remove('show');
  finishEl.classList.remove('loss');
  countdownEl.classList.remove('show');
  clearRacers();
  updateSpeedometer(0, false);
  speedFxIntensity = 0;
  chaseFov = CHASE_FOV;
  setSpeedFxOverlay(0);
  if (pickupToastEl) pickupToastEl.classList.remove('on', 'pop', ...TOAST_KINDS);
  clearSpeedStreaks();
  camera.fov = CHASE_FOV;
  camera.updateProjectionMatrix();
  camera.position.set(40, 68, 150);
  camera.lookAt(10, 2, 40);
}

async function startRace() {
  mode = 'countdown';
  lossOrbitStart = null;
  finishCinematicStart = null;
  radioManager.ensurePlaying();
  introEl.classList.add('hidden');
  finishEl.classList.remove('show');
  finishEl.classList.remove('loss');
  lapTotalEl.textContent = String(totalLaps);
  lapCountEl.textContent = '1';
  damageValueEl.textContent = '0%';
  damageFillEl.style.width = '0%';
  damageHudEl.classList.remove('warn', 'critical');
  fuelValueEl.textContent = '100%';
  fuelFillEl.style.width = '100%';
  fuelHudEl.classList.remove('warn', 'critical');
  updateNitroHud(null);
  updateSpeedometer(0, false);
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
  lossOrbitStart = null;
  finishCinematicStart = clock.elapsedTime;
  finishPlaceSaved = place;

  // Trackside camera placed ~14m past the finish line on the outer shoulder
  const f = frameAt(0.012);
  const sideOffset = ROAD_WIDTH * 0.5 + 4.8;
  finishSideCamPos.set(
    f.p.x + f.side.x * sideOffset,
    2.1,
    f.p.z + f.side.z * sideOffset
  );
}

function showFinishModal(place) {
  finishEl.classList.remove('loss');
  const currentTrackName = (TRACKS.find((t) => t.id === selectedTrackId) || TRACKS[0]).name;
  finishTitle.textContent = place === 1 ? 'You win!' : `${ordinal(place)} place`;
  finishMsg.textContent = place === 1
    ? `Clean run around ${currentTrackName}.`
    : 'Hit Race again or head back to the garage.';
  finishEl.classList.add('show');
}

function showLoss(message) {
  mode = 'finish';
  finishCinematicStart = null;
  lossOrbitStart = clock.elapsedTime;
  finishTitle.textContent = 'Race lost';
  finishMsg.textContent = message;
  finishEl.classList.add('loss');
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

await buildTrack(selectedTrackId);

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  updateBoostPadVisuals(dt);
  updatePickupVisuals(dt);
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
    } else if (mode === 'finish' && finishCinematicStart !== null) {
      updateFinishedRacers(dt);
    }
    updateCamera(dt);
    const player = racers.find((r) => r.isPlayer);
    updateSpeedEffects(dt, player);
    if ((lossOrbitStart !== null || finishCinematicStart !== null) && player) {
      updateVehicleEffects(player, dt, false, false);
    }
  }
  renderer.render(scene, camera);
});

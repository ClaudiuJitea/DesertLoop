import * as THREE from 'three';
import { vehicleSurface } from './vehicle-surfaces.js';
import { upgradeDamageAt } from './upgrade-damage.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function studioEnvironment(renderer) {
  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(room, .04);
  room.dispose();
  generator.dispose();
  return target;
}
export function polishCar(root, environment = null) {
  const parts = [];
  root.traverse(part => { if (part.isMesh) parts.push(part); });
  for (const part of parts) {
    let wheel = false;
    for (let node = part; node; node = node.parent) if (/wheel|steer/i.test(node.name)) wheel = true;
    const original = Array.isArray(part.material) ? part.material[0] : part.material;
    if (wheel || !part.geometry.getAttribute('color')) {
      const material = original.clone();
      material.roughness = .72;
      material.metalness = .16;
      material.envMap = environment;
      material.envMapIntensity = .2;
      part.material = material;
      continue;
    }
    const geometry = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
    const colors = geometry.getAttribute('color');
    const buckets = new Map();
    for (let i = 0; i < colors.count; i += 3) {
      const kind = vehicleSurface(colors.getX(i), colors.getY(i), colors.getZ(i));
      if (!buckets.has(kind)) buckets.set(kind, []);
      buckets.get(kind).push(i, i + 1, i + 2);
    }
    const replacement = new THREE.Group();
    replacement.name = part.name;
    replacement.position.copy(part.position);
    replacement.quaternion.copy(part.quaternion);
    replacement.scale.copy(part.scale);
    for (const [kind, vertices] of buckets) {
      const surface = new THREE.BufferGeometry();
      for (const [name, attribute] of Object.entries(geometry.attributes)) {
        const values = new Float32Array(vertices.length * attribute.itemSize);
        vertices.forEach((index, i) => {
          values[i * attribute.itemSize] = attribute.getX(index);
          if (attribute.itemSize > 1) values[i * attribute.itemSize + 1] = attribute.getY(index);
          if (attribute.itemSize > 2) values[i * attribute.itemSize + 2] = attribute.getZ(index);
          if (attribute.itemSize > 3) values[i * attribute.itemSize + 3] = attribute.getW(index);
        });
        surface.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize));
      }
      const material = new THREE.MeshPhysicalMaterial({
        color: kind === 'glass' ? 0x152b3b : kind === 'chrome' ? 0xafbdc9 : 0xffffff,
        vertexColors: kind !== 'glass' && kind !== 'chrome',
        roughness: kind === 'glass' ? .16 : kind === 'chrome' ? .23 : kind === 'trim' ? .84 : .29,
        metalness: kind === 'chrome' ? .88 : kind === 'paint' ? .12 : 0,
        clearcoat: kind === 'paint' ? .55 : 0, clearcoatRoughness: .18,
        flatShading: true, envMap: environment, envMapIntensity: kind === 'glass' ? .35 : .2,
      });
      // Damage uses per-vertex colour, including the now correctly tinted glass.
      if (kind === 'glass' || kind === 'chrome') {
        const tint = material.color.clone();
        const color = surface.getAttribute('color');
        for (let i = 0; i < color.count; i++) color.setXYZ(i, tint.r, tint.g, tint.b);
        material.color.setHex(0xffffff);
        material.vertexColors = true;
      }
      const mesh = new THREE.Mesh(surface, material);
      mesh.userData.vehicleSurface = kind;
      mesh.castShadow = mesh.receiveShadow = true;
      replacement.add(mesh);
    }
    while (part.children.length) replacement.add(part.children[0]);
    part.parent.add(replacement);
    part.parent.remove(part);
    if (geometry !== part.geometry) geometry.dispose();
    part.geometry.dispose();
    (Array.isArray(part.material) ? part.material : [part.material]).forEach(m => m.dispose());
  }
}
// Sample the finished paint before damage subdivision so race and preview match exactly.
export function carPaintColor(model) {
  const swatches = new Map();
  const color = new THREE.Color();
  const hsl = {};
  model.traverse(part => {
    if (!part.isMesh || part.userData.vehicleSurface !== 'paint') return;
    const colors = part.geometry.getAttribute('color');
    if (!colors) return;
    for (let i = 0; i < colors.count; i++) {
      color.setRGB(colors.getX(i), colors.getY(i), colors.getZ(i));
      color.getHSL(hsl);
      if (hsl.l < .07 || hsl.l > .68 || hsl.s < .08) continue;
      const key = [color.r, color.g, color.b].map(v => v.toFixed(3)).join(',');
      const swatch = swatches.get(key) || { count: 0, color: color.clone() };
      swatch.count++; swatches.set(key, swatch);
    }
  });
  return [...swatches.values()].sort((a,b) => b.count-a.count)[0]?.color.clone() || new THREE.Color(0xa98a60);
}

function bodySurfaceHeight(racer, x, z) {
  racer.mesh.updateWorldMatrix(true, true);
  const start = new THREE.Vector3(x, racer.visualBounds.max.y + 1, z);
  racer.mesh.localToWorld(start);
  const down = new THREE.Vector3(0,-1,0).transformDirection(racer.mesh.matrixWorld);
  const ray = new THREE.Raycaster(start, down);
  const panels = [];
  (racer.model || racer.mesh).traverse(part => {
    if (part.isMesh && part.userData.vehicleSurface === 'paint') panels.push(part);
  });
  const hit = ray.intersectObjects(panels, false)[0];
  return hit ? racer.mesh.worldToLocal(hit.point.clone()).y : racer.visualBounds.min.y + (racer.visualBounds.max.y-racer.visualBounds.min.y)*.65;
}

export function addCarDetails(racer, engineLevel = 0) {
  const bounds = racer.visualBounds;
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const details = new THREE.Group();
  details.name = 'performance-details';
  racer.mesh.add(details);
  let sourceMaterial;
  (racer.model || racer.mesh).traverse(part => {
    if (!sourceMaterial && part.isMesh && part.userData.vehicleSurface === 'paint') sourceMaterial = part.material;
  });
  const painted = sourceMaterial ? sourceMaterial.clone() : new THREE.MeshPhysicalMaterial({roughness:.29, metalness:.12,clearcoat:.55});
  painted.vertexColors = false;
  painted.color.copy(racer.paintColor || carPaintColor(racer.model || racer.mesh));
  racer.upgradePaint = painted;
  racer.upgradeDamageMeshes = [];
  const upgradePart = (width, height, depth, region) => {
    const geometry = new THREE.BoxGeometry(width, height, depth,
      Math.max(2, Math.ceil(width / .08)), Math.max(2, Math.ceil(height / .08)), Math.max(2, Math.ceil(depth / .08)));
    // White vertex colours preserve the chosen body paint; damage darkens locally.
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 3).fill(1), 3));
    painted.vertexColors = true;
    const part = new THREE.Mesh(geometry, painted);
    part.userData.upgradeRegion = region;
    racer.upgradeDamageMeshes.push(part);
    return part;
  };
  racer.headlights = [-1, 1].map(sign => {
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(size.x * .14, size.y * .07),
      new THREE.MeshBasicMaterial({ color: 0xffedbd, toneMapped: false }));
    lamp.position.set(center.x + sign * size.x * .31, bounds.min.y + size.y * .43, bounds.max.z + .025);
    details.add(lamp);
    return lamp;
  });
  if (engineLevel > 0) {
    const splitter = upgradePart(size.x * .94, .055, .2, 'front');
    splitter.position.set(center.x, bounds.min.y + size.y * .12, bounds.max.z + .025);
    details.add(splitter);
  }
  if (engineLevel >= 2) {
    const wingZ = bounds.min.z + size.z * .12;
    const mountX = [center.x - size.x * .29, center.x + size.x * .29];
    const deckHeights = mountX.map(x => bodySurfaceHeight(racer, x, wingZ));
    const wingY = Math.max(...deckHeights) + .16;
    mountX.forEach((x,i) => {
      const supportHeight = wingY - deckHeights[i];
      const support = upgradePart(.055, supportHeight, .12, 'rear');
      support.position.set(x, deckHeights[i] + supportHeight / 2, wingZ);
      support.userData.deckHeight = deckHeights[i];
      details.add(support);
    });
    const wing = upgradePart(size.x * .96, .06, .33, 'rear');
    wing.position.set(center.x, wingY, wingZ); details.add(wing);
    if (engineLevel >= 3) {
      for (const sign of [-1,1]) {
        const endplate = upgradePart(.04, .14, .35, 'rear');
        endplate.position.set(sign * size.x * .47, .025, 0);
        wing.add(endplate);
      }
    }
    racer.rearWing = wing;
  }
  details.traverse(part => { if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; } });
  details.updateWorldMatrix(true, true);
  const inverse = details.matrixWorld.clone().invert();
  for (const part of racer.upgradeDamageMeshes) {
    const toDetails = new THREE.Matrix4().multiplyMatrices(inverse, part.matrixWorld);
    part.userData.damageRest = {
      positions: part.geometry.attributes.position.array.slice(),
      toDetails, fromDetails: toDetails.clone().invert(),
    };
  }
  // Preserve the mounting coordinates, then follow the same roll/pitch as the body.
  if (racer.model) racer.model.attach(details);
  racer.performanceDetails = details;
}
export function syncCarDetails(racer) {
  racer.headlights?.forEach((lamp, i) => {
    const severity = racer.bodyDamage?.[i ? 'frontRightLight' : 'frontLeftLight'] || 0;
    lamp.material.color.setHex(severity > .45 ? 0x171e23 : 0xffedbd);
    lamp.rotation.z = severity * (i ? .16 : -.16);
  });
  const point = new THREE.Vector3();
  for (const part of racer.upgradeDamageMeshes || []) {
    const { positions, toDetails, fromDetails } = part.userData.damageRest;
    const position = part.geometry.attributes.position;
    const color = part.geometry.attributes.color;
    for (let i = 0; i < position.count; i++) {
      point.fromArray(positions, i * 3).applyMatrix4(toDetails);
      const bent = upgradeDamageAt(point.x, point.y, point.z, part.userData.upgradeRegion, racer.visualBounds, racer.bodyDamage);
      if (bent.shade === 1) {
        position.setXYZ(i, positions[i*3], positions[i*3+1], positions[i*3+2]);
      } else {
        point.set(bent.x, bent.y, bent.z).applyMatrix4(fromDetails);
        position.setXYZ(i, point.x, point.y, point.z);
      }
      color.setXYZ(i, bent.shade, bent.shade, bent.shade);
    }
    position.needsUpdate = color.needsUpdate = true;
    part.geometry.computeVertexNormals();
    part.geometry.computeBoundingSphere();
  }
}

export class GaragePreview {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.scene = new THREE.Scene();
    this.environment = studioEnvironment(this.renderer);
    this.scene.environment = this.environment.texture;
    this.scene.add(new THREE.HemisphereLight(0xfff6e8, 0x80715f, .8));
    this.camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    this.active = false;
    this.model = null;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.canvas = canvas;
  }
  setModel(model, bounds) {
    this.clear();
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.sub(center);
    // Render targets belong to their renderer; the workshop has its own environment.
    model.traverse(part => {
      if (part.isMesh) for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
        if (material.isMeshStandardMaterial) {
          material.envMap = this.environment.texture;
          material.needsUpdate = true;
        }
      }
    });
    this.model = new THREE.Group();
    this.model.add(model);
    this.model.rotation.y = -.65;
    this.scene.add(this.model);
    this.size = bounds.getSize(new THREE.Vector3()).length();
    this.start();
  }
  start() {
    this.active = true;
    let previous = performance.now();
    this.renderer.setAnimationLoop(now => {
      const dt = Math.min((now - previous) / 1000, .05); previous = now;
      const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
      if (!width || !height) return;
      if (width !== this.width || height !== this.height) {
        this.renderer.setSize(width, height, false);
        this.width = width; this.height = height;
      }
      this.camera.aspect = width / height;
      const distance = (this.size || 5) * 1.5 / Math.min(1, this.camera.aspect);
      this.camera.position.set(distance * .5, distance * .28, distance * .75);
      this.camera.lookAt(0, 0, 0); this.camera.updateProjectionMatrix();
      if (this.model && !this.reducedMotion.matches) this.model.rotation.y += dt * .16;
      this.renderer.render(this.scene, this.camera);
    });
  }
  clear() {
    if (!this.model) return;
    this.scene.remove(this.model);
    this.model.traverse(part => {
      if (part.isMesh) { part.geometry.dispose(); (Array.isArray(part.material) ? part.material : [part.material]).forEach(m => m.dispose()); }
    });
    this.model = null;
  }
  stop() { this.active = false; this.renderer.setAnimationLoop(null); this.clear(); }
}

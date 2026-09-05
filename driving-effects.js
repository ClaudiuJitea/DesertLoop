import * as THREE from 'three';

// Fixed-size pools keep effect cost independent of race length.
export class DrivingEffects {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.cursor = 0;
    this.dustCursor = 0;
    this.emitTime = 0;
    this.previous = null;
    this.matrix = new THREE.Object3D();
    this.marks = Array.from({ length: 192 }, () => ({ life: 0, x: 0, z: 0, yaw: 0, length: 0 }));
    this.skids = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0x0c1116, transparent: true, opacity: 0.38, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }), this.marks.length);
    this.skids.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.skids.frustumCulled = false;
    this.group.add(this.skids);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    this.dust = Array.from({ length: 36 }, () => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xcdb89b, transparent: true, depthWrite: false }));
      sprite.visible = false;
      this.group.add(sprite);
      return { sprite, life: 0, maxLife: 1, vx: 0, vz: 0 };
    });
    this.clear();
  }
  clear() {
    this.previous = null;
    this.emitTime = 0;
    for (let i = 0; i < this.marks.length; i++) {
      this.marks[i].life = 0;
      this.matrix.scale.setScalar(0);
      this.matrix.updateMatrix();
      this.skids.setMatrixAt(i, this.matrix.matrix);
    }
    this.skids.instanceMatrix.needsUpdate = true;
    for (const particle of this.dust) { particle.life = 0; particle.sprite.visible = false; }
  }
  update(dt, player, { active = false, braking = false, reducedMotion = false } = {}) {
    this.group.visible = Boolean(player);
    if (!player) { this.previous = null; return; }
    const d = player.drive;
    const speed = Math.abs(d.speed);
    const sliding = active && !player.wrecked && speed > 9 && (braking || player.slipT > 0);
    const forwardX = Math.sin(d.yaw), forwardZ = Math.cos(d.yaw);
    const rearX = d.x - forwardX * player.def.halfL * 0.7;
    const rearZ = d.z - forwardZ * player.def.halfL * 0.7;
    this.emitTime -= dt;
    if (sliding && this.emitTime <= 0) {
      this.emitTime = 0.045;
      for (const side of [-1, 1]) {
        const x = rearX + forwardZ * side * player.def.halfW * 0.8;
        const z = rearZ - forwardX * side * player.def.halfW * 0.8;
        if (this.previous) {
          const previousX = this.previous.x + Math.cos(this.previous.yaw) * side * player.def.halfW * 0.8;
          const previousZ = this.previous.z - Math.sin(this.previous.yaw) * side * player.def.halfW * 0.8;
          const length = Math.hypot(x - previousX, z - previousZ);
          // Recovery/teleports must not draw a line across the circuit.
          if (length > 0.02 && length < 5) {
            Object.assign(this.marks[this.cursor++ % this.marks.length], {
              life: 10, x: (x + previousX) / 2, z: (z + previousZ) / 2,
              yaw: Math.atan2(x - previousX, z - previousZ), length: length + 0.08,
            });
          }
        }
        if (!reducedMotion) {
          const particle = this.dust[this.dustCursor++ % this.dust.length];
          particle.life = particle.maxLife = 0.8 + Math.random() * 0.5;
          particle.vx = -forwardX * 1.5 + (Math.random() - 0.5);
          particle.vz = -forwardZ * 1.5 + (Math.random() - 0.5);
          particle.sprite.position.set(x, 0.24, z);
          particle.sprite.visible = true;
        }
      }
      this.previous = { x: rearX, z: rearZ, yaw: d.yaw };
    } else if (!sliding) this.previous = null;
    let marksChanged = false;
    for (let i = 0; i < this.marks.length; i++) {
      const mark = this.marks[i];
      if (mark.life <= 0) continue;
      marksChanged = true;
      mark.life = Math.max(0, mark.life - dt);
      this.matrix.position.set(mark.x, 0.034, mark.z);
      this.matrix.rotation.set(-Math.PI / 2, 0, mark.yaw);
      this.matrix.scale.set(0.23 * Math.min(1, mark.life / 2), mark.life ? mark.length : 0, 1);
      this.matrix.updateMatrix();
      this.skids.setMatrixAt(i, this.matrix.matrix);
    }
    if (marksChanged) this.skids.instanceMatrix.needsUpdate = true;
    for (const particle of this.dust) {
      particle.life = Math.max(0, particle.life - dt);
      particle.sprite.visible = particle.life > 0 && !reducedMotion;
      if (!particle.sprite.visible) continue;
      const age = 1 - particle.life / particle.maxLife;
      particle.sprite.position.x += particle.vx * dt;
      particle.sprite.position.z += particle.vz * dt;
      particle.sprite.position.y += dt * 0.55;
      particle.sprite.scale.setScalar(0.65 + age * 2.2);
      particle.sprite.material.opacity = Math.sin(age * Math.PI) * 0.28;
    }

  }
}

let asphaltTexture;
export function detailRoad(mesh) {
  if (!asphaltTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.createImageData(256, 256);
    let seed = 37;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = 190 + (seed % 66);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    asphaltTexture = new THREE.CanvasTexture(canvas);
    asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.colorSpace = THREE.SRGBColorSpace;
    asphaltTexture.anisotropy = 4;
  }
  const positions = mesh.geometry.getAttribute('position');
  const uv = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) { uv[i * 2] = positions.getX(i) / 5; uv[i * 2 + 1] = positions.getZ(i) / 5; }
  mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  mesh.material.map = asphaltTexture;
  mesh.material.needsUpdate = true;
}

export function createTrackTrim(frameAt, length, roadWidth) {
  const segments = Math.ceil(length / 3);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.65, 0.055, 3.05),
    new THREE.MeshLambertMaterial({ color: 0xffffff }), segments * 2);
  const pose = new THREE.Object3D();
  const color = new THREE.Color();
  let count = 0;
  for (let i = 0; i < segments; i++) {
    const frame = frameAt(i / segments);
    const ahead = frameAt((i / segments + 10 / length) % 1);
    const bend = frame.tan.x * ahead.tan.z - frame.tan.z * ahead.tan.x;
    if (Math.abs(bend) < 0.055) continue;
    for (const side of [-1, 1]) {
      pose.position.set(frame.p.x + frame.side.x * side * (roadWidth / 2 + 0.4), 0.025,
        frame.p.z + frame.side.z * side * (roadWidth / 2 + 0.4));
      pose.rotation.y = Math.atan2(frame.tan.x, frame.tan.z);
      pose.updateMatrix();
      mesh.setMatrixAt(count, pose.matrix);
      color.setHex(i % 2 ? 0xe9e2cf : 0xb65332);
      mesh.setColorAt(count++, color);
    }
  }
  mesh.count = count;
  mesh.receiveShadow = true;
  return mesh;
}

import * as THREE from 'three';
import { exhaustLayout } from './exhaust-layout.js';

let smokeTexture;
export function exhaustSmokeTexture() {
  if (smokeTexture) return smokeTexture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // Overlapping soft lobes break up the silhouette without sharp particle edges.
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.4, radius = i ? 21 : 0;
    const x = 64 + Math.cos(angle) * radius, y = 64 + Math.sin(angle) * radius;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 39);
    gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(.45, 'rgba(255,255,255,0.07)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0,0,128,128);
  }
  smokeTexture = new THREE.CanvasTexture(canvas);
  return smokeTexture;
}
let flameTexture;
function getFlameTexture() {
  if (flameTexture) return flameTexture;
  const canvas = document.createElement('canvas'); canvas.width=32; canvas.height=128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0,0,0,128);
  gradient.addColorStop(0,'rgba(59,110,244,0)');
  gradient.addColorStop(.24,'rgba(78,117,250,0.16)');
  gradient.addColorStop(.62,'rgba(101,180,255,0.7)');
  gradient.addColorStop(1,'rgba(226,242,255,0.95)');
  ctx.fillStyle=gradient; ctx.fillRect(0,0,32,128);
  flameTexture=new THREE.CanvasTexture(canvas);
  flameTexture.colorSpace=THREE.SRGBColorSpace;
  return flameTexture;
}
export function installExhaust(racer) {
  const profiles = exhaustLayout(racer.id, racer.visualBounds);
  const tubeMaterial = new THREE.MeshStandardMaterial({color:0x656b6c, metalness:.75,roughness:.38});
  racer.exhaustOutlets = profiles.map(profile => {
    const mount=new THREE.Group();
    mount.name='exhaust-outlet';
    mount.position.set(profile.x, profile.y, profile.z);
    mount.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), new THREE.Vector3(...profile.direction));
    const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.22,16,1,true),tubeMaterial);
    pipe.rotation.x=Math.PI/2;pipe.position.z=.10;mount.add(pipe);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(.065,.012,6,16),tubeMaterial);mount.add(lip);
    const opening=new THREE.Mesh(new THREE.CircleGeometry(.055,16),new THREE.MeshBasicMaterial({color:0x0b0d0e,side:THREE.DoubleSide}));
    opening.position.z=.015;mount.add(opening);
    const cone=new THREE.CylinderGeometry(0,.082,1,12,6,true);
    cone.translate(0,.5,0);cone.rotateX(-Math.PI/2);
    const flame=new THREE.Mesh(cone,new THREE.MeshBasicMaterial({map:getFlameTexture(),transparent:true,opacity:.75,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
    flame.position.z=-.02;flame.visible=false;mount.add(flame);
    const core=new THREE.Mesh(cone,new THREE.MeshBasicMaterial({map:getFlameTexture(),color:0xe2f3ff,transparent:true,opacity:.8,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
    core.position.z=-.02;core.visible=false;mount.add(core);
    racer.mesh.add(mount);
    if (racer.model) racer.model.attach(mount);
    return {mount, flame, core};
  });
  racer.exhaustOutletIndex=0;
  racer.exhaustTime=0;
}
export function updateExhaustFlames(racer, dt, active, reducedMotion) {
  racer.exhaustTime=(racer.exhaustTime||0)+dt;
  const boosted=active && !reducedMotion && !racer.wrecked && Math.abs(racer.drive.speed)>3 && (racer.boostT>0||racer.onPad);
  racer.exhaustOutlets?.forEach(({flame,core},i)=>{
    flame.visible=core.visible=Boolean(boosted);
    if(!boosted)return;
    const pulse=.9+.1*Math.sin(racer.exhaustTime*39+i*2)+.05*Math.sin(racer.exhaustTime*67);
    const length=(.38+Math.min(Math.abs(racer.drive.speed)/60,.6))*pulse;
    flame.scale.set(pulse,pulse,length);
    core.scale.set(.47,.47,length*.48);
    flame.material.opacity=.65+.1*pulse;
  });
}

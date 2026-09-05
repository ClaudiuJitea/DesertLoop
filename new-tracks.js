import * as THREE from 'three';

export const EXTRA_ROUTES = {
  'alpine-pass': [[-180,-145],[-35,-160],[115,-155],[220,-100],[220,5],[130,65],[210,150],[150,250],[0,280],[-160,240],[-240,135],[-175,50],[-235,-55]],
  'sunset-coast': [[-180,-140],[-30,-160],[145,-130],[240,-40],[185,40],[230,160],[125,245],[-40,250],[-160,195],[-220,90],[-195,-10],[-240,-90]],
};
export function makeExtraTracks({ group, place, frameAt, pine, rock, bush }) {
  function mountains(snow) {
    for (let i = 0; i < 16; i++) {
      const angle = i / 16 * Math.PI * 2;
      const radius = 480 + (i % 3) * 55;
      const height = 100 + (i % 4) * 28;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(90 + i % 3 * 20, height, 5),
        new THREE.MeshLambertMaterial({ color: snow ? 0x647982 : 0xb39177, flatShading: true }));
      mountain.position.set(Math.cos(angle) * radius, height / 2 - 5, Math.sin(angle) * radius + 40);
      mountain.rotation.y = angle;
      group.add(mountain);
      if (snow) {
        const cap = new THREE.Mesh(new THREE.ConeGeometry((90 + i % 3 * 20) * .31, height * .31, 5),
          new THREE.MeshLambertMaterial({ color: 0xe7f2ed, flatShading: true }));
        cap.position.copy(mountain.position); cap.position.y += height * .345;
        cap.rotation.y = angle;
        group.add(cap);
      }
    }
  }
  function scenery(alpine) {
    for (let i = 0; i < 110; i++) {
      const { p, side, tan } = frameAt(i / 110);
      for (const sign of [-1, 1]) {
        const distance = 16 + i % 5 * 4;
        const x = p.x + side.x * distance * sign, z = p.z + side.z * distance * sign;
        // Stay clear of both the local road and any nearby switchback.
        let clearance = Infinity;
        for (let j = 0; j < 120; j++) { const q = frameAt(j / 120).p; clearance = Math.min(clearance, Math.hypot(x - q.x, z - q.z)); }
        if (clearance < 12 || (!alpine && x < -250)) continue;
        const obj = place(alpine ? (i % 5 ? pine : rock) : (i % 3 ? bush : rock), x, z, Math.atan2(tan.x, tan.z));
        obj.scale.setScalar(alpine ? 1.5 + i % 3 * .4 : .8 + i % 3 * .3);
      }
    }
    if (!alpine) {
      const water = new THREE.Mesh(new THREE.PlaneGeometry(900, 1500, 1, 1), new THREE.MeshPhongMaterial({ color: 0x3a99b5, shininess: 90, specular: 0xffd2a5 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(-725, 0.005, 0);
      group.add(water);
      // Bright surf bands define the coast without covering the road.
      for (let i = 0; i < 3; i++) {
        const surf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1200), new THREE.MeshBasicMaterial({ color: 0xd6e9de, transparent: true, opacity: .35 - i * .07 }));
        surf.rotation.x = -Math.PI / 2; surf.position.set(-279 - i * 5, .012, 0); group.add(surf);
      }
    }
  }
  return [
    { id: 'alpine-pass', name: 'Alpine Pass', tagline: 'Pine forest · Technical switchbacks', fogColor: 0xc9e0e3, fogNear: 180, fogFar: 1050, groundColor: 0x70896e, flatsColor: 0x89948a, skyColor: 0x568cad, sunColor: 0xe7f5ff, sunIntensity: 2.0,
      buildHorizon: () => mountains(true), buildScenery: async () => scenery(true) },
    { id: 'sunset-coast', name: 'Sunset Coast', tagline: 'Ocean horizon · Fast coastal sweepers', fogColor: 0xf3cba8, fogNear: 230, fogFar: 1050, groundColor: 0xc4ae7b, flatsColor: 0xd4bf90, skyColor: 0xa987a9, sunColor: 0xffc28a, sunIntensity: 2.3,
      buildHorizon: () => mountains(false), buildScenery: async () => scenery(false) },
  ].map(track => ({ ...track, buildCurve: () => new THREE.CatmullRomCurve3(EXTRA_ROUTES[track.id].map(([x,z]) => new THREE.Vector3(x,0,z)), true, 'centripetal') }));
}

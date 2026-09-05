// Normalized positions in the vehicle's measured local bounds; +Z is forward.
const PROFILES = {
  'muscle-car-60s-524d46': [{ x: .19, y: .12, z: 0, direction: [0,0,-1] }, { x: .81, y: .12, z: 0, direction: [0,0,-1] }],
  'camper-van-8d10e2': [{ x: .22, y: .10, z: 0, direction: [0,0,-1] }],
  'hatchback-80s-e95554': [{ x: .18, y: .13, z: 0, direction: [0,0,-1] }],
  'pickup-truck-70s-8c0080': [{ x: 1, y: .13, z: .16, direction: [1,0,-.25] }],
};
export function exhaustLayout(id, bounds) {
  return (PROFILES[id] || PROFILES['hatchback-80s-e95554']).map(p => {
    const length = Math.hypot(...p.direction);
    const direction = p.direction.map(v => v / length);
    return {
      x: bounds.min.x + (bounds.max.x - bounds.min.x) * p.x + direction[0] * .10,
      y: bounds.min.y + (bounds.max.y - bounds.min.y) * p.y,
      z: bounds.min.z + (bounds.max.z - bounds.min.z) * p.z + direction[2] * .10,
      direction,
    };
  });
}

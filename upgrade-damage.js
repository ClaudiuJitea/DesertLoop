// Evaluate from pristine mounting coordinates: repairs never accumulate mesh drift.
export function upgradeDamageAt(x, y, z, region, bounds, damage = {}) {
  const clamp = v => Math.max(0, Math.min(1, v || 0));
  const width = bounds.max.x - bounds.min.x;
  const length = bounds.max.z - bounds.min.z;
  const centerX = (bounds.min.x + bounds.max.x) / 2;
  const across = Math.max(-1, Math.min(1, (x - centerX) / (width * .5)));
  const front = region === 'front';
  const longitudinal = clamp(damage[front ? 'frontBumper' : 'rearBumper']);
  const left = clamp(damage.leftDoor) * Math.max(0, -across);
  const right = clamp(damage.rightDoor) * Math.max(0, across);
  const severity = Math.min(1, longitudinal + left + right);
  // A continuous field keeps the wing, its mounts and endplates joined.
  const crease = .65 + .35 * Math.cos(across * 7 + z * 3);
  return {
    x: x + (left - right) * width * .09,
    y: y - severity * width * .065 * crease,
    z: z + (front ? -1 : 1) * severity * length * .055 * crease,
    shade: 1 - severity * (.25 + .5 * Math.pow(Math.sin(x * 43 + y * 31 + z * 19), 8)),
  };
}

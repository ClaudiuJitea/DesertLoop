export const UPGRADE_TYPES = {
  engine: { name: 'Engine', description: '+4% top speed and +8% acceleration per level.', costs: [300, 600, 1000] },
  handling: { name: 'Handling', description: '+6% steering and +10% braking per level.', costs: [250, 500, 850] },
  armor: { name: 'Protection', description: '12% less collision damage per level.', costs: [200, 450, 750] },
};
export const PAINTS = [
  { name: 'Factory', color: null }, { name: 'Ember', color: 0x984b35 },
  { name: 'Glacier', color: 0x4b6a80 }, { name: 'Juniper', color: 0x506c50 },
  { name: 'Saffron', color: 0xad8b49 }, { name: 'Orchid', color: 0x715369 },
];
const KEY = 'desert_loop_career_v1';
const integer = (value, max = 100000000) => Number.isSafeInteger(value) && value >= 0 ? Math.min(value, max) : 0;
export class Career {
  constructor(storage, vehicleIds) {
    this.storage = storage;
    this.vehicleIds = vehicleIds;
    this.awarded = new Set();
    this.saved = Boolean(storage);
    let raw;
    try { raw = JSON.parse(storage?.getItem(KEY) || 'null'); } catch { this.saved = false; }
    if (raw?.version !== 1) raw = null;
    this.state = { version: 1, points: integer(raw?.points), races: integer(raw?.races), wins: integer(raw?.wins), cars: {} };
    for (const id of vehicleIds) {
      const car = raw?.cars?.[id];
      this.state.cars[id] = { engine: integer(car?.engine, 3), handling: integer(car?.handling, 3), armor: integer(car?.armor, 3), paint: integer(car?.paint, PAINTS.length - 1) };
    }
  }
  save() {
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(KEY, JSON.stringify(this.state));
      this.saved = true;
    } catch { this.saved = false; }
  }
  reward(raceId, place) {
    if (this.awarded.has(raceId) || !Number.isInteger(place) || place < 1 || place > 8) return 0;
    this.awarded.add(raceId);
    const points = [900, 600, 450, 350, 300, 250, 200, 150][place - 1];
    this.state.points = integer(this.state.points + points);
    this.state.races++;
    if (place === 1) this.state.wins++;
    this.save();
    return points;
  }
  purchase(id, type) {
    if (!Object.hasOwn(this.state.cars, id) || !Object.hasOwn(UPGRADE_TYPES, type)) return false;
    const car = this.state.cars[id], upgrade = UPGRADE_TYPES[type];
    if (!car || !upgrade || car[type] >= 3) return false;
    const cost = upgrade.costs[car[type]];
    if (this.state.points < cost) return false;
    this.state.points -= cost;
    car[type]++;
    this.save();
    return true;
  }
  paint(id, paint) {
    if (!this.state.cars[id] || !Number.isInteger(paint) || !PAINTS[paint]) return false;
    this.state.cars[id].paint = paint;
    this.save();
    return true;
  }
  tune(base) {
    const car = this.state.cars[base.id] || { engine: 0, handling: 0, armor: 0 };
    return { ...base, maxSpeed: base.maxSpeed * (1 + .04 * car.engine), accel: base.accel * (1 + .08 * car.engine),
      steer: base.steer * (1 + .06 * car.handling), brake: base.brake * (1 + .10 * car.handling), damageFactor: 1 - .12 * car.armor };
  }
}

# Desert Loop

A browser racing game built with [Three.js](https://threejs.org/). Pick a car, tune the radio, and race AI around desert highways and oasis city streets — managing fuel, damage, and nitro along the way.

**Play:** [desert-loop.vercel.app](https://desert-loop.vercel.app)

![Garage screen — choose your car, track, laps, and radio station](images/main.png)

## Screenshots

| Garage & race setup | Desert circuit racing | Collisions & damage |
| --- | --- | --- |
| ![Car selection, track picker, and Desert Radio](images/main.png) | ![Pack racing through an American desert town](images/ingame01.png) | ![Impact feedback with fuel and body damage](images/ingame02.png) |
| Four driveable cars, Desert or City track, 3 or 5 laps, and a live radio equalizer | Chase the pack past diners and mesas; grab repair, fuel, and nitro pickups | Crashes dent the mesh, drain fuel, and cost positions — repair pads help you recover |

## Run locally

Serve the folder over HTTP (module imports need a real origin):

```bash
python3 -m http.server 8765
```

Open [http://localhost:8765](http://localhost:8765).

## Controls

| Key | Action |
| --- | --- |
| `W` / `↑` | Accelerate |
| `S` / `↓` / `Space` | Brake / handbrake / reverse |
| `A` / `←` · `D` / `→` | Steer |
| `N` | Use stored nitro |
| `V` | Switch camera view (Chase / Inside cockpit) |
| `R` | Recover the car (returns you behind the field) |
| `Esc` | Return to garage |
| `P` | Power radio ON / OFF |
| `T` / `]` / `[` | Next / previous radio station |
| Garage, Track & Radio UI | Choose car, track (Desert / City), lap count (3 or 5), and radio station |

Touchscreen devices also show steering, throttle, brake, nitro, recovery, camera, and garage buttons. System reduced-motion preferences disable speed streaks, boost FOV effects, and UI animations.

### Gameplay presentation

The race HUD includes a digital/analog speedometer, elapsed race time, race progress, and a live circuit map (on larger screens). Speed telemetry continues through finish-line parking and resets when stopped or totaled. The 240 km/h dial has headroom above the unchanged 200 km/h boost cap. Lighting preserves the original warm desert palette, with soft shadows centered on the car. Studio reflections apply only to vehicles; the additional circuits use themed skies.

The broadcast HUD adds nearby standings, upcoming corner direction, current/best lap times, lap-complete notifications, and a race report with top speed. Optional standings and timing panels collapse on compact screens to keep the road visible.

Hard braking and oil slides leave fading tire marks and soft tire smoke; boost adds tapered blue-white flames at the actual exhaust outlets. Textured asphalt and alternating curb paint define the circuit. Effects use bounded pools (192 skid segments and 36 tire-smoke sprites, plus the existing exhaust pools) and clear on restart, recovery, or track change. Reduced-motion mode suppresses new smoke, boost flares, and impact flashes.

### Regression checks

```bash
node tests/gameplay.test.cjs
node tests/progression.test.cjs
node tests/vehicle-visuals.test.cjs
node tests/exhaust.test.cjs
node tests/radio.test.cjs
node tests/upgrade-integration.test.cjs
node tests/upgrade-damage.test.cjs
node --check game.js
```

These checks exercise the speedometer and main frame callback with simulated race states; visual rendering and device performance require a browser play-test.

## Tracks

### Desert (1,820 m)

The main circuit — a red-rock canyon highway with Saguaro cacti, sandstone monolith spires, Route 66 diners, ranch barns, and canyon chicanes. Eight AI racers fight for position on boost pads and sweepers.

### City

An oasis valley circuit with buildings, high-speed sweepers, pine groves, and tighter urban corners.

### Alpine Pass (1,679 m)

A technical forest loop with switchbacks, granite peaks, snowcaps, and cool mountain lighting.

### Sunset Coast (1,537 m)

A fast coastal loop with an ocean horizon, surf bands, scrubland, and warm evening light.

### Exhaust & nitro

Visible exhaust tips and both smoke/flame effects share car-specific attachment points: dual rear outlets on the muscle car, one rear outlet on the van and hatchback, and a side exit behind the pickup's rear wheel. Fumes drift from those points in world space, expand, and fade; throttle changes emission density. Nitro produces narrow layered flames, with subtle neutral speed streaks. Flames stop at the finish and on wrecks, and reduced-motion mode suppresses exhaust fumes and flames.

## Career & garage

Open **Garage** from the launch page or **Upgrade car** after a finish. Rewards are 900 / 600 / 450 / 350 / 300 / 250 / 200 / 150 points for places 1–8. Retiring, running out of fuel, or being totaled earns no points. Each race pays out once.

Each car has three levels of engine, handling, and protection upgrades. Engine levels add 4% top speed and 8% acceleration each; handling adds 6% steering and 10% braking each; protection reduces collision damage by 12% per level. Boost remains capped at 200 km/h. Engine level 1 adds a paint-matched splitter; level 2 adds a paint-matched rear wing with supports fitted to the body; level 3 adds matching wing endplates. These parts and the exhaust outlets follow the body suspension. The garage and race car use the same part-building code. Six included paint options and a rotating 3D preview show your build.

Points, upgrades, paint, wins, and finishes save locally on this browser/device. A message appears if browser storage is unavailable. Cars start each new race repaired; upgrades persist. The launch-page speed and handling stats show the selected car's installed upgrades.

Cars use restrained clearcoat paint, dark glass, separate chrome and wheel finishes, and a muted racing palette. The race hub, garage, and HUD share a cream, charcoal, and copper theme. Directional deformation reveals chipped paint and exposed metal; damaged headlights go dark. Collisions also bend and scuff the upgraded splitter, wing, supports, and endplates on the impacted end or side. Partial repairs reduce these dents; full repairs restore the original geometry and chosen paint. Garage previews remain pristine.

## Features

- **Four driveable cars** — Camper Van, Pickup Truck, Muscle Car, and Hatchback, each with different top speed and steering
- **Desert Radio** — selectable stations from `sounds/radio/` (`Neon Night`, `Neon Velocity`, `Radio Off`), live animated equalizer, volume slider, and hotkeys; settings persist in `localStorage`
- **AI pack** — passing, blocking recovery, and lane changes across an 8-car field
- **Fuel & damage** — meters in the HUD; run dry or get totaled and the race ends
- **Pickups** — boost pads on the racing line, plus fuel, repair, and nitro scattered around the circuit
- **Nitro** — charges stored up to three; fire with `N`; pickups collect only on a real car touch
- **Speed streaks** and camera punch while boosting
- **Oil slicks** that make the car slip briefly
- **Procedural effects** — brake lights, exhaust smoke, and impact sparks

### Body damage

Impacts crumple the **car mesh itself** — not sticker overlays. Damage is directional:

- Front hits → bumper, hood, headlights
- Side hits → door panels
- Rear hits → bumper, trunk, brake lights

Severity stacks per panel. Repair pads ease panels back toward their pristine shape. Totaled cars get a short orbit camera around the wreck.

## Debug helpers

With the race running, open the browser console:

```js
__desertLoop.damagePlayer(35, 'front')  // 'front' | 'rear' | 'left' | 'right' | 'all'
__desertLoop.inspectPlayer(Math.PI / 2) // park camera around the player
```

## Stack

- Vanilla JS + Three.js `0.180` (CDN import map)
- GLB vehicle / building previews under `assets/`
- No build step — edit `game.js` / `index.html` and refresh

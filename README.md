# Desert Loop

A browser racing game built with [Three.js](https://threejs.org/). Pick a car, race AI around a desert loop, manage fuel and damage, and try to finish first.

**Play:** [desert-loop.vercel.app](https://desert-loop.vercel.app)

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
| `S` / `↓` | Brake / reverse |
| `A` / `←` · `D` / `→` | Steer |
| `N` | Use stored nitro |
| Garage UI | Choose car and lap count (3 or 5) |

## Features

- Four driveable cars: Camper Van, Pickup Truck, Muscle Car, Hatchback
- AI pack with passing, blocking recovery, and lane changes
- Fuel and damage meters; race ends if you run dry or get totaled
- Boost pads on the racing line, plus fuel, repair, and nitro pickups
- Nitro charges are stored and fired with `N`; pickups collect only on a real car touch
- Speed streaks and camera punch while boosting
- Oil slicks that make the car slip briefly
- Procedural brake lights, exhaust smoke, and impact sparks

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

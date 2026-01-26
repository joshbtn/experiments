# SkiFree VR - Game Architecture Diagram

## Module Dependency Graph

```
                    ┌─────────────────┐
                    │   index.html    │
                    │   (entry point) │
                    └────────┬────────┘
                             │
                    ┌────────┴────────────────────────┐
                    │                                 │
         ┌──────────▼──────────┐        ┌────────────▼──────────┐
         │   physics.js        │        │    config.js          │
         │ (pure physics)      │        │ (all magic numbers)   │
         │                     │        │                       │
         │ - Gravity           │        │ - Physics config      │
         │ - Collision         │        │ - Difficulty presets  │
         │ - Jump mechanics    │        │ - Input sensitivity   │
         │ - Body simulation   │        │ - Graphics settings   │
         └──────────┬──────────┘        └────────────┬──────────┘
                    │                                 │
                    │                                 │
         ┌──────────▼────────────┐                    │
         │    input.js           │                    │
         │ (unified input)       │                    │
         │                       │                    │
         │ - Keyboard (arrows)   │                    │
         │ - VR head tilt        │                    │
         │ - Single API          │                    │
         └──────────┬────────────┘                    │
                    │                                 │
    ┌───────────────┼─────────────────┬──────────────┤
    │               │                 │              │
    │    ┌──────────▼─────────┐  ┌───▼──────────┐  │
    │    │   world.js         │  │ obstacles.js │  │
    │    │ (terrain mgmt)     │  │ (obstacles)  │  │
    │    │                    │  │              │  │
    │    │ - Ground planes    │  │ - Spawning   │  │
    │    │ - Motion lines     │  │ - Trees      │  │
    │    │ - Memory cleanup   │  │ - Ramps      │  │
    │    └────────┬───────────┘  └───┬──────────┘  │
    │             │                  │             │
    └─────────────┼──────────────────┼─────────────┘
                  │                  │
                  └────────┬─────────┘
                           │
                  ┌────────▼──────────┐
                  │    game.js        │
                  │ (orchestrator)    │
                  │                   │
                  │ - Combines all    │
                  │ - Game loop       │
                  │ - State mgmt      │
                  │ - Collision check │
                  └───────────────────┘
```

## Game Loop Flow

```
START

  ↓
┌─────────────────────────────────────────────┐
│ REQUEST ANIMATION FRAME (60 FPS)            │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │ 1. INPUT            │
    │ - Read keyboard     │
    │ - Read VR head      │
    │ - Compute steering  │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ 2. PHYSICS UPDATE   │
    │ - Apply gravity     │
    │ - Apply forces      │
    │ - Update position   │
    │ - Check constraints │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ 3. WORLD UPDATE     │
    │ - Spawn ground      │
    │ - Update motion     │
    │ - Cleanup old obj   │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ 4. OBSTACLE UPDATE  │
    │ - Spawn obstacles   │
    │ - Update positions  │
    │ - Remove distant    │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ 5. COLLISION CHECK  │
    │ - Tree vs player    │
    │ - Ramp vs player    │
    │ - Ground check      │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ 6. RENDER           │
    │ - Update positions  │
    │ - Update rotations  │
    │ - Update visuals    │
    └──────────┬──────────┘
               │
               └──────────────┐
                              │
                     (Repeat 60x/sec)
```

## Data Flow

```
┌──────────────┐
│ PLAYER INPUT │  ← Keyboard / VR Headset
└──────┬───────┘
       │
       ↓
┌─────────────────────┐
│ INPUT.JS            │
│ getSteering()       │  ← Unified input
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ PHYSICS.JS          │
│ applySteering()     │  ← Apply forces
│ update()            │
│ checkCollision()    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ GAME.JS             │
│ Game State          │  ← Position, velocity
│ player {}           │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ A-FRAME SCENE       │
│ Visual Rendering    │  ← Rendered on screen
└─────────────────────┘
```

## State Machine

```
┌─────────┐
│  START  │  
└────┬────┘  
     │ (Click/Gaze)
     ↓
┌──────────────────────────┐
│      PLAYING             │
│ - Distance increases     │
│ - Obstacles spawn        │
│ - Physics applied        │
│ - Collision checked      │
└────────┬─────────────────┘
         │ (Hit tree / Fall off)
         ↓
┌──────────────────────────┐
│     GAMEOVER             │
│ - Distance recorded      │
│ - Best score updated     │
│ - Retry button shown     │
└────────┬─────────────────┘
         │ (Restart)
         ↓
         └──────────────────→ START
```

## Memory Layout

```
┌─────────────────────────────────────────────┐
│         Game Instance (game.js)             │
├─────────────────────────────────────────────┤
│ ├─ player: PhysicsBody                      │
│ │  ├─ position: {x, y}                      │
│ │  ├─ velocity: {x, y}                      │
│ │  └─ mass, radius, onGround                │
│ ├─ physics: PhysicsEngine                   │
│ ├─ input: InputHandler                      │
│ │  └─ keys: {left, right, space}            │
│ ├─ world: WorldManager                      │
│ │  ├─ groundPlanes: []                      │
│ │  └─ motionLines: []                       │
│ ├─ obstacles: ObstacleManager                │
│ │  └─ obstacles: [                          │
│ │      {type: 'tree', x, z, radius},        │
│ │      {type: 'ramp', x, z, width},         │
│ │      ...                                  │
│ │    ]                                      │
│ └─ distance, score, worldZ, state           │
└─────────────────────────────────────────────┘
```

## File Size & Complexity

```
physics.js       ████░░░░░░ 73 lines  (Pure logic)
input.js         ████░░░░░░ 70 lines  (Simple)
world.js         ██████░░░░ 102 lines (Medium)
obstacles.js     ███████░░░ 142 lines (Complex)
game.js          ██████░░░░ 190 lines (Medium-High)
config.js        ███░░░░░░░ 60 lines  (Data)
index.html       ████░░░░░░ 162 lines (Markup)
───────────────────────────────────
TOTAL            ████████░░ ~800 lines

Color: ████ = Highly testable/reusable
       ░░░░ = Tightly coupled/monolithic
```

## Extension Points

```
┌─────────────────────┐
│  New Feature?       │
└──────┬──────────────┘
       │
       ├─ Input handling ───────→ Extend input.js
       │
       ├─ Physics ──────────────→ Extend physics.js
       │
       ├─ Visual effects ───────→ Extend world.js
       │
       ├─ Obstacle types ──────→ Extend obstacles.js
       │
       ├─ Game flow ────────────→ Extend game.js
       │
       ├─ Magic numbers ────────→ Update config.js
       │
       └─ New system ──────────→ Create new module
                                  (powerups, audio, etc.)
```

## Recommended Development Workflow

```
Step 1: Define Feature
   └─→ What does it do?
   └─→ Which module owns it?
   └─→ What data does it need?

Step 2: Update Config
   └─→ Add any new settings
   └─→ Add difficulty presets

Step 3: Implement Core Logic
   └─→ In appropriate module
   └─→ With unit tests

Step 4: Integrate into Game
   └─→ Update game.js
   └─→ Add to game loop if needed

Step 5: Test & Debug
   └─→ Desktop mode
   └─→ VR mode
   └─→ Performance check

Step 6: Optimize
   └─→ Profile with DevTools
   └─→ Optimize hot paths
   └─→ Check memory leaks
```

---

This professional architecture enables rapid iteration while maintaining code quality! 🚀

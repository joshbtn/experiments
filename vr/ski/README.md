# SkiFree VR - Game Architecture

A professional, productionized skiing game built with A-Frame VR and modular JavaScript architecture.

## Project Structure

```
vr/ski/
├── index.html                 # Main entry point
├── js/
│   ├── physics.js            # Physics engine (gravity, collisions, forces)
│   ├── input.js              # Input handler (keyboard + VR controls)
│   ├── world.js              # World manager (terrain, ground planes)
│   ├── obstacles.js          # Obstacle system (trees, ramps)
│   └── game.js               # Main game engine (orchestrator)
├── assets/                   # Game assets (future expansion)
└── README.md                 # This file
```

## Architecture Overview

### Separation of Concerns

Each module has a single responsibility:

- **Physics.js** - Pure physics simulation without rendering
  - Gravity calculations
  - Collision detection
  - Jump mechanics
  - Body state management

- **Input.js** - All input handling
  - Keyboard (arrow keys)
  - VR head tilt
  - Unified input API
  - Input state tracking

- **World.js** - Terrain and visual effects
  - Dynamic ground plane spawning
  - Motion lines for visual feedback
  - World initialization and cleanup

- **Obstacles.js** - Obstacle management
  - Spawning logic with spacing
  - Tree and ramp creation
  - Collision metadata
  - Memory management

- **Game.js** - Main orchestrator
  - Combines all systems
  - Game loop management
  - Collision resolution
  - State management

## Key Features

### Physics System
- Realistic gravity simulation (configurable -0.018)
- Body physics with velocity and position tracking
- Jump mechanics with configurable force
- Ground collision detection

### Input System
- Dual input: keyboard (left/right arrows) + VR head tilt
- Unified steering API
- Configurable sensitivity per input type
- Spacebar for jump (optional keyboard control)

### World Management
- Infinite terrain with dynamic ground plane spawning
- Motion lines for visual speed feedback
- Efficient memory management (cleanup of distant objects)

### Obstacle System
- Intelligent spawning with minimum spacing
- 75% trees, 25% jump ramps distribution
- Obstacle metadata for collision calculation
- Dynamic frequency control

## Game Loop

1. **Input** - Gather keyboard and VR input
2. **Physics Update** - Apply forces and constraints
3. **World Update** - Advance terrain, spawn new ground
4. **Obstacle Update** - Spawn and remove obstacles
5. **Collision Check** - Test player vs obstacles
6. **Render** - Update positions in scene
7. **Repeat** - RequestAnimationFrame

## Configuration

Edit the config in `game.js`:

```javascript
const game = new SkiFreeGame({
  baseSpeed: 0.25,        // Initial downhill speed
  maxSpeed: 0.4,          // Speed cap
  speedAccel: 0.001       // Acceleration over distance
});
```

Physics config in `physics.js`:

```javascript
new PhysicsEngine({
  gravity: -0.018,        // Downhill pull
  groundLevel: 0          // Ground Y position
});
```

## Performance Considerations

- **Dynamic LOD**: Only processes active obstacles
- **Memory Pooling**: Cleans up distant ground planes
- **Efficient Rendering**: Uses A-Frame for optimized WebGL
- **Minimal DOM**: Sparse DOM updates, mostly attribute changes

## Future Enhancements

- [ ] Cannon.js physics engine integration
- [ ] Advanced collision shapes (AABB, spheres)
- [ ] Multiplayer support
- [ ] Sound effects and music
- [ ] Particle effects for jumps
- [ ] Power-ups and scoring systems
- [ ] Leaderboards
- [ ] Mobile touch controls
- [ ] Customizable player skins

## Browser Support

- Chrome/Edge (VR support)
- Firefox (Desktop + VR)
- Safari (Desktop)
- Mobile VR (Cardboard, Daydream, etc.)

## Controls

### Desktop
- **Left/Right Arrows** - Steer
- **Spacebar** - Jump (optional)
- **Mouse Click** - Start game

### VR
- **Head Tilt Left/Right** - Steer
- **Gaze + Fuse** - Start game
- **Head Position** - Jump trigger (collision with ramp)

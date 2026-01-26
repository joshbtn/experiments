# SkiFree VR - Development Guide

## Quick Start

### Running Locally

```bash
# Start a local server
python -m http.server 8000

# Open in browser
http://localhost:8000/vr/ski/index.html
```

### Testing

**Desktop Mode:**
1. Click "START SKIING" button
2. Use arrow keys to steer
3. Avoid trees, hit rainbows to jump

**VR Mode:**
1. Put on headset
2. Look at red box until fuse completes (2 seconds)
3. Tilt head left/right to steer
4. Collide with rainbow ramps to jump

## Code Organization

### Module Loading Order
Files load in dependency order:
1. `physics.js` - Base physics engine
2. `input.js` - Input handling (no dependencies)
3. `world.js` - World management (no dependencies)
4. `obstacles.js` - Obstacle system (no dependencies)
5. `game.js` - Main game (depends on all above)

### Adding New Features

#### Adding a New Obstacle Type

1. **Add spawn method in `obstacles.js`:**
```javascript
spawnRock(x, z) {
  const rock = document.createElement('a-entity');
  rock.setAttribute('position', `${x} 0 ${z}`);
  rock.setAttribute('geometry', 'primitive: sphere; radius: 0.5');
  rock.setAttribute('color', '#888888');
  // ... add to obstacles array
}
```

2. **Add spawn call in `spawn()` method:**
```javascript
if (rng < 0.5) {
  this.spawnTree(x, z);
} else if (rng < 0.75) {
  this.spawnRock(x, z);
} else {
  this.spawnJumpRamp(x, z);
}
```

3. **Add collision handler in `game.js`:**
```javascript
checkRockCollision(rock) {
  const dx = Math.abs(this.player.position.x - rock.x);
  if (dx < 0.6 && this.player.position.y < 0.5) {
    this.gameOver('HIT A ROCK!');
  }
}
```

#### Adding Power-ups

1. **Create power-up class in new file `powerups.js`**:
```javascript
class PowerUpManager {
  constructor() {
    this.active = [];
  }
  
  spawnSpeedBoost(x, z) {
    // Create visual, add to active
  }
  
  checkCollisions(player) {
    // Check player overlap with powerups
  }
}
```

2. **Integrate into `game.js`**:
```javascript
this.powerups = new PowerUpManager();
// In update loop: this.powerups.checkCollisions(this.player);
```

#### Tuning Physics

Edit `game.js` constructor:
```javascript
new SkiFreeGame({
  baseSpeed: 0.25,      // Start slower/faster
  maxSpeed: 0.5,        // Higher max for difficulty
  speedAccel: 0.002     // Accelerate faster
});
```

Edit `physics.js`:
```javascript
new PhysicsEngine({
  gravity: -0.025       // Stronger gravity = stick to ground
});
```

## Performance Tips

### Optimization Checklist

- [ ] Use `.filter()` instead of `.forEach()` when removing items
- [ ] Cache DOM queries: `const world = document.getElementById('world')`
- [ ] Batch attribute updates when possible
- [ ] Remove DOM elements immediately (don't queue)
- [ ] Use object pooling for frequently created objects

### Debugging

**Enable console logging:**
```javascript
// In game.js gameLoop()
if (distance % 50 === 0) {
  console.log(`Distance: ${distance}, Obstacles: ${this.obstacles.obstacles.length}`);
}
```

**Check memory leaks:**
1. Open DevTools
2. Performance tab
3. Record 30 seconds of gameplay
4. Look for memory growth (ground planes, obstacles)

**Verify collision boxes:**
```javascript
// Add visual collision debugging
obs.setAttribute('wireframe', 'true');
obs.setAttribute('opacity', '0.3');
```

## Testing Checklist

- [ ] Desktop mode: Keyboard steering works smoothly
- [ ] Desktop mode: Jumps trigger on rainbows
- [ ] Desktop mode: Crashes on trees
- [ ] VR mode: Head tilt steering works
- [ ] VR mode: Gaze-to-start works (2 second fuse)
- [ ] Memory: No memory leaks after 5 minute play
- [ ] Performance: 60 FPS maintained on target hardware
- [ ] Edge cases: Can go arbitrarily left/right
- [ ] Edge cases: Speed increases over time
- [ ] Edge cases: Game restarts properly

## Common Issues

### Problem: Player flying into sky
**Solution:** Check `spawnGroundPlane()` in `world.js` is being called every frame
```javascript
// In game.js update():
this.world.updateGroundPlanes(this.worldZ);
```

### Problem: No collisions detected
**Solution:** Verify collision detection window and player position
```javascript
console.log(`Player Y: ${this.player.position.y}, Ground: 0`);
console.log(`Tree at (${tree.x}, ${tree.z}), Player at (${this.player.position.x}, -)`);
```

### Problem: Game stuttering
**Solution:** Check obstacle count
```javascript
console.log(`Active obstacles: ${this.obstacles.obstacles.length}`);
```
If > 100, increase spawn interval in `obstacles.js`

### Problem: Jumps not working
**Solution:** Check ramp collision zone
```javascript
// In game.js checkRampCollision():
if (dx < rampWidth / 2 + playerRadius && this.player.position.y < 0.2) {
  console.log('RAMP HIT!');
  this.physics.applyJump(this.player, 0.42);
}
```

## Next Steps

1. **Add Sound** - Use Howler.js or Web Audio API
2. **Add Particles** - Jump effects using A-Frame particle system
3. **Leaderboards** - Firebase integration
4. **Mobile** - Touch controls for mobile VR
5. **Advanced Physics** - Cannon.js for complex collisions
6. **Level System** - Different ski courses
7. **Multiplayer** - WebSocket-based concurrent play

## Resources

- [A-Frame Documentation](https://aframe.io/docs/)
- [WebXR API](https://immersive-web.github.io/)
- [Cannon.js Physics](https://www.cannonjs.org/)
- [Three.js Reference](https://threejs.org/docs/)

## Performance Targets

- **FPS**: 60 minimum on desktop, 72 on VR
- **Memory**: < 100MB after 10 minutes
- **Input Latency**: < 50ms
- **Load Time**: < 2 seconds

---

Happy coding! 🎿

# SkiFree VR - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# Run it
python -m http.server 8000

# Open
http://localhost:8000/vr/ski/index.html

# Play
Desktop: Click button, press arrow keys
VR: Gaze at red box, tilt head, hit rainbows
```

## 📂 File Quick Reference

| File | What It Does | When to Edit |
|------|-------------|--------------|
| `index.html` | Scene setup | Never (use modules) |
| `config.js` | All settings | Want to tune game |
| `physics.js` | Gravity, collisions | Modify physics feel |
| `input.js` | Keyboard + VR | Add new input types |
| `world.js` | Terrain, visuals | Change world look |
| `obstacles.js` | Spawn trees/ramps | Add new obstacles |
| `game.js` | Game loop, state | Add game features |

## ⚙️ Common Tweaks

### Make Easier
```javascript
// config.js
baseSpeed: 0.15,        // Was 0.25
spawnInterval: 12,      // Was 8
minSpacing: 20          // Was 15
```

### Make Harder
```javascript
// config.js
baseSpeed: 0.35,        // Was 0.25
gravity: -0.022,        // Was -0.018
spawnInterval: 5        // Was 8
```

### Change Speed
```javascript
// config.js
baseSpeed: X,           // Starting speed
maxSpeed: Y,            // Top speed
speedAcceleration: Z    // How fast it increases
```

### Change Jump
```javascript
// config.js
jumpForce: 0.5          // Higher = bigger jump
```

### Change Steering
```javascript
// config.js
keyboardSteering: 0.20  // Faster turning
vrHeadTilt: 0.01        // More sensitive
```

## 🎮 Adding a New Obstacle Type

### Step 1: Add spawn function (`obstacles.js`)
```javascript
spawnRock(x, z) {
  const rock = document.createElement('a-entity');
  rock.setAttribute('position', `${x} 0 ${z}`);
  rock.setAttribute('geometry', 'primitive: sphere; radius: 0.4');
  rock.setAttribute('color', '#777777');
  // ... add to world and obstacles array
}
```

### Step 2: Update spawn chance (`obstacles.js`)
```javascript
if (rng < 0.5) {
  this.spawnTree(x, z);
} else if (rng < 0.75) {
  this.spawnRock(x, z);    // New line
} else {
  this.spawnJumpRamp(x, z);
}
```

### Step 3: Add collision handler (`game.js`)
```javascript
checkRockCollision(rock) {
  const dx = Math.abs(this.player.position.x - rock.x);
  if (dx < 0.7 && this.player.position.y < 0.5) {
    this.gameOver('HIT A ROCK!');
  }
}
```

### Step 4: Call in collision check
```javascript
// In game.js checkCollisions()
obstacles.forEach(obs => {
  if (obs.type === 'rock') this.checkRockCollision(obs);
});
```

## 🐛 Debug Checklist

```
☐ Player in sky?
  → Check spawnGroundPlane() is being called
  → Check physics.js gravity value

☐ No collisions?
  → Check collision zones in game.js
  → Check player height (playerY < threshold)
  → Add console.log in collision code

☐ Jumps not working?
  → Check ramp detection zone
  → Check jump velocity value
  → Add console.log("JUMP!") debug

☐ FPS dropping?
  → Check obstacle count (console.log)
  → Profile with DevTools
  → Check ground plane cleanup

☐ Memory growing?
  → Check cleanup in world.js
  → Check cleanup in obstacles.js
  → Look for DOM elements not removed
```

## 📊 Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| FPS | 60 | Check DevTools Performance |
| Memory | < 100MB | Check after 10 min play |
| Input lag | < 50ms | Test with input |
| Load time | < 2s | Check Network tab |

## 🔍 Common Issues

### "Ground keeps disappearing"
```javascript
// In game.js gameLoop(), add:
this.world.updateGroundPlanes(this.worldZ);
```

### "Can't collect jumps"
```javascript
// In obstacles.js, increase trigger zone:
if (Math.abs(rPos.x - playerX) < rampWidth / 2 + 1) {
```

### "Crashes immediately"
```javascript
// Check start position isn't in obstacle
// In game.js startGame():
this.player.position.x = 0;  // Clear center
this.player.position.y = 0;  // On ground
```

### "Game runs slowly"
```javascript
// In config.js, reduce object count:
spawnInterval: 12,      // Spawn less frequently
maxObstaclesActive: 100 // Hard limit
```

## 🧪 Testing Your Changes

```javascript
// Test physics in console
const physics = new PhysicsEngine();
const body = physics.createPlayerBody();
physics.update(body);
console.log(body.position.y);  // Should be 0

// Test input
const input = new InputHandler();
input.keys.left = true;
console.log(input.getSteering());  // Should be < 0

// Test obstacle spawning
const obs = new ObstacleManager();
obs.spawn(0);
console.log(obs.obstacles.length);  // Should be > 0
```

## 📝 Code Style

```javascript
// Use clear names
const playerHeight = 0.3;  // Good
const ph = 0.3;            // Bad

// Use constants for magic numbers
const GRAVITY = -0.018;
const playerY = 0 + (GRAVITY * deltaTime);

// Add comments for why, not what
// When player lands, reset velocity to prevent bouncing
if (body.position.y <= 0) {
  body.velocity.y = 0;
}

// Avoid nested callbacks
input.getSteering()        // Good
  .then(updatePosition)
  .then(renderScene);

// Good variable names prevent bugs
const distanceToObstacle = Math.abs(playerX - obstacleX);
if (distanceToObstacle < COLLISION_DISTANCE) {
  // crash
}
```

## 🚀 Deployment Checklist

Before sharing/publishing:
- [ ] Test on VR headset
- [ ] Test on mobile
- [ ] Check FPS on target device
- [ ] Verify memory stable at 100MB
- [ ] Test with slow internet (simulate in DevTools)
- [ ] Check all controls work
- [ ] Verify collision feel good
- [ ] Record gameplay video
- [ ] Get user feedback

## 🎯 High-Impact Changes (Highest ROI)

1. **Adjust base speed** (1 min)
   - Changes game feel entirely

2. **Adjust spawn interval** (1 min)
   - Changes difficulty significantly

3. **Add sound** (1-2 hours)
   - Massively increases enjoyment

4. **Add leaderboard** (2-3 hours)
   - Increases replayability

5. **Add mobile controls** (2-3 hours)
   - Expands audience

## 📚 Key Files to Read First

1. **For overview**: PROJECT_SUMMARY.md
2. **For dev**: DEVELOPMENT.md
3. **For architecture**: ARCHITECTURE.md
4. **For tweaking**: config.js
5. **For modifying**: game.js

## 🔗 Important Lines of Code

```javascript
// gravity (physics.js line 12)
this.gravity = config.gravity || -0.018;

// steering input (input.js line 46)
return steering;

// game loop (game.js line 184)
requestAnimationFrame(this.gameLoop);

// collision check (game.js line 237)
this.checkCollisions();

// obstacle spawn (game.js line 152)
this.obstacles.update(this.distance, this.worldZ);
```

## 💡 Pro Tips

1. **Use DevTools consistently**
   - Console for logs
   - Performance for FPS
   - Memory for leaks

2. **Change one thing at a time**
   - Makes it easy to revert
   - Easier to debug

3. **Save before big changes**
   - Use version control if possible
   - Comment out old code, don't delete

4. **Test on actual hardware**
   - Desktop, mobile, VR
   - Performance different on each

5. **Ask for user feedback**
   - What feels fun?
   - What's frustrating?
   - What's easy/hard?

---

**Print this card and post it next to your monitor!** 📌

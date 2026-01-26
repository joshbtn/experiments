/**
 * Main Game Engine
 * Orchestrates all systems: physics, input, rendering, collision
 */

class SkiFreeGame {
  constructor(config = {}) {
    this.config = {
      baseSpeed: 0.25,
      maxSpeed: 0.4,
      speedAccel: 0.001,
      ...config
    };

    // Game state
    this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER
    this.distance = 0;
    this.score = 0;
    this.bestScore = localStorage.getItem('skifree_best') || 0;
    this.messageFadeTimeout = null;

    // Systems
    this.physics = new PhysicsEngine();
    this.input = new InputHandler();
    this.world = new WorldManager();
    this.obstacles = new ObstacleManager();

    // Player body
    this.player = this.physics.createPlayerBody();

    // UI elements
    this.ui = {
      distance: document.getElementById('distance'),
      message: document.getElementById('msg'),
      startButton: document.getElementById('desktop-start-button'),
      startBox: document.getElementById('start-box'),
      startNode: document.getElementById('start-node'),
      camera: document.getElementById('camera'),
      playerContainer: document.getElementById('player-container'),
      world: document.getElementById('world')
    };

    this.setupUI();
    this.startAnimationLoop();
  }

  /**
   * Setup UI event listeners
   */
  setupUI() {
    // VR gaze start
    this.ui.startBox.addEventListener('click', () => this.start());

    // Desktop click start
    this.ui.startButton.addEventListener('click', () => this.start());

    // Set camera for input system
    this.input.setCamera(this.ui.camera);
  }

  /**
   * Start the game
   */
  start() {
    if (this.state === 'PLAYING') return;

    this.state = 'PLAYING';
    this.distance = 0;
    this.player = this.physics.createPlayerBody();

    // Reset systems
    this.world.reset();
    this.obstacles.reset();

    // Update UI
    this.ui.startNode.setAttribute('visible', 'false');
    this.ui.startButton.style.display = 'none';
    this.ui.message.innerText = 'LOOK TO STEER | SPACE TO PAUSE';
    this.ui.message.style.opacity = '1';
    this.ui.message.style.transition = 'opacity 0.6s ease';
    if (this.messageFadeTimeout) {
      clearTimeout(this.messageFadeTimeout);
    }
    this.messageFadeTimeout = setTimeout(() => {
      this.ui.message.style.opacity = '0';
    }, 10000);

    // Clear world position
    this.ui.world.setAttribute('position', '0 0 0');
  }

  /**
   * Main game loop
   */
  gameLoop = () => {
    // Handle pause toggle
    if (this.input.shouldPause() && this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.message.innerText = 'PAUSED - PRESS SPACE TO RESUME';
      this.ui.message.style.opacity = '1';
      this.input.resetPause();
    } else if (this.input.shouldPause() && this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.message.innerText = '';
      this.ui.message.style.opacity = '0';
      this.input.resetPause();
    }

    if (this.state === 'PLAYING') {
      this.update();
      this.render();
      this.checkCollisions();
    }

    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Update game logic
   */
  update() {
    // Get steering + heading slowdown from head yaw
    const { steering, forwardFactor } = this.input.getSteeringAndHeading();

    // Increase speed over time, then scale by heading factor
    const rawSpeed = Math.min(
      this.config.baseSpeed + (this.distance * this.config.speedAccel),
      this.config.maxSpeed
    );
    const speed = rawSpeed * forwardFactor;

    // Advance distance with heading-adjusted speed
    this.distance += speed;

    // Apply physics
    this.physics.applySteering(this.player, steering);
    this.physics.update(this.player, 1);

    // Update systems (obstacles move toward player)
    this.world.updateMotionLines(speed * forwardFactor);
    this.obstacles.update(this.distance, speed * forwardFactor, this.player.position.x);

    // Update UI
    this.ui.distance.innerText = `Distance: ${Math.floor(this.distance)}m`;
  }

  /**
   * Render player and world positions
   */
  render() {
    // Update player position (stays at origin in z, moves in x/y only)
    this.ui.playerContainer.setAttribute(
      'position',
      `${this.player.position.x} ${this.player.position.y} 0`
    );

    // Update player collision sphere position for debugging
    const playerCollisionSphere = document.getElementById('player-collision');
    if (playerCollisionSphere) {
      playerCollisionSphere.setAttribute('position', `0 ${this.player.position.y} 0`);
    }

    // World container stays centered - obstacles move relative to player
    this.ui.world.setAttribute('position', {
      x: -this.player.position.x,
      y: 0,
      z: 0
    });
  }

  /**
   * Check collisions with obstacles
   */
  checkCollisions() {
    const obstacles = this.obstacles.getObstacles();
    
    if (obstacles.length === 0) {
      console.log('[CHECK] No obstacles to check');
      return;
    }
    
    console.log(`[CHECK] Checking ${obstacles.length} obstacles, player at (${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, 0)`);

    obstacles.forEach(obs => {
      if (obs.type === 'tree') {
        this.checkTreeCollision(obs);
      } else if (obs.type === 'jump-ramp') {
        this.checkRampCollision(obs);
      }
    });
  }

  /**
   * Check collision with tree using AABB (axis-aligned bounding box)
   * All positions are in camera-relative space
   */
  checkTreeCollision(tree) {
    const playerRadius = 0.3;
    
    // Camera (player) is always at visual x=0, tree is at tree.x - player.position.x visually
    const treeVisualX = tree.x - this.player.position.x;
    const treeVisualY = 0; // Tree base at ground level
    
    // Debug: log the offset calculation
    console.log(`[TREE_CHECK] Tree world x=${tree.x.toFixed(1)}, Player world x=${this.player.position.x.toFixed(1)} -> Visual x=${treeVisualX.toFixed(1)}`);
    
    // AABB Check
    const overlapX = Math.abs(0 - treeVisualX) < (tree.halfWidth + playerRadius);
    const overlapY = Math.abs(this.player.position.y - treeVisualY) < (tree.halfHeight + playerRadius);
    const overlapZ = Math.abs(tree.z) < (tree.halfDepth + playerRadius + 1.0);

    if (overlapX || overlapY || overlapZ) {
      console.log(`[COLLISION_TREE] x: ${overlapX} (${Math.abs(0-treeVisualX).toFixed(2)} < ${(tree.halfWidth + playerRadius).toFixed(2)}), y: ${overlapY} (${Math.abs(this.player.position.y - treeVisualY).toFixed(2)} < ${(tree.halfHeight + playerRadius).toFixed(2)}), z: ${overlapZ} (${Math.abs(tree.z).toFixed(2)} < ${(tree.halfDepth + playerRadius + 1.0).toFixed(2)})`);
    }

    // Simple distance-based sphere collision as fallback
    const distToTree = Math.hypot(
      treeVisualX,
      this.player.position.y - treeVisualY,
      tree.z
    );
    const collisionDistance = tree.halfWidth + playerRadius + 0.5; // Add margin
    
    if (distToTree < collisionDistance) {
      console.log(`[SPHERE_COLLISION_TREE] Distance: ${distToTree.toFixed(2)} < ${collisionDistance.toFixed(2)}`);
    }

    if ((overlapX && overlapY && overlapZ) || distToTree < collisionDistance) {
      console.log(`[CRASH] Tree collision triggered!`);
      this.gameOver('CRASHED INTO TREE!');
    }
  }

  /**
   * Check collision with jump ramp using AABB
   * All positions are in camera-relative space
   */
  checkRampCollision(ramp) {
    const playerRadius = 0.3;
    
    // Camera (player) is always at visual x=0, ramp is at ramp.x - player.position.x visually
    const rampVisualX = ramp.x - this.player.position.x;
    const rampVisualY = 0; // Ramp base at ground level
    
    // AABB Check
    const overlapX = Math.abs(0 - rampVisualX) < (ramp.halfWidth + playerRadius);
    const overlapY = Math.abs(this.player.position.y - rampVisualY) < (ramp.halfHeight + playerRadius + 0.1);
    const overlapZ = Math.abs(ramp.z) < (ramp.halfDepth + playerRadius + 1.0);

    if (overlapX || overlapY || overlapZ) {
      console.log(`[COLLISION_RAMP] x: ${overlapX} (${Math.abs(0-rampVisualX).toFixed(2)} < ${(ramp.halfWidth + playerRadius).toFixed(2)}), y: ${overlapY} (${Math.abs(this.player.position.y - rampVisualY).toFixed(2)} < ${(ramp.halfHeight + playerRadius + 0.1).toFixed(2)}), z: ${overlapZ} (${Math.abs(ramp.z).toFixed(2)} < ${(ramp.halfDepth + playerRadius + 1.0).toFixed(2)})`);
    }

    // Simple distance-based sphere collision as fallback
    const distToRamp = Math.hypot(
      rampVisualX,
      this.player.position.y - rampVisualY,
      ramp.z
    );
    const collisionDistance = ramp.halfWidth + playerRadius + 0.5;
    
    if (distToRamp < collisionDistance) {
      console.log(`[SPHERE_COLLISION_RAMP] Distance: ${distToRamp.toFixed(2)} < ${collisionDistance.toFixed(2)}`);
    }

    // Trigger jump only when roughly on ground level
    if ((overlapX && overlapY && overlapZ || distToRamp < collisionDistance) && this.player.position.y < 0.3) {
      console.log(`[JUMP] Ramp collision triggered!`);
      this.physics.applyJump(this.player, 0.42);
      console.log('JUMP!');
    }
  }

  /**
   * End game
   */
  gameOver(reason) {
    this.state = 'GAMEOVER';
    this.score = Math.floor(this.distance);

    // Update best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('skifree_best', this.bestScore);
    }

    // Show game over UI
    this.ui.message.innerHTML = `
      <span style="color:red; font-size:18px">${reason}</span><br>
      Distance: ${this.score}m | Best: ${this.bestScore}m<br>
      <span style="font-size:14px">CLICK TO RETRY</span>
    `;
    this.ui.message.style.opacity = '1';
    if (this.messageFadeTimeout) {
      clearTimeout(this.messageFadeTimeout);
    }

    this.ui.startNode.setAttribute('visible', 'true');
    this.ui.startButton.style.display = 'block';
    this.ui.startNode.setAttribute('position', `${this.player.position.x} 0.5 -4`);
  }

  /**
   * Start the animation loop
   */
  startAnimationLoop() {
    requestAnimationFrame(this.gameLoop);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.game = new SkiFreeGame();
  });
} else {
  window.game = new SkiFreeGame();
}

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
    this.obstacles.update(this.distance, speed * forwardFactor);

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

    // World container stays centered - obstacles move relative to player
    this.ui.world.setAttribute('position', {
      x: -this.player.position.x,
      y: 0,
      z: 0
    });
  }

  /**
   * Check collisions using swept-sphere collision detection
   * Professional approach: checks if obstacle crossed the player plane between frames
   */
  checkCollisions() {
    const obstacles = this.obstacles.getObstacles();
    const playerX = this.player.position.x;
    const playerY = this.player.position.y;
    const playerRadius = 0.6;
    
    obstacles.forEach(obs => {
      // Track previous Z position for swept collision detection
      const currentZ = obs.z;
      const previousZ = obs.previousZ !== undefined ? obs.previousZ : currentZ;
      
      // Swept collision: check if obstacle crossed the player plane (z=0) this frame
      const crossedPlane = (previousZ < 0 && currentZ >= 0) || 
                          (previousZ >= 0 && currentZ < 0) ||
                          Math.abs(currentZ) < 3.0; // Within collision zone
      
      if (!crossedPlane) {
        obs.previousZ = currentZ;
        return; // Not in collision range yet
      }
      
      // CRITICAL FIX: Obstacles are inside world container which is offset by -player.x
      // Visual obstacle position = world.position.x + obs.x = -player.x + obs.x
      // Player visual position = player.position.x
      // So visual distance is: player.x - (-player.x + obs.x) = 2*player.x - obs.x
      // But simpler: since world is offset, obstacle visual X = obs.x - player.x in camera space
      // Actually, let's just check the VISUAL positions:
      const obstacleVisualX = -playerX + obs.x; // world offset + obs position
      const playerVisualX = playerX;
      
      const dx = playerVisualX - obstacleVisualX; // Both in same visual space now
      const dy = playerY - 0;
      const lateralDistance = Math.sqrt(dx * dx + dy * dy);
      
      console.log(`[COLLISION CHECK] Visual: Obs(${obstacleVisualX.toFixed(1)}) vs Player(${playerVisualX.toFixed(1)}) = dist ${lateralDistance.toFixed(2)}`);
      
      if (obs.type === 'tree') {
        const treeRadius = 0.8;
        if (lateralDistance < (playerRadius + treeRadius)) {
          console.log(`[HIT] Tree! Distance: ${lateralDistance.toFixed(2)} < ${(playerRadius + treeRadius).toFixed(2)}`);
          this.gameOver('CRASHED INTO TREE!');
        }
      } else if (obs.type === 'jump-ramp') {
        const rampRadius = 3.5;
        if (lateralDistance < (playerRadius + rampRadius) && playerY < 0.3) {
          console.log(`[JUMP] Ramp! Distance: ${lateralDistance.toFixed(2)}`);
          this.physics.applyJump(this.player, 0.42);
        }
      }
      
      obs.previousZ = currentZ;
    });
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

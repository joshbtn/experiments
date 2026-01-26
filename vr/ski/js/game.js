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
    this.state = 'START'; // START, PLAYING, GAMEOVER
    this.distance = 0;
    this.score = 0;
    this.bestScore = localStorage.getItem('skifree_best') || 0;

    // Systems
    this.physics = new PhysicsEngine();
    this.input = new InputHandler();
    this.world = new WorldManager();
    this.obstacles = new ObstacleManager();

    // Player body
    this.player = this.physics.createPlayerBody();

    // World position
    this.worldZ = 0;

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
    this.worldZ = 0;

    // Reset systems
    this.world.reset();
    this.obstacles.reset();

    // Update UI
    this.ui.startNode.setAttribute('visible', 'false');
    this.ui.startButton.style.display = 'none';
    this.ui.message.innerText = 'ARROW KEYS / HEAD TILT TO STEER | SPACEBAR TO JUMP';

    // Clear world position
    this.ui.world.setAttribute('position', '0 0 0');
  }

  /**
   * Main game loop
   */
  gameLoop = () => {
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
    // Increase speed over time
    const speed = Math.min(
      this.config.baseSpeed + (this.distance * this.config.speedAccel),
      this.config.maxSpeed
    );

    // Advance distance
    this.distance += speed;

    // Get input
    const steering = this.input.getSteering();

    // Apply physics
    this.physics.applySteering(this.player, steering);
    this.physics.update(this.player, 1);

    // Handle jump input
    if (this.input.shouldJump()) {
      this.physics.applyJump(this.player, 0.42);
      this.input.resetJump();
    }

    // Advance world
    this.worldZ += speed;

    // Update systems
    this.world.updateMotionLines(speed);
    this.world.updateGroundPlanes(this.worldZ);
    this.obstacles.update(this.distance, this.worldZ);

    // Update UI
    this.ui.distance.innerText = `Distance: ${Math.floor(this.distance)}m`;
  }

  /**
   * Render player and world positions
   */
  render() {
    // Update player position
    this.ui.playerContainer.setAttribute(
      'position',
      `${this.player.position.x} ${this.player.position.y} 0`
    );

    // Update world offset
    const wPos = this.ui.world.getAttribute('position');
    this.ui.world.setAttribute('position', {
      x: -this.player.position.x,
      y: 0,
      z: wPos.z + (this.worldZ - this.distance)
    });
  }

  /**
   * Check collisions with obstacles
   */
  checkCollisions() {
    const obstacles = this.obstacles.getObstacles();

    obstacles.forEach(obs => {
      if (obs.type === 'tree') {
        this.checkTreeCollision(obs);
      } else if (obs.type === 'jump-ramp') {
        this.checkRampCollision(obs);
      }
    });
  }

  /**
   * Check collision with tree
   */
  checkTreeCollision(tree) {
    const dx = Math.abs(this.player.position.x - tree.x);
    const treeRadius = 0.8;
    const playerRadius = 0.3;

    if (dx < treeRadius + playerRadius && this.player.position.y < 0.5) {
      this.gameOver('CRASHED INTO TREE!');
    }
  }

  /**
   * Check collision with jump ramp
   */
  checkRampCollision(ramp) {
    const dx = Math.abs(this.player.position.x - ramp.x);
    const rampWidth = 6;
    const playerRadius = 0.3;

    // Simple jump trigger
    if (dx < rampWidth / 2 + playerRadius && this.player.position.y < 0.2) {
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

/**
 * Obstacle Manager
 * Handles spawning, updating, and removing obstacles
 */

class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.lastSpawnDistance = 0;
    this.spawnInterval = 6; // spawn more often in player-relative space
    this.minSpacing = 15;
  }

  /**
   * Spawn obstacles based on distance and move them toward player
   */
  update(distance, speed, playerX = 0) {
    if (distance - this.lastSpawnDistance > this.spawnInterval) {
      this.spawn();
      this.lastSpawnDistance = distance;
    }

    // Move all obstacles toward player (player is at z=0)
    this.obstacles.forEach(obs => {
      obs.z += speed;
      // Position relative to player camera (player is at 0, obstacles are offset by playerX)
      const visualX = obs.x - playerX;
      obs.element.setAttribute('position', `${visualX} 0 ${obs.z}`);
    });

    // Update and clean obstacles
    this.updateObstacles();
    
    // Debug log current obstacles
    if (this.obstacles.length > 0) {
      console.log(`[UPDATE] ${this.obstacles.length} obstacles: ${this.obstacles.map(o => `${o.type}(${o.x.toFixed(1)},${o.z.toFixed(1)})`).join(', ')}`);
    }
  }

  /**
   * Spawn a new random obstacle
   */
  spawn() {
    // Spawn much closer in front of player for timely collision detection
    const potentialZ = -30 - Math.random() * 20; // Spawn between z=-30 to z=-50 (much closer)

    // Check spacing against existing obstacles
    const tooClose = this.obstacles.some(obs => Math.abs(obs.z - potentialZ) < this.minSpacing);
    if (tooClose) return;

    const x = (Math.random() - 0.5) * 50;
    const z = potentialZ;

    const rng = Math.random();
    if (rng < 0.75) {
      this.spawnTree(x, z);
    } else {
      this.spawnJumpRamp(x, z);
    }
    console.log(`[SPAWN] Obstacle at (${x.toFixed(1)}, ${z.toFixed(1)}), total: ${this.obstacles.length + 1}`);
  }

  /**
   * Spawn a tree obstacle
   */
  spawnTree(x, z) {
    const world = document.getElementById('world');
    if (!world) return;

    const tree = document.createElement('a-entity');
    tree.setAttribute('position', `${x} 0 ${z}`);
    tree.classList.add('obstacle');
    tree.setAttribute('data-type', 'tree');
    tree.setAttribute('data-radius', '0.8');

    // Trunk
    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('radius', '0.15');
    trunk.setAttribute('height', '0.6');
    trunk.setAttribute('color', '#4b3621');
    tree.appendChild(trunk);

    // Leaves
    const leaves = document.createElement('a-cone');
    leaves.setAttribute('radius-bottom', '0.8');
    leaves.setAttribute('height', '2.5');
    leaves.setAttribute('position', '0 1.2 0');
    leaves.setAttribute('color', '#1b4d3e');
    tree.appendChild(leaves);

    // Collision box (transparent debug visual)
    const collisionBox = document.createElement('a-box');
    collisionBox.setAttribute('width', '1.0');   // halfWidth * 2
    collisionBox.setAttribute('height', '2.5');  // halfHeight * 2
    collisionBox.setAttribute('depth', '1.0');   // halfDepth * 2
    collisionBox.setAttribute('color', '#ff0000');
    collisionBox.setAttribute('opacity', '0.2');
    tree.appendChild(collisionBox);

    tree.setAttribute('static-body', '');
    world.appendChild(tree);
    // Collision box: tree is ~0.8 wide, ~2.5 tall (leaves at 1.2 offset)
    this.obstacles.push({
      element: tree,
      type: 'tree',
      x, z,
      // Half-extents of collision box (width/2, height/2, depth/2)
      halfWidth: 0.5,   // X extent
      halfHeight: 1.25, // Y extent (half of 2.5 height)
      halfDepth: 0.5    // Z extent
    });
  }

  /**
   * Spawn a jump ramp
   */
  spawnJumpRamp(x, z) {
    const world = document.getElementById('world');
    if (!world) return;

    const ramp = document.createElement('a-entity');
    ramp.setAttribute('position', `${x} 0 ${z}`);
    ramp.classList.add('jump-ramp');
    ramp.setAttribute('data-type', 'jump-ramp');
    ramp.setAttribute('data-width', '6');

    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff'];
    colors.forEach((color, i) => {
      const strip = document.createElement('a-box');
      strip.setAttribute('width', '6');
      strip.setAttribute('height', '0.2');
      strip.setAttribute('depth', '0.4');
      strip.setAttribute('position', `0 0.05 ${i * 0.4}`);
      strip.setAttribute('color', color);
      ramp.appendChild(strip);
    });

    // Collision box (transparent debug visual)
    const collisionBox = document.createElement('a-box');
    collisionBox.setAttribute('width', '6.0');   // halfWidth * 2
    collisionBox.setAttribute('height', '0.2');  // halfHeight * 2
    collisionBox.setAttribute('depth', '2.0');   // halfDepth * 2
    collisionBox.setAttribute('color', '#00ff00');
    collisionBox.setAttribute('opacity', '0.2');
    collisionBox.setAttribute('position', `0 0.05 0`);
    ramp.appendChild(collisionBox);

    ramp.setAttribute('static-body', '');
    world.appendChild(ramp);
    // Collision box: 5 strips of 0.4 depth each = 2.0 depth total
    this.obstacles.push({
      element: ramp,
      type: 'jump-ramp',
      x, z,
      // Half-extents of collision box
      halfWidth: 3.0,   // X extent (6 wide)
      halfHeight: 0.1,  // Y extent (0.2 tall)
      halfDepth: 1.0    // Z extent (2.0 deep)
    });
  }

  /**
   * Update and clean obstacles
   */
  updateObstacles() {
    this.obstacles = this.obstacles.filter(obs => {
      // Remove if passed far behind player (player is at z=0)
      if (obs.z > 50) {
        if (obs.element && obs.element.parentNode) {
          obs.element.parentNode.removeChild(obs.element);
        }
        return false;
      }

      return true;
    });
  }

  /**
   * Get all obstacles for collision detection
   */
  getObstacles() {
    return this.obstacles;
  }

  /**
   * Reset obstacles
   */
  reset() {
    this.obstacles.forEach(obs => {
      if (obs.element && obs.element.parentNode) {
        obs.element.parentNode.removeChild(obs.element);
      }
    });
    this.obstacles = [];
    this.lastSpawnDistance = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ObstacleManager;
}

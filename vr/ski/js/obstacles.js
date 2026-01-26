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
  update(distance, speed) {
    if (distance - this.lastSpawnDistance > this.spawnInterval) {
      this.spawn();
      this.lastSpawnDistance = distance;
    }

    // Move all obstacles toward player (player is at z=0)
    this.obstacles.forEach(obs => {
      obs.z += speed;
      obs.element.setAttribute('position', `${obs.x} 0 ${obs.z}`);
    });

    // Update and clean obstacles
    this.updateObstacles();
  }

  /**
   * Spawn a new random obstacle
   */
  spawn() {
    // Spawn in front of player (player is at z=0)
    const potentialZ = -70 - Math.random() * 50; // random distance ahead

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

    world.appendChild(tree);
    this.obstacles.push({ element: tree, type: 'tree', x, z, radius: 0.8 });
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

    world.appendChild(ramp);
    this.obstacles.push({ element: ramp, type: 'jump-ramp', x, z, width: 6 });
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

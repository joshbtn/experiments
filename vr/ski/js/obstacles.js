/**
 * Obstacle Manager
 * Handles spawning, updating, and removing obstacles
 */

class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.spawnedPositions = [];
    this.lastSpawnDistance = 0;
    this.spawnInterval = 8;
    this.minSpacing = 15;
  }

  /**
   * Spawn obstacles based on distance
   */
  update(distance, worldZ) {
    if (distance - this.lastSpawnDistance > this.spawnInterval) {
      this.spawn(worldZ);
      this.lastSpawnDistance = distance;
    }

    // Clean up old positions
    this.spawnedPositions = this.spawnedPositions.filter(pos => pos.z + worldZ < 20);

    // Update and clean obstacles
    this.updateObstacles(worldZ);
  }

  /**
   * Spawn a new random obstacle
   */
  spawn(worldZ) {
    // Check spacing
    const potentialZ = -80 - worldZ;
    for (let pos of this.spawnedPositions) {
      if (Math.abs(pos.z - potentialZ) < this.minSpacing) {
        return; // Too close to previous obstacle
      }
    }

    const x = (Math.random() - 0.5) * 50;
    const z = potentialZ;

    const rng = Math.random();
    if (rng < 0.75) {
      this.spawnTree(x, z);
    } else {
      this.spawnJumpRamp(x, z);
    }

    this.spawnedPositions.push({ x, z });
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
  updateObstacles(worldZ) {
    this.obstacles = this.obstacles.filter(obs => {
      const zRel = obs.z + worldZ;

      // Remove if far behind
      if (zRel > 50) {
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
    this.spawnedPositions = [];
    this.lastSpawnDistance = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ObstacleManager;
}

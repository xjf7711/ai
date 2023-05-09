// Section B.10.2 Tag trees
import { log2 } from "assets/js/core_utils";

export class TagTree {
  constructor(width, height) {
    const levelsLength = log2(Math.max(width, height)) + 1;
    this.levels = [];
    for (let i = 0; i < levelsLength; i++) {
      const level = {
        width,
        height,
        items: []
      };
      this.levels.push(level);
      width = Math.ceil(width / 2);
      height = Math.ceil(height / 2);
    }
  }

  reset(i, j) {
    console.log("reset  i is ", i, " j is ", j);
    let currentLevel = 0,
      value = 0,
      level;
    while (currentLevel < this.levels.length) {
      level = this.levels[currentLevel];
      const index = i + j * level.width;
      if (level.items[index] !== undefined) {
        value = level.items[index];
        break;
      }
      level.index = index;
      i >>= 1;
      j >>= 1;
      currentLevel++;
    }
    currentLevel--;
    level = this.levels[currentLevel];
    level.items[level.index] = value;
    this.currentLevel = currentLevel;
    console.log("this.currentLevel is ", this.currentLevel);
    delete this.value;
  }

  incrementValue() {
    const level = this.levels[this.currentLevel];
    level.items[level.index]++;
  }

  nextLevel() {
    console.log("nextLevel . this.currentLevel is ", this.currentLevel);
    let currentLevel = this.currentLevel;
    let level = this.levels[currentLevel];
    const value = level.items[level.index];
    currentLevel--;
    if (currentLevel < 0) {
      this.value = value;
      return false;
    }

    this.currentLevel = currentLevel;
    level = this.levels[currentLevel];
    level.items[level.index] = value;
    return true;
  }
}

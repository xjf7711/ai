import { log2 } from "assets/js/core_utils";

export class InclusionTree {
  constructor(width, height, defaultValue) {
    const levelsLength = log2(Math.max(width, height)) + 1;
    this.levels = [];
    for (let i = 0; i < levelsLength; i++) {
      const items = new Uint8Array(width * height);
      for (let j = 0, jj = items.length; j < jj; j++) {
        items[j] = defaultValue;
      }

      const level = {
        width,
        height,
        items
      };
      this.levels.push(level);

      width = Math.ceil(width / 2);
      height = Math.ceil(height / 2);
    }
  }

  reset(i, j, stopValue) {
    console.log("reset . i is ", i, " j is ", j, " stopValue is ", stopValue);
    let currentLevel = 0;
    while (currentLevel < this.levels.length) {
      const level = this.levels[currentLevel];
      const index = i + j * level.width;
      level.index = index;
      const value = level.items[index];

      if (value === 0xff) {
        break;
      }

      if (value > stopValue) {
        this.currentLevel = currentLevel;
        // already know about this one, propagating the value to top levels
        this.propagateValues();
        return false;
      }

      i >>= 1;
      j >>= 1;
      currentLevel++;
    }
    this.currentLevel = currentLevel - 1;
    console.log("this.currentLevel is ", this.currentLevel);
    return true;
  }

  incrementValue(stopValue) {
    console.log("incrementValue . stopValue is ", stopValue);
    const level = this.levels[this.currentLevel];
    level.items[level.index] = stopValue + 1;
    this.propagateValues();
  }

  propagateValues() {
    let levelIndex = this.currentLevel;
    let level = this.levels[levelIndex];
    const currentValue = level.items[level.index];
    while (--levelIndex >= 0) {
      level = this.levels[levelIndex];
      level.items[level.index] = currentValue;
    }
  }

  nextLevel() {
    console.log("nextLevel this.currentLevel is ", this.currentLevel);
    let currentLevel = this.currentLevel;
    let level = this.levels[currentLevel];
    console.log("level is ", level);
    const value = level.items[level.index];
    level.items[level.index] = 0xff;
    currentLevel--;
    if (currentLevel < 0) {
      return false;
    }

    this.currentLevel = currentLevel;
    level = this.levels[currentLevel];
    level.items[level.index] = value;
    return true;
  }
}

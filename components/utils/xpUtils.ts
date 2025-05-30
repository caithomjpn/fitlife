// utils/xpUtils.ts
export function getRequiredXpForLevel(level: number): number {
    if (level <= 1) return 200;
    return 200 + (level - 1) * 100;
  }
  
  export function getTotalXpForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += getRequiredXpForLevel(i);
    }
    return total;
  }
  
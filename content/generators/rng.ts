/**
 * Deterministic pseudo-random generator used by the content pipeline.
 *
 * Every question in the bank is produced from a seed, so rebuilding the bank
 * from source always yields byte-identical output — ids stay stable, curated
 * test forms keep referencing the same items, and content review is a diff.
 */
export class Rng {
  private state: number;

  constructor(seed: string | number) {
    this.state = typeof seed === "number" ? seed >>> 0 : Rng.hash(seed);
    if (this.state === 0) this.state = 0x9e3779b9;
    // Discard a few values so nearby seeds diverge immediately.
    for (let i = 0; i < 8; i += 1) this.next();
  }

  /** FNV-1a, enough mixing for content generation. */
  static hash(input: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** xorshift32 */
  next(): number {
    let x = this.state;
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    this.state = x;
    return x / 0x100000000;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Integer in [min, max] excluding any value in `exclude`. */
  intExcept(min: number, max: number, exclude: number[]): number {
    const pool: number[] = [];
    for (let v = min; v <= max; v += 1) if (!exclude.includes(v)) pool.push(v);
    if (pool.length === 0) throw new Error(`intExcept: empty pool ${min}..${max}`);
    return pool[this.int(0, pool.length - 1)];
  }

  /** Non-zero integer in [-mag, mag]. */
  nonZero(mag: number): number {
    const v = this.int(1, mag);
    return this.bool() ? v : -v;
  }

  bool(p = 0.5): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("pick: empty array");
    return items[this.int(0, items.length - 1)];
  }

  /** Fisher–Yates on a copy. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** `count` distinct items, in random order. */
  sample<T>(items: readonly T[], count: number): T[] {
    return this.shuffle(items).slice(0, count);
  }
}

/** Cycles a list without repeating until it is exhausted. */
export function cycler<T>(items: readonly T[], rng: Rng): () => T {
  let pool: T[] = [];
  return () => {
    if (pool.length === 0) pool = rng.shuffle(items);
    return pool.pop() as T;
  };
}

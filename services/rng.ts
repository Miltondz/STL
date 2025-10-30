// services/rng.ts

// Un generador de números pseudoaleatorios simple y determinista (LCG).
// Esto es crucial para que los combates sean reproducibles.
export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  // Devuelve el siguiente número pseudoaleatorio como un float entre 0 (incluido) y 1 (excluido).
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  
  // Devuelve un entero entre min (incluido) y max (incluido).
  nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Devuelve el estado actual para poder guardarlo.
  getState(): number {
    return this.seed;
  }

  // Restaura el estado a partir de uno guardado.
  setState(seed: number): void {
    this.seed = seed;
  }
}
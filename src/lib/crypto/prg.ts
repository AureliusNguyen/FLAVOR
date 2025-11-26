/**
 * Pseudorandom Generator (PRG) for Bonawitz Secure Aggregation
 * Uses Linear Congruential Generator (LCG) for pedagogical transparency
 *
 * NOTE: This is for educational purposes only - NOT cryptographically secure!
 * Real implementations should use cryptographic PRGs like AES-CTR or ChaCha20
 */

/**
 * Pedagogical PRG based on LCG algorithm
 * Formula: X_{n+1} = (a * X_n + c) mod m
 *
 * Using parameters from Numerical Recipes (good distribution for demos)
 */
export class PedagogicalPRG {
  private state: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32; // 2^32

  constructor(seed: number) {
    // Ensure seed is positive and within range
    this.state = Math.abs(seed) % this.m;
  }

  /**
   * Generate next random number in range [0, modulus)
   */
  next(modulus: number): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state % modulus;
  }

  /**
   * Generate a vector of random numbers, each in range [0, modulus)
   */
  nextVector(length: number, modulus: number): number[] {
    const vector: number[] = [];
    for (let i = 0; i < length; i++) {
      vector.push(this.next(modulus));
    }
    return vector;
  }

  /**
   * Peek at the next value without advancing state (for visualization)
   */
  peek(modulus: number): number {
    const nextState = (this.a * this.state + this.c) % this.m;
    return nextState % modulus;
  }

  /**
   * Reset to a specific state (useful for demonstrations)
   */
  reset(seed: number): void {
    this.state = Math.abs(seed) % this.m;
  }

  /**
   * Get current internal state (for debugging/visualization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Generate a sequence showing the PRG output (for educational display)
   */
  generateSequencePreview(
    count: number,
    modulus: number
  ): { index: number; value: number; state: number }[] {
    const originalState = this.state;
    const sequence: { index: number; value: number; state: number }[] = [];

    for (let i = 0; i < count; i++) {
      const value = this.next(modulus);
      sequence.push({
        index: i,
        value,
        state: this.state,
      });
    }

    // Restore original state
    this.state = originalState;

    return sequence;
  }
}

/**
 * Generate pairwise mask vector using PRG
 * This is used in Bonawitz protocol for p_uv masks
 */
export function generatePairwiseMask(
  seed: number,
  vectorLength: number,
  modulus: number
): number[] {
  const prg = new PedagogicalPRG(seed);
  return prg.nextVector(vectorLength, modulus);
}

/**
 * Generate multiple pairwise masks for a client
 * Returns map of peerId -> mask vector
 */
export function generateAllPairwiseMasks(
  clientId: number,
  peerIds: number[],
  sharedSeeds: Map<string, number>,
  vectorLength: number,
  modulus: number
): Map<number, number[]> {
  const masks = new Map<number, number[]>();

  for (const peerId of peerIds) {
    if (peerId === clientId) continue;

    // Get shared seed for this pair
    const minId = Math.min(clientId, peerId);
    const maxId = Math.max(clientId, peerId);
    const seed = sharedSeeds.get(`${minId},${maxId}`);

    if (seed === undefined) {
      throw new Error(
        `No shared seed found for clients ${clientId} and ${peerId}`
      );
    }

    // Generate mask from shared seed
    const mask = generatePairwiseMask(seed, vectorLength, modulus);
    masks.set(peerId, mask);
  }

  return masks;
}

/**
 * Deterministic random vector generation (for self-masks b_u)
 * Uses client ID and round as seed for reproducibility in demos
 */
export function generateSelfMask(
  clientId: number,
  vectorLength: number,
  modulus: number,
  roundSeed: number = 0
): number[] {
  // Derive unique seed from client ID and round
  const seed = (clientId * 31337 + roundSeed * 7919) % (2 ** 31);
  const prg = new PedagogicalPRG(seed);
  return prg.nextVector(vectorLength, modulus);
}

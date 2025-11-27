// Shamir Secret Sharing Implementation
// Using finite field arithmetic over a large prime

import { Share, Polynomial, ShamirConfig } from '@/types';

// Large prime for finite field (256-bit prime)
const DEFAULT_PRIME = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639747');

export class ShamirSecretSharing {
  private config: ShamirConfig;
  private useSeededRandom: boolean;
  private seed: number;

  constructor(threshold: number = 7, totalShares: number = 10, prime?: bigint, useSeededRandom: boolean = false, seed: number = 42) {
    this.config = {
      threshold,
      totalShares,
      prime: prime || DEFAULT_PRIME
    };
    this.useSeededRandom = useSeededRandom;
    this.seed = seed;
  }

  // Seeded random for consistent demo values
  private seededRandom(index: number): number {
    const x = Math.sin(this.seed * 9999 + index * 7777) * 10000;
    return Math.abs(x - Math.floor(x));
  }

  // Modular arithmetic helpers
  private mod(a: bigint, m: bigint): bigint {
    return ((a % m) + m) % m;
  }

  private modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = BigInt(1);
    base = this.mod(base, mod);
    while (exp > 0) {
      if (exp % BigInt(2) === BigInt(1)) {
        result = this.mod(result * base, mod);
      }
      exp = exp / BigInt(2);
      base = this.mod(base * base, mod);
    }
    return result;
  }

  private modInverse(a: bigint, m: bigint): bigint {
    // Using Fermat's little theorem: a^(-1) = a^(m-2) mod m
    return this.modPow(a, m - BigInt(2), m);
  }

  // Generate random coefficients for polynomial
  private generatePolynomial(secret: bigint, degree: number): Polynomial {
    const coefficients: bigint[] = [secret];

    for (let i = 1; i <= degree; i++) {
      let coeff: bigint;

      if (this.useSeededRandom) {
        // Use seeded random for consistent demo values
        const rand = this.seededRandom(i);
        // Generate a large but reproducible coefficient
        coeff = BigInt(Math.floor(rand * Number.MAX_SAFE_INTEGER));
      } else {
        // Generate random coefficient (use crypto.getRandomValues in production)
        const randomBytes = new Uint8Array(32);
        if (typeof window !== 'undefined' && window.crypto) {
          window.crypto.getRandomValues(randomBytes);
        } else {
          // Fallback for SSR
          for (let j = 0; j < 32; j++) {
            randomBytes[j] = Math.floor(Math.random() * 256);
          }
        }
        coeff = BigInt(0);
        for (let j = 0; j < randomBytes.length; j++) {
          coeff = (coeff << BigInt(8)) + BigInt(randomBytes[j]);
        }
      }
      coefficients.push(this.mod(coeff, this.config.prime));
    }

    return {
      coefficients,
      degree
    };
  }

  // Evaluate polynomial at point x
  evaluatePolynomial(polynomial: Polynomial, x: bigint): bigint {
    let result = BigInt(0);
    let xPower = BigInt(1);

    for (const coeff of polynomial.coefficients) {
      result = this.mod(result + this.mod(coeff * xPower, this.config.prime), this.config.prime);
      xPower = this.mod(xPower * x, this.config.prime);
    }

    return result;
  }

  // Split a secret into shares
  split(secret: bigint | number): { shares: Share[]; polynomial: Polynomial } {
    const secretBigInt = typeof secret === 'number' ? BigInt(secret) : secret;
    const polynomial = this.generatePolynomial(
      this.mod(secretBigInt, this.config.prime),
      this.config.threshold - 1
    );

    const shares: Share[] = [];
    for (let i = 1; i <= this.config.totalShares; i++) {
      const x = BigInt(i);
      const y = this.evaluatePolynomial(polynomial, x);
      shares.push({ x: i, y, clientId: i });
    }

    return { shares, polynomial };
  }

  // Reconstruct secret from shares using Lagrange interpolation
  reconstruct(shares: Share[]): bigint {
    if (shares.length < this.config.threshold) {
      throw new Error(`Need at least ${this.config.threshold} shares, got ${shares.length}`);
    }

    // Use only the first threshold shares
    const usedShares = shares.slice(0, this.config.threshold);
    let secret = BigInt(0);

    for (let i = 0; i < usedShares.length; i++) {
      let numerator = BigInt(1);
      let denominator = BigInt(1);

      for (let j = 0; j < usedShares.length; j++) {
        if (i !== j) {
          const xi = BigInt(usedShares[i].x);
          const xj = BigInt(usedShares[j].x);

          numerator = this.mod(numerator * (BigInt(0) - xj), this.config.prime);
          denominator = this.mod(denominator * (xi - xj), this.config.prime);
        }
      }

      const lagrangeCoeff = this.mod(
        numerator * this.modInverse(denominator, this.config.prime),
        this.config.prime
      );

      secret = this.mod(
        secret + this.mod(usedShares[i].y * lagrangeCoeff, this.config.prime),
        this.config.prime
      );
    }

    return secret;
  }

  // Verify that shares can reconstruct the secret
  verify(shares: Share[], expectedSecret: bigint): boolean {
    try {
      const reconstructed = this.reconstruct(shares);
      return reconstructed === this.mod(expectedSecret, this.config.prime);
    } catch {
      return false;
    }
  }

  // Get configuration
  getConfig(): ShamirConfig {
    return { ...this.config };
  }

  // Helper to convert number to shares for model weights
  splitModelWeight(weight: number, scale: number = 1e6): { shares: Share[]; polynomial: Polynomial } {
    // Scale and convert to integer
    const scaledWeight = BigInt(Math.round(weight * scale));
    return this.split(scaledWeight);
  }

  // Helper to reconstruct model weight
  reconstructModelWeight(shares: Share[], scale: number = 1e6): number {
    const scaledWeight = this.reconstruct(shares);
    return Number(scaledWeight) / scale;
  }

  // Get polynomial points for visualization
  getPolynomialPoints(polynomial: Polynomial, numPoints: number = 100): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const maxX = this.config.totalShares + 1;

    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * maxX;
      const xBig = BigInt(Math.round(x * 1000));
      const y = this.evaluatePolynomial(polynomial, xBig);
      // Normalize for visualization
      const yNorm = Number(y % BigInt(1000)) / 1000;
      points.push({ x, y: yNorm });
    }

    return points;
  }
}

// Singleton instance with default config (7 of 10)
export const shamirSSS = new ShamirSecretSharing(7, 10);

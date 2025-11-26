/**
 * Diffie-Hellman Key Exchange Primitives
 * Pedagogical implementation for Bonawitz et al. (2017) secure aggregation
 *
 * Uses small prime for visualization purposes - NOT cryptographically secure
 */

// Default DH parameters (small for pedagogy)
export const DH_PARAMS = {
  p: BigInt(65537), // Small prime (2^16 + 1, a Fermat prime)
  g: BigInt(3),     // Generator
};

/**
 * Generate a Diffie-Hellman key pair
 * Returns: { private: a, public: g^a mod p }
 */
export function generateDHKeyPair(
  prime: bigint = DH_PARAMS.p,
  generator: bigint = DH_PARAMS.g
): { private: bigint; public: bigint } {
  // Generate random private key in range [2, p-2]
  const privateKey = BigInt(
    Math.floor(Math.random() * Number(prime - BigInt(3))) + 2
  );

  // Compute public key: g^a mod p using modular exponentiation
  const publicKey = modPow(generator, privateKey, prime);

  return {
    private: privateKey,
    public: publicKey,
  };
}

/**
 * Compute shared secret from own private key and peer's public key
 * Returns: (theirPublic)^myPrivate mod prime
 */
export function computeSharedSecret(
  myPrivate: bigint,
  theirPublic: bigint,
  prime: bigint = DH_PARAMS.p
): bigint {
  return modPow(theirPublic, myPrivate, prime);
}

/**
 * Derive a deterministic seed from shared secret for PRG
 * Simple hash function for pedagogy (NOT cryptographically secure)
 */
export function deriveSharedSeed(sharedSecret: bigint): number {
  // Simple deterministic derivation (in real world, use proper KDF)
  const secretNum = Number(sharedSecret % BigInt(2 ** 31));

  // Mix bits for better distribution
  let seed = secretNum;
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 0x85ebca6b);
  seed ^= seed >>> 13;
  seed = Math.imul(seed, 0xc2b2ae35);
  seed ^= seed >>> 16;

  return seed >>> 0; // Ensure positive 32-bit integer
}

/**
 * Modular exponentiation: (base^exp) mod modulus
 * Uses binary exponentiation for efficiency
 */
export function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  if (modulus === BigInt(1)) return BigInt(0);

  let result = BigInt(1);
  base = base % modulus;

  while (exp > BigInt(0)) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % modulus;
    }
    exp = exp >> BigInt(1);
    base = (base * base) % modulus;
  }

  return result;
}

/**
 * Perform pairwise key exchange for all client pairs
 * Returns map of [minId, maxId] -> shared seed
 */
export function performPairwiseKeyExchange(
  clientIds: number[],
  dhParams: { p: bigint; g: bigint } = DH_PARAMS
): {
  keyPairs: Map<number, { private: bigint; public: bigint }>;
  sharedSeeds: Map<string, number>;
} {
  const keyPairs = new Map<number, { private: bigint; public: bigint }>();
  const sharedSeeds = new Map<string, number>();

  // Generate key pairs for each client
  for (const clientId of clientIds) {
    keyPairs.set(clientId, generateDHKeyPair(dhParams.p, dhParams.g));
  }

  // Compute pairwise shared secrets
  for (let i = 0; i < clientIds.length; i++) {
    for (let j = i + 1; j < clientIds.length; j++) {
      const clientU = clientIds[i];
      const clientV = clientIds[j];

      const keyPairU = keyPairs.get(clientU)!;
      const keyPairV = keyPairs.get(clientV)!;

      // Both clients compute the same shared secret
      const sharedSecret = computeSharedSecret(
        keyPairU.private,
        keyPairV.public,
        dhParams.p
      );

      // Verify symmetry (for testing)
      const sharedSecretV = computeSharedSecret(
        keyPairV.private,
        keyPairU.public,
        dhParams.p
      );

      if (sharedSecret !== sharedSecretV) {
        throw new Error(
          `DH key exchange failed for clients ${clientU} and ${clientV}`
        );
      }

      // Derive seed and store with canonical key [min, max]
      const seed = deriveSharedSeed(sharedSecret);
      const minId = Math.min(clientU, clientV);
      const maxId = Math.max(clientU, clientV);
      const pairKey = `${minId},${maxId}`;
      sharedSeeds.set(pairKey, seed);
    }
  }

  return { keyPairs, sharedSeeds };
}

/**
 * Get shared seed for a specific client pair
 * Handles ordering automatically (u,v) and (v,u) return same seed
 */
export function getPairwiseSeed(
  clientU: number,
  clientV: number,
  sharedSeeds: Map<string, number>
): number | undefined {
  const minId = Math.min(clientU, clientV);
  const maxId = Math.max(clientU, clientV);
  const key = `${minId},${maxId}`;
  return sharedSeeds.get(key);
}

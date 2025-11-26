/**
 * Shamir Secret Sharing Scheme
 * Extended from ShamirSSSPrimitiveSection for use in Bonawitz protocol
 *
 * Implements (t, n) threshold secret sharing over finite fields
 */

const DEFAULT_PRIME = 257; // Small prime for pedagogical purposes

/**
 * Proper modulo operation that handles negative numbers correctly
 */
export function modulo(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Extended Euclidean Algorithm to find modular inverse
 * Used in Lagrange interpolation for division in finite fields
 */
export function modInverse(a: number, m: number): number {
  a = modulo(a, m);
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }

  return modulo(oldS, m);
}

/**
 * Evaluate polynomial at point x in finite field
 * P(x) = a₀ + a₁x + a₂x² + ... + aₙxⁿ (mod prime)
 */
export function evaluatePolynomial(
  coefficients: number[],
  x: number,
  prime: number
): number {
  let result = 0;
  let xPower = 1;

  for (const coeff of coefficients) {
    result = modulo(result + coeff * xPower, prime);
    xPower = modulo(xPower * x, prime);
  }

  return result;
}

/**
 * Generate a random polynomial with the secret as the constant term
 * Degree = threshold - 1
 * P(x) = secret + a₁x + a₂x² + ... + aₜ₋₁x^(t-1)
 */
export function generateRandomPolynomial(
  secret: number,
  degree: number,
  prime: number
): number[] {
  const coefficients = [modulo(secret, prime)];

  for (let i = 0; i < degree; i++) {
    // Generate random coefficient in range [1, prime-1]
    coefficients.push(Math.floor(Math.random() * (prime - 1)) + 1);
  }

  return coefficients;
}

/**
 * Share data type (x, y) pair
 */
export interface Share {
  x: number; // Share index (participant ID)
  y: number; // Share value
}

/**
 * Generate N shares from a secret with threshold T
 * Returns array of (x, y) pairs where x is the share index and y is the share value
 */
export function generateShares(
  secret: number,
  n: number,
  t: number,
  prime: number = DEFAULT_PRIME
): Share[] {
  // Ensure secret is in valid range
  secret = modulo(secret, prime);

  // Polynomial degree is t-1 (threshold minus one)
  const polynomial = generateRandomPolynomial(secret, t - 1, prime);

  const shares: Share[] = [];

  // Evaluate polynomial at points 1, 2, 3, ..., N
  for (let i = 1; i <= n; i++) {
    const y = evaluatePolynomial(polynomial, i, prime);
    shares.push({ x: i, y });
  }

  return shares;
}

/**
 * Lagrange interpolation to reconstruct secret from T or more shares
 * Reconstructs P(0) which equals the original secret
 */
export function lagrangeInterpolation(
  shares: Share[],
  prime: number = DEFAULT_PRIME
): number {
  let secret = 0;

  for (let i = 0; i < shares.length; i++) {
    const { x: xi, y: yi } = shares[i];

    // Compute Lagrange basis polynomial L_i(0)
    let numerator = 1;
    let denominator = 1;

    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        const { x: xj } = shares[j];
        // L_i(0) = ∏(0 - x_j) / (x_i - x_j)
        numerator = modulo(numerator * (0 - xj), prime);
        denominator = modulo(denominator * (xi - xj), prime);
      }
    }

    // Compute L_i(0) = numerator / denominator (using modular inverse)
    const lagrangeBasis = modulo(numerator * modInverse(denominator, prime), prime);

    // Add y_i * L_i(0) to the result
    secret = modulo(secret + yi * lagrangeBasis, prime);
  }

  return secret;
}

/**
 * Distribute secret shares to specific recipients
 * Used in Bonawitz protocol where each client distributes shares of their self-mask
 */
export function distributeSecretShares(
  secret: number,
  threshold: number,
  recipientIds: number[],
  prime: number = DEFAULT_PRIME
): Map<number, Share> {
  const n = recipientIds.length;
  const shares = generateShares(secret, n, threshold, prime);

  const shareMap = new Map<number, Share>();
  recipientIds.forEach((recipientId, index) => {
    shareMap.set(recipientId, shares[index]);
  });

  return shareMap;
}

/**
 * Reconstruct secret from a collection of shares
 * Wrapper around lagrangeInterpolation for convenience
 */
export function reconstructSecret(
  shares: Share[],
  prime: number = DEFAULT_PRIME
): number {
  if (shares.length === 0) {
    throw new Error('Cannot reconstruct secret: no shares provided');
  }

  return lagrangeInterpolation(shares, prime);
}

/**
 * Secret-share a vector element-wise
 * Used for sharing self-mask vectors in Bonawitz protocol
 */
export function shareVector(
  vector: number[],
  threshold: number,
  numShares: number,
  prime: number = DEFAULT_PRIME
): Share[][] {
  // Each element gets independently secret-shared
  return vector.map((element) =>
    generateShares(element, numShares, threshold, prime)
  );
}

/**
 * Reconstruct a vector from shares
 * sharesPerElement[i] contains the shares for the i-th vector element
 */
export function reconstructVector(
  sharesPerElement: Share[][],
  prime: number = DEFAULT_PRIME
): number[] {
  return sharesPerElement.map((shares) =>
    lagrangeInterpolation(shares, prime)
  );
}

/**
 * Distribute vector shares to recipients
 * Returns map: recipientId -> array of shares (one per vector element)
 */
export function distributeVectorShares(
  vector: number[],
  threshold: number,
  recipientIds: number[],
  prime: number = DEFAULT_PRIME
): Map<number, Share[]> {
  const vectorShares = shareVector(vector, threshold, recipientIds.length, prime);

  // Transpose: vectorShares[elementIdx][shareIdx] -> result[recipientId][elementIdx]
  const distributedShares = new Map<number, Share[]>();

  recipientIds.forEach((recipientId, recipientIdx) => {
    const sharesForRecipient: Share[] = [];

    for (let elementIdx = 0; elementIdx < vector.length; elementIdx++) {
      sharesForRecipient.push(vectorShares[elementIdx][recipientIdx]);
    }

    distributedShares.set(recipientId, sharesForRecipient);
  });

  return distributedShares;
}

/**
 * Collect shares from multiple holders to reconstruct a vector
 * Input: map of holderId -> array of shares (one per element)
 * Output: reconstructed vector
 */
export function collectAndReconstructVector(
  sharesFromHolders: Map<number, Share[]>,
  prime: number = DEFAULT_PRIME
): number[] {
  if (sharesFromHolders.size === 0) {
    throw new Error('No shares provided for reconstruction');
  }

  // Get vector length from first holder
  const firstHolderShares = Array.from(sharesFromHolders.values())[0];
  const vectorLength = firstHolderShares.length;

  // Collect shares for each element
  const sharesPerElement: Share[][] = [];

  for (let elementIdx = 0; elementIdx < vectorLength; elementIdx++) {
    const sharesForElement: Share[] = [];

    for (const [holderId, holderShares] of sharesFromHolders) {
      sharesForElement.push(holderShares[elementIdx]);
    }

    sharesPerElement.push(sharesForElement);
  }

  return reconstructVector(sharesPerElement, prime);
}

/**
 * Get human-readable polynomial string for display
 */
export function formatPolynomial(coefficients: number[]): string {
  const terms: string[] = [];

  coefficients.forEach((coeff, degree) => {
    if (coeff === 0) return;

    let term = '';
    if (degree === 0) {
      term = `${coeff}`;
    } else if (degree === 1) {
      term = coeff === 1 ? 'x' : `${coeff}x`;
    } else {
      term = coeff === 1 ? `x^${degree}` : `${coeff}x^${degree}`;
    }
    terms.push(term);
  });

  return terms.reverse().join(' + ').replace(/\+ -/g, '- ');
}

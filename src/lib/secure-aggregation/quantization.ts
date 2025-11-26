/**
 * Quantization utilities for Bonawitz Secure Aggregation
 *
 * Converts floating-point gradients to integers for modular arithmetic,
 * and dequantizes back to floats after aggregation
 */

import { modulo } from '../crypto/shamir-sss';

/**
 * Quantize a float vector to integers
 *
 * Formula: x̃ = round(x × Q) mod R
 * where:
 *   - Q is the quantization factor (e.g., 2^8 = 256)
 *   - R is the modulus for secure aggregation (e.g., 2^16 = 65536)
 *
 * Uses Math.round instead of Math.floor for better precision, especially
 * for negative numbers where floor introduces systematic bias.
 *
 * @param floatVector - Original floating-point values
 * @param Q - Quantization factor (typically 2^k)
 * @param modulus - Modulus R for finite field arithmetic
 * @returns Integer vector with values in [0, modulus)
 */
export function quantizeVector(
  floatVector: number[],
  Q: number,
  modulus: number
): number[] {
  return floatVector.map((value) => {
    // Multiply by quantization factor and round to nearest integer
    const quantized = Math.round(value * Q);

    // Apply modulo to ensure value is in [0, modulus)
    return modulo(quantized, modulus);
  });
}

/**
 * Quantize a single scalar value
 */
export function quantizeScalar(
  value: number,
  Q: number,
  modulus: number
): number {
  const quantized = Math.round(value * Q);
  return modulo(quantized, modulus);
}

/**
 * Dequantize an integer vector back to floats
 *
 * Formula: x = x̃ / Q
 *
 * NOTE: This handles the modular wraparound correctly by checking
 * if values are likely negative (> modulus/2)
 *
 * @param intVector - Quantized integer values
 * @param Q - Quantization factor used during quantization
 * @param modulus - Modulus R used during quantization
 * @returns Dequantized floating-point vector
 */
export function dequantizeVector(
  intVector: number[],
  Q: number,
  modulus: number
): number[] {
  return intVector.map((value) => {
    // Handle negative values that wrapped around modulus
    let signedValue = value;
    if (value > modulus / 2) {
      signedValue = value - modulus;
    }

    // Divide by quantization factor
    return signedValue / Q;
  });
}

/**
 * Dequantize a single scalar value
 */
export function dequantizeScalar(
  value: number,
  Q: number,
  modulus: number
): number {
  let signedValue = value;
  if (value > modulus / 2) {
    signedValue = value - modulus;
  }

  return signedValue / Q;
}

/**
 * Compute average after dequantization
 *
 * Formula: x̄ = (Σx̃_u / N) / Q
 * where N is the number of clients
 *
 * @param aggregatedVector - Sum of quantized vectors (mod R)
 * @param numClients - Number of clients that contributed
 * @param Q - Quantization factor
 * @param modulus - Modulus R
 * @returns Average as floating-point vector
 */
export function dequantizeAndAverage(
  aggregatedVector: number[],
  numClients: number,
  Q: number,
  modulus: number
): number[] {
  return aggregatedVector.map((sum) => {
    // Handle negative sums
    let signedSum = sum;
    if (sum > modulus / 2) {
      signedSum = sum - modulus;
    }

    // Average then dequantize: (sum / N) / Q
    return signedSum / (numClients * Q);
  });
}

/**
 * Estimate appropriate quantization factor for a dataset
 * Based on expected range of gradient values
 *
 * @param expectedRange - Expected max absolute value of inputs
 * @param modulus - Modulus R for secure aggregation
 * @param safetyMargin - Safety factor (default 0.5 to use half of available range)
 * @returns Recommended quantization factor Q
 */
export function estimateQuantizationFactor(
  expectedRange: number,
  modulus: number,
  safetyMargin: number = 0.5
): number {
  // Use half the modulus range to allow for positive and negative values
  const availableRange = (modulus / 2) * safetyMargin;

  // Q should map expectedRange to availableRange
  const Q = Math.floor(availableRange / expectedRange);

  // Round to nearest power of 2 for cleaner display
  const powerOf2 = Math.pow(2, Math.floor(Math.log2(Q)));

  return powerOf2;
}

/**
 * Validate that quantized values are within acceptable range
 * Helps catch overflow issues
 */
export function validateQuantizedVector(
  vector: number[],
  modulus: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  vector.forEach((value, index) => {
    if (value < 0 || value >= modulus) {
      errors.push(
        `Element ${index}: value ${value} is outside valid range [0, ${modulus})`
      );
    }

    if (!Number.isInteger(value)) {
      errors.push(`Element ${index}: value ${value} is not an integer`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Display quantization info for pedagogical purposes
 */
export interface QuantizationInfo {
  originalFloat: number;
  quantized: number;
  dequantized: number;
  error: number;
  errorPercent: number;
}

export function getQuantizationInfo(
  floatValue: number,
  Q: number,
  modulus: number
): QuantizationInfo {
  const quantized = quantizeScalar(floatValue, Q, modulus);
  const dequantized = dequantizeScalar(quantized, Q, modulus);
  const error = Math.abs(floatValue - dequantized);
  const errorPercent =
    floatValue !== 0 ? (error / Math.abs(floatValue)) * 100 : 0;

  return {
    originalFloat: floatValue,
    quantized,
    dequantized,
    error,
    errorPercent,
  };
}

// Defense mechanisms against gradient inversion attacks
// Based on: Zhu et al. "Deep Leakage from Gradients" Section 5
import * as tf from "@tensorflow/tfjs";
import type { DefenseConfig } from "@/types/gradient-inversion";

/**
 * Apply defense mechanism to gradients
 */
export function applyDefense(
  gradients: tf.Tensor[],
  config: DefenseConfig
): tf.Tensor[] {
  switch (config.type) {
    case "gaussian":
      return applyGaussianNoise(gradients, config.noiseVariance ?? 0.01);
    case "laplacian":
      return applyLaplacianNoise(gradients, config.noiseVariance ?? 0.01);
    case "pruning":
      return applyGradientPruning(gradients, config.pruningRatio ?? 0.1);
    case "fp16":
      return applyFP16Conversion(gradients);
    case "int8":
      return applyInt8Quantization(gradients);
    case "none":
    default:
      return gradients;
  }
}

/**
 * Add Gaussian noise to gradients
 * Defense effectiveness depends on variance:
 * - 10^-4: Does not prevent leak
 * - 10^-3: Leak with artifacts
 * - 10^-2: Starts to defend, but affects accuracy
 * - 10^-1: Defends well, but severely degrades accuracy
 */
export function applyGaussianNoise(
  gradients: tf.Tensor[],
  variance: number
): tf.Tensor[] {
  return gradients.map((g) =>
    tf.tidy(() => {
      const noise = tf.randomNormal(g.shape, 0, Math.sqrt(variance));
      return g.add(noise);
    })
  );
}

/**
 * Add Laplacian noise to gradients
 * Similar effectiveness profile to Gaussian noise
 * Slightly better defense at 10^-3 scale
 */
export function applyLaplacianNoise(
  gradients: tf.Tensor[],
  variance: number
): tf.Tensor[] {
  // Laplacian with scale b where variance = 2b^2
  const scale = Math.sqrt(variance / 2);

  return gradients.map((g) =>
    tf.tidy(() => {
      // Generate Laplacian noise using inverse CDF method
      // Laplacian(0, b) = b * sign(U-0.5) * ln(1 - 2|U-0.5|) where U ~ Uniform(0,1)
      const u = tf.randomUniform(g.shape);
      const centered = u.sub(0.5);
      const sign = tf.sign(centered);
      const absVal = tf.abs(centered);
      const noise = sign.mul(tf.log(tf.scalar(1).sub(absVal.mul(2)).add(1e-10))).mul(-scale);
      return g.add(noise);
    })
  );
}

/**
 * Gradient pruning/sparsification
 * Set small-magnitude gradients to zero
 * Defense effectiveness:
 * - 1-10%: No effect on attack
 * - 20%: Artifacts appear
 * - 30%+: Attack starts to fail
 * - 70%+: Attack fails completely
 */
export function applyGradientPruning(
  gradients: tf.Tensor[],
  pruneRatio: number
): tf.Tensor[] {
  return gradients.map((g) =>
    tf.tidy(() => {
      const flatGrad = g.flatten();
      const absGrad = flatGrad.abs();

      // Find threshold for pruning (k-th percentile)
      const sorted = tf.topk(absGrad, absGrad.size, true).values;
      const kIndex = Math.floor(absGrad.size * pruneRatio);
      const thresholdValue = sorted.slice([kIndex], [1]).dataSync()[0];

      // Create mask: 1 where |grad| >= threshold, 0 otherwise
      const mask = absGrad.greaterEqual(tf.scalar(thresholdValue)).cast("float32");

      // Apply mask
      const prunedFlat = flatGrad.mul(mask);
      return prunedFlat.reshape(g.shape);
    })
  );
}

/**
 * Convert gradients to FP16 (half precision)
 * NOTE: This does NOT effectively defend against DLG attack!
 * Included to demonstrate that precision reduction alone is insufficient.
 */
export function applyFP16Conversion(gradients: tf.Tensor[]): tf.Tensor[] {
  return gradients.map((g) =>
    tf.tidy(() => {
      // Simulate FP16 by reducing precision
      // FP16 has ~3.3 decimal digits of precision
      const data = g.dataSync();
      const fp16Data = new Float32Array(data.length);

      for (let i = 0; i < data.length; i++) {
        // Convert to FP16 range and back (approximate)
        const fp16 = Math.fround(data[i]);
        // Further reduce precision to simulate FP16 limitations
        fp16Data[i] = Math.round(fp16 * 1024) / 1024;
      }

      return tf.tensor(fp16Data, g.shape);
    })
  );
}

/**
 * Quantize gradients to INT8
 * This DOES defend but severely impacts model accuracy (drops to ~53.7%)
 */
export function applyInt8Quantization(gradients: tf.Tensor[]): tf.Tensor[] {
  return gradients.map((g) =>
    tf.tidy(() => {
      const data = g.dataSync();
      const min = Math.min(...Array.from(data));
      const max = Math.max(...Array.from(data));
      const scale = (max - min) / 255;

      if (scale === 0) return g.clone();

      // Quantize to INT8 range [0, 255] then back to float
      const int8Data = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const quantized = Math.round((data[i] - min) / scale);
        int8Data[i] = quantized * scale + min;
      }

      return tf.tensor(int8Data, g.shape);
    })
  );
}

/**
 * Simulate secure aggregation (Bonawitz et al.)
 * Aggregates gradients from multiple clients
 * Server only sees the SUM, not individual gradients
 * This prevents gradient inversion on individual clients!
 */
export function simulateSecureAggregation(
  clientGradients: tf.Tensor[][], // Array of gradient lists from each client
  numClients: number
): tf.Tensor[] {
  if (clientGradients.length === 0) return [];

  return tf.tidy(() => {
    const numLayers = clientGradients[0].length;
    const aggregatedGrads: tf.Tensor[] = [];

    for (let layer = 0; layer < numLayers; layer++) {
      // Sum gradients across all clients for this layer
      const layerGrads = clientGradients.map((cg) => cg[layer]);
      const summed = tf.addN(layerGrads);
      // Server receives sum, not individual gradients
      aggregatedGrads.push(summed);
    }

    return aggregatedGrads;
  });
}

/**
 * Get defense effectiveness info for display
 */
export function getDefenseInfo(
  type: string,
  params?: Record<string, number>
): {
  name: string;
  description: string;
  effectiveness: "none" | "partial" | "effective" | "strong";
  accuracyImpact: "none" | "low" | "medium" | "severe";
  notes: string;
} {
  switch (type) {
    case "gaussian":
      const gVar = params?.noiseVariance ?? 0.01;
      return {
        name: "Gaussian Noise",
        description: `Add Gaussian noise with variance ${gVar.toExponential(0)}`,
        effectiveness:
          gVar >= 0.01 ? (gVar >= 0.1 ? "strong" : "effective") : "partial",
        accuracyImpact:
          gVar >= 0.01 ? (gVar >= 0.1 ? "severe" : "medium") : "low",
        notes:
          gVar < 0.01
            ? "Attack still successful with artifacts"
            : gVar >= 0.1
              ? "Effectively prevents attack but model accuracy drops to <1%"
              : "Partially defends, accuracy drops to ~45%",
      };

    case "laplacian":
      const lVar = params?.noiseVariance ?? 0.01;
      return {
        name: "Laplacian Noise",
        description: `Add Laplacian noise with variance ${lVar.toExponential(0)}`,
        effectiveness:
          lVar >= 0.01 ? (lVar >= 0.1 ? "strong" : "effective") : "partial",
        accuracyImpact:
          lVar >= 0.01 ? (lVar >= 0.1 ? "severe" : "medium") : "low",
        notes: "Similar to Gaussian, slightly better defense at 10^-3",
      };

    case "pruning":
      const ratio = params?.pruningRatio ?? 0.1;
      return {
        name: "Gradient Pruning",
        description: `Prune ${(ratio * 100).toFixed(0)}% of smallest gradients`,
        effectiveness:
          ratio >= 0.3
            ? "strong"
            : ratio >= 0.2
              ? "effective"
              : ratio >= 0.1
                ? "partial"
                : "none",
        accuracyImpact: ratio >= 0.5 ? "medium" : "low",
        notes:
          ratio < 0.2
            ? "Attack still successful"
            : ratio >= 0.3
              ? "Attack fails, accuracy preserved with error compensation"
              : "Artifacts appear in recovered image",
      };

    case "fp16":
      return {
        name: "Half Precision (FP16)",
        description: "Convert gradients to 16-bit floating point",
        effectiveness: "none",
        accuracyImpact: "none",
        notes: "Does NOT prevent the attack! Precision is still sufficient for DLG.",
      };

    case "int8":
      return {
        name: "INT8 Quantization",
        description: "Quantize gradients to 8-bit integers",
        effectiveness: "effective",
        accuracyImpact: "severe",
        notes: "Prevents attack but model accuracy drops to ~53.7%",
      };

    case "secure_aggregation":
      return {
        name: "Secure Aggregation",
        description: "Server only receives sum of gradients across all clients",
        effectiveness: "strong",
        accuracyImpact: "none",
        notes:
          "Prevents individual gradient exposure. Attack can only target aggregated gradient.",
      };

    default:
      return {
        name: "No Defense",
        description: "Gradients shared without modification",
        effectiveness: "none",
        accuracyImpact: "none",
        notes: "Attack will succeed",
      };
  }
}

/**
 * Table 3 from paper: Accuracy vs Defendability tradeoff
 */
export const DEFENSE_TRADEOFF_TABLE = {
  original: { accuracy: 76.3, defends: false },
  "gaussian-1e-4": { accuracy: 75.6, defends: false },
  "gaussian-1e-3": { accuracy: 73.3, defends: false },
  "gaussian-1e-2": { accuracy: 45.3, defends: true },
  "gaussian-1e-1": { accuracy: 1.0, defends: true },
  "laplacian-1e-4": { accuracy: 75.6, defends: false },
  "laplacian-1e-3": { accuracy: 73.4, defends: false },
  "laplacian-1e-2": { accuracy: 46.2, defends: true },
  "laplacian-1e-1": { accuracy: 1.0, defends: true },
  fp16: { accuracy: 76.1, defends: false },
  int8: { accuracy: 53.7, defends: true },
};

/**
 * Table 1 from paper: Iterations required for batch attack
 */
export const BATCH_ITERATIONS_TABLE = {
  1: 270,
  2: 602,
  4: 1173,
  8: 2711,
};

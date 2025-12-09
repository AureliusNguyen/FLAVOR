// DLG (Deep Leakage from Gradients) Attack Implementation
// Based on: Zhu et al. "Deep Leakage from Gradients" (NeurIPS 2019)
import * as tf from "@tensorflow/tfjs";

export interface DlgAttackConfig {
  // Shape of a single image, e.g. [28, 28, 1]
  inputShape: [number, number, number];
  numClasses: number;

  maxIterations: number;
  learningRate: number;

  // Run N optimization steps between UI updates
  updateEvery?: number;

  // Called every `updateEvery` iterations
  onIteration?: (info: {
    iter: number;
    distance: number;
    dummyImage: tf.Tensor; // [H,W,C]
    dummyProbs: tf.Tensor; // [numClasses]
  }) => void;

  // Function to check if attack should stop (for UI cancel button)
  shouldStop?: () => boolean;
}

export interface DlgAttackResult {
  recoveredImage: tf.Tensor; // [H,W,C]
  recoveredProbs: tf.Tensor; // [numClasses]
  history: number[]; // distance over iterations
}

/**
 * Compute gradients of loss w.r.t. model's trainable weights
 * for a given input image and label
 */
export function computeModelGradients(
  model: tf.LayersModel,
  image: tf.Tensor, // [1, H, W, C]
  label: tf.Tensor // [1, numClasses] one-hot
): tf.Tensor[] {
  return tf.tidy(() => {
    const { grads } = tf.variableGrads(() => {
      const logits = model.predict(image) as tf.Tensor;
      const loss = tf.losses.softmaxCrossEntropy(label, logits);
      return loss as tf.Scalar;
    });

    // Collect gradients in order of trainable weights
    const gradientList = model.trainableWeights.map((w) => {
      const grad = grads[w.name];
      return grad ? grad.clone() : tf.zeros(w.shape as number[]);
    });

    return gradientList;
  });
}

/**
 * DLG Attack: Recover training data from gradients
 *
 * Algorithm:
 * 1. Initialize dummy input x' and label y' randomly
 * 2. Compute dummy gradients ∇W' from (x', y')
 * 3. Minimize ||∇W' - ∇W||² by updating x' and y'
 * 4. Return recovered x' and y' when converged
 */
export async function dlgAttack(
  model: tf.LayersModel,
  targetGrads: tf.Tensor[], // Gradients to match (same order as model.trainableWeights)
  config: DlgAttackConfig
): Promise<DlgAttackResult> {
  const {
    inputShape,
    numClasses,
    maxIterations,
    learningRate,
    updateEvery = 10,
    onIteration,
    shouldStop,
  } = config;

  const distanceHistory: number[] = [];

  // Initialize dummy image and label as trainable variables
  // Image initialized with random noise
  const dummyImage = tf.variable(
    tf.randomNormal(inputShape).mul(0.5).add(0.5).clipByValue(0, 1)
  );
  // Label logits initialized randomly
  const dummyLabelLogits = tf.variable(tf.randomNormal([numClasses]));

  // Use Adam optimizer for better convergence
  const optimizer = tf.train.adam(learningRate);

  // Gradient matching loss function
  const gradMatchingLoss = (): tf.Scalar => {
    return tf.tidy(() => {
      // Get softmax of label logits
      const dummyLabel = tf.softmax(dummyLabelLogits);

      // Expand dims for batch dimension: [H,W,C] -> [1,H,W,C]
      const dummyImageBatch = dummyImage.expandDims(0);
      const dummyLabelBatch = dummyLabel.expandDims(0);

      // Compute dummy gradients
      const { grads } = tf.variableGrads(() => {
        const logits = model.predict(dummyImageBatch) as tf.Tensor;
        const loss = tf.losses.softmaxCrossEntropy(dummyLabelBatch, logits);
        return loss as tf.Scalar;
      });

      // Collect dummy gradients in same order as target gradients
      const dummyGrads = model.trainableWeights.map((w) => {
        const grad = grads[w.name];
        return grad ? grad : tf.zeros(w.shape as number[]);
      });

      // Compute ||∇W' - ∇W||² (sum of squared differences)
      const diffSquares = dummyGrads.map((g, i) =>
        g.sub(targetGrads[i]).square().sum()
      );
      const distance = tf.addN(diffSquares);

      return distance as tf.Scalar;
    });
  };

  // Optimization loop
  for (let iter = 0; iter < maxIterations; iter++) {
    // Check for stop signal
    if (shouldStop?.()) break;

    // Minimize the gradient matching loss
    const distanceScalar = optimizer.minimize(
      gradMatchingLoss,
      /* returnCost */ true,
      [dummyImage, dummyLabelLogits]
    ) as tf.Scalar;

    // Extract distance value
    const distance = (await distanceScalar.data())[0];
    distanceHistory.push(distance);
    distanceScalar.dispose();

    // Clip image values to valid range [0, 1]
    tf.tidy(() => {
      const clipped = dummyImage.clipByValue(0, 1);
      dummyImage.assign(clipped);
    });

    // Update UI periodically
    const shouldUpdateUI =
      iter % updateEvery === 0 || iter === maxIterations - 1;

    if (shouldUpdateUI && onIteration) {
      // Clone tensors for UI (will be disposed by caller)
      const [imgSnap, probSnap] = tf.tidy(() => [
        dummyImage.clone(),
        tf.softmax(dummyLabelLogits).clone(),
      ]);

      onIteration({
        iter,
        distance,
        dummyImage: imgSnap,
        dummyProbs: probSnap,
      });

      // Let the browser breathe
      await tf.nextFrame();
    }
  }

  // Final result snapshots
  const [finalImage, finalProbs] = tf.tidy(() => [
    dummyImage.clone(),
    tf.softmax(dummyLabelLogits).clone(),
  ]);

  // Clean up optimization variables
  dummyImage.dispose();
  dummyLabelLogits.dispose();
  optimizer.dispose();

  return {
    recoveredImage: finalImage,
    recoveredProbs: finalProbs,
    history: distanceHistory,
  };
}

/**
 * DLG Attack for batched data
 * When batch size > 1, the attack becomes harder due to N! permutations
 * Paper's solution: update one sample at a time
 */
export async function dlgBatchAttack(
  model: tf.LayersModel,
  targetGrads: tf.Tensor[],
  config: DlgAttackConfig & { batchSize: number }
): Promise<{
  recoveredImages: tf.Tensor[]; // Array of [H,W,C]
  recoveredProbs: tf.Tensor[]; // Array of [numClasses]
  history: number[];
}> {
  const {
    inputShape,
    numClasses,
    maxIterations,
    learningRate,
    updateEvery = 10,
    onIteration,
    shouldStop,
    batchSize,
  } = config;

  const distanceHistory: number[] = [];

  // Initialize dummy images and labels for each sample in batch
  const dummyImages: tf.Variable[] = [];
  const dummyLabelLogits: tf.Variable[] = [];

  for (let i = 0; i < batchSize; i++) {
    dummyImages.push(
      tf.variable(
        tf.randomNormal(inputShape).mul(0.5).add(0.5).clipByValue(0, 1)
      )
    );
    dummyLabelLogits.push(tf.variable(tf.randomNormal([numClasses])));
  }

  const optimizer = tf.train.adam(learningRate);

  // Gradient matching loss for batched data
  const batchGradMatchingLoss = (): tf.Scalar => {
    return tf.tidy(() => {
      // Stack all dummy images and labels
      const batchedImages = tf.stack(dummyImages.map((img) => img));
      const batchedLabels = tf.stack(
        dummyLabelLogits.map((logits) => tf.softmax(logits))
      );

      // Compute dummy gradients for the batch
      const { grads } = tf.variableGrads(() => {
        const logits = model.predict(batchedImages) as tf.Tensor;
        const loss = tf.losses.softmaxCrossEntropy(batchedLabels, logits);
        return loss as tf.Scalar;
      });

      // Collect and match gradients
      const dummyGrads = model.trainableWeights.map((w) => {
        const grad = grads[w.name];
        return grad ? grad : tf.zeros(w.shape as number[]);
      });

      const diffSquares = dummyGrads.map((g, i) =>
        g.sub(targetGrads[i]).square().sum()
      );
      return tf.addN(diffSquares) as tf.Scalar;
    });
  };

  // Collect all variables for optimization
  const allVariables = [...dummyImages, ...dummyLabelLogits];

  // Optimization loop - update one sample at a time (paper's approach)
  for (let iter = 0; iter < maxIterations; iter++) {
    if (shouldStop?.()) break;

    // Update only one sample per iteration (round-robin)
    const sampleIdx = iter % batchSize;
    const varsToUpdate = [dummyImages[sampleIdx], dummyLabelLogits[sampleIdx]];

    const distanceScalar = optimizer.minimize(
      batchGradMatchingLoss,
      true,
      varsToUpdate
    ) as tf.Scalar;

    const distance = (await distanceScalar.data())[0];
    distanceHistory.push(distance);
    distanceScalar.dispose();

    // Clip image values
    tf.tidy(() => {
      const clipped = dummyImages[sampleIdx].clipByValue(0, 1);
      dummyImages[sampleIdx].assign(clipped);
    });

    // Update UI
    const shouldUpdateUI =
      iter % updateEvery === 0 || iter === maxIterations - 1;

    if (shouldUpdateUI && onIteration) {
      const [imgSnap, probSnap] = tf.tidy(() => [
        dummyImages[0].clone(), // Show first image for progress
        tf.softmax(dummyLabelLogits[0]).clone(),
      ]);

      onIteration({
        iter,
        distance,
        dummyImage: imgSnap,
        dummyProbs: probSnap,
      });

      await tf.nextFrame();
    }
  }

  // Final results
  const finalImages = dummyImages.map((img) => img.clone());
  const finalProbs = dummyLabelLogits.map((logits) =>
    tf.softmax(logits).clone()
  );

  // Cleanup
  dummyImages.forEach((img) => img.dispose());
  dummyLabelLogits.forEach((logits) => logits.dispose());
  optimizer.dispose();

  return {
    recoveredImages: finalImages,
    recoveredProbs: finalProbs,
    history: distanceHistory,
  };
}

/**
 * Compute Mean Squared Error between two images
 */
export function computeMSE(
  original: number[] | tf.Tensor,
  recovered: number[] | tf.Tensor
): number {
  return tf.tidy(() => {
    const origTensor =
      original instanceof tf.Tensor ? original : tf.tensor(original);
    const recTensor =
      recovered instanceof tf.Tensor ? recovered : tf.tensor(recovered);

    const mse = origTensor.sub(recTensor).square().mean();
    return mse.dataSync()[0];
  });
}

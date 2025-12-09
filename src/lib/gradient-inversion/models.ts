// Model architectures for DLG attack demonstration
import * as tf from "@tensorflow/tfjs";

/**
 * Simple CNN - Fast for demonstrations
 * 2 Conv layers + 2 FC layers
 * ~25K parameters
 */
export function createSimpleCNN(): tf.LayersModel {
  const model = tf.sequential();

  // Conv Layer 1: 28x28x1 -> 14x14x16
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      filters: 16,
      kernelSize: 3,
      padding: "same",
      activation: "relu",
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  // Conv Layer 2: 14x14x16 -> 7x7x32
  model.add(
    tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      padding: "same",
      activation: "relu",
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  // Flatten: 7x7x32 = 1568
  model.add(tf.layers.flatten());

  // FC Layer 1
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));

  // Output Layer
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * LeNet-5 Style Architecture
 * Classic architecture for MNIST
 * ~60K parameters
 */
export function createLeNet(): tf.LayersModel {
  const model = tf.sequential();

  // C1: 28x28x1 -> 28x28x6 (with padding to keep size)
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      filters: 6,
      kernelSize: 5,
      padding: "same",
      activation: "relu",
    })
  );

  // S2: 28x28x6 -> 14x14x6
  model.add(tf.layers.averagePooling2d({ poolSize: 2, strides: 2 }));

  // C3: 14x14x6 -> 10x10x16
  model.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 5,
      activation: "relu",
    })
  );

  // S4: 10x10x16 -> 5x5x16
  model.add(tf.layers.averagePooling2d({ poolSize: 2, strides: 2 }));

  // Flatten: 5x5x16 = 400
  model.add(tf.layers.flatten());

  // C5: FC with 120 units
  model.add(tf.layers.dense({ units: 120, activation: "relu" }));

  // F6: FC with 84 units
  model.add(tf.layers.dense({ units: 84, activation: "relu" }));

  // Output: 10 classes
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * Simplified ResNet-like Architecture
 * Includes skip connections (residual blocks)
 * ~100K parameters
 */
export function createMiniResNet(): tf.LayersModel {
  const input = tf.input({ shape: [28, 28, 1] });

  // Initial Conv
  let x = tf.layers
    .conv2d({
      filters: 16,
      kernelSize: 3,
      padding: "same",
      activation: "relu",
    })
    .apply(input) as tf.SymbolicTensor;

  // Residual Block 1
  const res1 = residualBlock(x, 16);

  // Residual Block 2 with downsampling
  const res2 = residualBlock(res1, 32, true);

  // Residual Block 3 with downsampling
  const res3 = residualBlock(res2, 64, true);

  // Global Average Pooling
  const gap = tf.layers.globalAveragePooling2d({}).apply(res3) as tf.SymbolicTensor;

  // Output
  const output = tf.layers
    .dense({ units: 10, activation: "softmax" })
    .apply(gap) as tf.SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: output });

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * Helper function to create a residual block
 */
function residualBlock(
  input: tf.SymbolicTensor,
  filters: number,
  downsample: boolean = false
): tf.SymbolicTensor {
  const strides = downsample ? 2 : 1;

  // Main path
  let x = tf.layers
    .conv2d({
      filters,
      kernelSize: 3,
      strides,
      padding: "same",
      activation: "relu",
    })
    .apply(input) as tf.SymbolicTensor;

  x = tf.layers
    .conv2d({
      filters,
      kernelSize: 3,
      padding: "same",
    })
    .apply(x) as tf.SymbolicTensor;

  // Shortcut path
  let shortcut: tf.SymbolicTensor;
  if (downsample) {
    shortcut = tf.layers
      .conv2d({
        filters,
        kernelSize: 1,
        strides,
        padding: "same",
      })
      .apply(input) as tf.SymbolicTensor;
  } else {
    // If filters match, use identity
    const inputFilters = (input.shape[3] as number) || 0;
    if (inputFilters === filters) {
      shortcut = input;
    } else {
      shortcut = tf.layers
        .conv2d({
          filters,
          kernelSize: 1,
          padding: "same",
        })
        .apply(input) as tf.SymbolicTensor;
    }
  }

  // Add and activate
  const added = tf.layers.add().apply([x, shortcut]) as tf.SymbolicTensor;
  const output = tf.layers.activation({ activation: "relu" }).apply(added) as tf.SymbolicTensor;

  return output;
}

/**
 * Get model info for display
 */
export function getModelInfo(modelType: string): {
  name: string;
  description: string;
  architecture: string[];
  estimatedParams: number;
} {
  switch (modelType) {
    case "simple":
      return {
        name: "Simple CNN",
        description: "Fast and lightweight CNN for quick demonstrations",
        architecture: [
          "Conv2D(16, 3x3) + ReLU + MaxPool",
          "Conv2D(32, 3x3) + ReLU + MaxPool",
          "Flatten",
          "Dense(64) + ReLU",
          "Dense(10) + Softmax",
        ],
        estimatedParams: 25000,
      };
    case "lenet":
      return {
        name: "LeNet-5",
        description: "Classic architecture designed for handwritten digit recognition",
        architecture: [
          "Conv2D(6, 5x5) + ReLU + AvgPool",
          "Conv2D(16, 5x5) + ReLU + AvgPool",
          "Flatten",
          "Dense(120) + ReLU",
          "Dense(84) + ReLU",
          "Dense(10) + Softmax",
        ],
        estimatedParams: 60000,
      };
    case "resnet":
      return {
        name: "Mini ResNet",
        description: "Simplified ResNet with skip connections for deeper representation",
        architecture: [
          "Conv2D(16, 3x3) + ReLU",
          "ResBlock(16)",
          "ResBlock(32, stride=2)",
          "ResBlock(64, stride=2)",
          "GlobalAvgPool",
          "Dense(10) + Softmax",
        ],
        estimatedParams: 100000,
      };
    default:
      return {
        name: "Unknown",
        description: "",
        architecture: [],
        estimatedParams: 0,
      };
  }
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import * as tf from "@tensorflow/tfjs";
import type {
  ModelType,
  DefenseType,
  AttackConfig,
  DefenseConfig,
  AttackProgress,
  GradientStats,
} from "@/types/gradient-inversion";
import { createSimpleCNN, createLeNet, createMiniResNet } from "@/lib/gradient-inversion/models";
import { dlgAttack } from "@/lib/gradient-inversion/dlg-attack";
import { applyDefense } from "@/lib/gradient-inversion/defenses";

interface GradientInversionContextType {
  // Model
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  model: tf.LayersModel | null;
  modelReady: boolean;
  modelLoading: boolean;
  parameterCount: number;
  initializeModel: () => Promise<void>;

  // Attack state
  attackRunning: boolean;
  attackProgress: AttackProgress | null;
  distanceHistory: number[];

  // Images
  victimImage: number[] | null;
  victimLabel: number;
  recoveredImage: number[] | null;
  recoveredProbs: number[] | null;
  setVictimImage: (image: number[], label: number) => void;

  // Batch mode
  batchSize: number;
  setBatchSize: (size: number) => void;
  batchImages: { image: number[]; label: number }[];
  setBatchImages: (images: { image: number[]; label: number }[]) => void;
  recoveredBatch: number[][];

  // Defense settings
  defenseConfig: DefenseConfig;
  setDefenseConfig: (config: DefenseConfig) => void;

  // Attack configuration
  attackConfig: AttackConfig;
  setAttackConfig: (config: AttackConfig) => void;

  // Gradient stats
  gradientStats: GradientStats[];

  // Actions
  runAttack: () => Promise<void>;
  runBatchAttack: () => Promise<void>;
  stopAttack: () => void;
  resetAttack: () => void;

  // Results
  finalMSE: number | null;
  attackSuccess: boolean | null;
}

const GradientInversionContext = createContext<GradientInversionContextType | null>(null);

export function useGradientInversion() {
  const context = useContext(GradientInversionContext);
  if (!context) {
    throw new Error("useGradientInversion must be used within a GradientInversionProvider");
  }
  return context;
}

const DEFAULT_ATTACK_CONFIG: AttackConfig = {
  maxIterations: 300,
  learningRate: 0.1,
  updateEvery: 10,
  batchSize: 1,
};

const DEFAULT_DEFENSE_CONFIG: DefenseConfig = {
  type: "none",
};

export function GradientInversionProvider({ children }: { children: React.ReactNode }) {
  // Model state
  const [selectedModel, setSelectedModel] = useState<ModelType>("simple");
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [parameterCount, setParameterCount] = useState(0);

  // Attack state
  const [attackRunning, setAttackRunning] = useState(false);
  const [attackProgress, setAttackProgress] = useState<AttackProgress | null>(null);
  const [distanceHistory, setDistanceHistory] = useState<number[]>([]);
  const stopSignalRef = useRef(false);

  // Images
  const [victimImage, setVictimImageState] = useState<number[] | null>(null);
  const [victimLabel, setVictimLabel] = useState<number>(0);
  const [recoveredImage, setRecoveredImage] = useState<number[] | null>(null);
  const [recoveredProbs, setRecoveredProbs] = useState<number[] | null>(null);

  // Batch mode
  const [batchSize, setBatchSize] = useState(1);
  const [batchImages, setBatchImages] = useState<{ image: number[]; label: number }[]>([]);
  const [recoveredBatch, setRecoveredBatch] = useState<number[][]>([]);

  // Defense and attack config
  const [defenseConfig, setDefenseConfig] = useState<DefenseConfig>(DEFAULT_DEFENSE_CONFIG);
  const [attackConfig, setAttackConfig] = useState<AttackConfig>(DEFAULT_ATTACK_CONFIG);

  // Gradient stats
  const [gradientStats, setGradientStats] = useState<GradientStats[]>([]);

  // Results
  const [finalMSE, setFinalMSE] = useState<number | null>(null);
  const [attackSuccess, setAttackSuccess] = useState<boolean | null>(null);

  const setVictimImage = useCallback((image: number[], label: number) => {
    setVictimImageState(image);
    setVictimLabel(label);
    setRecoveredImage(null);
    setRecoveredProbs(null);
    setFinalMSE(null);
    setAttackSuccess(null);
    setDistanceHistory([]);
  }, []);

  const initializeModel = useCallback(async () => {
    setModelLoading(true);
    setModelReady(false);

    // Dispose old model if exists
    if (model) {
      model.dispose();
    }

    try {
      // Ensure WebGL backend
      await tf.ready();

      let newModel: tf.LayersModel;
      switch (selectedModel) {
        case "lenet":
          newModel = createLeNet();
          break;
        case "resnet":
          newModel = createMiniResNet();
          break;
        case "simple":
        default:
          newModel = createSimpleCNN();
          break;
      }

      // Count parameters
      let totalParams = 0;
      newModel.trainableWeights.forEach((w) => {
        const shape = w.shape as number[];
        if (shape && shape.length > 0) {
          totalParams += shape.reduce((a, b) => a * b, 1);
        }
      });
      setParameterCount(totalParams);

      setModel(newModel);
      setModelReady(true);
    } catch (error) {
      console.error("Failed to initialize model:", error);
    } finally {
      setModelLoading(false);
    }
  }, [selectedModel, model]);

  const computeGradients = useCallback(
    (inputImage: number[], label: number): tf.Tensor[] | null => {
      if (!model) return null;

      return tf.tidy(() => {
        // Reshape image to [1, 28, 28, 1]
        const imageTensor = tf.tensor(inputImage).reshape([1, 28, 28, 1]);

        // One-hot encode label
        const labelTensor = tf.oneHot([label], 10);

        // Compute gradients w.r.t. trainable weights
        const { grads } = tf.variableGrads(() => {
          const logits = model.predict(imageTensor) as tf.Tensor;
          const loss = tf.losses.softmaxCrossEntropy(labelTensor, logits);
          return loss as tf.Scalar;
        });

        // Collect gradients in order of trainable weights
        const gradientList = model.trainableWeights.map((w) => {
          // Access gradients by variable name
          const grad = grads[w.name];
          return grad ? grad.clone() : tf.zeros(w.shape as number[]);
        });

        return gradientList;
      });
    },
    [model]
  );

  const computeGradientStats = useCallback(
    async (gradients: tf.Tensor[]): Promise<GradientStats[]> => {
      if (!model) return [];

      const stats: GradientStats[] = [];
      for (let i = 0; i < gradients.length; i++) {
        const g = gradients[i];
        const data = await g.data();
        const dataArray = Array.from(data);

        const min = Math.min(...dataArray);
        const max = Math.max(...dataArray);
        const mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const variance = dataArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataArray.length;
        const std = Math.sqrt(variance);
        const norm = Math.sqrt(dataArray.reduce((a, b) => a + b * b, 0));

        stats.push({
          layerName: model.trainableWeights[i].name,
          shape: g.shape,
          min,
          max,
          mean,
          std,
          norm,
        });
      }
      return stats;
    },
    [model]
  );

  const runAttack = useCallback(async () => {
    if (!model || !victimImage) return;

    setAttackRunning(true);
    stopSignalRef.current = false;
    setDistanceHistory([]);
    setRecoveredImage(null);
    setRecoveredProbs(null);
    setFinalMSE(null);
    setAttackSuccess(null);

    try {
      // Compute real gradients from victim image
      const realGradients = computeGradients(victimImage, victimLabel);
      if (!realGradients) {
        throw new Error("Failed to compute gradients");
      }

      // Compute and display gradient stats
      const stats = await computeGradientStats(realGradients);
      setGradientStats(stats);

      // Apply defense if configured
      let targetGradients = realGradients;
      if (defenseConfig.type !== "none") {
        targetGradients = applyDefense(realGradients, defenseConfig);
      }

      // Run DLG attack
      const result = await dlgAttack(model, targetGradients, {
        inputShape: [28, 28, 1],
        numClasses: 10,
        maxIterations: attackConfig.maxIterations,
        learningRate: attackConfig.learningRate,
        updateEvery: attackConfig.updateEvery,
        onIteration: (info) => {
          setAttackProgress({
            iteration: info.iter,
            distance: info.distance,
            currentImage: Array.from(info.dummyImage.dataSync()),
            currentProbs: Array.from(info.dummyProbs.dataSync()),
          });
          setDistanceHistory((prev) => [...prev, info.distance]);

          // Dispose the cloned tensors after extracting data
          info.dummyImage.dispose();
          info.dummyProbs.dispose();
        },
        shouldStop: () => stopSignalRef.current,
      });

      // Extract final results
      const finalImageData = Array.from(result.recoveredImage.dataSync());
      const finalProbsData = Array.from(result.recoveredProbs.dataSync());

      setRecoveredImage(finalImageData);
      setRecoveredProbs(finalProbsData);

      // Compute MSE
      const mse = victimImage.reduce((sum, pixel, i) => {
        return sum + Math.pow(pixel - finalImageData[i], 2);
      }, 0) / victimImage.length;
      setFinalMSE(mse);
      setAttackSuccess(mse < 0.1); // Threshold for success

      // Clean up
      result.recoveredImage.dispose();
      result.recoveredProbs.dispose();
      realGradients.forEach((g) => g.dispose());
      if (targetGradients !== realGradients) {
        targetGradients.forEach((g) => g.dispose());
      }
    } catch (error) {
      console.error("Attack failed:", error);
    } finally {
      setAttackRunning(false);
    }
  }, [
    model,
    victimImage,
    victimLabel,
    defenseConfig,
    attackConfig,
    computeGradients,
    computeGradientStats,
  ]);

  const runBatchAttack = useCallback(async () => {
    if (!model || batchImages.length === 0) return;

    setAttackRunning(true);
    stopSignalRef.current = false;
    setDistanceHistory([]);
    setRecoveredBatch([]);

    try {
      // Compute aggregated gradients from batch
      const batchGradients: tf.Tensor[][] = [];
      for (const { image, label } of batchImages) {
        const grads = computeGradients(image, label);
        if (grads) batchGradients.push(grads);
      }

      if (batchGradients.length === 0) return;

      // Average gradients (simulating what server sees)
      const avgGradients = tf.tidy(() => {
        return batchGradients[0].map((_, i) => {
          const layerGrads = batchGradients.map((bg) => bg[i]);
          const stacked = tf.stack(layerGrads);
          return stacked.mean(0);
        });
      });

      // Apply defense if configured
      let targetGradients = avgGradients;
      if (defenseConfig.type !== "none") {
        targetGradients = applyDefense(avgGradients, defenseConfig);
      }

      // For batch attack, we need to recover multiple images
      // This is a simplified version - in practice, you'd use the paper's batch attack variant
      const result = await dlgAttack(model, targetGradients, {
        inputShape: [28, 28, 1],
        numClasses: 10,
        maxIterations: attackConfig.maxIterations * batchSize, // More iterations for batches
        learningRate: attackConfig.learningRate,
        updateEvery: attackConfig.updateEvery,
        onIteration: (info) => {
          setAttackProgress({
            iteration: info.iter,
            distance: info.distance,
            currentImage: Array.from(info.dummyImage.dataSync()),
            currentProbs: Array.from(info.dummyProbs.dataSync()),
          });
          setDistanceHistory((prev) => [...prev, info.distance]);
          info.dummyImage.dispose();
          info.dummyProbs.dispose();
        },
        shouldStop: () => stopSignalRef.current,
      });

      const recoveredData = Array.from(result.recoveredImage.dataSync());
      setRecoveredBatch([recoveredData]);

      // Clean up
      result.recoveredImage.dispose();
      result.recoveredProbs.dispose();
      batchGradients.forEach((bg) => bg.forEach((g) => g.dispose()));
      avgGradients.forEach((g) => g.dispose());
      if (targetGradients !== avgGradients) {
        targetGradients.forEach((g) => g.dispose());
      }
    } catch (error) {
      console.error("Batch attack failed:", error);
    } finally {
      setAttackRunning(false);
    }
  }, [model, batchImages, batchSize, defenseConfig, attackConfig, computeGradients]);

  const stopAttack = useCallback(() => {
    stopSignalRef.current = true;
  }, []);

  const resetAttack = useCallback(() => {
    stopSignalRef.current = true;
    setAttackRunning(false);
    setAttackProgress(null);
    setDistanceHistory([]);
    setRecoveredImage(null);
    setRecoveredProbs(null);
    setRecoveredBatch([]);
    setFinalMSE(null);
    setAttackSuccess(null);
    setGradientStats([]);
  }, []);

  const value: GradientInversionContextType = {
    // Model
    selectedModel,
    setSelectedModel,
    model,
    modelReady,
    modelLoading,
    parameterCount,
    initializeModel,

    // Attack state
    attackRunning,
    attackProgress,
    distanceHistory,

    // Images
    victimImage,
    victimLabel,
    recoveredImage,
    recoveredProbs,
    setVictimImage,

    // Batch mode
    batchSize,
    setBatchSize,
    batchImages,
    setBatchImages,
    recoveredBatch,

    // Defense settings
    defenseConfig,
    setDefenseConfig,

    // Attack config
    attackConfig,
    setAttackConfig,

    // Gradient stats
    gradientStats,

    // Actions
    runAttack,
    runBatchAttack,
    stopAttack,
    resetAttack,

    // Results
    finalMSE,
    attackSuccess,
  };

  return (
    <GradientInversionContext.Provider value={value}>
      {children}
    </GradientInversionContext.Provider>
  );
}

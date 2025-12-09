// Types for Gradient Inversion Attack Visualization

export type ModelType = 'simple' | 'lenet' | 'resnet';

export type DefenseType = 'none' | 'gaussian' | 'laplacian' | 'pruning' | 'fp16' | 'int8';

export type AttackScenario = 'server' | 'peer';

export interface ModelConfig {
  type: ModelType;
  name: string;
  description: string;
  parameterCount: number;
  layers: LayerInfo[];
}

export interface LayerInfo {
  name: string;
  type: string;
  outputShape: number[];
  params: number;
}

export interface AttackConfig {
  maxIterations: number;
  learningRate: number;
  updateEvery: number;
  batchSize: number;
}

export interface DefenseConfig {
  type: DefenseType;
  noiseVariance?: number;  // For gaussian/laplacian
  pruningRatio?: number;   // For pruning (0-1)
}

export interface AttackResult {
  success: boolean;
  iterations: number;
  finalDistance: number;
  mse: number;
  recoveredImage: number[];
  recoveredLabel: number;
  groundTruthLabel: number;
}

export interface AttackProgress {
  iteration: number;
  distance: number;
  currentImage: number[];  // Flattened pixel array
  currentProbs: number[];  // Softmax probabilities
}

export interface BatchAttackResult {
  batchSize: number;
  iterationsRequired: number;
  recoveredImages: number[][];
  groundTruthImages: number[][];
  mseValues: number[];
  orderMatched: boolean;
}

export interface DefenseResult {
  defenseType: DefenseType;
  defenseParams: Record<string, number>;
  attackSuccess: boolean;
  recoveredImage: number[] | null;
  mse: number;
  modelAccuracyImpact: number;  // Percentage accuracy drop
}

// For visualization of attack scenarios
export interface AttackScenarioConfig {
  type: AttackScenario;
  attackerPosition: 'server' | 'client';
  victimCount: number;
  description: string;
}

// Gradient statistics for display
export interface GradientStats {
  layerName: string;
  shape: number[];
  min: number;
  max: number;
  mean: number;
  std: number;
  norm: number;
}

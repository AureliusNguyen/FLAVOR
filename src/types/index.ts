// Core types for FLAVOR

export interface Client {
  id: number;
  name: string;
  dataSize: number;
  digits: number[];
  color: string;
}

export interface Share {
  x: number;
  y: bigint;
  clientId: number;
}

export interface Polynomial {
  coefficients: bigint[];
  degree: number;
}

export interface ShamirConfig {
  threshold: number;  // t - minimum shares needed
  totalShares: number;  // n - total shares created
  prime: bigint;
}

export interface ModelWeights {
  layer: string;
  weights: number[];
  shape: number[];
}

export interface TrainingMetrics {
  round: number;
  clientId: number;
  loss: number;
  accuracy: number;
  epoch: number;
}

export interface AggregationResult {
  round: number;
  globalLoss: number;
  globalAccuracy: number;
  participatingClients: number[];
}

export interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  isActive: boolean;
  onComplete?: () => void;
  stepIndex: number;
  totalSteps: number;
}

export interface Section {
  id: string;
  title: string;
  steps: Step[];
}

export interface NavigationState {
  currentSection: number;
  currentStep: number;
  totalSections: number;
  isAnimating: boolean;
}

export interface MNISTSample {
  pixels: number[];
  label: number;
}

export interface ClientData {
  clientId: number;
  samples: MNISTSample[];
  distribution: number[];  // count per digit 0-9
}

export interface VisualizationState {
  phase: 'idle' | 'animating' | 'complete';
  progress: number;
  data: unknown;
}

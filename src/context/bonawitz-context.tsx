"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ProtocolConfig, BonawitzClient, DropoutPhase } from '@/types/secure-aggregation';
import { DH_PARAMS } from '@/lib/crypto/diffie-hellman';
import {
  initializeClients,
  executeRound0,
  executeRound1,
  executeRound2,
  executeRound4,
  verifyProtocolCorrectness,
} from '@/lib/secure-aggregation/bonawitz-protocol';
import { generateDigitPixels } from '@/lib/data/mnist';

// MNIST sample image type
interface MNISTSampleImage {
  pixels: number[];  // Normalized [0, 1] for MNISTImage component
  label: number;
}

// MNIST-related types
interface MNISTClientData {
  clientId: number;
  distribution: number[]; // Count of each digit 0-9
  primaryDigits: number[]; // Primary digits this client has (non-IID)
  sampleImages: MNISTSampleImage[]; // Sample images for visualization
}

interface BonawitzContextType {
  // Configuration
  config: ProtocolConfig;
  setConfig: (config: ProtocolConfig) => void;

  // Clients
  clients: BonawitzClient[];
  setClients: React.Dispatch<React.SetStateAction<BonawitzClient[]>>;
  clientNames: Map<number, string>;
  clientColors: Map<number, string>;
  clientInputVectors: Map<number, number[]>;

  // MNIST data
  mnistClientData: MNISTClientData[];

  // Protocol execution
  protocolData: any;

  // Dropout controls
  toggleClientDropout: (clientId: number, phase: DropoutPhase) => void;

  // Training state
  trainingComplete: boolean;
  setTrainingComplete: (complete: boolean) => void;

  // Current protocol round for visualization
  currentProtocolRound: number;
  setCurrentProtocolRound: (round: number) => void;

  // Reset function
  resetProtocol: () => void;
}

const BonawitzContext = createContext<BonawitzContextType | null>(null);

// Client names matching the simple workflow (medical institutions)
const CLIENT_NAME_TEMPLATES = Array.from({ length: 20 }, (_, i) => `Device ${i + 1}`);

// Generate color dynamically based on index and total count using HSL
function generateClientColor(index: number, total: number): string {
  const hue = (index / total) * 360;
  return `hsl(${hue}, 70%, 55%)`;
}

/**
 * Generate non-IID MNIST data distribution for a client
 * Each client has a skewed distribution favoring 2-3 digits
 * Also generates sample images for visualization
 */
function generateMNISTDistribution(clientId: number, samplesPerClient: number = 100): MNISTClientData {
  const distribution = new Array(10).fill(0);
  const sampleImages: MNISTSampleImage[] = [];

  // Primary digits for this client (non-IID)
  const primaryDigit1 = (clientId - 1) % 10;
  const primaryDigit2 = clientId % 10;
  const secondaryDigit = (clientId + 4) % 10;

  for (let i = 0; i < samplesPerClient; i++) {
    const rand = Math.random();
    let digit: number;

    if (rand < 0.40) {
      digit = primaryDigit1;
    } else if (rand < 0.70) {
      digit = primaryDigit2;
    } else if (rand < 0.85) {
      digit = secondaryDigit;
    } else {
      digit = Math.floor(Math.random() * 10);
    }

    distribution[digit]++;

    // Generate sample images for the first 10 samples (for visualization)
    if (i < 10) {
      sampleImages.push({
        pixels: generateDigitPixels(digit, true), // normalized for MNISTImage
        label: digit
      });
    }
  }

  return {
    clientId,
    distribution,
    primaryDigits: [primaryDigit1, primaryDigit2],
    sampleImages
  };
}

/**
 * Generate gradient vector based on MNIST data distribution
 * Simulates gradient updates from training on non-IID data
 *
 * The gradient vector represents model weight updates, which are influenced by:
 * - Which digits the client has (non-IID)
 * - The relative frequency of each digit
 */
function generateGradientFromMNIST(
  clientId: number,
  mnistData: MNISTClientData,
  vectorDim: number
): number[] {
  const vector: number[] = [];
  const total = mnistData.distribution.reduce((a, b) => a + b, 0);

  // Normalize distribution to probabilities
  const probs = mnistData.distribution.map(count => count / total);

  // Generate gradient vector based on distribution
  // This simulates how training on different data leads to different gradients
  for (let j = 0; j < vectorDim; j++) {
    // Each dimension influenced by different digit combinations
    let value = 0;

    // Primary influence: probability of primary digits
    const primaryInfluence = probs[mnistData.primaryDigits[0]] + probs[mnistData.primaryDigits[1]];

    // Gradient component based on dimension index and client's data distribution
    // Using a deterministic formula based on client data to ensure reproducibility
    const digitIndex = j % 10;
    const digitProb = probs[digitIndex];

    // Gradient value: combination of digit probability and some base component
    // Centered around 0, range roughly [-0.5, 0.5]
    value = (digitProb - 0.1) * 2 + (primaryInfluence - 0.5) * 0.3;

    // Add small deterministic variation based on client and dimension
    value += ((clientId * 13 + j * 7) % 100) / 500 - 0.1;

    // Clamp to reasonable range
    value = Math.max(-0.5, Math.min(0.5, value));

    vector.push(value);
  }

  return vector;
}

export function BonawitzProvider({ children }: { children: React.ReactNode }) {
  // Protocol configuration
  // Using higher Q (2^12) for better quantization precision
  // R must be larger than N * Q * max_input_value to avoid overflow
  const [config, setConfig] = useState<ProtocolConfig>({
    N: 7,
    T: 5,
    k: 3,
    R: 2 ** 16,  // Default modulus for demonstration
    Q: 2 ** 12, // Higher quantization factor for ~0.0002 resolution
    shamirPrime: 65537, // 2^16 + 1, industry standard Fermat prime
    dhPrime: DH_PARAMS.p,
    dhGenerator: DH_PARAMS.g,
  });

  const [trainingComplete, setTrainingComplete] = useState(false);
  const [currentProtocolRound, setCurrentProtocolRound] = useState(0);

  // Generate MNIST data distribution for each client (non-IID)
  const mnistClientData = useMemo(() => {
    const data: MNISTClientData[] = [];
    for (let i = 1; i <= config.N; i++) {
      data.push(generateMNISTDistribution(i, 100));
    }
    return data;
  }, [config.N]);

  // Generate client input vectors based on MNIST data
  const clientInputVectors = useMemo(() => {
    const vectors = new Map<number, number[]>();
    for (let i = 1; i <= config.N; i++) {
      const mnistData = mnistClientData[i - 1];
      const vector = generateGradientFromMNIST(i, mnistData, config.k);
      vectors.set(i, vector);
    }
    return vectors;
  }, [config.N, config.k, mnistClientData]);

  // Generate client names (medical institution names like simple workflow)
  const clientNames = useMemo(() => {
    const names = new Map<number, string>();
    for (let i = 1; i <= config.N; i++) {
      names.set(i, CLIENT_NAME_TEMPLATES[(i - 1) % CLIENT_NAME_TEMPLATES.length]);
    }
    return names;
  }, [config.N]);

  // Generate client colors dynamically
  const clientColors = useMemo(() => {
    const colors = new Map<number, string>();
    for (let i = 1; i <= config.N; i++) {
      colors.set(i, generateClientColor(i - 1, config.N));
    }
    return colors;
  }, [config.N]);

  // Initialize clients
  const [clients, setClients] = useState<BonawitzClient[]>(() =>
    initializeClients(
      Array.from({ length: config.N }, (_, i) => i + 1),
      clientInputVectors,
      clientNames,
      clientColors,
      config
    )
  );

  // Reinitialize clients when config changes
  const reinitializeClients = useCallback(() => {
    // Generate new MNIST data
    const newMnistData: MNISTClientData[] = [];
    for (let i = 1; i <= config.N; i++) {
      newMnistData.push(generateMNISTDistribution(i, 100));
    }

    // Generate gradient vectors from MNIST
    const newVectors = new Map<number, number[]>();
    for (let i = 1; i <= config.N; i++) {
      const mnistData = newMnistData[i - 1];
      const vector = generateGradientFromMNIST(i, mnistData, config.k);
      newVectors.set(i, vector);
    }

    // Generate names and colors
    const newNames = new Map<number, string>();
    for (let i = 1; i <= config.N; i++) {
      newNames.set(i, CLIENT_NAME_TEMPLATES[(i - 1) % CLIENT_NAME_TEMPLATES.length]);
    }

    const newColors = new Map<number, string>();
    for (let i = 1; i <= config.N; i++) {
      newColors.set(i, generateClientColor(i - 1, config.N));
    }

    setClients(
      initializeClients(
        Array.from({ length: config.N }, (_, i) => i + 1),
        newVectors,
        newNames,
        newColors,
        config
      )
    );
  }, [config]);

  // Auto-reinitialize clients when config.N or config.k changes
  useEffect(() => {
    reinitializeClients();
  }, [config.N, config.k, reinitializeClients]);

  // Protocol data computation
  // Always compute round0 and round1 together since DH keys (conceptually Round 0)
  // are generated in our round1 function
  const protocolData = useMemo(() => {
    const round0 = executeRound0(clients);
    const round1 = executeRound1(clients, config);

    if (currentProtocolRound <= 1) {
      return { round0, round1 };
    }

    if (currentProtocolRound === 2) {
      const round2 = executeRound2(clients, round1, config);
      return { round0, round1, round2 };
    }

    const round2 = executeRound2(clients, round1, config);

    if (currentProtocolRound >= 3) {
      const round4 = executeRound4(clients, round1, round2, config);
      const verification = verifyProtocolCorrectness(clients, round4, config);
      return { round0, round1, round2, round4, verification };
    }

    return { round0, round1 };
  }, [clients, config, currentProtocolRound]);

  // Dropout toggle
  const toggleClientDropout = useCallback((clientId: number, phase: DropoutPhase) => {
    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? { ...c, dropoutPhase: phase, isDropped: phase !== 'alive' }
          : c
      )
    );
  }, []);

  // Reset protocol
  const resetProtocol = useCallback(() => {
    setCurrentProtocolRound(0);
    setTrainingComplete(false);
    reinitializeClients();
  }, [reinitializeClients]);

  return (
    <BonawitzContext.Provider value={{
      config,
      setConfig,
      clients,
      setClients,
      clientNames,
      clientColors,
      clientInputVectors,
      mnistClientData,
      protocolData,
      toggleClientDropout,
      trainingComplete,
      setTrainingComplete,
      currentProtocolRound,
      setCurrentProtocolRound,
      resetProtocol,
    }}>
      {children}
    </BonawitzContext.Provider>
  );
}

export function useBonawitz() {
  const context = useContext(BonawitzContext);
  if (!context) {
    throw new Error('useBonawitz must be used within BonawitzProvider');
  }
  return context;
}

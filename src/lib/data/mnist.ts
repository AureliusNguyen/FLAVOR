// MNIST data generation and distribution utilities
// Using pre-computed synthetic data for visualization

import { ClientData, MNISTSample, Client } from '@/types';

// Client colors for visualization
const CLIENT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
];

// Generate synthetic MNIST-like pixel data (28x28 = 784 pixels)
// Returns pixel values in range [0, 255] for synthetic display
// or [0, 1] for normalized display (when normalized=true)
export function generateDigitPixels(digit: number, normalized: boolean = false): number[] {
  const pixels = new Array(784).fill(0);

  // Simplified digit patterns (just for visualization)
  const patterns: Record<number, number[][]> = {
    0: [[10,11,12,13,14,15,16], [38,44], [66,72], [94,100], [122,128], [150,156], [178,184], [206,212], [234,235,236,237,238,239,240]],
    1: [[12,13], [40,41], [68,69], [96,97], [124,125], [152,153], [180,181], [208,209], [236,237]],
    2: [[10,11,12,13,14,15,16], [44], [72], [94,95,96,97,98,99,100], [122], [150], [178,179,180,181,182,183,184]],
    3: [[10,11,12,13,14,15,16], [44], [72], [94,95,96,97,98,99,100], [128], [156], [178,179,180,181,182,183,184]],
    4: [[10,16], [38,44], [66,72], [94,95,96,97,98,99,100], [128], [156], [184]],
    5: [[10,11,12,13,14,15,16], [38], [66], [94,95,96,97,98,99,100], [128], [156], [178,179,180,181,182,183,184]],
    6: [[10,11,12,13,14,15,16], [38], [66], [94,95,96,97,98,99,100], [122,128], [150,156], [178,179,180,181,182,183,184]],
    7: [[10,11,12,13,14,15,16], [44], [72], [100], [128], [156], [184]],
    8: [[10,11,12,13,14,15,16], [38,44], [66,72], [94,95,96,97,98,99,100], [122,128], [150,156], [178,179,180,181,182,183,184]],
    9: [[10,11,12,13,14,15,16], [38,44], [66,72], [94,95,96,97,98,99,100], [128], [156], [178,179,180,181,182,183,184]],
  };

  const pattern = patterns[digit] || patterns[0];
  for (const row of pattern) {
    for (const idx of row) {
      if (idx < 784) {
        // Add some noise and variation
        pixels[idx] = 200 + Math.floor(Math.random() * 55);
        // Add neighboring pixels for thickness
        if (idx + 1 < 784) pixels[idx + 1] = 150 + Math.floor(Math.random() * 50);
        if (idx + 28 < 784) pixels[idx + 28] = 150 + Math.floor(Math.random() * 50);
      }
    }
  }

  // Normalize to [0, 1] range if requested (for MNISTImage component)
  if (normalized) {
    return pixels.map(p => p / 255);
  }

  return pixels;
}

// Generate non-IID distribution for clients
// Each client has a skewed distribution favoring certain digits
export function generateClientData(numClients: number = 10, samplesPerClient: number = 100): ClientData[] {
  const clientData: ClientData[] = [];

  for (let clientId = 0; clientId < numClients; clientId++) {
    const samples: MNISTSample[] = [];
    const distribution = new Array(10).fill(0);

    // Create non-IID distribution - each client favors 2-3 digits
    const primaryDigits = [clientId % 10, (clientId + 1) % 10];
    const secondaryDigit = (clientId + 5) % 10;

    for (let i = 0; i < samplesPerClient; i++) {
      let digit: number;
      const rand = Math.random();

      if (rand < 0.4) {
        digit = primaryDigits[0];
      } else if (rand < 0.7) {
        digit = primaryDigits[1];
      } else if (rand < 0.85) {
        digit = secondaryDigit;
      } else {
        digit = Math.floor(Math.random() * 10);
      }

      samples.push({
        pixels: generateDigitPixels(digit),
        label: digit
      });
      distribution[digit]++;
    }

    clientData.push({
      clientId,
      samples,
      distribution
    });
  }

  return clientData;
}

// Generate client metadata
export function generateClients(numClients: number = 10): Client[] {
  const clients: Client[] = [];
  const clientNames = [
    'Hospital A', 'Hospital B', 'Clinic C', 'Lab D', 'Center E',
    'Facility F', 'Institute G', 'Practice H', 'Unit I', 'Site J'
  ];

  for (let i = 0; i < numClients; i++) {
    clients.push({
      id: i,
      name: clientNames[i] || `Client ${i + 1}`,
      dataSize: 80 + Math.floor(Math.random() * 40), // 80-120 samples
      digits: [(i % 10), ((i + 1) % 10)], // Primary digits
      color: CLIENT_COLORS[i % CLIENT_COLORS.length]
    });
  }

  return clients;
}

// Pre-computed training results for visualization
export interface PrecomputedRound {
  round: number;
  clientMetrics: {
    clientId: number;
    loss: number;
    accuracy: number;
    localUpdates: number[];
  }[];
  globalAccuracy: number;
  globalLoss: number;
}

export function generatePrecomputedTraining(numRounds: number = 10, numClients: number = 10): PrecomputedRound[] {
  const rounds: PrecomputedRound[] = [];

  for (let round = 0; round < numRounds; round++) {
    const clientMetrics = [];

    for (let clientId = 0; clientId < numClients; clientId++) {
      // Simulate improving metrics over rounds with some noise
      const baseAccuracy = 0.1 + (round / numRounds) * 0.8;
      const noise = (Math.random() - 0.5) * 0.1;
      const accuracy = Math.min(0.99, Math.max(0.1, baseAccuracy + noise));
      const loss = 2.5 - (round / numRounds) * 2.3 + (Math.random() - 0.5) * 0.3;

      // Simulate local weight updates (simplified)
      const localUpdates = Array.from({ length: 10 }, () =>
        (Math.random() - 0.5) * 0.1
      );

      clientMetrics.push({
        clientId,
        loss: Math.max(0.1, loss),
        accuracy,
        localUpdates
      });
    }

    // Global metrics (average with improvement trend)
    const globalAccuracy = 0.15 + (round / numRounds) * 0.78 + (Math.random() - 0.5) * 0.02;
    const globalLoss = 2.3 - (round / numRounds) * 2.1 + (Math.random() - 0.5) * 0.1;

    rounds.push({
      round,
      clientMetrics,
      globalAccuracy: Math.min(0.98, globalAccuracy),
      globalLoss: Math.max(0.1, globalLoss)
    });
  }

  return rounds;
}

// Export singleton data for consistent visualization
export const defaultClients = generateClients(10);
export const defaultClientData = generateClientData(10, 100);
export const defaultTrainingRounds = generatePrecomputedTraining(10, 10);

/**
 * Bonawitz et al. (2017) Secure Aggregation Protocol
 * arXiv:1611.04482
 *
 * Implements the core protocol logic with complete mathematical steps
 */

import {
  performPairwiseKeyExchange,
  getPairwiseSeed,
  DH_PARAMS,
} from '../crypto/diffie-hellman';
import { generateAllPairwiseMasks, generateSelfMask } from '../crypto/prg';
import {
  distributeVectorShares,
  collectAndReconstructVector,
  Share,
} from '../crypto/shamir-sss';
import { quantizeVector, dequantizeAndAverage } from './quantization';
import { modulo } from '../crypto/shamir-sss';
import type {
  ProtocolConfig,
  BonawitzClient,
  Round0Data,
  Round1Data,
  Round2Data,
  Round4Data,
  PairwiseMasks,
  ClientMaskBreakdown,
  DropoutRecoveryDetails,
  ComputationStep,
  VerificationResult,
} from '@/types/secure-aggregation';

/**
 * Initialize clients with input vectors
 * Round 0: Advertisement / Setup
 */
export function initializeClients(
  clientIds: number[],
  inputVectors: Map<number, number[]>,
  clientNames: Map<number, string>,
  clientColors: Map<number, string>,
  config: ProtocolConfig
): BonawitzClient[] {
  return clientIds.map((id) => {
    const inputVector = inputVectors.get(id) || [];
    const quantizedVector = quantizeVector(inputVector, config.Q, config.R);

    return {
      id,
      name: clientNames.get(id) || `Client ${id}`,
      color: clientColors.get(id) || '#6366f1',
      inputVector,
      quantizedVector,
      dhKeyPair: null,
      pairwiseMasks: null,
      selfMask: null,
      selfMaskShares: null,
      maskedInput: null,
      dropoutPhase: 'alive',
      isDropped: false,
    };
  });
}

/**
 * Round 0: Create initial protocol state
 */
export function executeRound0(clients: BonawitzClient[]): Round0Data {
  const aliveClients = clients
    .filter((c) => c.dropoutPhase === 'alive')
    .map((c) => c.id);

  return {
    clients,
    totalClients: clients.length,
    aliveClients,
  };
}

/**
 * Round 1: Pairwise key exchange using Diffie-Hellman
 *
 * NOTE: In the real protocol, ALL clients participate in key exchange (Round 0/1)
 * before any dropouts occur. Dropouts happen AFTER keys are exchanged.
 * So we generate keys for ALL clients, not just currently "alive" ones.
 */
export function executeRound1(
  clients: BonawitzClient[],
  config: ProtocolConfig
): Round1Data {
  // ALL clients participate in key exchange - dropout happens later
  const allClientIds = clients.map((c) => c.id);

  // Track which clients are still alive at the end of Round 1
  const aliveClients = clients
    .filter((c) => c.dropoutPhase === 'alive' || c.dropoutPhase === 'after_advertise')
    .map((c) => c.id);

  // Perform DH key exchange for ALL clients (keys exchanged before dropout)
  const { keyPairs, sharedSeeds } = performPairwiseKeyExchange(allClientIds, {
    p: config.dhPrime,
    g: config.dhGenerator,
  });

  // Update client states
  clients.forEach((client) => {
    client.dhKeyPair = keyPairs.get(client.id) || null;
  });

  return {
    dhKeyPairs: keyPairs,
    sharedSeeds,
    aliveClients,
  };
}

/**
 * Round 2: Masked input collection
 * Each client generates masks and submits masked input
 *
 * NOTE: In the Bonawitz protocol:
 * - 'alive' and 'after_masked_input' clients participate and submit
 * - 'after_masked_input' means dropped AFTER Round 2 (submitted, then can't reveal in Round 4)
 * - Clients who dropped earlier don't participate in Round 2
 */
export function executeRound2(
  clients: BonawitzClient[],
  round1Data: Round1Data,
  config: ProtocolConfig
): Round2Data {
  // Clients who participate in Round 2 masking and submission
  // 'after_masked_input' = submitted masked input, then dropped before Round 4
  const participatingClients = clients
    .filter(
      (c) =>
        c.dropoutPhase === 'alive' ||
        c.dropoutPhase === 'after_masked_input'
    )
    .map((c) => c.id);

  const maskedInputs = new Map<number, number[]>();
  const selfMasks = new Map<number, number[]>();
  const selfMaskShares = new Map<number, Map<number, Share[]>>();
  const pairwiseMasksMap = new Map<number, PairwiseMasks>();

  // Each participating client generates masks and masked input
  for (const client of clients) {
    if (!participatingClients.includes(client.id)) continue;

    // Generate pairwise masks with all other participating clients
    const otherClients = participatingClients.filter((id) => id !== client.id);
    const pairwiseMasks = generateAllPairwiseMasks(
      client.id,
      otherClients,
      round1Data.sharedSeeds,
      config.k,
      config.R
    );

    // Generate self-mask b_u
    const selfMask = generateSelfMask(client.id, config.k, config.R);

    // Secret-share self-mask to other participating clients
    const recipientIds = otherClients;
    const shares = distributeVectorShares(
      selfMask,
      config.T,
      recipientIds,
      config.shamirPrime
    );

    // Compute masked input: s_u = x̃_u + Σp_uv (v>u) - Σp_vu (v<u) + b_u
    const maskedInput = computeMaskedInput(
      client.quantizedVector,
      client.id,
      pairwiseMasks,
      selfMask,
      config.R
    );

    // Store results
    client.pairwiseMasks = {
      generated: pairwiseMasks,
      received: pairwiseMasks, // Same masks, just viewed differently
    };
    client.selfMask = selfMask;
    client.selfMaskShares = shares;
    client.maskedInput = maskedInput;

    pairwiseMasksMap.set(client.id, client.pairwiseMasks);
    selfMasks.set(client.id, selfMask);
    selfMaskShares.set(client.id, shares);

    // All participating clients submit their masked input
    maskedInputs.set(client.id, maskedInput);
  }

  // Server aggregates masked inputs
  const serverAggregatedMasked = aggregateMaskedInputs(maskedInputs, config.R);

  // Identify clients who submitted but then dropped (can't reveal self-mask in Round 4)
  const submittedIds = Array.from(maskedInputs.keys());
  const droppedClients = clients
    .filter(c => c.dropoutPhase === 'after_masked_input')
    .map(c => c.id);

  // Alive clients are those who can reveal their self-mask in Round 4
  const aliveInRound4 = submittedIds.filter(id => !droppedClients.includes(id));

  return {
    maskedInputs,
    selfMasks,
    selfMaskShares,
    pairwiseMasksMap,
    serverAggregatedMasked,
    aliveClients: aliveInRound4,
    droppedClients,
  };
}

/**
 * Compute masked input for a single client
 * Formula: s_u = x̃_u + Σ(p_uv for v > u) - Σ(p_vu for v < u) + b_u (mod R)
 */
export function computeMaskedInput(
  quantizedInput: number[],
  clientId: number,
  pairwiseMasks: Map<number, number[]>,
  selfMask: number[],
  modulus: number
): number[] {
  const k = quantizedInput.length;
  const result = [...quantizedInput];

  // Add pairwise masks: p_uv for v > clientId
  for (const [peerId, mask] of pairwiseMasks) {
    if (peerId > clientId) {
      for (let i = 0; i < k; i++) {
        result[i] = modulo(result[i] + mask[i], modulus);
      }
    }
  }

  // Subtract pairwise masks: p_vu for v < clientId
  for (const [peerId, mask] of pairwiseMasks) {
    if (peerId < clientId) {
      for (let i = 0; i < k; i++) {
        result[i] = modulo(result[i] - mask[i], modulus);
      }
    }
  }

  // Add self-mask
  for (let i = 0; i < k; i++) {
    result[i] = modulo(result[i] + selfMask[i], modulus);
  }

  return result;
}

/**
 * Server aggregates masked inputs
 * Σs_u mod R
 */
export function aggregateMaskedInputs(
  maskedInputs: Map<number, number[]>,
  modulus: number
): number[] | null {
  if (maskedInputs.size === 0) return null;

  const firstInput = Array.from(maskedInputs.values())[0];
  const k = firstInput.length;
  const sum = new Array(k).fill(0);

  for (const maskedInput of maskedInputs.values()) {
    for (let i = 0; i < k; i++) {
      sum[i] = modulo(sum[i] + maskedInput[i], modulus);
    }
  }

  return sum;
}

/**
 * Round 4: Unmasking and dropout recovery
 *
 * Handles two types of dropped clients:
 * 1. after_masked_input: Submitted masked input, then dropped (pairwise masks cancelled)
 * 2. before_masked_input: Dropped before submitting (pairwise masks need reconstruction)
 */
export function executeRound4(
  clients: BonawitzClient[],
  round1Data: Round1Data,
  round2Data: Round2Data,
  config: ProtocolConfig
): Round4Data {
  const aliveClients = round2Data.aliveClients;
  const droppedClients = round2Data.droppedClients;

  // Determine which dropped clients submitted and which didn't
  const submittedIds = Array.from(round2Data.maskedInputs.keys());
  const droppedWhoSubmitted = droppedClients.filter(id => submittedIds.includes(id));
  const droppedWhoDidntSubmit = droppedClients.filter(id => !submittedIds.includes(id));

  // Collect self-masks from alive clients (revealed directly to server)
  const aliveSelfMasks = new Map<number, number[]>();
  for (const aliveId of aliveClients) {
    const selfMask = round2Data.selfMasks.get(aliveId);
    if (selfMask) {
      aliveSelfMasks.set(aliveId, selfMask);
    }
  }

  // Reconstruct self-masks for dropped clients who submitted
  // (their self-masks are in the aggregated sum and need to be removed)
  const reconstructedSelfMasks = new Map<number, number[]>();

  for (const droppedId of droppedWhoSubmitted) {
    // Collect shares from alive clients
    const sharesFromAlive = new Map<number, Share[]>();

    for (const aliveId of aliveClients) {
      const sharesHeld = round2Data.selfMaskShares.get(droppedId);
      if (sharesHeld) {
        const share = sharesHeld.get(aliveId);
        if (share) {
          sharesFromAlive.set(aliveId, share);
        }
      }
    }

    // Reconstruct using Shamir SSS
    if (sharesFromAlive.size >= config.T) {
      const reconstructed = collectAndReconstructVector(
        sharesFromAlive,
        config.shamirPrime
      );
      reconstructedSelfMasks.set(droppedId, reconstructed);
    }
  }

  // Only reconstruct pairwise masks for clients who dropped BEFORE submitting
  // (their pairwise masks with alive clients didn't cancel)
  const reconstructedPairwiseMasks = reconstructPairwiseMasksForDropped(
    droppedWhoDidntSubmit,  // Only clients who didn't submit
    aliveClients,
    round1Data.sharedSeeds,
    config
  );

  // Unmask the aggregated result
  // Need to subtract: alive clients' self-masks + reconstructed dropped self-masks + pairwise masks
  const unmaskedSum = unmaskAggregatedResult(
    round2Data.serverAggregatedMasked!,
    aliveSelfMasks,
    reconstructedSelfMasks,
    reconstructedPairwiseMasks,
    config.R
  );

  // Dequantize and average - use number of clients who submitted (not just alive)
  // The sum includes inputs from all clients who submitted (alive + dropped who submitted)
  const numSubmitted = submittedIds.length;
  const dequantizedAverage = dequantizeAndAverage(
    unmaskedSum,
    numSubmitted,
    config.Q,
    config.R
  );

  return {
    droppedClients,
    aliveClients,
    reconstructedSelfMasks,
    reconstructedPairwiseMasks,
    unmaskedSum,
    dequantizedAverage,
    // Include recovered sum for visualization (same as unmaskedSum)
    recoveredSum: unmaskedSum,
  };
}

/**
 * Reconstruct pairwise masks for dropped clients
 * Returns: Map of droppedId -> net pairwise mask contribution
 */
export function reconstructPairwiseMasksForDropped(
  droppedClients: number[],
  aliveClients: number[],
  sharedSeeds: Map<string, number>,
  config: ProtocolConfig
): Map<number, number[]> {
  const reconstructedMasks = new Map<number, number[]>();

  for (const droppedId of droppedClients) {
    const netMask = new Array(config.k).fill(0);

    // For each alive client, compute pairwise mask with dropped client
    for (const aliveId of aliveClients) {
      const seed = getPairwiseSeed(droppedId, aliveId, sharedSeeds);
      if (!seed) continue;

      const mask = generateAllPairwiseMasks(
        droppedId,
        [aliveId],
        sharedSeeds,
        config.k,
        config.R
      ).get(aliveId)!;

      // Net contribution depends on relative ordering
      if (droppedId < aliveId) {
        // Dropped client would have added p_uv
        // Alive client subtracted p_vu (same as p_uv)
        // Net: +p_uv for dropped, -p_uv for alive → Need to remove +p_uv
        for (let i = 0; i < config.k; i++) {
          netMask[i] = modulo(netMask[i] + mask[i], config.R);
        }
      } else {
        // Dropped client would have subtracted p_vu
        // Alive client added p_uv (same as p_vu)
        // Net: -p_vu for dropped, +p_vu for alive → Need to remove -p_vu (add p_vu)
        for (let i = 0; i < config.k; i++) {
          netMask[i] = modulo(netMask[i] - mask[i], config.R);
        }
      }
    }

    reconstructedMasks.set(droppedId, netMask);
  }

  return reconstructedMasks;
}

/**
 * Unmask the aggregated result by removing all masks
 *
 * The aggregated masked sum is: Σs_u = Σx̃_u + Σb_u (pairwise masks cancel among alive clients)
 * But if there are dropouts, we also have residual pairwise masks.
 *
 * To recover Σx̃_u:
 * 1. Subtract b_u from alive clients (revealed directly)
 * 2. Subtract reconstructed b_u from dropped clients (via Shamir)
 * 3. Subtract residual pairwise masks involving dropped clients
 */
export function unmaskAggregatedResult(
  aggregatedMasked: number[],
  aliveSelfMasks: Map<number, number[]>,
  reconstructedSelfMasks: Map<number, number[]>,
  reconstructedPairwiseMasks: Map<number, number[]>,
  modulus: number
): number[] {
  const k = aggregatedMasked.length;
  const result = [...aggregatedMasked];

  // Remove alive clients' self-masks (revealed directly to server)
  for (const selfMask of aliveSelfMasks.values()) {
    for (let i = 0; i < k; i++) {
      result[i] = modulo(result[i] - selfMask[i], modulus);
    }
  }

  // Remove reconstructed self-masks (from dropped clients)
  for (const selfMask of reconstructedSelfMasks.values()) {
    for (let i = 0; i < k; i++) {
      result[i] = modulo(result[i] - selfMask[i], modulus);
    }
  }

  // Remove reconstructed pairwise masks (involving dropped clients)
  for (const pairwiseMask of reconstructedPairwiseMasks.values()) {
    for (let i = 0; i < k; i++) {
      result[i] = modulo(result[i] - pairwiseMask[i], modulus);
    }
  }

  return result;
}

/**
 * Get detailed mask breakdown for a specific client (for visualization)
 */
export function getClientMaskBreakdown(
  client: BonawitzClient,
  config: ProtocolConfig
): ClientMaskBreakdown {
  const steps: ComputationStep[] = [];
  let stepNum = 1;

  // Step 1: Quantized input
  steps.push({
    step: stepNum++,
    description: 'Start with quantized input vector',
    formula: '\\tilde{x}_u',
    values: { quantizedInput: client.quantizedVector },
    result: client.quantizedVector,
  });

  const pairwiseMasksAdded: { peerId: number; mask: number[] }[] = [];
  const pairwiseMasksSubtracted: { peerId: number; mask: number[] }[] = [];

  if (client.pairwiseMasks) {
    for (const [peerId, mask] of client.pairwiseMasks.generated) {
      if (peerId > client.id) {
        pairwiseMasksAdded.push({ peerId, mask });
      } else {
        pairwiseMasksSubtracted.push({ peerId, mask });
      }
    }
  }

  return {
    clientId: client.id,
    quantizedInput: client.quantizedVector,
    pairwiseMasksAdded,
    pairwiseMasksSubtracted,
    selfMask: client.selfMask || [],
    maskedResult: client.maskedInput || [],
    steps,
  };
}

/**
 * Get dropout recovery details for visualization
 */
export function getDropoutRecoveryDetails(
  droppedClientId: number,
  round2Data: Round2Data,
  round4Data: Round4Data,
  config: ProtocolConfig
): DropoutRecoveryDetails | null {
  if (!round4Data.reconstructedSelfMasks.has(droppedClientId)) {
    return null;
  }

  // Self-mask reconstruction
  const sharesHeld = round2Data.selfMaskShares.get(droppedClientId);
  const shares: Share[] = [];

  if (sharesHeld) {
    for (const [holderId, holderShares] of sharesHeld) {
      if (round4Data.aliveClients.includes(holderId)) {
        // Take first element's share as example
        if (holderShares.length > 0) {
          shares.push(holderShares[0]);
        }
      }
    }
  }

  const reconstructedMask = round4Data.reconstructedSelfMasks.get(droppedClientId)!;

  // Pairwise mask reconstruction
  const pairwiseContributions: {
    aliveClientId: number;
    mask: number[];
    direction: 'add' | 'subtract';
  }[] = [];

  // This would need more detailed tracking - simplified for now
  const totalPairwiseMask = round4Data.reconstructedPairwiseMasks.get(droppedClientId) || [];

  return {
    droppedClientId,
    selfMaskReconstruction: {
      requiredShares: config.T,
      availableShares: shares.length,
      shares,
      reconstructedMask,
      steps: [],
    },
    pairwiseMaskReconstruction: {
      pairwiseContributions,
      totalMask: totalPairwiseMask,
    },
  };
}

/**
 * Verify protocol correctness by comparing with direct computation
 *
 * Important: The protocol computes the sum of clients in U₂ (those who submitted masked inputs),
 * which includes both:
 * - Alive clients (U₃)
 * - Late dropouts (U₂ \ U₃) - clients who submitted but then dropped
 *
 * Early dropouts (U₁ \ U₂) are NOT included in the sum since they never submitted.
 */
export function verifyProtocolCorrectness(
  clients: BonawitzClient[],
  round4Data: Round4Data,
  config: ProtocolConfig
): VerificationResult {
  // U₂ = clients who submitted masked inputs (alive + late dropouts)
  // This is exactly what the protocol aggregates
  const u2Clients = clients.filter(
    (c) => c.dropoutPhase === 'alive' || c.dropoutPhase === 'after_masked_input'
  );

  if (u2Clients.length === 0) {
    return {
      passed: false,
      message: 'No clients submitted masked inputs',
      expected: [],
      actual: [],
      details: ['No U₂ clients to verify'],
    };
  }

  // Compute true average directly from U₂ clients
  const u2Inputs = u2Clients.map((c) => c.inputVector);
  const k = u2Inputs[0].length;
  const trueSum = new Array(k).fill(0);

  for (const input of u2Inputs) {
    for (let i = 0; i < k; i++) {
      trueSum[i] += input[i];
    }
  }

  const trueAverage = trueSum.map((sum) => sum / u2Inputs.length);

  // Compare with protocol result
  const protocolAverage = round4Data.dequantizedAverage!;
  const epsilon = 0.01; // Tolerance for quantization error

  const passed = protocolAverage.every(
    (val, i) => Math.abs(val - trueAverage[i]) < epsilon
  );

  return {
    passed,
    message: passed
      ? 'Protocol reconstruction matches true average!'
      : 'Mismatch detected between protocol and true average',
    expected: trueAverage,
    actual: protocolAverage,
    details: passed
      ? [`All values within tolerance (U₂ = ${u2Clients.length} clients)`]
      : protocolAverage.map(
          (val, i) =>
            `Element ${i}: expected ${trueAverage[i].toFixed(4)}, got ${val.toFixed(4)}`
        ),
  };
}

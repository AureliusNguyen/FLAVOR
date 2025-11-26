/**
 * Type definitions for Bonawitz et al. (2017) Secure Aggregation Protocol
 */

import { Share } from '@/lib/crypto/shamir-sss';

/**
 * Protocol configuration parameters
 */
export interface ProtocolConfig {
  N: number; // Total number of clients
  T: number; // Threshold (minimum clients needed for reconstruction)
  k: number; // Vector dimension (length of input vectors)
  R: number; // Modulus for finite field arithmetic
  Q: number; // Quantization factor
  shamirPrime: number; // Prime for Shamir secret sharing
  dhPrime: bigint; // Prime for Diffie-Hellman
  dhGenerator: bigint; // Generator for Diffie-Hellman
}

/**
 * Client dropout phases (when a client can drop out)
 */
export type DropoutPhase =
  | 'never_joined' // Client never participated
  | 'after_advertise' // Dropped after R0 (Advertisement)
  | 'after_share_keys' // Dropped after R1 (Key Exchange)
  | 'after_masked_input' // Dropped after R2 (Masked Input Collection)
  | 'alive'; // Client is still active

/**
 * Diffie-Hellman key pair
 */
export interface DHKeyPair {
  private: bigint;
  public: bigint;
}

/**
 * Pairwise mask data
 */
export interface PairwiseMasks {
  generated: Map<number, number[]>; // Masks generated for other clients (p_uv)
  received: Map<number, number[]>; // Masks received from other clients (p_vu)
}

/**
 * Client state in the Bonawitz protocol
 */
export interface BonawitzClient {
  id: number;
  name: string;
  color: string;

  // Input data
  inputVector: number[]; // Original float gradient
  quantizedVector: number[]; // Quantized integer vector

  // Cryptographic state
  dhKeyPair: DHKeyPair | null; // Diffie-Hellman keys
  pairwiseMasks: PairwiseMasks | null; // p_uv masks
  selfMask: number[] | null; // b_u (random self-mask)
  selfMaskShares: Map<number, Share[]> | null; // Shares of b_u distributed to others

  // Protocol state
  maskedInput: number[] | null; // s_u (sent to server)
  dropoutPhase: DropoutPhase;
  isDropped: boolean;
}

/**
 * Round 0: Advertisement data
 */
export interface Round0Data {
  clients: BonawitzClient[];
  totalClients: number;
  aliveClients: number[];
}

/**
 * Round 1: Key Exchange data
 */
export interface Round1Data {
  dhKeyPairs: Map<number, DHKeyPair>;
  sharedSeeds: Map<string, number>; // "[minId,maxId]" -> seed
  aliveClients: number[];
}

/**
 * Round 2: Masked Input Collection data
 */
export interface Round2Data {
  maskedInputs: Map<number, number[]>; // clientId -> s_u
  selfMasks: Map<number, number[]>; // clientId -> b_u
  selfMaskShares: Map<number, Map<number, Share[]>>; // ownerId -> (holderId -> shares)
  pairwiseMasksMap: Map<number, PairwiseMasks>; // clientId -> masks
  serverAggregatedMasked: number[] | null; // Σs_u mod R
  aliveClients: number[];
  droppedClients: number[];
}

/**
 * Round 4: Unmasking data
 */
export interface Round4Data {
  droppedClients: number[];
  aliveClients: number[];
  reconstructedSelfMasks: Map<number, number[]>; // droppedId -> reconstructed b_u
  reconstructedPairwiseMasks: Map<number, number[]>; // droppedId -> net pairwise mask
  unmaskedSum: number[] | null; // Final sum Σx̃_u
  recoveredSum: number[] | null; // Same as unmaskedSum, for visualization
  dequantizedAverage: number[] | null; // Final average x̄
}

/**
 * Complete protocol state for all rounds
 */
export interface ProtocolState {
  config: ProtocolConfig;
  round0: Round0Data | null;
  round1: Round1Data | null;
  round2: Round2Data | null;
  round4: Round4Data | null;
}

/**
 * Computation step for visualization
 * Used to show step-by-step math breakdowns
 */
export interface ComputationStep {
  step: number;
  description: string;
  formula?: string; // LaTeX formula
  values?: Record<string, number | number[] | string>; // Variable values
  result?: number | number[] | string;
}

/**
 * Client mask breakdown for detailed view
 */
export interface ClientMaskBreakdown {
  clientId: number;
  quantizedInput: number[];
  pairwiseMasksAdded: { peerId: number; mask: number[] }[];
  pairwiseMasksSubtracted: { peerId: number; mask: number[] }[];
  selfMask: number[];
  maskedResult: number[];
  steps: ComputationStep[];
}

/**
 * Dropout recovery details for visualization
 */
export interface DropoutRecoveryDetails {
  droppedClientId: number;
  selfMaskReconstruction: {
    requiredShares: number;
    availableShares: number;
    shares: Share[];
    reconstructedMask: number[];
    steps: ComputationStep[];
  };
  pairwiseMaskReconstruction: {
    pairwiseContributions: {
      aliveClientId: number;
      mask: number[];
      direction: 'add' | 'subtract';
    }[];
    totalMask: number[];
  };
}

/**
 * Verification result
 */
export interface VerificationResult {
  passed: boolean;
  message: string;
  expected?: number[];
  actual?: number[];
  details?: string[];
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Math as MathTex, MathBlock } from '@/components/math';
import type { ProtocolConfig, BonawitzClient, DropoutPhase } from '@/types/secure-aggregation';
import {
  initializeClients,
  executeRound0,
  executeRound1,
  executeRound2,
  executeRound4,
  verifyProtocolCorrectness,
} from '@/lib/secure-aggregation/bonawitz-protocol';
import { DH_PARAMS } from '@/lib/crypto/diffie-hellman';
import { getQuantizationInfo } from '@/lib/secure-aggregation/quantization';

const ROUND_NAMES = [
  'Setup & Advertisement',
  'Pairwise Key Exchange',
  'Masked Input Collection',
  'Unmasking & Recovery',
  'Final Result',
];

interface Props {
  currentStep: number;
}

export function BonawitzSecureAggregationSection({ currentStep }: Props) {
  // Protocol configuration (user-controllable)
  const [config, setConfig] = useState<ProtocolConfig>({
    N: 7,
    T: 5,
    k: 3,
    R: 2 ** 16, // 65536
    Q: 2 ** 8,  // 256
    shamirPrime: 257,
    dhPrime: DH_PARAMS.p,
    dhGenerator: DH_PARAMS.g,
  });

  const [showDetailedMath, setShowDetailedMath] = useState(false);
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  // Initialize mock client data (simulated gradients)
  const clientInputVectors = useMemo(() => {
    const vectors = new Map<number, number[]>();
    for (let i = 1; i <= config.N; i++) {
      // Generate mock gradient vector for each client
      const vector: number[] = [];
      for (let j = 0; j < config.k; j++) {
        // Deterministic but varied values
        const value = ((i * 0.1 + j * 0.05) % 1) - 0.5;
        vector.push(value);
      }
      vectors.set(i, vector);
    }
    return vectors;
  }, [config.N, config.k]);

  const clientNames = useMemo(() => {
    const names = new Map<number, string>();
    const prefixes = ['Hospital', 'Clinic', 'Lab', 'Center', 'Facility', 'Institute', 'Practice', 'Unit', 'Site', 'Station'];
    for (let i = 1; i <= config.N; i++) {
      names.set(i, `${prefixes[(i - 1) % prefixes.length]} ${i}`);
    }
    return names;
  }, [config.N]);

  const clientColors = useMemo(() => {
    const colors = new Map<number, string>();
    const palette = [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e'
    ];
    for (let i = 1; i <= config.N; i++) {
      colors.set(i, palette[(i - 1) % palette.length]);
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

  // Recompute protocol when step changes or clients change
  const protocolData = useMemo(() => {
    if (currentStep === 0) {
      return { round0: executeRound0(clients) };
    }

    const round0 = executeRound0(clients);

    if (currentStep === 1) {
      const round1 = executeRound1(clients, config);
      return { round0, round1 };
    }

    const round1 = executeRound1(clients, config);

    if (currentStep === 2) {
      const round2 = executeRound2(clients, round1, config);
      return { round0, round1, round2 };
    }

    const round2 = executeRound2(clients, round1, config);

    if (currentStep >= 3) {
      const round4 = executeRound4(clients, round1, round2, config);
      const verification = verifyProtocolCorrectness(clients, round4, config);
      return { round0, round1, round2, round4, verification };
    }

    return { round0, round1 };
  }, [clients, config, currentStep]);

  const toggleClientDropout = (clientId: number, phase: DropoutPhase) => {
    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? { ...c, dropoutPhase: phase, isDropped: phase !== 'alive' }
          : c
      )
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 text-white">
      {/* Header */}
      <Card className="border-blue-500 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            Bonawitz et al. (2017) Secure Aggregation Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-300">
            This module simulates a <strong className="text-blue-300">robust, dropout-resistant secure aggregation protocol</strong> using{' '}
            <strong className="text-purple-300">pairwise masking</strong> and <strong className="text-green-300">secret-shared mask recovery</strong>,
            as used in federated learning research (arXiv:1611.04482).
          </p>
          <Alert className="bg-blue-900/30 border-blue-500">
            <AlertDescription className="text-gray-200">
              <strong className="text-blue-300">How it works:</strong> Clients mask their inputs using pairwise PRG masks
              (which cancel when summed) plus a secret self-mask. If clients drop out, the server
              reconstructs their masks using Shamir Secret Sharing and removes them to recover the
              true aggregate.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Round Progress */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Protocol Round:</span>
            <div className="flex gap-2">
              {ROUND_NAMES.map((name, idx) => (
                <Badge
                  key={idx}
                  variant={currentStep === idx ? 'default' : 'outline'}
                  className="text-xs"
                >
                  R{idx}: {name.split('&')[0]}
                </Badge>
              ))}
            </div>
          </div>
          <Progress value={(currentStep / (ROUND_NAMES.length - 1)) * 100} />
        </CardContent>
      </Card>

      {/* Step 0: Setup & Advertisement */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Round 0: Setup & Advertisement</h2>
            <p className="text-muted-foreground">
              Configure parameters and view client input vectors (gradients)
            </p>
          </div>

          {/* Parameters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Protocol Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Clients (N): <span className="text-blue-600">{config.N}</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={config.N}
                    onChange={(e) => setConfig({ ...config, N: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Threshold (T): <span className="text-blue-600">{config.T}</span>
                  </label>
                  <input
                    type="range"
                    min={Math.ceil(config.N / 2)}
                    max={config.N - 1}
                    value={config.T}
                    onChange={(e) => setConfig({ ...config, T: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Minimum alive clients needed for reconstruction</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Vector Dimension (k): <span className="text-blue-600">{config.k}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={config.k}
                    onChange={(e) => setConfig({ ...config, k: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Modulus (R): <span className="text-blue-400">{config.R.toLocaleString()}</span>
                  </label>
                  <Select
                    value={config.R.toString()}
                    onValueChange={(value) => setConfig({ ...config, R: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full bg-gray-900 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="256" className="text-white hover:bg-gray-800 focus:bg-gray-800">2^8 (256)</SelectItem>
                      <SelectItem value="65536" className="text-white hover:bg-gray-800 focus:bg-gray-800">2^16 (65,536)</SelectItem>
                      <SelectItem value="4294967296" className="text-white hover:bg-gray-800 focus:bg-gray-800">2^32 (4,294,967,296)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Quantization Formula:</h4>
                <MathBlock>{"\\tilde{x}_u = \\lfloor x_u \\times Q \\rfloor \\mod R"}</MathBlock>
                <p className="text-xs text-center mt-2">
                  where <MathTex>{"Q = 2^8 = 256"}</MathTex>, <MathTex>{`R = ${config.R.toLocaleString()}`}</MathTex>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clients */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Client Input Vectors (Mock Gradients)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {clients.map((client) => (
                  <Card key={client.id} className="border-2" style={{ borderColor: client.color }}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge style={{ backgroundColor: client.color }}>
                          Client {client.id}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium">{client.name}</p>
                      <div className="text-xs font-mono">
                        <div className="text-gray-400">Float:</div>
                        <div>[{client.inputVector.map(v => v.toFixed(3)).join(', ')}]</div>
                        <div className="text-gray-400 mt-1">Quantized:</div>
                        <div>[{client.quantizedVector.join(', ')}]</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Pairwise Key Exchange */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Round 1: Pairwise Key Exchange</h2>
            <p className="text-muted-foreground">
              Diffie-Hellman key agreement for all client pairs
            </p>
          </div>

          {protocolData.round1 && (
            <>
              {/* DH Parameters */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Diffie-Hellman Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                    <div>Prime (p): {config.dhPrime.toString()}</div>
                    <div>Generator (g): {config.dhGenerator.toString()}</div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Each client pair (u, v) computes a shared secret:{' '}
                      <MathTex>{"s_{uv} = g^{a_u \\cdot a_v} \\mod p"}</MathTex>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Example Pair (detailed) */}
              {protocolData.round1.dhKeyPairs.size >= 2 && (
                <Card className="border-green-500">
                  <CardHeader>
                    <CardTitle className="text-white">Example: Clients 1 & 2 Key Exchange</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const kp1 = protocolData.round1.dhKeyPairs.get(1);
                      const kp2 = protocolData.round1.dhKeyPairs.get(2);
                      const seed = protocolData.round1.sharedSeeds.get('1,2');

                      if (!kp1 || !kp2) return null;

                      return (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-900/30 p-3 rounded">
                              <p className="font-semibold">Client 1:</p>
                              <div className="font-mono text-xs space-y-1">
                                <div>Private: a₁ = {kp1.private.toString().slice(0, 20)}...</div>
                                <div>Public: A₁ = {kp1.public.toString().slice(0, 20)}...</div>
                              </div>
                            </div>
                            <div className="bg-purple-900/30 p-3 rounded">
                              <p className="font-semibold">Client 2:</p>
                              <div className="font-mono text-xs space-y-1">
                                <div>Private: a₂ = {kp2.private.toString().slice(0, 20)}...</div>
                                <div>Public: A₂ = {kp2.public.toString().slice(0, 20)}...</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-900/30 p-3 rounded text-center">
                            <p className="font-semibold mb-1">Shared Seed:</p>
                            <p className="font-mono text-sm">PRG_seed₁₂ = {seed}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              This seed generates pairwise mask p₁₂
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Pairwise Seeds Matrix */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Pairwise Seeds Matrix ({protocolData.round1.sharedSeeds.size} pairs)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr>
                          <th className="p-2 border"></th>
                          {Array.from({ length: config.N }, (_, i) => i + 1).map(i => (
                            <th key={i} className="p-2 border">C{i}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: config.N }, (_, i) => i + 1).map(u => (
                          <tr key={u}>
                            <th className="p-2 border">C{u}</th>
                            {Array.from({ length: config.N }, (_, j) => j + 1).map(v => {
                              if (u === v) {
                                return <td key={v} className="p-2 border text-center bg-gray-100">-</td>;
                              }
                              const minId = Math.min(u, v);
                              const maxId = Math.max(u, v);
                              const seed = protocolData.round1.sharedSeeds.get(`${minId},${maxId}`);
                              return (
                                <td key={v} className="p-2 border text-center">
                                  {seed || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Dropout Controls */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Dropout Control: After Key Exchange</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-3">
                    Select clients to drop out after this round:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {clients.map(client => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dropout-r1-${client.id}`}
                          checked={client.dropoutPhase === 'after_share_keys'}
                          onCheckedChange={(checked: boolean) =>
                            toggleClientDropout(
                              client.id,
                              checked ? 'after_share_keys' : 'alive'
                            )
                          }
                        />
                        <label htmlFor={`dropout-r1-${client.id}`} className="text-sm cursor-pointer">
                          Client {client.id}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </StepContent>

      {/* Step 2: Masked Input Collection - Due to size constraints, implementing core visualization */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Round 2: Masked Input Collection</h2>
            <p className="text-muted-foreground">
              Each client generates masks and submits masked input to server
            </p>
          </div>

          {protocolData.round2 && (
            <>
              {/* Masking Formula */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Masking Formula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <MathBlock>
                      {"s_u = \\tilde{x}_u + \\sum_{v>u} p_{uv} - \\sum_{v<u} p_{vu} + b_u \\pmod{R}"}
                    </MathBlock>
                    <div className="text-xs text-center mt-2 space-y-1">
                      <div><MathTex>{"\\tilde{x}_u"}</MathTex>: quantized input</div>
                      <div><MathTex>{"p_{uv}"}</MathTex>: pairwise PRG mask (from seed s_uv)</div>
                      <div><MathTex>{"b_u"}</MathTex>: self-mask (secret-shared to others)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Server Aggregation */}
              {protocolData.round2.serverAggregatedMasked && (
                <Card className="border-orange-500">
                  <CardHeader>
                    <CardTitle className="text-white">Server View: Aggregated Masked Sum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertDescription>
                        Server receives {protocolData.round2.maskedInputs.size} masked inputs
                        and computes:
                      </AlertDescription>
                    </Alert>
                    <div className="bg-orange-900/30 p-4 rounded-lg mt-3">
                      <div className="font-mono text-center">
                        Σs_u (mod {config.R}) =
                        [{protocolData.round2.serverAggregatedMasked.join(', ')}]
                      </div>
                      <p className="text-xs text-center mt-2 text-orange-700">
                        This is still masked! Needs unmasking in Round 4.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dropout Summary */}
              {protocolData.round2.droppedClients.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Dropped clients detected:</strong>{' '}
                    {protocolData.round2.droppedClients.join(', ')}
                    <br />
                    Will recover their masks in Round 4 using Shamir Secret Sharing.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </StepContent>

      {/* Step 3 & 4: Unmasking & Results */}
      <StepContent isActive={currentStep >= 3} stepIndex={3}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Round 4: Unmasking & Dropout Recovery</h2>
            <p className="text-muted-foreground">
              Reconstruct masks for dropped clients and recover true aggregate
            </p>
          </div>

          {protocolData.round4 && (
            <>
              {/* Recovery Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Dropout Recovery Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-900/30 p-4 rounded">
                      <p className="font-semibold">Alive Clients:</p>
                      <p className="font-mono">{protocolData.round4.aliveClients.join(', ')}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Count: {protocolData.round4.aliveClients.length} ≥ T={config.T} ✓
                      </p>
                    </div>
                    <div className="bg-red-900/30 p-4 rounded">
                      <p className="font-semibold">Dropped Clients:</p>
                      <p className="font-mono">
                        {protocolData.round4.droppedClients.length > 0
                          ? protocolData.round4.droppedClients.join(', ')
                          : 'None'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Need to reconstruct their masks
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Result */}
              {protocolData.round4.dequantizedAverage && (
                <Card className="border-green-500 bg-green-900/30">
                  <CardHeader>
                    <CardTitle className="text-green-300">Final Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-lg border border-green-500">
                      <p className="font-semibold mb-2 text-green-300">Recovered Average Gradient:</p>
                      <div className="font-mono text-lg text-center text-white">
                        [{protocolData.round4.dequantizedAverage.map(v => v.toFixed(6)).join(', ')}]
                      </div>
                    </div>

                    {protocolData.verification && (
                      <Alert variant={protocolData.verification.passed ? 'default' : 'destructive'}>
                        <AlertDescription>
                          <strong>{protocolData.verification.message}</strong>
                          {protocolData.verification.passed && (
                            <div className="mt-2 space-y-1 text-xs">
                              <div>Expected: [{protocolData.verification.expected?.map(v => v.toFixed(6)).join(', ')}]</div>
                              <div>Actual: [{protocolData.verification.actual?.map(v => v.toFixed(6)).join(', ')}]</div>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-blue-900/30 p-3 rounded">
                        <p className="font-semibold">Security:</p>
                        <p className="text-gray-300">Server never saw individual inputs</p>
                      </div>
                      <div className="bg-purple-900/30 p-3 rounded">
                        <p className="font-semibold">Privacy:</p>
                        <p className="text-gray-300">Pairwise masks cancelled completely</p>
                      </div>
                      <div className="bg-orange-900/30 p-3 rounded">
                        <p className="font-semibold">Robustness:</p>
                        <p className="text-gray-300">Recovered despite {protocolData.round4.droppedClients.length} dropouts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </StepContent>
    </div>
  );
}

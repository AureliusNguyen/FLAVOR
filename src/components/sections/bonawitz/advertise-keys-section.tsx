"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBonawitz } from "@/context/bonawitz-context";
import { MathBlock, Math as MathTex } from "@/components/math";
import { Key, Share2 } from "lucide-react";

interface Props {
  currentStep: number;
}

export function BonawitzAdvertiseKeysSection({ currentStep }: Props) {
  const { clients, config, protocolData, setCurrentProtocolRound } =
    useBonawitz();

  useEffect(() => {
    if (currentStep >= 0) {
      setCurrentProtocolRound(0);
    }
  }, [currentStep, setCurrentProtocolRound]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground">
      {/* Step 0: Round 0 Overview */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 0</Badge>
            <h2 className="text-3xl font-bold mb-2">Advertise Keys</h2>
            <p className="text-muted-foreground">
              Clients generate and broadcast cryptographic keys
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-yellow-400" />
                  Diffie-Hellman Key Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">
                  Each client generates a DH key pair for pairwise key
                  agreement:
                </p>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <MathBlock>
                    {
                      "a_u \\xleftarrow{\\$} \\mathbb{Z}_q, \\quad A_u = g^{a_u} \\mod p"
                    }
                  </MathBlock>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                    <strong>Example (Client 1):</strong>
                    {(() => {
                      const keyPair = protocolData.round1?.dhKeyPairs?.get(1);
                      if (!keyPair) return <span> Loading...</span>;
                      return (
                        <div className="font-mono mt-1">
                          <div>
                            1. Pick random:{" "}
                            <span className="text-yellow-600 dark:text-yellow-200">
                              <MathTex>{"a_1 = "}</MathTex> {keyPair.private.toString()}
                            </span>
                          </div>
                          <div>
                            2. Compute:{" "}
                            <span className="text-green-600 dark:text-green-200">
                              <MathTex>{`A_1 = ${config.dhGenerator.toString()}^{${keyPair.private.toString()}} \\bmod ${config.dhPrime.toString()} = ${keyPair.public.toString()}`}</MathTex>
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Private key <MathTex>{"a_u"}</MathTex> stays secret; public key <MathTex>{"A_u"}</MathTex> is broadcast
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-400" />
                  Secret Shares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">
                  Each client creates Shamir shares of their private key and
                  self-mask:
                </p>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="mb-2">
                    • Share private key <MathTex>{"a_u"}</MathTex> with{" "}
                    <MathTex>{"(T, N)"}</MathTex> threshold.  
                  </div>
                  <div>
                    • Share self-mask seed <MathTex>{"b_u"}</MathTex> with{" "}
                    <MathTex>{"(T, N)"}</MathTex> threshold
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enables reconstruction if client drops out
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">DH Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Prime (p):</span>
                    <div className="text-blue-600 dark:text-blue-200 break-all">
                      {config.dhPrime.toString()}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      (<MathTex>{"2^{16} + 1"}</MathTex>, a Fermat prime)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Generator (g):</span>
                    <div className="text-green-600 dark:text-green-200">
                      {config.dhGenerator.toString()}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      (primitive root<MathTex>{"\\mod p"}</MathTex>)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clients.map((client, idx) => {
              const keyPair = protocolData.round1?.dhKeyPairs?.get(client.id);
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="border-2 bg-card/80"
                    style={{
                      borderColor: client.color,
                    }}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-foreground text-xs font-bold"
                          style={{ backgroundColor: client.color }}
                        >
                          {client.id}
                        </div>
                        <span className="text-sm font-medium">
                          {client.name}
                        </span>
                      </div>
                      <div className="text-xs font-mono bg-muted p-2 rounded space-y-1">
                        <div>
                          <span className="text-muted-foreground">
                            Private <MathTex>{"a_u"}</MathTex>:
                          </span>
                          <span className="text-yellow-600 dark:text-yellow-200 ml-1">
                            {keyPair?.private?.toString() || "..."}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Public <MathTex>{"A_u"}</MathTex>:
                          </span>
                          <span className="text-green-600 dark:text-green-200 ml-1">
                            {keyPair?.public?.toString() || "..."}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                          <MathBlock>
                            {keyPair
                              ? `${config.dhGenerator.toString()}^{${keyPair.private.toString()}} \\mod ${config.dhPrime.toString()} = ${keyPair.public.toString()}`
                              : "..."}
                          </MathBlock>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </StepContent>

      {/* Step 1: Secret Sharing Setup */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Shamir Secret Sharing</h2>
            <p className="text-muted-foreground">
              Clients create (T, N) threshold shares for dropout recovery
            </p>
          </div>

          {/* Lagrange Interpolation Formula - Show First */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Lagrange Interpolation Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                Given <MathTex>{"T"}</MathTex> shares (points on the
                polynomial), we can reconstruct the secret using:
              </p>

              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <MathBlock>
                  {
                    "f(0) = \\sum_{i=1}^{T} y_i \\cdot L_i(0), \\quad \\text{where } L_i(0) = \\prod_{j \\neq i} \\frac{-x_j}{x_i - x_j}"
                  }
                </MathBlock>
              </div>

              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <p className="text-xs text-muted-foreground mb-2">
                  General form for any <MathTex>{"x"}</MathTex>:
                </p>
                <MathBlock>
                  {
                    "P(x) = \\sum_{i=1}^{T} y_i \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}"
                  }
                </MathBlock>
              </div>
            </CardContent>
          </Card>

          {/* Polynomial Construction and Evaluations */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-400" />
                Polynomial Construction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <MathBlock>
                  {
                    "f(x) = s + a_1 x + a_2 x^2 + \\ldots + a_{T-1} x^{T-1} \\mod p"
                  }
                </MathBlock>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Secret <MathTex>{"s"}</MathTex> is hidden as the constant
                  term; coefficients{" "}
                  <MathTex>{"a_1, \\ldots, a_{T-1}"}</MathTex> are random
                </p>
              </div>

              {/* Live Example using Client 1's DH Private Key */}
              <div className="bg-muted p-4 rounded-lg border border-purple-500/30">
                <p className="font-semibold text-purple-600 dark:text-purple-200 mb-3">
                  Live Example: Sharing Client 1's Private Key (<MathTex>{`T = ${config.T.toString()}`}</MathTex>, <MathTex>{`N = ${config.N.toString()}`}</MathTex>)
                </p>
                {(() => {
                  // Use actual DH private key from protocol as the secret
                  const keyPair = protocolData.round1?.dhKeyPairs?.get(1);
                  if (!keyPair) {
                    return (
                      <div className="text-muted-foreground">
                        Loading protocol data...
                      </div>
                    );
                  }

                  // Convert BigInt to number for Shamir visualization (safe since shamirPrime is small)
                  const secret = Number(
                    keyPair.private % BigInt(config.shamirPrime)
                  );
                  const p = config.shamirPrime;

                  // Generate random polynomial coefficients properly
                  // f(x) = secret + a1*x + a2*x^2 + ... + a_{T-1}*x^{T-1}
                  // Use seeded random based on secret for reproducibility in visualization
                  const seededRandom = (seed: number, i: number) => {
                    const x = Math.sin(seed * 9999 + i * 7777) * 10000;
                    return Math.abs(x - Math.floor(x));
                  };

                  const coeffs: number[] = [secret];
                  for (let i = 1; i < config.T; i++) {
                    // Random coefficient in range [1, p-1]
                    const rand = seededRandom(secret, i);
                    coeffs.push(Math.floor(rand * (p - 2)) + 1);
                  }

                  // Evaluate f(x) for x = 0, 1, 2, ..., N
                  const evaluations: { x: number; fx: number }[] = [];
                  for (let x = 0; x <= config.N; x++) {
                    let result = 0;
                    let xPower = 1;
                    for (const c of coeffs) {
                      result = (((result + c * xPower) % p) + p) % p;
                      xPower = (xPower * x) % p;
                    }
                    evaluations.push({ x, fx: result });
                  }

                  return (
                    <div className="space-y-3 text-sm">
                      <div className="font-mono">
                        <span className="text-muted-foreground">Secret to share: </span>
                        <span className="text-yellow-600 dark:text-yellow-200">
                          <MathTex>{"s = "}</MathTex> {secret} (Client 1's DH private key<MathTex>{"\\mod p"}</MathTex>)
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">
                          Polynomial (degree {config.T - 1}) with random
                          coefficients:
                        </span>
                        <div className="text-blue-600 dark:text-blue-200 mt-1 overflow-x-auto">
                          <MathBlock>
                            {`f(x) = ${coeffs
                              .map((c, i) => {
                                if (i === 0) return c.toLocaleString();
                                if (i === 1) return `${c.toLocaleString()}x`;
                                return `${c.toLocaleString()}x^{${i}}`;
                              })
                              .join(" + ")} \\mod ${p.toLocaleString()}`}
                          </MathBlock>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          where <MathTex>{"p = "}</MathTex> {p.toLocaleString()}{" "}
                          = <MathTex>{"2^{16} + 1"}</MathTex> (Fermat prime)
                        </div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <span className="text-muted-foreground font-semibold">
                          Share evaluations{" "}
                          <MathTex>{"f(0), f(1), \\ldots, f(N)"}</MathTex>:
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {evaluations.map(({ x, fx }) => (
                            <div
                              key={x}
                              className={`p-2 rounded ${
                                x === 0
                                  ? "bg-yellow-900/30 border border-yellow-500/50"
                                  : "bg-card"
                              }`}
                            >
                              <span
                                className={`font-mono ${
                                  x === 0 ? "text-yellow-600 dark:text-yellow-200" : "text-green-600 dark:text-green-200"
                                }`}
                              >
                                <MathTex>{`f(${x}) = ${fx.toLocaleString()}`}</MathTex>
                              </span>
                              {x === 0 && (
                                <span className="text-yellow-400 dark:text-yellow-200 text-xs block">
                                  (secret!)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                        <strong>Shares distributed:</strong> Client 1 keeps{" "}
                        <MathTex>{"f(1) = "}</MathTex>{" "}
                        {evaluations[1]?.fx.toLocaleString()}, Client 2 gets{" "}
                        <MathTex>{"f(2) = "}</MathTex>{" "}
                        {evaluations[2]?.fx.toLocaleString()}, etc.
                        <br />
                        <strong className="text-green-600 dark:text-green-200">
                          Any {config.T} shares
                        </strong>{" "}
                        can reconstruct
                        <MathTex>{"f(0) = "}</MathTex> {secret} via Lagrange
                        interpolation
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Purpose of shares */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-purple-900/30 border-purple-500/50">
              <CardContent className="pt-2">
                <p className="font-semibold text-purple-600 dark:text-purple-200 mb-2">
                  Private Key Shares
                </p>
                <p className="text-sm text-purple-900 dark:text-purple-200">
                  Each client creates T-of-N shares of their DH private key{" "}
                  <MathTex>{"a_u"}</MathTex>. If client drops, others can
                  reconstruct <MathTex>{"a_u"}</MathTex> to compute pairwise
                  masks.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/30 border-blue-500/50">
              <CardContent className="pt-2">
                <p className="font-semibold text-blue-600 dark:text-blue-200 mb-2">
                  Self-Mask Shares
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Each client creates T-of-N shares of their self-mask{" "}
                  <MathTex>{"b_u"}</MathTex>. If client drops, others can
                  reconstruct <MathTex>{"b_u"}</MathTex> to remove it from the
                  sum.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-green-900/30 border-green-500">
            <CardContent className="flex items-center">
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>Threshold:</strong> With <MathTex>{`T = ${config.T.toString()}`}</MathTex> out of <MathTex>{`N = ${config.N.toString()}`}</MathTex>, any <MathTex>{"T"}</MathTex> clients can reconstruct a dropped client's
                secrets, but fewer than <MathTex>{"T"}</MathTex> clients learn nothing.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: Polynomial Reconstruction Plot */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Polynomial Reconstruction
            </h2>
            <p className="text-muted-foreground">
              Visualizing how Shamir shares form points on a polynomial curve
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Shares as Points on a Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const keyPair = protocolData.round1?.dhKeyPairs?.get(1);
                if (!keyPair) {
                  return (
                    <div className="text-muted-foreground text-center">
                      Loading protocol data...
                    </div>
                  );
                }

                const secret = Number(
                  keyPair.private % BigInt(config.shamirPrime)
                );
                const p = config.shamirPrime;

                // Generate random polynomial coefficients (same seeded random as Step 1)
                const seededRandom = (seed: number, i: number) => {
                  const x = Math.sin(seed * 9999 + i * 7777) * 10000;
                  return Math.abs(x - Math.floor(x));
                };

                const coeffs: number[] = [secret];
                for (let i = 1; i < config.T; i++) {
                  const rand = seededRandom(secret, i);
                  coeffs.push(Math.floor(rand * (p - 2)) + 1);
                }

                // Evaluate f(x) for x = 1 to N (shares only, not secret at x=0)
                const shares: { x: number; y: number }[] = [];
                for (let x = 1; x <= config.N; x++) {
                  let result = 0;
                  let xPower = 1;
                  for (const c of coeffs) {
                    result = (((result + c * xPower) % p) + p) % p;
                    xPower = (xPower * x) % p;
                  }
                  shares.push({ x, y: result });
                }

                // Use log scale to normalize values (matching shamir-section approach)
                const yValues = shares.map((share) => {
                  const logY = Math.log10(share.y + 1);
                  return logY;
                });
                const secretLogY = Math.log10(secret + 1);
                const allLogY = [secretLogY, ...yValues];
                const minLogY = Math.min(...allLogY);
                const maxLogY = Math.max(...allLogY);
                const range = maxLogY - minLogY || 1;

                // Normalize to SVG coordinates (y inverted: 10 = top, 80 = bottom)
                const normalizeY = (logY: number) =>
                  80 - ((logY - minLogY) / range) * 65;

                // Calculate point positions for shares
                const points = shares.map((share, idx) => ({
                  x: 8 + (share.x / (config.N + 1)) * 85,
                  y: normalizeY(yValues[idx]),
                }));

                const secretY = normalizeY(secretLogY);

                // Build SVG path through all points (starting from secret at x=0)
                let pathD = `M 8 ${secretY}`;
                points.forEach((point, idx) => {
                  if (idx === 0) {
                    pathD += ` Q ${(8 + point.x) / 2} ${
                      (secretY + point.y) / 2
                    }, ${point.x} ${point.y}`;
                  } else {
                    pathD += ` T ${point.x} ${point.y}`;
                  }
                });

                return (
                  <>
                    {/* SVG Polynomial Curve */}
                    <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {/* Y-axis at x=8 */}
                        <line
                          x1="8"
                          y1="5"
                          x2="8"
                          y2="85"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          className="text-muted-foreground"
                        />
                        {/* X-axis at y=85 */}
                        <line
                          x1="8"
                          y1="85"
                          x2="95"
                          y2="85"
                          stroke="currentColor"
                          strokeWidth="0.3"
                          className="text-muted-foreground"
                        />

                        {/* Polynomial curve through actual points */}
                        <motion.path
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            delay: 1.2,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                          d={pathD}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-purple-400"
                        />
                      </svg>

                      {/* Share points (x = 1 to N) */}
                      {points.map((point, idx) => (
                        <motion.div
                          key={shares[idx].x}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            backgroundColor: clients[idx]?.color || "#a855f7",
                          }}
                          title={`Client ${idx + 1}: (${shares[idx].x}, ${
                            shares[idx].y
                          })`}
                        />
                      ))}

                      {/* Secret point at x=0 (on the Y-axis) */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 }}
                        className="absolute w-4 h-4 rounded-full bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ left: "8%", top: `${secretY}%` }}
                      />

                      {/* Labels */}
                      <span className="absolute left-1 top-1/2 text-xs text-muted-foreground -rotate-90 transform -translate-y-1/2">
                        <MathTex>{"f(x)"}</MathTex>
                      </span>
                      <span className="absolute bottom-1 left-1/2 text-xs text-muted-foreground">
                        <MathTex>{"x"}</MathTex>
                      </span>
                      <span
                        className="absolute text-xs font-medium z-20 text-yellow-600 dark:text-yellow-200"
                        style={{ left: "1%", top: "10%" }}
                      >
                        Secret
                      </span>
                      <span
                        className="absolute text-[10px] text-muted-foreground"
                        style={{ left: "6%", top: "87%" }}
                      >
                        <MathTex>{"0"}</MathTex>
                      </span>
                    </div>

                    <p className="text-sm text-center text-foreground/80 mt-4">
                      The polynomial passes through all share points and{" "}
                      <span className="text-yellow-600 dark:text-yellow-200"><MathTex>{"f(0) = "}</MathTex> secret = {secret}</span>
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Lagrange Interpolation Formula */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Lagrange Interpolation Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                Given <MathTex>{"T"}</MathTex> shares (points on the curve), we can reconstruct the
                secret using:
              </p>

              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <MathBlock>
                  {
                    "P(x) = \\sum_{i=1}^{T} y_i \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}"
                  }
                </MathBlock>
              </div>

              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <p className="text-xs text-muted-foreground mb-2">
                  To find the secret, evaluate at <MathTex>{"x = 0"}</MathTex>:
                </p>
                <MathBlock>
                  {
                    "f(0) = \\sum_{i=1}^{T} y_i \\cdot L_i(0), \\quad \\text{where } L_i(0) = \\prod_{j \\neq i} \\frac{-x_j}{x_i - x_j}"
                  }
                </MathBlock>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-600 dark:text-green-200 mb-2">
                    Reconstruction Guarantee
                  </p>
                  <p className="text-sm text-green-900 dark:text-green-200">
                    Any <strong><MathTex>{`T = ${config.T.toString()}`}</MathTex></strong> shares can exactly
                    reconstruct the polynomial and recover <MathTex>{"f(0)"}</MathTex>
                  </p>
                </div>
                <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-2">
                    Security Property
                  </p>
                  <p className="text-sm text-red-900 dark:text-red-200">
                    With <strong><MathTex>{"< T"}</MathTex></strong> shares, all possible secrets
                    are equally likely (perfect secrecy)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: Public Key Broadcast */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Public Key Broadcast</h2>
            <p className="text-muted-foreground">
              Clients share their public keys with the server
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                {clients.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ y: 0 }}
                    animate={{ y: [-10, 0] }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-foreground font-bold"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.id}
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      className="mt-2"
                    >
                      <Key className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-muted p-6 rounded-xl border border-border"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-200 mb-2">
                      Server
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Received {clients.length} public keys
                    </div>
                    <div className="mt-2 flex gap-1 justify-center">
                      {clients.map((c) => (
                        <Key
                          key={c.id}
                          className="h-3 w-3"
                          style={{ color: c.color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-500">
            <CardContent className="flex items-center justify-center">
              <p className="text-center text-blue-900 dark:text-blue-200">
                <strong>Round 0 Complete:</strong> All clients have advertised
                their public keys. Next, they will establish pairwise shared
                secrets.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

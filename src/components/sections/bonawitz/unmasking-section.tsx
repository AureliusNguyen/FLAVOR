"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBonawitz } from "@/context/bonawitz-context";
import { MathBlock, Math as MathTex } from "@/components/math";
import { Unlock, Share2, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  currentStep: number;
}

export function BonawitzUnmaskingSection({ currentStep }: Props) {
  const { clients, config, protocolData, setCurrentProtocolRound } =
    useBonawitz();

  useEffect(() => {
    if (currentStep >= 0) {
      setCurrentProtocolRound(3);
    }
  }, [currentStep, setCurrentProtocolRound]);

  const aliveClients = clients.filter((c) => !c.isDropped);
  const droppedClients = clients.filter((c) => c.isDropped);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-white">
      {/* Step 0: Unmasking Overview */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 4</Badge>
            <h2 className="text-3xl font-bold mb-2">Unmasking</h2>
            <p className="text-gray-400">
              Remove self-masks and recover true aggregate
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-400" />
                Unmasking Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <p className="font-semibold text-green-300">
                        Alive Clients ({aliveClients.length})
                      </p>
                    </div>
                    <p className="text-xs text-gray-300">
                      Reveal their self-mask <MathTex>{"b_u"}</MathTex> directly
                      to the server
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {aliveClients.map((c) => (
                        <Badge key={c.id} style={{ backgroundColor: c.color }}>
                          {c.id}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-900/30 border-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-5 w-5 text-red-400" />
                      <p className="font-semibold text-red-300">
                        Dropped Clients ({droppedClients.length})
                      </p>
                    </div>
                    <p className="text-xs text-gray-300">
                      Server reconstructs <MathTex>{"b_u"}</MathTex> using
                      Shamir shares from alive clients
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {droppedClients.map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="border-red-500 text-red-300"
                        >
                          {c.id}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <MathBlock>
                  {
                    "\\sum x_u = \\sum y_u - \\sum_{u \\in U_3} b_u - \\sum_{u \\in U_2 \\setminus U_3} \\text{Reconstruct}(b_u)"
                  }
                </MathBlock>
                <p className="text-xs text-center mt-2 text-gray-400">
                  <MathTex>{"U_3"}</MathTex> = alive clients in Round 4,{" "}
                  <MathTex>{"U_2"}</MathTex> = clients who submitted in Round 2
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Share Collection */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Collecting Shares</h2>
            <p className="text-gray-400">
              Alive clients provide shares for dropped clients
            </p>
          </div>

          {droppedClients.length > 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Shamir Secret Sharing Reconstruction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-900/30 border-blue-500">
                  <AlertDescription className="text-blue-200">
                    Each alive client holds a share of each dropped client's
                    self-mask <MathTex>{"b_u"}</MathTex>. With{" "}
                    <MathTex>{"T = "}</MathTex> {config.T} shares, we can
                    reconstruct the secret.
                  </AlertDescription>
                </Alert>

                {droppedClients.map((dropped, idx) => (
                  <motion.div
                    key={dropped.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <Card
                      className="border-2 border-red-500/50"
                      style={{ backgroundColor: "rgba(31, 41, 55, 0.8)" }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold opacity-50"
                            style={{ backgroundColor: dropped.color }}
                          >
                            {dropped.id}
                          </div>
                          <span className="font-medium text-red-300">
                            {dropped.name} (Dropped)
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          Collecting shares from alive clients:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aliveClients
                            .slice(0, config.T)
                            .map((alive, shareIdx) => (
                              <motion.div
                                key={alive.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: idx * 0.2 + shareIdx * 0.1,
                                }}
                              >
                                <Badge style={{ backgroundColor: alive.color }}>
                                  Share from C{alive.id}
                                </Badge>
                              </motion.div>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-green-400">
                          ✓ {Math.min(aliveClients.length, config.T)}/{config.T}{" "}
                          shares collected - reconstruction possible!
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-900/30 border-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-green-300">
                    No Dropouts!
                  </p>
                  <p className="text-gray-400">
                    All clients remained online. No secret reconstruction
                    needed. Each client simply reveals their self-mask <MathTex>{"b_u"}</MathTex>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </StepContent>

      {/* Step 2: Final Unmasking with Detailed Math */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Removing All Masks</h2>
            <p className="text-gray-400">
              Step-by-step computation of the final unmasked aggregate
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Unmasking Computation (mod {config.R.toLocaleString()})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Start with masked sum */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="bg-gray-900 p-4 rounded-lg border-l-4 border-cyan-500"
              >
                <div className="text-sm font-semibold text-cyan-300 mb-2">
                  Step 1: Masked Sum from Server
                </div>
                <div className="font-mono text-sm">
                  <span className="text-gray-400">
                    <MathTex>{"\\sum_{u \\in U_2} y_u"}</MathTex> ={" "}
                  </span>
                  <span className="text-cyan-300">
                    [
                    {protocolData.round2?.serverAggregatedMasked?.join(", ") ||
                      "..."}
                    ]
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This includes: <MathTex>{"\\sum x_u + \\sum b_u"}</MathTex>{" "}
                  (pairwise masks already cancelled)
                </p>
              </motion.div>

              {/* Step 2: Alive clients' self-masks */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 p-4 rounded-lg border-l-4 border-green-500"
              >
                <div className="text-sm font-semibold text-green-300 mb-2">
                  Step 2: Subtract Alive Clients' Self-Masks (revealed directly)
                </div>
                <div className="space-y-2">
                  {aliveClients.map((c, idx) => {
                    const selfMask = protocolData.round2?.selfMasks?.get(c.id);
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-2 text-sm font-mono"
                      >
                        <Badge
                          style={{ backgroundColor: c.color }}
                          className="text-xs"
                        >
                          {c.name}
                        </Badge>
                        <span className="text-gray-400">
                          <MathTex>{`b_{${c.id}}`}</MathTex> =
                        </span>
                        <span className="text-green-300">
                          [{selfMask?.join(", ") || "..."}]
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Step 3: Reconstructed masks for dropped clients */}
              {droppedClients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900 p-4 rounded-lg border-l-4 border-red-500"
                >
                  <div className="text-sm font-semibold text-red-300 mb-2">
                    Step 3: Subtract Reconstructed Dropped Clients' Masks (via
                    Shamir SSS)
                  </div>
                  <div className="space-y-2">
                    {droppedClients.map((c, idx) => {
                      const reconstructed =
                        protocolData.round4?.reconstructedSelfMasks?.get(c.id);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="flex items-center gap-2 text-sm font-mono"
                        >
                          <Badge
                            variant="outline"
                            className="border-red-500 text-red-300 text-xs"
                          >
                            {c.name} (dropped)
                          </Badge>
                          <span className="text-gray-400">
                            <MathTex>{`\\text{Reconstruct}(b_{${c.id}})`}</MathTex>{" "}
                            =
                          </span>
                          <span className="text-red-300">
                            [{reconstructed?.join(", ") || "..."}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Reconstructed using T={config.T} shares from alive clients
                    via Lagrange interpolation
                  </p>
                </motion.div>
              )}

              {/* Final Result */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Unlock className="h-5 w-5 text-green-400" />
                      <p className="font-semibold text-green-300">
                        Final Unmasked Sum
                      </p>
                    </div>
                    {protocolData.round4?.recoveredSum ? (
                      <>
                        <div className="font-mono text-lg text-center text-green-300 mb-3">
                          <MathTex>{"\\sum x_u"}</MathTex> = [
                          {protocolData.round4.recoveredSum.join(", ")}]
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg">
                          <div className="text-sm text-gray-400 mb-2">
                            Dequantized Average:
                          </div>
                          <div className="font-mono text-center text-blue-300">
                            <MathTex>{"\\bar{x}"}</MathTex> = [
                            {protocolData.round4.dequantizedAverage
                              ?.map((v: number) => v.toFixed(6))
                              .join(", ") || "..."}
                            ]
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Formula:{" "}
                            <MathTex>
                              {"\\bar{x} = \\frac{\\sum x_u}{N \\cdot Q}"}
                            </MathTex>{" "}
                            where N={aliveClients.length}, Q=
                            {config.Q.toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-yellow-300">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-mono text-lg">Computing...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CardContent>
          </Card>

          <Alert className="bg-purple-900/30 border-purple-500">
            <AlertDescription className="text-purple-200">
              <strong>Privacy Preserved:</strong> The server now has the true
              aggregate sum, but never learned any individual client's gradient
              vector <MathTex>{"x_u"}</MathTex>!
              {droppedClients.length > 0 && (
                <span className="block mt-2">
                  <strong>Dropout Resilience:</strong> Successfully handled{" "}
                  {droppedClients.length} client dropout(s) using Shamir Secret
                  Sharing with threshold T={config.T}.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </StepContent>
    </div>
  );
}

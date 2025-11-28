"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBonawitz } from "@/context/bonawitz-context";
import { MathBlock, Math as MathTex } from "@/components/math";
import { Unlock, Share2, CheckCircle, Loader2, WifiOff, Key } from "lucide-react";

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

  // U₃ = clients who are alive and will participate in Round 4
  const u3Clients = clients.filter((c) => c.dropoutPhase === "alive");

  // U₂ = clients who submitted masked inputs
  const u2Clients = clients.filter(
    (c) => c.dropoutPhase === "alive" || c.dropoutPhase === "after_masked_input"
  );

  // U₁ \ U₂ = Early dropouts (didn't submit masked input)
  const earlyDropouts = clients.filter((c) => c.dropoutPhase === "after_share_keys");

  // U₂ \ U₃ = Late dropouts (submitted but then disconnected)
  const lateDropouts = clients.filter((c) => c.dropoutPhase === "after_masked_input");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground pb-26">
      {/* Step 0: Unmasking Overview */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 4</Badge>
            <h2 className="text-3xl font-bold mb-2">Unmasking</h2>
            <p className="text-muted-foreground">
              Remove self-masks and recover true aggregate
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-600 dark:text-green-200" />
                Unmasking Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-200" />
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Alive (<MathTex>{"U_3"}</MathTex>): {u3Clients.length}
                      </p>
                    </div>
                    <p className="text-xs text-green-900 dark:text-green-200">
                      Reveal their self-mask <MathTex>{"b_u"}</MathTex> directly
                      to the server
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {u3Clients.map((c) => (
                        <Badge key={c.id} style={{ backgroundColor: c.color }}>
                          {c.id}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-900/30 border-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5 text-orange-600 dark:text-orange-200" />
                      <p className="font-semibold text-orange-600 dark:text-orange-200">
                        Early (<MathTex>{"U_1 \\setminus U_2"}</MathTex>): {earlyDropouts.length}
                      </p>
                    </div>
                    <p className="text-xs text-orange-900 dark:text-orange-200">
                      Reconstruct private key <MathTex>{"a_u"}</MathTex> to compute
                      pairwise masks. No self-mask needed.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {earlyDropouts.map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="border-orange-500 text-orange-600 dark:text-orange-400"
                        >
                          {c.id}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-900/30 border-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-5 w-5 text-red-600 dark:text-red-200" />
                      <p className="font-semibold text-red-600 dark:text-red-200">
                        Late (<MathTex>{"U_2 \\setminus U_3"}</MathTex>): {lateDropouts.length}
                      </p>
                    </div>
                    <p className="text-xs text-red-900 dark:text-red-200">
                      Reconstruct self-mask <MathTex>{"b_u"}</MathTex> using
                      Shamir shares from alive clients
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lateDropouts.map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="border-red-500 text-red-600 dark:text-red-400"
                        >
                          {c.id}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <MathBlock>
                  {
                    "\\sum_{u \\in U_2} x_u = \\sum_{u \\in U_2} y_u - \\sum_{u \\in U_3} b_u - \\sum_{u \\in U_2 \\setminus U_3} \\text{Reconstruct}(b_u)"
                  }
                </MathBlock>
                <p className="text-xs text-center text-muted-foreground">
                  <MathTex>{"U_2"}</MathTex> = clients who submitted masked inputs,{" "}
                  <MathTex>{"U_3"}</MathTex> = clients alive in Round 4
                </p>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Why only self-masks?</strong> Pairwise masks <MathTex>{"p_{uv}"}</MathTex> cancel automatically among clients who submitted:
                  </p>
                  <MathBlock>
                    {
                      "\\sum_{u \\in U_2} \\left( \\sum_{v > u} p_{uv} - \\sum_{v < u} p_{vu} \\right) = 0"
                    }
                  </MathBlock>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Client <MathTex>{"u"}</MathTex> adds <MathTex>{"+p_{uv}"}</MathTex>, client <MathTex>{"v"}</MathTex> subtracts <MathTex>{"-p_{uv}"}</MathTex> → net contribution is 0
                  </p>
                </div>
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
            <p className="text-muted-foreground">
              Alive clients provide shares for dropped clients
            </p>
          </div>

          {(earlyDropouts.length > 0 || lateDropouts.length > 0) ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Shamir Secret Sharing Reconstruction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-900/30 border-blue-500">
                  <AlertDescription className="text-blue-600 dark:text-blue-200">
                    Each alive client holds shares of dropped clients' secrets.
                    With <MathTex>{`T = ${config.T.toString()}`}</MathTex> shares, we can reconstruct using Lagrange interpolation.
                  </AlertDescription>
                </Alert>

                {/* Early Dropouts - need private key reconstruction */}
                {earlyDropouts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-orange-600 dark:text-orange-200" />
                      <h4 className="font-semibold text-orange-600 dark:text-orange-200">
                        Early Dropouts <MathTex>{"(U_1 \\setminus U_2)"}</MathTex> — reconstruct private key
                      </h4>
                    </div>
                    <p className="text-sm text-orange-900 dark:text-orange-200">
                      These clients dropped before submitting. Their private key <MathTex>{"a_u"}</MathTex> is
                      reconstructed to compute pairwise masks with <MathTex>{"U_2"}</MathTex> clients.
                    </p>
                    {earlyDropouts.map((dropped, idx) => (
                      <motion.div
                        key={dropped.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                      >
                        <Card className="border-2 border-orange-500/50 bg-card/80">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-sm font-bold opacity-50"
                                style={{ backgroundColor: dropped.color }}
                              >
                                {dropped.id}
                              </div>
                              <span className="font-medium text-orange-600 dark:text-orange-200">
                                {dropped.name} (Early Dropout)
                              </span>
                              <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 text-xs">
                                <WifiOff className="h-3 w-3 mr-1" />
                                <MathTex>{"U_1 \\setminus U_2"}</MathTex>
                              </Badge>
                            </div>
                            <div className="text-sm text-orange-900 dark:text-orange-200 mb-2">
                              Reconstructing private key <MathTex>{"a_u"}</MathTex> from shares:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {u3Clients.slice(0, config.T).map((alive, shareIdx) => (
                                <motion.div
                                  key={alive.id}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: idx * 0.2 + shareIdx * 0.1 }}
                                >
                                  <Badge style={{ backgroundColor: alive.color }}>
                                    Share from C{alive.id}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-green-400">
                              ✓ {Math.min(u3Clients.length, config.T)}/{config.T} shares collected
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Late Dropouts - need self-mask reconstruction */}
                {lateDropouts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-red-600 dark:text-red-200" />
                      <h4 className="font-semibold text-red-600 dark:text-red-200">
                        Late Dropouts <MathTex>{"(U_2 \\setminus U_3)"}</MathTex> — reconstruct self-mask
                      </h4>
                    </div>
                    <p className="text-sm text-red-900 dark:text-red-200">
                      These clients submitted masked inputs but then dropped.
                      Their self-mask <MathTex>{"b_u"}</MathTex> is reconstructed to unmask their contribution.
                    </p>
                    {lateDropouts.map((dropped, idx) => (
                      <motion.div
                        key={dropped.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (earlyDropouts.length + idx) * 0.2 }}
                      >
                        <Card className="border-2 border-red-500/50 bg-card/80">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-sm font-bold opacity-50"
                                style={{ backgroundColor: dropped.color }}
                              >
                                {dropped.id}
                              </div>
                              <span className="font-medium text-red-600 dark:text-red-200">
                                {dropped.name} (Late Dropout)
                              </span>
                              <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400 text-xs">
                                <WifiOff className="h-3 w-3 mr-1" />
                                <MathTex>{"U_2 \\setminus U_3"}</MathTex>
                              </Badge>
                            </div>
                            <div className="text-sm text-red-900 dark:text-red-200 mb-2">
                              Reconstructing self-mask <MathTex>{"b_u"}</MathTex> from shares:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {u3Clients.slice(0, config.T).map((alive, shareIdx) => (
                                <motion.div
                                  key={alive.id}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: (earlyDropouts.length + idx) * 0.2 + shareIdx * 0.1 }}
                                >
                                  <Badge style={{ backgroundColor: alive.color }}>
                                    Share from C{alive.id}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-green-400">
                              ✓ {Math.min(u3Clients.length, config.T)}/{config.T} shares collected
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
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
                  <p className="text-muted-foreground">
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
            <p className="text-muted-foreground">
              Step-by-step computation of the final unmasked aggregate
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Unmasking Computation (mod {config.R.toLocaleString()})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Start with masked sum */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="bg-muted p-4 rounded-lg border-l-4 border-cyan-500"
              >
                <div className="text-sm font-semibold text-cyan-400 dark:text-cyan-200 mb-2">
                  Step 1: Masked Sum from Server
                </div>
                <div className="font-mono text-sm">
                  <span className="text-cyan-400 dark:text-cyan-200">
                    <MathTex>{"\\sum_{u \\in U_2} y_u"}</MathTex> ={" "}
                  </span>
                  <span className="text-cyan-400 dark:text-cyan-200">
                    [
                    {protocolData.round2?.serverAggregatedMasked?.join(", ") ||
                      "..."}
                    ]
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Expanded: <MathTex>{"\\sum_{u \\in U_2} y_u = \\sum_{u \\in U_2} x_u + \\underbrace{\\sum_{u \\in U_2} \\left(\\sum_{v>u} p_{uv} - \\sum_{v<u} p_{vu}\\right)}_{=0 \\text{ (cancels)}} + \\sum_{u \\in U_2} b_u"}</MathTex>
                </p>
              </motion.div>

              {/* Step 2: Alive clients' self-masks */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-muted p-4 rounded-lg border-l-4 border-green-500"
              >
                <div className="text-sm font-semibold text-green-400 dark:text-green-200 mb-2">
                  Step 2: Subtract Alive Clients' Self-Masks (<MathTex>{"U_3"}</MathTex> — revealed directly)
                </div>
                <div className="space-y-2">
                  {u3Clients.map((c, idx) => {
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
                        <span className="text-muted-foreground">
                          <MathTex>{`b_{${c.id}}`}</MathTex> =
                        </span>
                        <span className="text-green-400 dark:text-green-200">
                          [{selfMask?.join(", ") || "..."}]
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Step 3: Early dropouts - pairwise key reconstruction */}
              {earlyDropouts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-muted p-4 rounded-lg border-l-4 border-orange-500"
                >
                  <div className="text-sm font-semibold text-orange-400 dark:text-orange-200 mb-2">
                    Step 3a: Handle Early Dropouts <MathTex>{"(U_1 \\setminus U_2)"}</MathTex> — reconstruct pairwise masks
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    These clients didn't submit, so pairwise masks with them <strong>don't cancel</strong>.
                    We reconstruct their private key <MathTex>{"a_u"}</MathTex> to compute and remove these masks.
                  </p>
                  <div className="space-y-2">
                    {earlyDropouts.map((c, idx) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-center gap-2 text-sm font-mono"
                      >
                        <Badge
                          variant="outline"
                          className="border-orange-500 text-orange-600 dark:text-orange-400 text-xs"
                        >
                          {c.name} (early)
                        </Badge>
                        <span className="text-muted-foreground">
                          <MathTex>{`\\text{Reconstruct}(a_{${c.id}})`}</MathTex> → compute <MathTex>{`p_{${c.id},v}`}</MathTex>
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Late dropouts - self-mask reconstruction */}
              {lateDropouts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-muted p-4 rounded-lg border-l-4 border-red-500"
                >
                  <div className="text-sm font-semibold text-red-400 dark:text-red-200 mb-2">
                    Step 3b: Handle Late Dropouts <MathTex>{"(U_2 \\setminus U_3)"}</MathTex> — reconstruct self-masks
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    These clients submitted masked inputs, so their pairwise masks cancelled.
                    We only need to reconstruct their self-mask <MathTex>{"b_u"}</MathTex>.
                  </p>
                  <div className="space-y-2">
                    {lateDropouts.map((c, idx) => {
                      const reconstructed =
                        protocolData.round4?.reconstructedSelfMasks?.get(c.id);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-2 text-sm font-mono"
                        >
                          <Badge
                            variant="outline"
                            className="border-red-500 text-red-600 dark:text-red-400 text-xs"
                          >
                            {c.name} (late)
                          </Badge>
                          <span className="text-muted-foreground">
                            <MathTex>{`\\text{Reconstruct}(b_{${c.id}})`}</MathTex>{" "}
                            =
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            [{reconstructed?.join(", ") || "..."}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
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
                      <Unlock className="h-5 w-5 text-green-600 dark:text-green-200" />
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Final Unmasked Sum
                      </p>
                    </div>
                    {protocolData.round4?.recoveredSum ? (
                      <>
                        <div className="font-mono text-lg text-center text-green-600 dark:text-green-200 mb-3">
                          <MathTex>{"\\sum x_u"}</MathTex> = [
                          {protocolData.round4.recoveredSum.join(", ")}]
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">
                            Dequantized Average:
                          </div>
                          <div className="font-mono text-center text-blue-600 dark:text-blue-400">
                            <MathTex>{"\\bar{x}"}</MathTex> = [
                            {protocolData.round4.dequantizedAverage
                              ?.map((v: number) => v.toFixed(6))
                              .join(", ") || "..."}
                            ]
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Formula:{" "}
                            <MathTex>
                              {"\\bar{x} = \\frac{\\sum x_u}{|U_2| \\cdot Q}"}
                            </MathTex>{" "}
                            <MathTex>{`\\text{where } |U_2| = ${u2Clients.length.toString()}, Q = ${config.Q.toLocaleString()}`}</MathTex>
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-200">
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
            <AlertDescription className="text-purple-600 dark:text-purple-200">
              <strong>Privacy Preserved:</strong> The server now has the true
              aggregate sum of {u2Clients.length} clients' gradients, but never learned any individual client's gradient
              vector <MathTex>{"x_u"}</MathTex>!
              {(earlyDropouts.length > 0 || lateDropouts.length > 0) && (
                <span className="block mt-2">
                  <strong>Dropout Resilience:</strong> Successfully handled{" "}
                  {earlyDropouts.length > 0 && <>{earlyDropouts.length} early dropout(s) (pairwise key reconstruction)</>}
                  {earlyDropouts.length > 0 && lateDropouts.length > 0 && " and "}
                  {lateDropouts.length > 0 && <>{lateDropouts.length} late dropout(s) (self-mask reconstruction)</>}
                  {" "}using Shamir Secret Sharing with threshold <MathTex>{`T = ${config.T.toString()}`}</MathTex>.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </StepContent>
    </div>
  );
}

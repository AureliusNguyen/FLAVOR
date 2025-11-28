"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useBonawitz } from "@/context/bonawitz-context";
import {
  CheckCircle,
  Shield,
  Users,
  Lock,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Math as MathTex } from "@/components/math";
import Link from "next/link";

interface Props {
  currentStep: number;
}

export function BonawitzResultSection({ currentStep }: Props) {
  const { clients, config, protocolData, resetProtocol } = useBonawitz();

  // U₂ = clients who submitted masked inputs (alive + late dropouts)
  const u2Clients = clients.filter(
    (c) => c.dropoutPhase === "alive" || c.dropoutPhase === "after_masked_input"
  );
  // U₃ = clients still alive at Round 4
  const u3Clients = clients.filter((c) => c.dropoutPhase === "alive");
  // Early dropouts (U₁ \ U₂)
  const earlyDropouts = clients.filter(
    (c) => c.dropoutPhase === "after_share_keys"
  );
  // Late dropouts (U₂ \ U₃)
  const lateDropouts = clients.filter(
    (c) => c.dropoutPhase === "after_masked_input"
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground">
      {/* Step 0: Final Result */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-200" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">
              Secure Aggregation Complete!
            </h2>
            <p className="text-muted-foreground">
              The protocol successfully computed the aggregate
            </p>
          </div>

          {/* Result Card */}
          <Card className="bg-green-900/30 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-200 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Final Aggregated Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocolData.round4?.dequantizedAverage ? (
                <>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Average Gradient Vector:
                    </p>
                    <div className="font-mono text-xl text-center text-green-600 dark:text-green-200">
                      [
                      {protocolData.round4.dequantizedAverage
                        .map((v: number) => v.toFixed(6))
                        .join(", ")}
                      ]
                    </div>
                  </div>

                  {protocolData.verification && (
                    <Alert
                      variant={
                        protocolData.verification.passed
                          ? "default"
                          : "destructive"
                      }
                    >
                      <AlertDescription>
                        <strong>
                          {protocolData.verification.passed
                            ? "✓ Verification Passed"
                            : "✗ Verification Failed"}
                        </strong>
                        <p className="text-sm mt-1">
                          {protocolData.verification.message}
                        </p>
                        {protocolData.verification.passed && (
                          <div className="mt-2 text-xs font-mono">
                            <div>
                              Expected: [
                              {protocolData.verification.expected
                                ?.map((v: number) => v.toFixed(6))
                                .join(", ")}
                              ]
                            </div>
                            <div>
                              Actual: [
                              {protocolData.verification.actual
                                ?.map((v: number) => v.toFixed(6))
                                .join(", ")}
                              ]
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rounding Error Explanation */}
                  <div className="bg-muted p-4 rounded-lg border border-blue-500/30 mt-4">
                    <p className="font-semibold text-blue-600 dark:text-blue-200 mb-3">
                      Why Small Differences Are Expected
                    </p>
                    <div className="text-sm text-foreground/80 space-y-3">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          The protocol uses quantization to convert floats to
                          integers:
                        </p>
                        <div className="bg-card p-2 rounded font-mono text-xs">
                          <div className="text-yellow-600 dark:text-yellow-200">
                            <MathTex>
                              {
                                "\\tilde{x} = \\text{round}(x \\times Q) \\mod R"
                              }
                            </MathTex>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            <MathTex>{`\\text{where } Q = ${config.Q.toLocaleString()}`}</MathTex>{" "}
                            (quantization factor)
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">
                          Rounding introduces small errors at each step:
                        </p>
                        <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                          <li>
                            <span className="text-muted-foreground">
                              Client quantizes:
                            </span>{" "}
                            <span className="text-blue-600 dark:text-blue-200">
                              <MathTex>
                                {`0.1234 \\times ${config.Q.toLocaleString()} = ${(
                                  0.1234 * config.Q
                                ).toFixed(1)} \\approx ${Math.round(
                                  0.1234 * config.Q
                                )}`}
                              </MathTex>
                            </span>
                          </li>

                          <li>
                            <span className="text-muted-foreground">
                              After aggregation & dequantization:
                            </span>{" "}
                            <span className="text-green-600 dark:text-green-200">
                              <MathTex>
                                {`\\frac{${Math.round(
                                  0.1234 * config.Q
                                )}}{${config.Q.toLocaleString()}} = ${(
                                  Math.round(0.1234 * config.Q) / config.Q
                                ).toFixed(6)}`}
                              </MathTex>
                            </span>
                          </li>

                          <li>
                            <span className="text-muted-foreground">
                              Max error per value:
                            </span>{" "}
                            <span className="text-yellow-300">
                              <MathTex>
                                {`\\pm ${(0.5 / config.Q).toFixed(6)}`}
                              </MathTex>{" "}
                              (half a quantization step)
                            </span>
                          </li>
                        </ol>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-muted-foreground mb-1">
                          Acceptable Threshold:
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600 text-xs">
                            <MathTex>{"ε = 0.01"}</MathTex>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Differences <MathTex>{"< 1%"}</MathTex> are
                            considered correct (typical ML gradient precision)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          With <MathTex>{"Q = "}</MathTex>{" "}
                          {config.Q.toLocaleString()}, max error{" "}
                          <MathTex>{"≈"}</MathTex> <MathTex>{"≈"}</MathTex>{" "}
                          {((0.5 / config.Q) * 100).toFixed(4)}
                          <MathTex>{"%"}</MathTex> per element — well within
                          tolerance.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Result computation in progress...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{config.N}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{u2Clients.length}</p>
                <p className="text-sm text-muted-foreground">
                  <MathTex>{"U_2"}</MathTex> (Submitted)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{u3Clients.length}</p>
                <p className="text-sm text-muted-foreground">
                  <MathTex>{"U_3"}</MathTex> (Stayed Alive)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Lock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {earlyDropouts.length + lateDropouts.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dropouts Handled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Security Guarantees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Input Privacy
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Server never saw individual gradients{" "}
                        <MathTex>{"x_u"}</MathTex>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Pairwise Mask Cancellation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        All <MathTex>{"p_{uv}"}</MathTex> masks cancelled
                        perfectly
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Dropout Resilience
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Handled {earlyDropouts.length + lateDropouts.length}{" "}
                        dropouts via Shamir reconstruction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-200">
                        Honest Majority
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <MathTex>{`T = ${config.T.toString()}`}</MathTex>{" "}
                        <MathTex>{"\\leq"}</MathTex>{" "}
                        <MathTex>{u3Clients.length.toString()}</MathTex>{" "}
                        threshold satisfied
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: What's Next */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Thank You for Exploring!
            </h2>
            <p className="text-muted-foreground">
              You've completed the Bonawitz Secure Aggregation demonstration
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                What You Learned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    text: "Pairwise masking using Diffie-Hellman key agreement",
                    hasMath: false,
                  },
                  {
                    text: "Self-mask secret sharing for dropout resilience",
                    hasMath: false,
                  },
                  {
                    text: "How masks cancel out to reveal only the aggregate",
                    hasMath: false,
                  },
                  {
                    text: "Shamir Secret Sharing for reconstructing dropped clients' masks",
                    hasMath: false,
                  },
                  {
                    text: "The importance of the honest majority threshold",
                    hasMath: true,
                    mathPart: "(T > N/2)",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Badge className="bg-purple-600 text-xs">{idx + 1}</Badge>
                    <span className="text-foreground/80">
                      {item.text}
                      {item.hasMath && item.mathPart && (
                        <>
                          {" "}
                          <MathTex>{item.mathPart}</MathTex>
                        </>
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={resetProtocol}
              variant="outline"
              className="border-border text-foreground/80 hover:bg-card"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Different Configs
            </Button>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Back to Home
              </Button>
            </Link>
          </div>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="flex flex-col items-center justify-center">
              <p className="text-center text-purple-600 dark:text-purple-200 mb-3">
                <strong>Read the Original Paper</strong>
              </p>
              <a
                href="https://arxiv.org/abs/1611.04482"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 dark:text-purple-200 hover:text-purple-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Practical Secure Aggregation for Privacy-Preserving Machine
                Learning
                <Badge className="bg-purple-700">arXiv:1611.04482</Badge>
              </a>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

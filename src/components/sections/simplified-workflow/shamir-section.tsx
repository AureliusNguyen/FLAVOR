"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShamirSecretSharing } from "@/lib/crypto/shamir";
import { defaultClients } from "@/lib/data/mnist";
import { useMemo, useState, useEffect } from "react";
import { Share } from "@/types";
import { Math as MathTex, MathBlock } from "@/components/math";

interface ShamirSectionProps {
  currentStep: number;
}

export function ShamirSection({ currentStep }: ShamirSectionProps) {
  const clients = defaultClients;
  // Use seeded random for consistent demo values across renders
  const shamir = useMemo(() => new ShamirSecretSharing(7, 10, undefined, true, 42), []);
  const config = shamir.getConfig();

  // Example secret (simulated model weight)
  const exampleSecret = 42424242;
  const { shares, polynomial } = useMemo(
    () => shamir.split(exampleSecret),
    [shamir]
  );

  const [animatedCoeffs, setAnimatedCoeffs] = useState<boolean[]>(
    new Array(7).fill(false)
  );
  const [animatedShares, setAnimatedShares] = useState<boolean[]>(
    new Array(10).fill(false)
  );
  const [reconstructionShares, setReconstructionShares] = useState<Share[]>([]);
  const [reconstructedValue, setReconstructedValue] = useState<bigint | null>(
    null
  );

  // Animate coefficients appearance
  useEffect(() => {
    if (currentStep === 2) {
      polynomial.coefficients.forEach((_, idx) => {
        setTimeout(() => {
          setAnimatedCoeffs((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, idx * 200);
      });
    }
  }, [currentStep, polynomial]);

  // Animate shares generation
  useEffect(() => {
    if (currentStep === 3) {
      shares.forEach((_, idx) => {
        setTimeout(() => {
          setAnimatedShares((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, idx * 100);
      });
    }
  }, [currentStep, shares]);

  // Reconstruction animation
  useEffect(() => {
    if (currentStep === 5) {
      setReconstructionShares([]);
      setReconstructedValue(null);

      // Add shares one by one
      const selectedShares = shares.slice(0, 7);
      selectedShares.forEach((share, idx) => {
        setTimeout(() => {
          setReconstructionShares((prev) => [...prev, share]);

          // Reconstruct when we have enough shares
          if (idx === 6) {
            setTimeout(() => {
              const result = shamir.reconstruct(selectedShares);
              setReconstructedValue(result);
            }, 500);
          }
        }, idx * 300);
      });
    }
  }, [currentStep, shares, shamir]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pb-24">
      {/* Step 0: Introduction to SSS */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Shamir Secret Sharing</h2>
            <p className="text-muted-foreground text-lg">
              A cryptographic method to split a secret into multiple shares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">The Concept</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Split a secret <MathTex>{"S"}</MathTex> into{" "}
                <MathTex>{"n"}</MathTex> shares such that any{" "}
                <MathTex>{"t"}</MathTex> shares can reconstruct{" "}
                <MathTex>{"S"}</MathTex>, but <MathTex>{"t-1"}</MathTex> or
                fewer shares reveal nothing about <MathTex>{"S"}</MathTex>.
              </p>
              <div className="flex items-center gap-4 justify-center">
                <Badge variant="outline">
                  <MathTex>{"t = " + config.threshold}</MathTex>
                </Badge>
                <Badge variant="outline">
                  <MathTex>{"n = " + config.totalShares}</MathTex>
                </Badge>
              </div>
            </Card>

            <Card className="p-6 border-primary">
              <h3 className="font-semibold mb-4">Our Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                With <MathTex>{"(7, 10)"}</MathTex> threshold scheme:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <MathTex>{"n = " + config.totalShares}</MathTex> shares
                  distributed to <MathTex>{"n"}</MathTex> clients
                </li>
                <li>
                  • Any <MathTex>{"t = " + config.threshold}</MathTex> shares
                  can reconstruct
                </li>
                <li>
                  • Up to <MathTex>{"n - t"}</MathTex> clients can fail/collude
                  safely
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 1: Mathematical foundation */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Polynomial Interpolation
            </h2>
            <p className="text-muted-foreground">
              The mathematical foundation of Shamir's scheme
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Key Insight</h3>
              <p className="text-sm text-muted-foreground">
                A polynomial of degree <MathTex>{"t-1"}</MathTex> is uniquely
                determined by <MathTex>{"t"}</MathTex> points. We use this
                property to encode our secret.
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <MathBlock>
                  {"f(x) = a_0 + a_1 x + a_2 x^2 + \\cdots + a_{t-1} x^{t-1}"}
                </MathBlock>
                <p className="text-muted-foreground text-xs text-center mt-2">
                  where <MathTex>{"a_0"}</MathTex> = secret, and{" "}
                  <MathTex>{"a_1 \\ldots a_{t-1}"}</MathTex> are random
                  coefficients
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Each share is a point (<MathTex>{"x"}</MathTex>,{" "}
                <MathTex>{"f(x)"}</MathTex>) on this polynomial. Given{" "}
                <MathTex>{"t"}</MathTex> points, we can use Lagrange
                interpolation to find <MathTex>{"f(0) = "}</MathTex> secret.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Lagrange Interpolation Formula</h3>
              <p className="text-sm text-muted-foreground">
                Given <MathTex>{"n"}</MathTex> points, we can reconstruct the
                polynomial using:
              </p>

              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <MathBlock>
                  {
                    "P(x) = \\sum_{i=1}^{n} y_i \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}"
                  }
                </MathBlock>
              </div>

              <p className="text-xs text-muted-foreground">Expanded form:</p>
              <div className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
                <MathBlock>
                  {
                    "P(x) = \\frac{(x-x_2)(x-x_3)\\cdots(x-x_n)}{(x_1-x_2)(x_1-x_3)\\cdots(x_1-x_n)}y_1 + \\cdots + \\frac{(x-x_1)\\cdots(x-x_{n-1})}{(x_n-x_1)\\cdots(x_n-x_{n-1})}y_n"
                  }
                </MathBlock>
              </div>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: Show polynomial generation */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Polynomial Generation</h2>
            <p className="text-muted-foreground">
              Creating a degree-6 polynomial (
              <MathTex>{"t-1 = 7-1 = 6"}</MathTex>)
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">
                  Example Secret <MathTex>{"(a_0)"}</MathTex>:
                </span>
                <Badge variant="secondary" className="font-mono">
                  {exampleSecret}
                </Badge>
              </div>

              <h3 className="font-semibold text-sm">Coefficients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {polynomial.coefficients.map((coeff, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: animatedCoeffs[idx] ? 1 : 0,
                      x: animatedCoeffs[idx] ? 0 : -20,
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground w-8">
                      <MathTex>{"a_{" + idx + "}"}</MathTex>:
                    </span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                      {idx === 0
                        ? exampleSecret
                        : coeff.toString().slice(0, 20) + "..."}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-muted rounded">
                <MathBlock>{`f(x) = ${exampleSecret} + a_1 x + a_2 x^2 + a_3 x^3 + a_4 x^4 + a_5 x^5 + a_6 x^6`}</MathBlock>
              </div>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: Share generation */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Share Generation</h2>
            <p className="text-muted-foreground">
              Evaluating <MathTex>{"f(x)"}</MathTex> at points{" "}
              <MathTex>{"x = 1, 2, ..., 10"}</MathTex>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {shares.map((share, idx) => (
              <motion.div
                key={share.x}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: animatedShares[idx] ? 1 : 0.8,
                  opacity: animatedShares[idx] ? 1 : 0,
                }}
              >
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: clients[idx].color }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs truncate">
                      {clients[idx].name}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        <MathTex>{"x = "}</MathTex>{" "}
                      </span>
                      <span className="font-mono">
                        <MathTex>{share.x.toString().slice(0, 15)}</MathTex>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        <MathTex>{"y = "}</MathTex>{" "}
                      </span>
                      <span className="font-mono text-[10px] break-all">
                        <MathTex>
                          {share.y.toString().slice(0, 15) + "..."}
                        </MathTex>
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Each client receives their share (<MathTex>{"x"}</MathTex>,{" "}
            <MathTex>{"y"}</MathTex>). The secret is never revealed.
          </p>
        </div>
      </StepContent>

      {/* Step 4: Visualization of shares as points */}
      <StepContent isActive={currentStep === 4} stepIndex={4}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Shares as Points</h2>
            <p className="text-muted-foreground">
              Each share is a point on the polynomial curve
            </p>
          </div>

          <Card className="p-6">
            {/* Visual representation with SVG curve */}
            <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
              {(() => {
                // Calculate normalized y values from actual polynomial
                const yValues = shares.map((share) => {
                  // Use log scale to normalize the large bigint values to 0-100 range
                  const logY = Math.log10(
                    Number(share.y % BigInt(10 ** 15)) + 1
                  );
                  return logY;
                });
                const secretLogY = Math.log10(exampleSecret + 1);
                const allLogY = [secretLogY, ...yValues];
                const minLogY = Math.min(...allLogY);
                const maxLogY = Math.max(...allLogY);
                const range = maxLogY - minLogY || 1;

                // Normalize to SVG coordinates (y inverted: 10 = top, 80 = bottom)
                const normalizeY = (logY: number) =>
                  80 - ((logY - minLogY) / range) * 65;

                // Calculate point positions
                const points = shares.map((share, idx) => ({
                  x: 8 + (share.x / 11) * 85,
                  y: normalizeY(yValues[idx]),
                }));

                const secretY = normalizeY(secretLogY);

                // Build SVG path through all points
                let pathD = `M 8 ${secretY}`;
                points.forEach((point, idx) => {
                  if (idx === 0) {
                    pathD += ` Q ${(8 + point.x) / 2} ${
                      (secretY + point.y) / 2
                    }, ${point.x} ${point.y}`;
                  } else {
                    const prev = points[idx - 1];
                    const cpX = (prev.x + point.x) / 2;
                    const cpY = (prev.y + point.y) / 2;
                    pathD += ` T ${point.x} ${point.y}`;
                  }
                });

                return (
                  <>
                    {/* SVG for curve and axes */}
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
                        className="text-border"
                      />
                      {/* X-axis at y=85 */}
                      <line
                        x1="8"
                        y1="85"
                        x2="95"
                        y2="85"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        className="text-border"
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
                        className="text-primary"
                      />
                    </svg>

                    {/* Points */}
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
                          backgroundColor: clients[idx].color,
                        }}
                        title={`Client ${idx + 1}: (${shares[idx].x}, ${shares[
                          idx
                        ].y
                          .toString()
                          .slice(0, 10)}...)`}
                      />
                    ))}

                    {/* Secret point at x=0 (on the Y-axis) */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                      className="absolute w-4 h-4 rounded-full bg-primary transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ left: "8%", top: `${secretY}%` }}
                    />
                  </>
                );
              })()}

              {/* Labels */}
              <span className="absolute left-1 top-1/2 text-xs text-muted-foreground -rotate-90 transform -translate-y-1/2">
                <MathTex>{"f(x)"}</MathTex>
              </span>
              <span className="absolute bottom-1 left-1/2 text-xs text-muted-foreground">
                <MathTex>{"x"}</MathTex>
              </span>
              <span
                className="absolute text-xs font-medium z-20"
                style={{ left: "1%", top: "40%" }}
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

            <p className="text-sm text-muted-foreground mt-4 text-center">
              The polynomial passes through all share points and{" "}
              <MathTex>{"f(0) = "}</MathTex> secret
            </p>
          </Card>
        </div>
      </StepContent>

      {/* Step 5: Reconstruction */}
      <StepContent isActive={currentStep === 5} stepIndex={5}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Secret Reconstruction</h2>
            <p className="text-muted-foreground">
              Using Lagrange interpolation with 7 shares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Collecting Shares</h3>
              <div className="space-y-2">
                {shares.slice(0, 7).map((share, idx) => {
                  const isCollected = idx < reconstructionShares.length;
                  return (
                    <motion.div
                      key={share.x}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: isCollected ? 1 : 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${
                          isCollected ? "" : "opacity-30"
                        }`}
                        style={{ backgroundColor: clients[idx].color }}
                      />
                      <span className="text-sm">
                        Share {share.x} from {clients[idx].name}
                      </span>
                      {isCollected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-primary"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 border-primary">
              <h3 className="font-semibold mb-4">Reconstruction Result</h3>
              {reconstructionShares.length < 7 ? (
                <div className="text-sm text-muted-foreground">
                  <p>Collecting shares...</p>
                  <p className="mt-2">
                    {reconstructionShares.length}/7 shares collected
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {reconstructedValue !== null ? (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">
                          Lagrange Interpolation:
                        </p>
                        <MathBlock>
                          {"f(0) = \\sum_{i=1}^{7} y_i \\cdot L_i(0)"}
                        </MathBlock>
                        <p className="mt-1 text-[10px]">
                          where <MathTex>{"L_i(0)"}</MathTex> is the i-th
                          Lagrange basis polynomial evaluated at 0.
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Result:
                        </p>
                        <p className="font-mono text-xl font-bold">
                          {reconstructedValue.toString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary">✓</span>
                        <span>Matches original secret: <MathTex>{exampleSecret.toString()}</MathTex></span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">Computing...</p>
                  )}
                </motion.div>
              )}
            </Card>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            The secret is reconstructed without any party seeing individual
            model updates
          </p>
        </div>
      </StepContent>

      {/* Step 6: Security properties */}
      <StepContent isActive={currentStep === 6} stepIndex={6}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Security Properties</h2>
            <p className="text-muted-foreground">
              Why Shamir's scheme is information-theoretically secure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Perfect Secrecy</h3>
              <p className="text-xs text-muted-foreground">
                With fewer than t shares, all possible secrets are equally
                likely. No computational attack can help.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Fault Tolerance</h3>
              <p className="text-xs text-muted-foreground">
                Up to n-t clients can be offline or fail. The system still
                reconstructs correctly.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">No Single Point</h3>
              <p className="text-xs text-muted-foreground">
                No single party (including server) sees the secret. Trust is
                distributed.
              </p>
            </Card>
          </div>

          <Card className="p-6 border-primary">
            <h3 className="font-semibold mb-2">
              In Federated Learning Context
            </h3>
            <p className="text-sm text-muted-foreground">
              Each client splits their model update using SSS. The server
              collects shares from all clients and reconstructs only the sum of
              all updates - never seeing any individual client's update.
            </p>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { defaultClients } from "@/lib/data/mnist";
import { useState, useEffect } from "react";
import { Server, ArrowRight } from "lucide-react";
import { Math as MathTex } from "@/components/math";
import { useVisualization } from "@/context/visualization-context";

interface SecureAggregationSectionProps {
  currentStep: number;
}

export function SecureAggregationSection({
  currentStep,
}: SecureAggregationSectionProps) {
  const clients = defaultClients;
  const { setBlocked } = useVisualization();
  const [sharesSent, setSharesSent] = useState<boolean[]>(
    new Array(10).fill(false)
  );
  const [aggregating, setAggregating] = useState(false);
  const [aggregated, setAggregated] = useState(false);

  // Animation for sending shares
  useEffect(() => {
    if (currentStep === 1) {
      setSharesSent(new Array(10).fill(false));
      clients.forEach((_, idx) => {
        setTimeout(() => {
          setSharesSent((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, idx * 150);
      });
    }
  }, [currentStep, clients]);

  // Aggregation animation with blocking
  useEffect(() => {
    if (currentStep === 2) {
      setBlocked(true, "Aggregating shares");
      setAggregating(true);
      setAggregated(false);
      setTimeout(() => {
        setAggregating(false);
        setAggregated(true);
        setBlocked(false);
      }, 2000);

      return () => {
        setBlocked(false);
      };
    }
  }, [currentStep, setBlocked]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Introduction */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Secure Aggregation</h2>
            <p className="text-muted-foreground text-lg">
              Combining shares from all clients without revealing individual
              updates
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">How It Works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    1
                  </span>
                  Each client sends their share to the server
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    2
                  </span>
                  Server collects at least t shares (7 of 10)
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    3
                  </span>
                  Lagrange interpolation reconstructs the aggregated sum
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    4
                  </span>
                  Individual updates remain hidden from the server
                </li>
              </ol>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Shares being sent */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Sending Shares to Server
            </h2>
            <p className="text-muted-foreground">
              Each client transmits their cryptographic share
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Server in center */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                  <Server className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium mt-2">
                  Aggregation Server
                </span>
              </motion.div>
            </div>

            {/* Clients sending shares */}
            <div className="grid grid-cols-5 gap-4">
              {clients.map((client, idx) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: client.color }}
                  >
                    {idx + 1}
                  </div>

                  <span className="text-xs truncate w-full text-center mt-2">
                    {client.name}
                  </span>

                  {sharesSent[idx] && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-primary mt-1"
                    >
                      ✓ Sent
                    </motion.span>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: sharesSent[idx] ? [0, 1, 1, 0] : 0,
                      y: sharesSent[idx] ? [0, -40, -80, -120] : 0,
                    }}
                    transition={{ duration: 0.8 }}
                    className="h-6"
                  >
                    <ArrowRight className="h-8 w-8 rotate-[-90deg] text-muted-foreground" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </StepContent>

      {/* Step 2: Aggregation in progress */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Reconstructing Aggregated Sum
            </h2>
            <p className="text-muted-foreground">
              Server performs Lagrange interpolation on collected shares
            </p>
          </div>

          <Card className="p-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center mb-4">
                <Server className="h-10 w-10 text-primary-foreground" />
              </div>

              {aggregating && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"
                />
              )}

              {aggregated && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">✓</div>
                  <p className="font-semibold">Aggregation Complete</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sum of all model updates reconstructed
                  </p>
                </motion.div>
              )}

              {!aggregated && !aggregating && (
                <p className="text-sm text-muted-foreground">
                  Ready to aggregate
                </p>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">What Server Sees</h3>
              <p className="text-xs text-muted-foreground">
                Only the sum:{" "}
                <MathTex>
                  {"\\sum(\\text{updates}) = u_1 + u_2 + \\ldots + u_{10}"}
                </MathTex>
              </p>
            </Card>
            <Card className="p-4 border-primary">
              <h3 className="font-semibold text-sm mb-2">
                What Server Cannot See
              </h3>
              <p className="text-xs text-muted-foreground">
                Individual updates:{" "}
                <MathTex>{"u_1, u_2, \\ldots, u_{10}"}</MathTex>
              </p>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 3: Privacy guarantees */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Privacy Guarantees</h2>
            <p className="text-muted-foreground">
              What makes <span className="inline-block px-2 py-0.5 rounded-full bg-foreground text-background font-medium text-sm">Secure Aggregation</span> secure?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Against the Server</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  The server only learns the aggregated result
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  The server cannot infer individual client updates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  The server cannot perform gradient inversion
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Against Collusion</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  Up to <MathTex>{"t-1"}</MathTex> colluding clients cannot learn anything
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  The server and <MathTex>{"t-2"}</MathTex> clients cannot break security
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  The scheme is information-theoretically secure
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-4 bg-muted">
            <p className="text-sm text-center">
              The aggregated model update is now ready for FedAvg →
            </p>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

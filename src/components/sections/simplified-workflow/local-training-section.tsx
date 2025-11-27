"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { defaultTrainingRounds } from "@/lib/data/mnist";
import { useMNIST } from "@/context/mnist-context";
import { useVisualization } from "@/context/visualization-context";
import { MNISTImage } from "@/components/mnist-image";
import { useState, useEffect } from "react";
import { MathBlock } from "@/components/math";

interface LocalTrainingSectionProps {
  currentStep: number;
}

export function LocalTrainingSection({
  currentStep,
}: LocalTrainingSectionProps) {
  const { clients, clientData } = useMNIST();
  const { setBlocked } = useVisualization();
  const round0 = defaultTrainingRounds[0];
  const [animatedMetrics, setAnimatedMetrics] = useState<number[]>(
    new Array(10).fill(0)
  );
  const [trainingComplete, setTrainingComplete] = useState(false);

  // Block navigation during training animation (step 1)
  useEffect(() => {
    if (currentStep === 1) {
      setBlocked(true, "Training in progress");
      setTrainingComplete(false);

      // Simulate training duration (3 seconds)
      const timer = setTimeout(() => {
        setBlocked(false);
        setTrainingComplete(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
        setBlocked(false);
      };
    }
  }, [currentStep, setBlocked]);

  // Animate progress when step changes
  useEffect(() => {
    if (currentStep === 2) {
      const intervals = clients.map((_, idx) => {
        const targetAccuracy = round0.clientMetrics[idx].accuracy * 100;
        let current = 0;
        return setInterval(() => {
          current = Math.min(current + 2, targetAccuracy);
          setAnimatedMetrics((prev) => {
            const next = [...prev];
            next[idx] = current;
            return next;
          });
          if (current >= targetAccuracy) {
            clearInterval(intervals[idx]);
          }
        }, 30);
      });

      return () => intervals.forEach(clearInterval);
    }
  }, [currentStep, clients, round0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Introduction */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Local Training</h2>
            <p className="text-muted-foreground text-lg">
              Each client trains a model on their local data
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">How Local Training Works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    1
                  </span>
                  Server sends current global model to all clients
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    2
                  </span>
                  Each client initializes with global weights
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    3
                  </span>
                  Clients train for E local epochs on their data
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    4
                  </span>
                  Local model updates (gradients or weights) are computed
                </li>
              </ol>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Training animation */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Training in Progress</h2>
            <p className="text-muted-foreground">
              All 10 clients training simultaneously on local MNIST data
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {clients.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: client.color }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs font-medium truncate">
                      {client.name}
                    </span>
                  </div>

                  {/* Show sample images being trained */}
                  {clientData[idx] && (
                    <div className="grid grid-cols-5 gap-0.5 mb-2">
                      {clientData[idx].images.slice(0, 5).map((img, imgIdx) => (
                        <MNISTImage
                          key={imgIdx}
                          pixels={img.pixels}
                          size={14}
                          className="rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Training animation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Training</span>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-primary"
                      >
                        ●
                      </motion.span>
                    </div>
                    <motion.div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: client.color }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 2.5,
                          ease: "easeOut",
                          delay: idx * 0.1,
                        }}
                      />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Each client performs multiple epochs of stochastic gradient
              descent
            </p>
          </div>
        </div>
      </StepContent>

      {/* Step 2: Training results */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Training Complete</h2>
            <p className="text-muted-foreground">
              Local accuracy after first round of training
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {clients.map((client, idx) => {
              const metrics = round0.clientMetrics[idx];
              return (
                <motion.div
                  key={client.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: client.color }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-xs font-medium truncate">
                        {client.name}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Accuracy
                          </span>
                          <span className="font-mono">
                            {animatedMetrics[idx].toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={animatedMetrics[idx]}
                          className="h-2"
                        />
                      </div>

                      <div className="text-xs">
                        <span className="text-muted-foreground">Loss: </span>
                        <span className="font-mono">
                          {metrics.loss.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="p-4 max-w-md mx-auto">
            <p className="text-sm text-center text-muted-foreground">
              Notice the varying accuracies. This is due to non-IID data
              distribution. Some clients have easier digits to learn than
              others.
            </p>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: Model updates ready */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Model Updates Ready</h2>
            <p className="text-muted-foreground">
              Each client has computed their local model updates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What are Model Updates?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                After local training, each client has a set of updated model
                weights. These represent what the model learned from the local
                data.
              </p>
              <div className="bg-muted p-3 rounded">
                <MathBlock>
                  {"\\Delta w = w_{\\text{local}} - w_{\\text{global}}"}
                </MathBlock>
              </div>
            </Card>

            <Card className="p-6 border-primary">
              <h3 className="font-semibold mb-4">The Privacy Problem</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These updates contain information about the training data.
                Sending them directly to the server risks privacy.
              </p>
              <p className="text-sm font-medium mt-12">
                Solution: Split updates using Shamir Secret Sharing →
              </p>
            </Card>
          </div>
        </div>
      </StepContent>
    </div>
  );
}

"use client"

import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { defaultTrainingRounds } from '@/lib/data/mnist';
import { useState, useEffect } from 'react';

interface GlobalModelSectionProps {
  currentStep: number;
}

export function GlobalModelSection({ currentStep }: GlobalModelSectionProps) {
  const round1 = defaultTrainingRounds[0];
  const round2 = defaultTrainingRounds[1];
  const round3 = defaultTrainingRounds[2];

  const [improvement, setImprovement] = useState({ accuracy: 0, loss: 0 });

  useEffect(() => {
    if (currentStep === 1) {
      const targetAcc = (round2.globalAccuracy - round1.globalAccuracy) * 100;
      const targetLoss = round1.globalLoss - round2.globalLoss;

      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setImprovement({
          accuracy: (targetAcc * progress) / 100,
          loss: (targetLoss * progress) / 100
        });
        if (progress >= 100) clearInterval(interval);
      }, 30);

      return () => clearInterval(interval);
    }
  }, [currentStep, round1, round2]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Model state after round 1 */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Global Model Updated</h2>
            <p className="text-muted-foreground text-lg">
              After Round 1: All clients trained locally → updates aggregated → global model updated
            </p>
          </div>

          <Card className="p-4 bg-muted mb-4">
            <p className="text-sm text-center">
              <strong>What is a "Round"?</strong> One complete cycle: local training on all clients →
              secret sharing → secure aggregation → global model update
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Model Accuracy</h3>
              <div className="text-center">
                <p className="text-5xl font-bold font-mono">
                  {(round1.globalAccuracy * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  After Round 1
                </p>
              </div>
              <Progress
                value={round1.globalAccuracy * 100}
                className="mt-4 h-3"
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Model Loss</h3>
              <div className="text-center">
                <p className="text-5xl font-bold font-mono">
                  {round1.globalLoss.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Cross-entropy loss
                </p>
              </div>
              <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(round1.globalLoss / 2.5) * 100}%` }}
                />
              </div>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 1: Improvement visualization */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Model Improvement Over Rounds</h2>
            <p className="text-muted-foreground">
              Each round improves the global model
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-green-500/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                Accuracy
                <span className="text-green-500">↑</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Round 1</p>
                    <p className="text-lg font-mono">{(round1.globalAccuracy * 100).toFixed(1)}%</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-xs text-muted-foreground">Round 2</p>
                    <p className="text-lg font-mono">{(round2.globalAccuracy * 100).toFixed(1)}%</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <p className="text-xs text-muted-foreground">Round 3</p>
                    <p className="text-lg font-mono">{(round3.globalAccuracy * 100).toFixed(1)}%</p>
                  </motion.div>
                </div>
                <div className="p-3 bg-green-500/10 rounded">
                  <p className="text-center text-green-500 font-mono text-sm">
                    Total: +{((round3.globalAccuracy - round1.globalAccuracy) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-blue-500/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                Loss
                <span className="text-blue-500">↓</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Round 1</p>
                    <p className="text-lg font-mono">{round1.globalLoss.toFixed(3)}</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-xs text-muted-foreground">Round 2</p>
                    <p className="text-lg font-mono">{round2.globalLoss.toFixed(3)}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <p className="text-xs text-muted-foreground">Round 3</p>
                    <p className="text-lg font-mono">{round3.globalLoss.toFixed(3)}</p>
                  </motion.div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded">
                  <p className="text-center text-blue-500 font-mono text-sm">
                    Total: -{(round1.globalLoss - round3.globalLoss).toFixed(3)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 2: Next steps */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Continue Training</h2>
            <p className="text-muted-foreground">
              The process repeats for multiple rounds
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Next Round Process</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">1</span>
                  Server broadcasts updated global model to clients
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">2</span>
                  Clients perform local training with new model
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">3</span>
                  Updates split using Shamir Secret Sharing
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">4</span>
                  Secure aggregation produces next global update
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">5</span>
                  Repeat until convergence
                </li>
              </ol>
            </div>
          </Card>

          <Card className="p-4 bg-muted">
            <p className="text-sm text-center">
              Let's see how the model converges over multiple rounds →
            </p>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

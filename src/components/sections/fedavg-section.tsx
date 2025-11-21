"use client"

import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card } from '@/components/ui/card';
import { defaultClients, defaultTrainingRounds } from '@/lib/data/mnist';
import { useState, useEffect } from 'react';
import { Math as MathTex, MathBlock } from '@/components/math';

interface FedAvgSectionProps {
  currentStep: number;
}

export function FedAvgSection({ currentStep }: FedAvgSectionProps) {
  const clients = defaultClients;
  const round0 = defaultTrainingRounds[0];
  const [weights, setWeights] = useState<number[]>(new Array(10).fill(0));
  const [avgWeight, setAvgWeight] = useState(0);

  // Calculate max data size for proportional bars
  const maxDataSize = Math.max(...clients.map(c => c.dataSize));

  // Animate weight bars with actual proportional sizes
  useEffect(() => {
    if (currentStep === 1) {
      clients.forEach((client, idx) => {
        setTimeout(() => {
          setWeights(prev => {
            const next = [...prev];
            // Calculate width as percentage of max data size
            next[idx] = (client.dataSize / maxDataSize) * 100;
            return next;
          });
        }, idx * 100);
      });
    }
  }, [currentStep, clients, maxDataSize]);

  // Animate averaging
  useEffect(() => {
    if (currentStep === 2) {
      let current = 0;
      const target = 100;
      const interval = setInterval(() => {
        current += 2;
        setAvgWeight(Math.min(current, target));
        if (current >= target) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Introduction to FedAvg */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Federated Averaging</h2>
            <p className="text-muted-foreground text-lg">
              The most common aggregation strategy in federated learning
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">The Algorithm</h3>
              <div className="bg-muted p-4 rounded-lg">
                <MathBlock>{"w_{\\text{global}} = \\sum_{k=1}^{K} \\frac{n_k}{n} \\cdot w_k"}</MathBlock>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  where <MathTex>{"n_k"}</MathTex> = samples at client k, <MathTex>{"n"}</MathTex> = total samples
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Model updates are weighted by the number of training samples each client has.
                Clients with more data have more influence on the global model.
              </p>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Weighted contributions */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Client Weights</h2>
            <p className="text-muted-foreground">
              Contribution based on local data size
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-3">
              {clients.map((client, idx) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: client.color }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-sm w-24 truncate">{client.name}</span>
                  <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weights[idx]}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full rounded"
                      style={{ backgroundColor: client.color }}
                    />
                  </div>
                  <span className="text-xs font-mono w-16 text-right">
                    {client.dataSize} samples
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: Averaging process */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Computing Average</h2>
            <p className="text-muted-foreground">
              Weighted average of all client updates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Input Updates</h3>
              <div className="space-y-2">
                {clients.slice(0, 5).map((client, idx) => (
                  <div key={client.id} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: client.color }}
                    />
                    <span className="font-mono text-xs">
                      Δw_{idx + 1} × {(client.dataSize / 1000).toFixed(3)}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">... and 5 more</p>
              </div>
            </Card>

            <Card className="p-6 border-primary">
              <h3 className="font-semibold mb-4">Output</h3>
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: avgWeight < 100 ? 360 : 0 }}
                  transition={{
                    duration: 1,
                    repeat: avgWeight < 100 ? Infinity : 0,
                    ease: 'linear'
                  }}
                  className={`w-12 h-12 border-2 rounded-full mb-4 ${
                    avgWeight < 100 ? 'border-primary border-t-transparent' : 'border-primary'
                  }`}
                />
                {avgWeight >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                  >
                    <MathTex className="text-lg font-bold">{"\\Delta w_{\\text{global}}"}</MathTex>
                    <p className="text-sm text-muted-foreground mt-2">
                      Aggregated model update ready
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (weighted sum of all client updates)
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 3: Update equation */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Global Model Update</h2>
            <p className="text-muted-foreground">
              Applying the aggregated update to the global model
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg text-center">
                <MathBlock>{"w_{t+1} = w_t + \\eta \\cdot \\Delta w_{\\text{global}}"}</MathBlock>
                <p className="text-xs text-muted-foreground mt-2">
                  where <MathTex>{"\\eta"}</MathTex> is the server learning rate
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium">Previous Model</p>
                  <MathTex className="text-xs text-muted-foreground">{"w_t"}</MathTex>
                </div>
                <div>
                  <p className="text-sm font-medium">+ Update</p>
                  <MathTex className="text-xs text-muted-foreground">{"\\eta \\cdot \\Delta w"}</MathTex>
                </div>
                <div>
                  <p className="text-sm font-medium">= New Model</p>
                  <MathTex className="text-xs text-muted-foreground">{"w_{t+1}"}</MathTex>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Round 1 Metrics</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Accuracy:</span>
                  <span className="font-mono">{(round0.globalAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Loss:</span>
                  <span className="font-mono">{round0.globalLoss.toFixed(3)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted">
              <p className="text-sm">
                One round complete! The process repeats for multiple rounds until convergence.
              </p>
            </Card>
          </div>
        </div>
      </StepContent>
    </div>
  );
}

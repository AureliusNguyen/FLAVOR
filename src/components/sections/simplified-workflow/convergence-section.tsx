"use client"

import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card } from '@/components/ui/card';
import { defaultTrainingRounds, defaultClients } from '@/lib/data/mnist';
import { useState, useEffect, useRef } from 'react';

interface ConvergenceSectionProps {
  currentStep: number;
}

export function ConvergenceSection({ currentStep }: ConvergenceSectionProps) {
  const rounds = defaultTrainingRounds;
  const clients = defaultClients;
  const [visibleRounds, setVisibleRounds] = useState(0);
  const [selectedRound, setSelectedRound] = useState(0);

  // Animate rounds appearing
  useEffect(() => {
    if (currentStep === 1) {
      setVisibleRounds(0);
      const interval = setInterval(() => {
        setVisibleRounds(prev => {
          if (prev >= rounds.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [currentStep, rounds.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Introduction */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Training Convergence</h2>
            <p className="text-muted-foreground text-lg">
              Watching the model improve over 10 rounds
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Convergence Criteria</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Model accuracy increases over rounds
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Loss decreases and stabilizes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                  Client metrics become more consistent
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Convergence chart */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Accuracy Over Rounds</h2>
            <p className="text-muted-foreground">
              Global model accuracy progression
            </p>
          </div>

          <Card className="p-6">
            {/* Simple bar chart */}
            <div className="flex items-end gap-2 h-48 mb-4">
              {rounds.map((round, idx) => {
                const height = round.globalAccuracy * 100;
                const isVisible = idx < visibleRounds;
                return (
                  <motion.div
                    key={round.round}
                    initial={{ height: 0 }}
                    animate={{ height: isVisible ? `${height}%` : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-green-500 rounded-t relative group"
                    onClick={() => setSelectedRound(idx)}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {(round.globalAccuracy * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-2">
              {rounds.map((round) => (
                <div key={round.round} className="flex-1 text-center text-xs text-muted-foreground">
                  R{round.round + 1}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Initial Accuracy</p>
              <p className="font-mono font-bold">{(rounds[0].globalAccuracy * 100).toFixed(1)}%</p>
            </Card>
            <Card className="p-3 text-center border-primary">
              <p className="text-xs text-muted-foreground">Final Accuracy</p>
              <p className="font-mono font-bold">{(rounds[9].globalAccuracy * 100).toFixed(1)}%</p>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 2: Loss convergence */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Loss Reduction</h2>
            <p className="text-muted-foreground">
              Training loss decreasing over rounds
            </p>
          </div>

          <Card className="p-6">
            {/* Loss chart (inverted bar chart) */}
            <div className="flex items-start gap-2 h-48 mb-4">
              {rounds.map((round, idx) => {
                const height = (round.globalLoss / 2.5) * 100;
                return (
                  <motion.div
                    key={round.round}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex-1 bg-red-500 rounded-b relative group"
                  >
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {round.globalLoss.toFixed(2)}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-2">
              {rounds.map((round) => (
                <div key={round.round} className="flex-1 text-center text-xs text-muted-foreground">
                  R{round.round + 1}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-muted max-w-md mx-auto">
            <p className="text-sm text-center">
              Loss decreased from <strong>{rounds[0].globalLoss.toFixed(2)}</strong> to{' '}
              <strong>{rounds[9].globalLoss.toFixed(2)}</strong>
            </p>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: Per-client improvement */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Client-Level Convergence</h2>
            <p className="text-muted-foreground">
              How each client's local accuracy improved
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {clients.map((client, idx) => {
              const initialAcc = rounds[0].clientMetrics[idx].accuracy;
              const finalAcc = rounds[9].clientMetrics[idx].accuracy;
              const improvement = (finalAcc - initialAcc) * 100;

              return (
                <motion.div
                  key={client.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="text-xs truncate">{client.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Initial</span>
                        <span className="font-mono">{(initialAcc * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Final</span>
                        <span className="font-mono">{(finalAcc * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-center pt-1 border-t">
                        <span className="text-xs text-green-500 font-mono">
                          +{improvement.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </StepContent>
    </div>
  );
}

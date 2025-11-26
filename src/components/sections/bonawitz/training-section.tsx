'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBonawitz } from '@/context/bonawitz-context';
import { useVisualization } from '@/context/visualization-context';
import { Brain, Database, Cpu } from 'lucide-react';

interface Props {
  currentStep: number;
}

export function BonawitzTrainingSection({ currentStep }: Props) {
  const { clients, setTrainingComplete } = useBonawitz();
  const { setBlocked } = useVisualization();
  const [trainingProgress, setTrainingProgress] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep === 1) {
      // Simulate training progress
      setTrainingProgress(clients.map(() => 0));
      const intervals = clients.map((_, idx) => {
        return setInterval(() => {
          setTrainingProgress(prev => {
            const next = [...prev];
            if (next[idx] < 100) {
              next[idx] = Math.min(100, next[idx] + Math.random() * 15 + 5);
            }
            return next;
          });
        }, 200 + idx * 50);
      });

      return () => intervals.forEach(clearInterval);
    }
  }, [currentStep, clients]);

  useEffect(() => {
    if (trainingProgress.length > 0 && trainingProgress.every(p => p >= 100)) {
      setTrainingComplete(true);
    }
  }, [trainingProgress, setTrainingComplete]);

  // Block navigation while training is in progress
  useEffect(() => {
    if (currentStep === 1) {
      const isTrainingComplete = trainingProgress.length > 0 && trainingProgress.every(p => p >= 100);
      if (!isTrainingComplete) {
        setBlocked(true, 'Training in progress...');
      } else {
        setBlocked(false);
      }
    } else {
      setBlocked(false);
    }
  }, [currentStep, trainingProgress, setBlocked]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-white">
      {/* Step 0: Local Training Concept */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Local Model Training</h2>
            <p className="text-gray-400">Each client trains on their private data</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Database className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Private Data</h3>
                <p className="text-sm text-gray-400">
                  Each client has their own local dataset that never leaves their device
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Cpu className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Local Computation</h3>
                <p className="text-sm text-gray-400">
                  Training happens on client devices using gradient descent
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Brain className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Model Updates</h3>
                <p className="text-sm text-gray-400">
                  Clients compute gradient updates to share (not raw data)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <p className="text-center text-gray-300">
                In federated learning, clients train local models and only share model updates (gradients).
                The secure aggregation protocol ensures these gradients remain private during aggregation.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Training in Progress */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Training in Progress</h2>
            <p className="text-gray-400">Clients are computing gradient updates locally</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2" style={{ borderColor: client.color, backgroundColor: 'rgba(31, 41, 55, 0.8)' }}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: client.color }}
                        >
                          {client.id}
                        </div>
                        <span className="text-sm font-medium truncate">{client.name}</span>
                      </div>
                    </div>
                    <Progress
                      value={trainingProgress[idx] || 0}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Training</span>
                      <span>{Math.round(trainingProgress[idx] || 0)}%</span>
                    </div>
                    {/* Fixed height container to prevent layout shift */}
                    <div className="h-6">
                      {(trainingProgress[idx] || 0) >= 100 && (
                        <Badge className="w-full justify-center bg-green-600">Complete</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </StepContent>

      {/* Step 2: Training Complete */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <Brain className="h-8 w-8 text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Training Complete</h2>
            <p className="text-gray-400">All clients have computed their gradient updates</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Gradient Vectors Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-gray-900 p-3 rounded-lg border-l-4"
                    style={{ borderColor: client.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: client.color }}
                      >
                        {client.id}
                      </div>
                      <span className="text-sm font-medium">{client.name}</span>
                    </div>
                    <div className="text-xs font-mono text-green-300">
                      [{client.quantizedVector.slice(0, 3).join(', ')}{client.quantizedVector.length > 3 ? '...' : ''}]
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="pt-6">
              <p className="text-center text-purple-200">
                <strong>Next:</strong> Clients will now begin the secure aggregation protocol to combine their gradients without revealing individual values.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

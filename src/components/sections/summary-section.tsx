"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { defaultTrainingRounds, defaultClients } from "@/lib/data/mnist";
import {
  CheckCircle,
  Shield,
  Network,
  Brain,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVisualization } from "@/context/visualization-context";

interface SummarySectionProps {
  currentStep: number;
}

export function SummarySection({ currentStep }: SummarySectionProps) {
  const { goToSection } = useVisualization();
  const rounds = defaultTrainingRounds;
  const finalRound = rounds[rounds.length - 1];

  const handleStartOver = () => {
    goToSection(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Summary of results */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Training Complete!</h2>
            <p className="text-muted-foreground text-lg">
              Privacy-preserving federated learning with Shamir Secret Sharing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <Network className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold font-mono">10</p>
              <p className="text-sm text-muted-foreground">Clients</p>
            </Card>

            <Card className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold font-mono">
                {(finalRound.globalAccuracy * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Final Accuracy</p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold font-mono">(7,10)</p>
              <p className="text-sm text-muted-foreground">Threshold Scheme</p>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 1: Key takeaways */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Key Takeaways</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Data Never Leaves Device",
                description:
                  "Each client trains locally on their MNIST samples. Raw data stays private.",
                icon: Shield,
              },
              {
                title: "Secure Aggregation",
                description:
                  "Model updates are split using Shamir Secret Sharing. Server only sees the sum.",
                icon: Network,
              },
              {
                title: "Collaborative Learning",
                description:
                  "Despite non-IID data, clients collectively train an accurate global model.",
                icon: Brain,
              },
              {
                title: "Fault Tolerance",
                description:
                  "With (7,10) threshold, up to 3 clients can fail without breaking the system.",
                icon: CheckCircle,
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </StepContent>

      {/* Step 2: Technical summary */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Technical Summary</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dataset</span>
                  <span className="font-mono">MNIST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clients</span>
                  <span className="font-mono">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rounds</span>
                  <span className="font-mono">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Algorithm</span>
                  <span className="font-mono">FedAvg</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Shamir SSS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threshold (t)</span>
                  <span className="font-mono">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Shares (n)
                  </span>
                  <span className="font-mono">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Polynomial Degree
                  </span>
                  <span className="font-mono">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Field</span>
                  <span className="font-mono">256-bit prime</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-mono">
                  {(rounds[0].globalAccuracy * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Initial Accuracy
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-green-500">
                  {(finalRound.globalAccuracy * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Final Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  {rounds[0].globalLoss.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Initial Loss</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-blue-500">
                  {finalRound.globalLoss.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Final Loss</p>
              </div>
            </div>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: What's next */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">What's Next?</h2>
            <p className="text-muted-foreground">
              Future enhancements for FLAVOR
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Interactive parameter configuration",
              "Custom dataset upload",
              "Differential privacy integration",
              "Attack simulations + defenses",
              "Performance benchmarking",
              "Export / share configurations",
              "Secure Aggregation variants (Bonawitz / MPC masking)",
              "Client dropout & straggler simulator (availability %, latency)",
            ].map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {idx + 1}
                    </Badge>
                    <span className="text-sm">{item}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Thank you for exploring FLAVOR!
            </p>
            <div className="flex justify-center">
              <Button size="sm" onClick={handleStartOver}>
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </StepContent>
    </div>
  );
}
